import express, { Request, Response } from 'express';
import path from 'path';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 3000;

// Security Hardening: Disable Express fingerprinting header & add security headers
app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10kb' }));

// SSRF Guard Helpers
function isPrivateIp(ip: string): boolean {
  const cleanIp = ip.replace(/^::ffff:/i, '');

  const ipv4Match = cleanIp.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);
    if (a > 255 || b > 255 || c > 255 || d > 255) return true;

    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 (Loopback)
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (Link-local & AWS/GCP Metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 (Private)
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 (Private)
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
    if (a >= 224) return true; // Multicast / Reserved

    return false;
  }

  const lowerIp = cleanIp.toLowerCase();
  if (
    lowerIp === '::1' ||
    lowerIp === '::' ||
    lowerIp.startsWith('fe80:') ||
    lowerIp.startsWith('fc') ||
    lowerIp.startsWith('fd')
  ) {
    return true;
  }

  return false;
}

async function isSsrfSafeUrl(parsedUrl: URL): Promise<{ safe: boolean; reason?: string }> {
  const protocol = parsedUrl.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return { safe: false, reason: 'Apenas protocolos HTTP e HTTPS são permitidos para varredura.' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block obvious localhost or internal domain names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home.arpa')
  ) {
    return { safe: false, reason: 'Varredura não permitida: Domínios locais ou de infraestrutura interna são bloqueados (Proteção SSRF).' };
  }

  // Block numeric, octal, hex IP integer tricks (e.g. 2130706433, 0x7f000001)
  if (/^(0x[0-9a-f]+|\d+)$/i.test(hostname)) {
    return { safe: false, reason: 'Varredura não permitida: Endereço IP em formato numérico/hexadecimal não é permitido (Proteção SSRF).' };
  }

  // Resolve DNS to verify resolved IP addresses against internal ranges
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return {
          safe: false,
          reason: 'Varredura não permitida: O endereço informado resolve para uma rede de IP privada ou reservada (Proteção SSRF).'
        };
      }
    }
  } catch {
    return { safe: false, reason: 'Não foi possível resolver o nome de domínio informado no servidor DNS.' };
  }

  return { safe: true };
}

// Simple memory rate limiter per IP: max 20 requests per 15 minutes window
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Validation helpers for high-precision triaging
function isValidCpf(cpfRaw: string): boolean {
  const clean = cpfRaw.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  // Reject repeated numbers (00000000000, 11111111111...)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

const VALID_BRAZILIAN_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99
]);

function isValidBrazilianPhone(phoneRaw: string): boolean {
  // Reject if string contains alphabetical characters (e.g., CSS dimensions like 1920x1080)
  if (/[a-zA-Z]/i.test(phoneRaw)) return false;

  const clean = phoneRaw.replace(/\D/g, '');
  let ddd = 0;
  let numberPart = '';

  if (clean.length === 12 || clean.length === 13) {
    if (!clean.startsWith('55')) return false;
    ddd = parseInt(clean.substring(2, 4), 10);
    numberPart = clean.substring(4);
  } else if (clean.length === 10 || clean.length === 11) {
    ddd = parseInt(clean.substring(0, 2), 10);
    numberPart = clean.substring(2);
  } else {
    return false;
  }

  if (!VALID_BRAZILIAN_DDDS.has(ddd)) return false;

  // Reject repeating numbers like 999999999 or 00000000
  if (/^(\d)\1+$/.test(numberPart)) return false;

  // Mobile: 9 digits starting with 9
  if (numberPart.length === 9 && numberPart.startsWith('9')) return true;

  // Landline: 8 digits starting with 2..5
  if (numberPart.length === 8 && /^[2-5]/.test(numberPart)) return true;

  return false;
}

