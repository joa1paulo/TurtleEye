import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Code2,
  FileCode,
  FileText,
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Terminal,
  Database,
  Globe
} from 'lucide-react';

export const SecuritySuggestions: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const snippets = {
    cspMeta: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.seudominio.com.br;">`,
    viteSourcemap: `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Previne vazamento de código fonte TypeScript/React
    minify: 'esbuild',
  },
});`,
    securityHeadersExpress: `// server.ts (Express Security Headers)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});`
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[#11271b] border border-[#183925] shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded bg-[#183925] text-[#dcae4d] border border-[#235033]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-serif-display font-bold text-[#f2f6f3]">Guia de Hardening Front-End & Proteção LGPD</h3>
            </div>
            <p className="text-xs text-[#a0b5a6] max-w-2xl leading-relaxed">
              Sugestões práticas e snippets prontos para implementar no front-end e diminuir riscos de vazamento de dados, exposição de código e abuso de API.
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-[#183925] border border-[#dcae4d]/30 text-[#dcae4d] text-xs font-mono-code font-semibold shrink-0">
            TurtleEye Standard
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Suggestion 1: CSP Header */}
        <div className="p-5 rounded-xl bg-[#11271b] border border-[#183925] space-y-4 hover:border-[#235033] transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#f2f6f3]">1. Content Security Policy (CSP)</h4>
              <p className="text-xs text-[#8da595]">Bloqueie a execução de scripts remotos não autorizados</p>
            </div>
          </div>

          <p className="text-xs text-[#a0b5a6] leading-relaxed">
            Configure uma política CSP estrita para prevenir ataques de Cross-Site Scripting (XSS) e injeção de scripts maliciosos de terceiros que possam capturar dados de formulários.
          </p>

          <div className="relative group">
            <pre className="p-3 rounded bg-[#0a1b11] border border-[#183925] text-[11px] font-mono-code text-[#dcae4d] overflow-x-auto whitespace-pre-wrap">
              {snippets.cspMeta}
            </pre>
            <button
              onClick={() => copyToClipboard(snippets.cspMeta, 1)}
              className="absolute top-2 right-2 p-1.5 rounded bg-[#183925] hover:bg-[#204a30] text-[#e8eee9] text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-[#dcae4d]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono-code">{copiedIndex === 1 ? 'Copiado!' : 'Copiar Meta'}</span>
            </button>
          </div>
        </div>

        {/* Suggestion 2: Disable Source Maps */}
        <div className="p-5 rounded-xl bg-[#11271b] border border-[#183925] space-y-4 hover:border-[#235033] transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#f2f6f3]">2. Desative Source Maps em Produção</h4>
              <p className="text-xs text-[#8da595]">Evite a reconstrução do código-fonte original React/TypeScript</p>
            </div>
          </div>

          <p className="text-xs text-[#a0b5a6] leading-relaxed">
            Arquivos <code className="text-[#dcae4d] font-mono-code bg-[#0a1b11] px-1 py-0.5 rounded">.js.map</code> expõem a estrutura completa de componentes e comentários internos. Desative a geração de mapas no ambiente de produção.
          </p>

          <div className="relative group">
            <pre className="p-3 rounded bg-[#0a1b11] border border-[#183925] text-[11px] font-mono-code text-[#dcae4d] overflow-x-auto whitespace-pre-wrap">
              {snippets.viteSourcemap}
            </pre>
            <button
              onClick={() => copyToClipboard(snippets.viteSourcemap, 2)}
              className="absolute top-2 right-2 p-1.5 rounded bg-[#183925] hover:bg-[#204a30] text-[#e8eee9] text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-[#dcae4d]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono-code">{copiedIndex === 2 ? 'Copiado!' : 'Copiar Config'}</span>
            </button>
          </div>
        </div>

        {/* Suggestion 3: Security Headers */}
        <div className="p-5 rounded-xl bg-[#11271b] border border-[#183925] space-y-4 hover:border-[#235033] transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#f2f6f3]">3. Cabeçalhos de Segurança HTTP</h4>
              <p className="text-xs text-[#8da595]">Proteção contra Clickjacking e MIME Sniffing</p>
            </div>
          </div>

          <p className="text-xs text-[#a0b5a6] leading-relaxed">
            Configure cabeçalhos HTTP no servidor web ou proxy reverso (Nginx/Cloudflare/Express) para proteger a aplicação contra enquadramento em iframes maliciosos.
          </p>

          <div className="relative group">
            <pre className="p-3 rounded bg-[#0a1b11] border border-[#183925] text-[11px] font-mono-code text-[#dcae4d] overflow-x-auto whitespace-pre-wrap">
              {snippets.securityHeadersExpress}
            </pre>
            <button
              onClick={() => copyToClipboard(snippets.securityHeadersExpress, 3)}
              className="absolute top-2 right-2 p-1.5 rounded bg-[#183925] hover:bg-[#204a30] text-[#e8eee9] text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-[#dcae4d]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono-code">{copiedIndex === 3 ? 'Copiado!' : 'Copiar Middleware'}</span>
            </button>
          </div>
        </div>

        {/* Suggestion 4: PII & LGPD Compliance */}
        <div className="p-5 rounded-xl bg-[#11271b] border border-[#183925] space-y-4 hover:border-[#235033] transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#f2f6f3]">4. Tratamento de Dados Pessoais (LGPD)</h4>
              <p className="text-xs text-[#8da595]">Anonimização e Princípio da Minimização</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-[#a0b5a6] list-disc list-inside leading-relaxed">
            <li>
              <strong>Ofuscação de Exibição:</strong> Nunca renderize CPFs ou números de cartão inteiros no DOM estático. Exiba apenas máscaras parciais (<code className="text-[#dcae4d] font-mono-code">***.123.456-**</code>).
            </li>
            <li>
              <strong>Evite LocalStorage sem Criptografia:</strong> Não armazene PIIs sensíveis em <code className="text-[#dcae4d] font-mono-code">localStorage</code> simples.
            </li>
            <li>
              <strong>Restrição de Indexação:</strong> Verifique se rotas com formulários internos não estão listadas publicamente no seu arquivo <code className="text-[#dcae4d] font-mono-code">robots.txt</code> ou <code className="text-[#dcae4d] font-mono-code">sitemap.xml</code>.
            </li>
          </ul>
        </div>
      </div>

      {/* Additional Advice Box */}
      <div className="p-5 rounded-xl bg-[#0a1b11] border border-[#183925] flex items-start space-x-4 text-xs text-[#a0b5a6]">
        <AlertTriangle className="w-5 h-5 text-[#dcae4d] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#e8eee9]">Aviso sobre Restrição de Chaves de API de Terceiros:</span>
          <p className="leading-relaxed">
            Se for estritamente necessário expor chaves públicas no front-end (como Google Maps API ou Firebase Web Key), certifique-se de configurar <strong>Restrições de Origem HTTP (HTTP Referrers)</strong> na plataforma do provedor.
          </p>
        </div>
      </div>
    </div>
  );
};
