import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, ShieldCheck, FileSearch, Lock, Bug, Code2 } from 'lucide-react';

interface HeroSearchProps {
  onStartScan: (url: string) => void;
  onLoadDemo: () => void;
  isScanning: boolean;
  error?: string | null;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onStartScan,
  onLoadDemo,
  isScanning,
  error
}) => {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onStartScan(inputUrl.trim());
  };

  return (
    <div className="relative pt-12 pb-20 md:pt-16 md:pb-28 px-4 max-w-5xl mx-auto text-center">
      {/* Eyebrow Pill Badge */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-sm bg-[#0c1f14] border border-[#dcae4d]/40 text-[#dcae4d] font-mono-code text-[11px] sm:text-xs tracking-widest uppercase mb-8 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#dcae4d]"></span>
        <span>VIGILANTE LGPD & SEGURANÇA FRONT-END</span>
      </div>

      {/* Main Serif Headline */}
      <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-normal text-[#f2f6f3] tracking-tight leading-[1.12] max-w-4xl mx-auto">
        Seu site respeita<br />
        <span className="italic text-[#dcae4d] font-serif-display">a privacidade</span><br />
        dos seus usuários?
      </h1>

      {/* Subtitle */}
      <p className="mt-6 text-[#a8beaf] text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
        Analise sua conformidade com a LGPD e a segurança do seu front-end em segundos.
      </p>

      {/* Main Search Input Form (Exact rect layout like image) */}
      <div className="mt-10 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex flex-col sm:flex-row items-stretch bg-[#122c1d] border border-[#235033] focus-within:border-[#dcae4d] transition-all">
            <input
              type="text"
              id="hero-url-input"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://seusite.com.br"
              disabled={isScanning}
              className="w-full bg-transparent px-5 py-4 text-[#e8eee9] font-mono-code placeholder-[#587361] focus:outline-none text-sm sm:text-base border-b sm:border-b-0 border-[#235033]"
            />
            <button
              type="submit"
              id="hero-scan-submit-btn"
              disabled={isScanning || !inputUrl.trim()}
              className="px-8 py-4 bg-[#dcae4d] hover:bg-[#ebbd5c] text-[#0c1f14] font-mono-code font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>ANALISAR</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-3 text-xs text-red-300 bg-red-950/60 border border-red-800/50 rounded p-3 text-left flex items-start space-x-2 font-mono-code">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Sub-label below form */}
        <div className="mt-4 font-mono-code text-[11px] sm:text-xs text-[#6a8775] tracking-widest uppercase flex flex-wrap items-center justify-center gap-2">
          <span>GRATUITO</span>
          <span>·</span>
          <span>SEM INSTALAÇÃO</span>
          <span>·</span>
          <span>RESULTADO EM SEGUNDOS</span>
        </div>

        {/* Scroll indicator */}
        <div className="mt-8 flex flex-col items-center space-y-1 text-[#506c5b] hover:text-[#dcae4d] transition-colors cursor-pointer" onClick={() => {
          document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
        }}>
          <span className="font-mono-code text-[10px] uppercase tracking-widest">SCROLL</span>
          <div className="w-0.5 h-6 bg-[#235033]"></div>
        </div>

        {/* Demo trigger helper */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#a0b5a6]">
          <span>Quer testar um exemplo real?</span>
          <button
            type="button"
            id="hero-load-demo-btn"
            onClick={onLoadDemo}
            disabled={isScanning}
            className="text-[#dcae4d] font-semibold underline hover:text-[#ebbd5c] transition-colors cursor-pointer"
          >
            Carregar relatório de demonstração interativo
          </button>
        </div>
      </div>

      {/* Value Proposition Highlights (4 Pilares) */}
      <div id="recursos" className="mt-20 pt-10 border-t border-[#183925] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="p-5 rounded bg-[#11271b] border border-[#1d472e] hover:border-[#dcae4d]/40 transition-all space-y-2">
          <div className="w-8 h-8 rounded bg-[#173a26] text-[#dcae4d] flex items-center justify-center">
            <FileSearch className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-[#f2f6f3] text-sm">1. PII & LGPD Brasil</h3>
          <p className="text-xs text-[#8da595] leading-relaxed">
            Identifica CPFs, telefones e e-mails pessoais vazados em pacotes JS públicos.
          </p>
        </div>

        <div className="p-5 rounded bg-[#11271b] border border-[#1d472e] hover:border-[#dcae4d]/40 transition-all space-y-2">
          <div className="w-8 h-8 rounded bg-[#173a26] text-[#dcae4d] flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-[#f2f6f3] text-sm">2. Hardcoded Secrets</h3>
          <p className="text-xs text-[#8da595] leading-relaxed">
            Varre pacotes em busca de chaves privadas do Stripe, Google, AWS e APIs.
          </p>
        </div>

        <div className="p-5 rounded bg-[#11271b] border border-[#1d472e] hover:border-[#dcae4d]/40 transition-all space-y-2">
          <div className="w-8 h-8 rounded bg-[#173a26] text-[#dcae4d] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-[#f2f6f3] text-sm">3. Content Leak & .env</h3>
          <p className="text-xs text-[#8da595] leading-relaxed">
            Testa acessibilidade de backups (.env, backup.sql, wp-config.php, robots.txt).
          </p>
        </div>

        <div className="p-5 rounded bg-[#11271b] border border-[#1d472e] hover:border-[#dcae4d]/40 transition-all space-y-2">
          <div className="w-8 h-8 rounded bg-[#173a26] text-[#dcae4d] flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-[#f2f6f3] text-sm">4. Auditoria Avançada</h3>
          <p className="text-xs text-[#8da595] leading-relaxed">
            GitLeaks, RLS Supabase/Firebase, HTML Injection, Fetch sem Auth e Validações.
          </p>
        </div>
      </div>
    </div>
  );
};