// Institutional SAC / Public Contact Filter (Prevents false positives on legitimate support contacts)
const INSTITUTIONAL_PREFIXES = [
  'sac', 'contato', 'suporte', 'atendimento', 'faleconosco', 'fale-conosco', 'fale_conosco',
  'vendas', 'help', 'info', 'lgpd', 'dpo', 'privacidade', 'comercial', 'financeiro',
  'imprensa', 'media', 'press', 'ouvidoria', 'carreiras', 'rh', 'jobs', 'webmaster',
  'admin', 'administrator', 'noreply', 'no-reply', 'marketing', 'suportecliente',
  'faleconnosco', 'central', 'canal'
];

function isInstitutionalPublicContact(match: string, type: 'E-mail' | 'Telefone' | 'CPF'): boolean {
  if (type === 'E-mail') {
    const lower = match.toLowerCase().trim();
    const parts = lower.split('@');
    if (parts.length < 2) return false;
    const prefix = parts[0];

    return INSTITUTIONAL_PREFIXES.some((kw) => {
      return (
        prefix === kw ||
        prefix.startsWith(kw + '.') ||
        prefix.startsWith(kw + '-') ||
        prefix.startsWith(kw + '_') ||
        prefix.endsWith('.' + kw) ||
        prefix.endsWith('-' + kw) ||
        prefix.endsWith('_' + kw)
      );
    });
  }

  if (type === 'Telefone') {
    const clean = match.replace(/\D/g, '');
    // SAC / Toll-Free prefixes (0800, 0300, 4003, 4004, 3003)
    if (
      clean.startsWith('0800') ||
      clean.startsWith('0300') ||
      clean.startsWith('4003') ||
      clean.startsWith('4004') ||
      clean.startsWith('3003')
    ) {
      return true;
    }
  }

  return false;
}

// Masking helpers
function maskCpf(cpfRaw: string): string {
  const clean = cpfRaw.replace(/\D/g, '');
  if (clean.length === 11) {
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
  }
  return `***.${cpfRaw.slice(-4)}`;
}

function maskPhone(phoneRaw: string): string {
  const clean = phoneRaw.replace(/\D/g, '');
  if (clean.length >= 8) {
    return `(${clean.slice(0, 2) || 'XX'}) *****-${clean.slice(-4)}`;
  }
  return `(XX) *****-${phoneRaw.slice(-4)}`;
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length === 2) {
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
    return `${maskedUser}@${domain}`;
  }
  return '***@***.com';
}

function maskSecretKey(key: string): string {
  if (key.length <= 8) return key.substring(0, 2) + '****';
  return key.substring(0, 6) + '...' + key.substring(key.length - 4);
}

