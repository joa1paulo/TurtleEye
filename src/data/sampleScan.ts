import { ScanResult } from '../types';

export const SAMPLE_SCAN_RESULT: ScanResult = {
  targetUrl: 'https://exemplo-ecommerce-demo.com.br',
  scannedAt: new Date().toISOString(),
  durationMs: 1840,
  score: 45,
  summary: {
    criticalCount: 2,
    warningCount: 4,
    secureCount: 11
  },
  piiLeaks: {
    totalCount: 3,
    summaryByType: {
      cpf: 1,
      phone: 1,
      email: 1
    },
    items: [
      {
        type: 'CPF',
        match: '123.456.789-09',
        masked: '***.456.789-**',
        location: 'Arquivo JS (main.bundle.js)',
        sourceType: 'JavaScript'
      },
      {
        type: 'Telefone',
        match: '(11) 98765-4321',
        masked: '(11) *****-4321',
        location: 'HTML Principal (/checkout)',
        sourceType: 'HTML'
      },
      {
        type: 'E-mail',
        match: 'admin.suporte@empresa.com.br',
        masked: 'a***e@empresa.com.br',
        location: 'Arquivo JS (config.js)',
        sourceType: 'JavaScript'
      }
    ]
  },
  secretsLeaks: {
    totalCount: 2,
    items: [
      {
        service: 'Google Maps API Key',
        matchedKey: 'AIzaSyD8X9zP1kL2mN3oP4qR5sT6uV7wX8yZ90a',
        maskedKey: 'AIzaSy...90a',
        location: 'Arquivo JS (main.bundle.js)',
        risk: 'Crítico',
        recommendation: 'Restrinja a chave de API por referrer HTTP no Google Cloud Console para evitar o uso indevido da quota por terceiros.'
      },
      {
        service: 'AWS Access Key ID',
        matchedKey: 'AKIAIOSFODNN7EXAMPLE',
        maskedKey: 'AKIAIO...MPLE',
        location: 'HTML Principal (comentário em código)',
        risk: 'Crítico',
        recommendation: 'Revogue imediatamente esta chave de acesso no IAM da AWS. NUNCA exponha credenciais AWS no código do front-end.'
      }
    ]
  },
  contentLeaks: {
    totalTested: 13,
    accessibleCount: 2,
    items: [
      {
        path: '.env',
        url: 'https://exemplo-ecommerce-demo.com.br/.env',
        status: 200,
        accessible: true,
        type: 'Env Config',
        riskLevel: 'Crítico'
      },
      {
        path: 'robots.txt',
        url: 'https://exemplo-ecommerce-demo.com.br/robots.txt',
        status: 200,
        accessible: true,
        type: 'Robots File',
        riskLevel: 'Alerta'
      },
      {
        path: 'sitemap.xml',
        url: 'https://exemplo-ecommerce-demo.com.br/sitemap.xml',
        status: 200,
        accessible: true,
        type: 'Sitemap',
        riskLevel: 'Alerta'
      },
      {
        path: '.git/config',
        url: 'https://exemplo-ecommerce-demo.com.br/.git/config',
        status: 403,
        accessible: false,
        type: 'Git Repository Config',
        riskLevel: 'Crítico'
      },
      {
        path: 'backup.sql',
        url: 'https://exemplo-ecommerce-demo.com.br/backup.sql',
        status: 404,
        accessible: false,
        type: 'Database Backup',
        riskLevel: 'Crítico'
      },
      {
        path: 'wp-config.php.dist',
        url: 'https://exemplo-ecommerce-demo.com.br/wp-config.php.dist',
        status: 404,
        accessible: false,
        type: 'WordPress Sample Config',
        riskLevel: 'Alto'
      },
      {
        path: 'uploads/',
        url: 'https://exemplo-ecommerce-demo.com.br/uploads/',
        status: 403,
        accessible: false,
        type: 'Uploads Directory',
        riskLevel: 'Médio'
      },
      {
        path: 'config.json',
        url: 'https://exemplo-ecommerce-demo.com.br/config.json',
        status: 404,
        accessible: false,
        type: 'App Configuration',
        riskLevel: 'Alto'
      },
      {
        path: '.env.local',
        url: 'https://exemplo-ecommerce-demo.com.br/.env.local',
        status: 404,
        accessible: false,
        type: 'Local Env',
        riskLevel: 'Crítico'
      },
      {
        path: '.env.production',
        url: 'https://exemplo-ecommerce-demo.com.br/.env.production',
        status: 404,
        accessible: false,
        type: 'Production Env',
        riskLevel: 'Crítico'
      },
      {
        path: 'database.sqlite',
        url: 'https://exemplo-ecommerce-demo.com.br/database.sqlite',
        status: 404,
        accessible: false,
        type: 'SQLite Database',
        riskLevel: 'Crítico'
      },
      {
        path: '.DS_Store',
        url: 'https://exemplo-ecommerce-demo.com.br/.DS_Store',
        status: 404,
        accessible: false,
        type: 'OS Directory Metadata',
        riskLevel: 'Médio'
      },
      {
        path: 'swagger.json',
        url: 'https://exemplo-ecommerce-demo.com.br/swagger.json',
        status: 404,
        accessible: false,
        type: 'API Documentation Spec',
        riskLevel: 'Médio'
      }
    ]
  },
  advancedAudit: {
    gitLeaks: {
      status: 'Critico',
      exposedFiles: ['.git/HEAD', '.git/config', '.git/index'],
      details: 'Repositório Git público acessível no servidor HTTP (.git/). Atacantes podem reconstruir o código-fonte inteiro, commit por commit, extraindo segredos e credenciais históricas.',
      recommendation: 'Bloqueie o acesso à pasta .git/ no servidor web (Nginx/Apache/Cloudflare) usando regras de negação (location ~ /\\.git { deny all; }).'
    },
    rlsCheck: {
      status: 'Alerta',
      detectedEndpoints: ['/rest/v1/users', '/api/graphql', 'supabase.co/rest/v1'],
      details: 'Identificada referência a endpoints de BaaS/Database no bundle JS sem verificação visível de políticas RLS (Row Level Security). Se RLS estiver desativado no Supabase/Firebase, a tabela inteira fica exposta para leitura e escrita anônima.',
      recommendation: 'Ative Row Level Security (RLS) em TODAS as tabelas do seu banco de dados e defina políticas restritivas por auth.uid().'
    },
    inputSanitization: {
      status: 'Alto',
      vulnerabilitiesFound: ['dangerouslySetInnerHTML em UserProfile.tsx', 'Uso de element.innerHTML sem sanitizar DOMPurify'],
      details: 'Encontrada atribuição direta de HTML no DOM do front-end sem sanitização prévia (HTML Injection / Reflected XSS).',
      recommendation: 'Utilize DOMPurify para sanitizar strings vindas do usuário antes da renderização ou prefira o binding de texto puro do React ({text}).'
    },
    unauthFetch: {
      status: 'Alto',
      endpoints: ['GET /api/v1/orders', 'POST /api/v1/checkout/guest'],
      details: 'Funções de chamada de API (fetch/axios) invocadas sem cabeçalho Authorization ou Bearer token visível nas requisições.',
      recommendation: 'Verifique se todas as rotas sensíveis exigem verificação de JWT/Sessão no backend, independentemente do front-end.'
    },
    frontendValidation: {
      status: 'Alerta',
      findings: ['Validação de CPF e Valor apenas em formulário HTML sem re-validação obrigatória no Servidor'],
      details: 'Identificadas regras de validação aplicadas apenas no lado do cliente. Um atacante pode burlar os inputs do navegador e enviar dados arbitrários.',
      recommendation: 'Nunca confie em validações de front-end. Toda regra de negócio e sanitização de tipo DEVE ser duplicada e aplicada rigorosamente no backend.'
    },
    cspCheck: {
      status: 'Alto',
      hasCsp: false,
      details: 'A aplicação não possui política Content Security Policy (CSP) definida nos cabeçalhos HTTP ou em tags <meta>. Sem CSP, o navegador executa qualquer script injetado (XSS).',
      recommendation: 'Configure um cabeçalho Content-Security-Policy restritivo (ex: default-src \'self\'; script-src \'self\' \'nonce-...\').'
    },
    sriCheck: {
      status: 'Alerta',
      missingIntegrityAssets: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js'],
      details: 'Detectados scripts/estilos carregados de CDNs externas sem atributo Subresource Integrity (integrity="sha384-..."). Se a CDN for comprometida, scripts maliciosos serão executados.',
      recommendation: 'Adicione o atributo integrity="sha384-..." e crossorigin="anonymous" em todas as chamadas de scripts e CSS externos.'
    },
    iframeSandboxCheck: {
      status: 'Alerta',
      unprotectedIframes: ['<iframe> contendo widget de chat sem atributo sandbox'],
      details: 'Identificados elementos <iframe> incorporados sem o atributo sandbox="...". A página incorporada possui acesso total de execução no mesmo contexto.',
      recommendation: 'Adicione o atributo sandbox="allow-scripts allow-same-origin" em todos os iframes de conteúdos externos.'
    },
    securityHeadersCheck: {
      status: 'Alto',
      missingHeaders: ['Strict-Transport-Security (HSTS)', 'X-Frame-Options', 'Cross-Origin-Opener-Policy (COOP)'],
      presentHeaders: ['X-Content-Type-Options: nosniff', 'Referrer-Policy: strict-origin-when-cross-origin'],
      details: 'Ausência de cabeçalhos fundamentais como HSTS (força HTTPS) e X-Frame-Options / COOP (proteção contra Clickjacking e isolamento de abas).',
      recommendation: 'Configure cabeçalhos de segurança HTTP modernos no seu servidor web ou CDN (Cloudflare/Nginx/Vercel).'
    }
  },
  meta: {
    pageTitle: 'E-commerce Demo - Loja Virtual',
    jsFilesAnalyzed: 4,
    contentLengthBytes: 42890
  }
};