// Regex patterns required by specification
const CPF_REGEX = /(?:[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2})|(?:[0-9]{11})/g;
const PHONE_REGEX = /(?:\+?55\s?)?(?:\(?[1-9][0-9]\)?\s?)?(?:9\d|[2-9])\d{3}-?\d{4}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Secret Patterns
const SECRET_PATTERNS = [
  {
    service: 'Google Maps / Cloud API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/g,
    recommendation: 'Restrinja a chave de API por referrer HTTP no Google Cloud Console e remova secrets do front-end.'
  },
  {
    service: 'Stripe Secret Key',
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
    recommendation: 'A chave privada do Stripe NUNCA deve estar no front-end. Mova as transações para o servidor.'
  },
  {
    service: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/g,
    recommendation: 'Revogue esta chave AWS imediatamente no IAM e utilize credenciais temporárias do AWS STS via backend.'
  },
  {
    service: 'Firebase Config (apiKey expositora de gravação)',
    regex: /apiKey\s*:\s*["'](AIza[0-9A-Za-z-_]{35})["']/g,
    recommendation: 'Assegure-se de configurar as Regras de Segurança do Firestore/Realtime DB para evitar acesso não autorizado.'
  }
];

// Content Leak Files List (Max 20 critical files)
const CRITICAL_FILES_LIST = [
  { path: '.env', type: 'Env Config', risk: 'Crítico' as const },
  { path: 'robots.txt', type: 'Robots File', risk: 'Alerta' as const },
  { path: '.git/config', type: 'Git Repository Config', risk: 'Crítico' as const },
  { path: 'sitemap.xml', type: 'Sitemap', risk: 'Alerta' as const },
  { path: 'backup.sql', type: 'Database Backup', risk: 'Crítico' as const },
  { path: 'wp-config.php.dist', type: 'WordPress Sample Config', risk: 'Alto' as const },
  { path: 'uploads/', type: 'Uploads Directory', risk: 'Médio' as const },
  { path: 'config.json', type: 'App Configuration', risk: 'Alto' as const },
  { path: '.env.local', type: 'Local Env', risk: 'Crítico' as const },
  { path: '.env.production', type: 'Production Env', risk: 'Crítico' as const },
  { path: 'database.sqlite', type: 'SQLite Database', risk: 'Crítico' as const },
  { path: '.DS_Store', type: 'OS Directory Metadata', risk: 'Médio' as const },
  { path: 'swagger.json', type: 'API Documentation Spec', risk: 'Médio' as const }
];

async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  maxRedirects = 3
): Promise<{ ok: boolean; status: number; text: string; contentType: string; headers: Record<string, string> }> {
  let currentUrl = url;
  let redirectsLeft = maxRedirects;

  while (redirectsLeft >= 0) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      return { ok: false, status: 0, text: '', contentType: '', headers: {} };
    }

    const ssrfCheck = await isSsrfSafeUrl(parsed);
    if (!ssrfCheck.safe) {
      return { ok: false, status: 0, text: '', contentType: '', headers: {} };
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'TurtleEye-Security-Scanner/1.0 (+https://turtleeye.security - Ethical Inspection)'
        }
      });
      clearTimeout(id);

      // Extract response headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key.toLowerCase()] = value;
      });

      // Handle Redirects (301, 302, 303, 307, 308)
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location || redirectsLeft === 0) {
          return { ok: false, status: res.status, text: '', contentType: '', headers: resHeaders };
        }
        currentUrl = new URL(location, currentUrl).toString();
        redirectsLeft--;
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      return { ok: res.ok, status: res.status, text, contentType, headers: resHeaders };
    } catch {
      clearTimeout(id);
      return { ok: false, status: 0, text: '', contentType: '', headers: {} };
    }
  }

  return { ok: false, status: 0, text: '', contentType: '', headers: {} };
}

app.post('/api/scan', async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Limite de requisições excedido. Aguarde alguns minutos.' });
  }

  let targetUrlInput = req.body.url || req.body.target_url;
  if (!targetUrlInput || typeof targetUrlInput !== 'string') {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  targetUrlInput = targetUrlInput.trim();
  if (targetUrlInput.length > 500) {
    return res.status(400).json({ error: 'URL excede o tamanho máximo permitido.' });
  }

  // Ensure protocol
  if (!targetUrlInput.startsWith('http://') && !targetUrlInput.startsWith('https://')) {
    targetUrlInput = 'https://' + targetUrlInput;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrlInput);
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }

  // SSRF Validation
  const ssrfCheck = await isSsrfSafeUrl(parsedUrl);
  if (!ssrfCheck.safe) {
    return res.status(400).json({ error: ssrfCheck.reason });
  }

  const startTime = Date.now();

  try {
    // 1. Download main HTML
    const htmlRes = await fetchWithTimeout(parsedUrl.toString());
    if (htmlRes.status === 0) {
      return res.status(400).json({ error: 'Não foi possível conectar ao domínio informado. Verifique se o site está online.' });
    }

    const htmlContent = htmlRes.text;
    const $ = cheerio.load(htmlContent);
    const pageTitle = $('title').text().trim() || parsedUrl.hostname;

    // Extract JS files
    const jsUrls: string[] = [];
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const absoluteJsUrl = new URL(src, parsedUrl.toString()).toString();
          if (!jsUrls.includes(absoluteJsUrl)) {
            jsUrls.push(absoluteJsUrl);
          }
        } catch {
          // ignore malformed URLs
        }
      }
    });

    // Limit JS fetches to max 5 scripts to maintain speed
    const jsScriptsToFetch = jsUrls.slice(0, 5);
    const jsContents: { url: string; content: string }[] = [];

    await Promise.all(
      jsScriptsToFetch.map(async (jsUrl) => {
        const resJs = await fetchWithTimeout(jsUrl, 4000);
        if (resJs.ok && resJs.text) {
          jsContents.push({ url: jsUrl, content: resJs.text });
        }
      })
    );

    // PILLARS ANALYSIS
    const piiItems: any[] = [];
    const secretItems: any[] = [];

    // Helper to scan text for PII
    function analyzeTextForPii(text: string, locationName: string, sourceType: 'HTML' | 'JavaScript') {
      // CPFs
      const cpfMatches = text.match(CPF_REGEX) || [];
      const uniqueCpfs = Array.from(new Set(cpfMatches));
      uniqueCpfs.forEach((cpf) => {
        // Strict Modulo 11 CPF validation to eliminate false positives
        if (isValidCpf(cpf)) {
          piiItems.push({
            type: 'CPF',
            match: cpf,
            masked: maskCpf(cpf),
            location: locationName,
            sourceType
          });
        }
      });

      // Phone
      const phoneMatches = text.match(PHONE_REGEX) || [];
      const uniquePhones = Array.from(new Set(phoneMatches));
      uniquePhones.forEach((phone) => {
        // Strict DDD & Brazilian phone format triaging, excluding public SAC numbers (0800, 4004, etc.)
        if (isValidBrazilianPhone(phone) && !isInstitutionalPublicContact(phone, 'Telefone')) {
          piiItems.push({
            type: 'Telefone',
            match: phone,
            masked: maskPhone(phone),
            location: locationName,
            sourceType
          });
        }
      });

      // Email
      const emailMatches = text.match(EMAIL_REGEX) || [];
      const uniqueEmails = Array.from(new Set(emailMatches));
      uniqueEmails.forEach((email) => {
        // Filter common dummy extensions and institutional SAC/Support emails (sac@, suporte@, etc.)
        if (
          !email.endsWith('.png') &&
          !email.endsWith('.jpg') &&
          !email.endsWith('.svg') &&
          !email.endsWith('.js') &&
          !isInstitutionalPublicContact(email, 'E-mail')
        ) {
          piiItems.push({
            type: 'E-mail',
            match: email,
            masked: maskEmail(email),
            location: locationName,
            sourceType
          });
        }
      });
    }

    // Helper to scan text for Secrets
    function analyzeTextForSecrets(text: string, locationName: string) {
      SECRET_PATTERNS.forEach((pattern) => {
        const matches = text.match(pattern.regex) || [];
        const unique = Array.from(new Set(matches));
        unique.forEach((matchKey) => {
          secretItems.push({
            service: pattern.service,
            matchedKey: matchKey,
            maskedKey: maskSecretKey(matchKey),
            location: locationName,
            risk: 'Crítico',
            recommendation: pattern.recommendation
          });
        });
      });
    }

    // Scan HTML
    analyzeTextForPii(htmlContent, 'HTML Principal (' + parsedUrl.pathname + ')', 'HTML');
    analyzeTextForSecrets(htmlContent, 'HTML Principal (' + parsedUrl.pathname + ')');

    // Scan JS scripts
    jsContents.forEach((js) => {
      const jsFileName = js.url.split('/').pop() || 'script.js';
      analyzeTextForPii(js.content, `Arquivo JS (${jsFileName})`, 'JavaScript');
      analyzeTextForSecrets(js.content, `Arquivo JS (${jsFileName})`);
    });

    // PILAR 3: Content Leak Testing
    const contentLeakResults: any[] = [];
    const origin = parsedUrl.origin;

    await Promise.all(
      CRITICAL_FILES_LIST.map(async (fileObj) => {
        const testUrl = `${origin}/${fileObj.path}`;
        const testRes = await fetchWithTimeout(testUrl, 3500);

        // Check if 200 OK and not returning standard HTML SPA page
        let isAccessible = testRes.status === 200;
        if (isAccessible && fileObj.path !== 'robots.txt' && fileObj.path !== 'sitemap.xml') {
          // If response starts with <!doctype html> or <html>, it might be a SPA fallback redirect
          const lowerText = testRes.text.trim().toLowerCase();
          if (lowerText.startsWith('<!doctype html') || lowerText.startsWith('<html')) {
            isAccessible = false;
          }
        }

        contentLeakResults.push({
          path: fileObj.path,
          url: testUrl,
          status: testRes.status,
          accessible: isAccessible,
          type: fileObj.type,
          riskLevel: fileObj.risk
        });
      })
    );

    // PILAR 4: ADVANCED SECURITY AUDIT (5 NEW VERIFICATIONS)
    // 1. GitLeaks Check (.git/HEAD, .git/config, .git/index)
    const gitHeadRes = await fetchWithTimeout(`${origin}/.git/HEAD`, 3000);
    const isGitExposed = gitHeadRes.status === 200 && gitHeadRes.text.includes('ref: refs/');
    const gitLeaks = {
      status: (isGitExposed ? 'Critico' : 'Seguro') as 'Critico' | 'Seguro' | 'Alerta',
      exposedFiles: isGitExposed ? ['.git/HEAD', '.git/config', '.git/index'] : [],
      details: isGitExposed
        ? 'Repositório Git público acessível (.git/). Atacantes podem clonar o código-fonte original completo e reconstruir commits históricos contendo segredos.'
        : 'Pasta do repositório .git/ está protegida ou não exposta publicamente no servidor web.',
      recommendation: isGitExposed
        ? 'Bloqueie o diretório .git/ no servidor web (Nginx/Apache/Cloudflare): location ~ /\\.git { deny all; }.'
        : 'Mantenha as regras de bloqueio de pastas ocultas ativas.'
    };

    // Combined JS text for client-side auditing
    const allJsCode = jsContents.map((j) => j.content).join('\n') + '\n' + htmlContent;

    // 2. RLS Check (Supabase / Firebase / Hasura / PostgREST)
    const hasBaaSReferences = /supabase\.co|firebaseio\.com|nhost\.run|hasura|graphql|\/rest\/v1\//i.test(allJsCode);
    const hasExplicitAuthCheck = /auth\.uid\(\)|auth\.currentUser|bearer\s+[a-z0-9-_.]+/i.test(allJsCode);
    const isRlsAlert = hasBaaSReferences && !hasExplicitAuthCheck;
    const rlsCheck = {
      status: (isRlsAlert ? 'Alerta' : 'Seguro') as 'Critico' | 'Seguro' | 'Alerta',
      detectedEndpoints: hasBaaSReferences
        ? Array.from(new Set(allJsCode.match(/(?:https?:\/\/[^\s"'`]+supabase\.co|firebaseio\.com|\/rest\/v1\/[a-zA-Z0-9_-]+)/gi) || [])).slice(0, 3)
        : [],
      details: isRlsAlert
        ? 'Encontradas referências a BaaS/Database no bundle JS sem padrões claros de validação de token ou políticas RLS ativas no cliente. Se o RLS estiver desativado no banco, tabelas inteiras ficam expostas para leitura/escrita.'
        : 'Não foram detectadas falhas evidentes de exposição de tabelas BaaS sem autenticação no cliente.',
      recommendation: 'Assegure-se de habilitar Row Level Security (RLS) em TODAS as tabelas do banco de dados (Supabase/Firebase/PostgreSQL).'
    };

    // 3. Input Sanitization (HTML Injection / DOM XSS)
    const htmlInjMatches = Array.from(new Set(allJsCode.match(/dangerouslySetInnerHTML|\.innerHTML\s*=|\$\([^)]+\)\.html\(/g) || []));
    const isSanitizationWarning = htmlInjMatches.length > 0;
    const inputSanitization = {
      status: (isSanitizationWarning ? 'Alto' : 'Seguro') as 'Alto' | 'Seguro' | 'Alerta',
      vulnerabilitiesFound: htmlInjMatches.map((m) => `Atribuição direta de HTML no DOM: ${m}`),
      details: isSanitizationWarning
        ? `Identificados ${htmlInjMatches.length} pontos de injeção direta de HTML no DOM sem sanitização explícita (HTML Injection / DOM XSS).`
        : 'Não foram encontrados padrões de atribuição insegura via innerHTML no código-fonte.',
      recommendation: 'Utilize sanitização com DOMPurify antes de injetar HTML dinâmico ou prefira interpolação nativa segura ({text}).'
    };

    // 4. Unauth Fetch (Fetch sem cabeçalho Auth em rotas da API)
    const fetchWithoutAuth = Array.from(new Set(allJsCode.match(/fetch\s*\(\s*["'`]\/api\/[a-zA-Z0-9_\/-]+["'`]\s*,\s*\{\s*(?!.*Authorization)/gi) || [])).slice(0, 4);
    const isUnauthFetchWarning = fetchWithoutAuth.length > 0;
    const unauthFetch = {
      status: (isUnauthFetchWarning ? 'Alto' : 'Seguro') as 'Alto' | 'Seguro' | 'Alerta',
      endpoints: fetchWithoutAuth.map((f) => f.replace(/[\n\r\s]+/g, ' ')),
      details: isUnauthFetchWarning
        ? 'Identificados chamadas fetch() para rotas de API sem a passagem visível de cabeçalhos de Autorização (Authorization: Bearer).'
        : 'As chamadas de API inspecionadas não apresentaram padronização de requisições anônimas vulneráveis.',
      recommendation: 'Garanta que endpoints sensíveis do backend exijam verificação de Sessão/JWT antes de retornar dados.'
    };

    // 5. Frontend Validation (Apenas validação client-side)
    const hasOnlyFrontendValidation = /<form[^>]*>|pattern=["'][^"']+["']|required|maxLength/i.test(htmlContent) && !/zod|yup|valibot|express-validator/i.test(allJsCode);
    const frontendValidation = {
      status: (hasOnlyFrontendValidation ? 'Alerta' : 'Seguro') as 'Medio' | 'Seguro' | 'Alerta',
      findings: hasOnlyFrontendValidation
        ? ['Formulário com validações de atributo HTML (required/pattern) sem indicação de esquema de schema-validation compartilhado no backend']
        : [],
      details: hasOnlyFrontendValidation
        ? 'Identificados formulários que dependem de atributos HTML no navegador. Um atacante pode burlar essas restrições via cURL/Postman.'
        : 'As regras de entrada parecem estruturadas de forma consistente.',
      recommendation: 'Toda validação de input de formulário DEVE ser duplicada e estritamente aplicada no servidor (Backend/API).'
    };

    // 6. CSP (Content Security Policy) Check
    const cspHeader = htmlRes.headers['content-security-policy'] || htmlRes.headers['content-security-policy-report-only'];
    const cspMetaTag = $('meta[http-equiv="content-security-policy" i]').attr('content');
    const activeCsp = cspHeader || cspMetaTag;
    const hasCsp = Boolean(activeCsp);
    const cspCheck = {
      status: (hasCsp ? 'Seguro' : 'Alto') as 'Critico' | 'Alto' | 'Seguro' | 'Alerta',
      hasCsp,
      cspDirectives: activeCsp ? activeCsp.slice(0, 150) + (activeCsp.length > 150 ? '...' : '') : undefined,
      details: hasCsp
        ? `Política CSP ativa detectada (${cspHeader ? 'via cabeçalho HTTP' : 'via tag <meta>'}).`
        : 'A aplicação não possui Content Security Policy (CSP) ativa nos cabeçalhos HTTP nem em tag <meta>. Sem CSP, o navegador fica desprotegido contra injeções de scripts e XSS.',
      recommendation: 'Configure um cabeçalho Content-Security-Policy restritivo (ex: default-src \'self\'; script-src \'self\' \'nonce-...\').'
    };

    // 7. SRI (Subresource Integrity) Check
    const missingIntegrityAssets: string[] = [];
    $('script[src], link[rel="stylesheet"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href');
      const integrity = $(el).attr('integrity');
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        try {
          const assetUrl = new URL(src, parsedUrl.toString());
          if (assetUrl.hostname !== parsedUrl.hostname && !integrity) {
            missingIntegrityAssets.push(assetUrl.toString());
          }
        } catch {}
      }
    });
    const uniqueMissingIntegrity = Array.from(new Set(missingIntegrityAssets)).slice(0, 4);
    const hasSriIssues = uniqueMissingIntegrity.length > 0;
    const sriCheck = {
      status: (hasSriIssues ? 'Alerta' : 'Seguro') as 'Alto' | 'Seguro' | 'Alerta',
      missingIntegrityAssets: uniqueMissingIntegrity,
      details: hasSriIssues
        ? `Identificados ${uniqueMissingIntegrity.length} recursos de CDNs/domínios externos sem o atributo Subresource Integrity (integrity="sha384-..."). Se a CDN for comprometida, scripts maliciosos serão executados no navegador.`
        : 'Todos os scripts/estilos de terceiros possuem verificações de integridade SRI ou são locais.',
      recommendation: 'Adicione o atributo integrity="sha384-..." e crossorigin="anonymous" em todas as tags <script> e <link> de terceiros.'
    };

    // 8. Iframe Sandbox Check
    const unprotectedIframes: string[] = [];
    $('iframe').each((_, el) => {
      const sandbox = $(el).attr('sandbox');
      const src = $(el).attr('src') || 'iframe inline/dinâmico';
      if (sandbox === undefined) {
        unprotectedIframes.push(`<iframe> src="${src}" sem atributo sandbox`);
      }
    });
    const uniqueUnprotectedIframes = Array.from(new Set(unprotectedIframes)).slice(0, 3);
    const hasIframeIssues = uniqueUnprotectedIframes.length > 0;
    const iframeSandboxCheck = {
      status: (hasIframeIssues ? 'Alerta' : 'Seguro') as 'Alto' | 'Seguro' | 'Alerta',
      unprotectedIframes: uniqueUnprotectedIframes,
      details: hasIframeIssues
        ? `Identificados ${uniqueUnprotectedIframes.length} elementos <iframe> sem o atributo sandbox. Sem o sandbox, o conteúdo do iframe pode executar scripts arbitrários no contexto da sua aplicação.`
        : 'Nenhum <iframe> desprotegido foi encontrado no documento HTML.',
      recommendation: 'Aplique o atributo sandbox="allow-scripts allow-same-origin" em todos os elementos <iframe> para restringir permissões.'
    };

    // 9. Security Headers & COOP/COEP Check
    const missingHeaders: string[] = [];
    const presentHeaders: string[] = [];

    if (htmlRes.headers['strict-transport-security']) {
      presentHeaders.push('Strict-Transport-Security (HSTS)');
    } else {
      missingHeaders.push('Strict-Transport-Security (HSTS)');
    }

    if (htmlRes.headers['x-frame-options'] || (cspHeader && cspHeader.includes('frame-ancestors'))) {
      presentHeaders.push('X-Frame-Options / frame-ancestors');
    } else {
      missingHeaders.push('X-Frame-Options / frame-ancestors (Proteção Clickjacking)');
    }

    if (htmlRes.headers['x-content-type-options']) {
      presentHeaders.push('X-Content-Type-Options (nosniff)');
    } else {
      missingHeaders.push('X-Content-Type-Options (nosniff)');
    }

    if (htmlRes.headers['referrer-policy']) {
      presentHeaders.push('Referrer-Policy');
    } else {
      missingHeaders.push('Referrer-Policy');
    }

    if (htmlRes.headers['cross-origin-opener-policy']) {
      presentHeaders.push('Cross-Origin-Opener-Policy (COOP)');
    } else {
      missingHeaders.push('Cross-Origin-Opener-Policy (COOP)');
    }

    const hasHeaderIssues = missingHeaders.length >= 2;
    const securityHeadersCheck = {
      status: (hasHeaderIssues ? 'Alto' : missingHeaders.length > 0 ? 'Alerta' : 'Seguro') as 'Alto' | 'Seguro' | 'Alerta',
      missingHeaders,
      presentHeaders,
      details: missingHeaders.length > 0
        ? `Ausência de ${missingHeaders.length} cabeçalhos modernos de segurança HTTP recomendados para navegadores.`
        : 'Todos os principais cabeçalhos de segurança HTTP modernos foram detectados.',
      recommendation: 'Adicione os cabeçalhos HSTS, X-Frame-Options, X-Content-Type-Options e Referrer-Policy na configuração do servidor ou CDN.'
    };

    const advancedAudit = {
      gitLeaks,
      rlsCheck,
      inputSanitization,
      unauthFetch,
      frontendValidation,
      cspCheck,
      sriCheck,
      iframeSandboxCheck,
      securityHeadersCheck
    };

    // Calculate Summary Stats
    const accessibleLeaks = contentLeakResults.filter((f) => f.accessible);
    const criticalCount = secretItems.length + accessibleLeaks.filter((f) => f.riskLevel === 'Crítico').length;
    const warningCount = piiItems.length + accessibleLeaks.filter((f) => f.riskLevel === 'Alto' || f.riskLevel === 'Médio').length;
    const alertCount = accessibleLeaks.filter((f) => f.riskLevel === 'Alerta').length;
    const secureCount = contentLeakResults.filter((f) => !f.accessible).length;

    // Security Score (100 - penalties)
    // Critical: -25 | High/Medium Warning: -10 | Public Mapping Alert (robots/sitemap): -2
    let score = 100;
    score -= criticalCount * 25;
    score -= warningCount * 10;
    score -= alertCount * 2;
    if (score < 0) score = 0;

    const durationMs = Date.now() - startTime;

    const scanResult = {
      status: 'success',
      target: parsedUrl.toString(),
      scan_duration_ms: durationMs,
      targetUrl: parsedUrl.toString(),
      scannedAt: new Date().toISOString(),
      durationMs,
      score,
      summary: {
        criticalCount,
        warningCount,
        secureCount
      },
      piiLeaks: {
        totalCount: piiItems.length,
        items: piiItems,
        summaryByType: {
          cpf: piiItems.filter((i) => i.type === 'CPF').length,
          phone: piiItems.filter((i) => i.type === 'Telefone').length,
          email: piiItems.filter((i) => i.type === 'E-mail').length
        }
      },
      secretsLeaks: {
        totalCount: secretItems.length,
        items: secretItems
      },
      contentLeaks: {
        totalTested: contentLeakResults.length,
        accessibleCount: accessibleLeaks.length,
        items: contentLeakResults
      },
      results: {
        pii_leaks: piiItems.map((item) => ({
          type: item.type,
          count: 1,
          sample: item.masked,
          location: item.location
        })),
        hardcoded_secrets: secretItems.map((item) => ({
          service: item.service,
          risk: item.risk,
          key_preview: item.maskedKey
        })),
        exposed_files: contentLeakResults.filter((f) => f.accessible).map((item) => ({
          file: `/${item.path}`,
          status: `${item.status} OK`,
          risk: item.riskLevel
        }))
      },
      advancedAudit,
      meta: {
        pageTitle,
        jsFilesAnalyzed: jsContents.length,
        contentLengthBytes: htmlContent.length
      }
    };

    return res.json(scanResult);
  } catch (err: any) {
    console.error('Erro na varredura:', err);
    return res.status(500).json({ error: 'Ocorreu um erro ao processar o escaneamento do domínio.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TurtleEye Server rodando na porta ${PORT}`);
  });
}

startServer();
