import React, { useState } from 'react';
import { ScanResult, PiiMatch, SecretMatch, ContentLeakFile } from '../types';
import { SecuritySuggestions } from './SecuritySuggestions';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  FileCode2,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  Sparkles,
  ShieldX,
  FileText,
  Globe,
  FileCode,
  Terminal
} from 'lucide-react';

interface ResultsReportProps {
  result: ScanResult;
  onNewScan: () => void;
}

export const ResultsReport: React.FC<ResultsReportProps> = ({ result, onNewScan }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pii' | 'secrets' | 'leaks' | 'advanced' | 'suggestions'>('all');
  const [showAllFiles, setShowAllFiles] = useState(false);

  const { summary, piiLeaks, secretsLeaks, contentLeaks, targetUrl, scannedAt, score, meta } = result;

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Excelente' };
    if (scoreValue >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Atenção Necessária' };
    return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Risco Alto' };
  };

  const scoreBadge = getScoreColor(score);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Bar Summary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11271b] border border-[#183925] rounded-xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono-code text-[#a0b5a6] mb-1">
            <span>Relatório de Inspeção Front-End</span>
            <span>•</span>
            <span className="text-[#dcae4d]">{new Date(scannedAt).toLocaleString('pt-BR')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#f2f6f3] flex items-center space-x-2 truncate max-w-2xl">
            <span className="truncate">{targetUrl}</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#a0b5a6] hover:text-[#dcae4d] transition-colors shrink-0"
              title="Abrir URL em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          {meta.pageTitle && (
            <p className="text-xs text-[#8da595] mt-1">Título: "{meta.pageTitle}"</p>
          )}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button
            onClick={onNewScan}
            id="report-new-scan-btn"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded bg-[#183925] hover:bg-[#204a30] text-[#dcae4d] text-xs font-mono-code font-semibold border border-[#28573a] transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NOVA VARREDURA</span>
          </button>
        </div>
      </div>

      {/* Instant Visual Risk Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Gauge Card */}
        <div className={`p-6 rounded-xl border ${scoreBadge.border} ${scoreBadge.bg} flex flex-col justify-between`}>
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#a0b5a6]">Índice de Proteção LGPD</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className={`text-4xl sm:text-5xl font-black font-mono-code ${scoreBadge.text}`}>{score}</span>
              <span className="text-[#a0b5a6] text-sm font-semibold font-mono-code">/100</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#183925] flex items-center justify-between text-xs font-semibold">
            <span className="text-[#e8eee9]">Classificação:</span>
            <span className={scoreBadge.text}>{scoreBadge.label}</span>
          </div>
        </div>

        {/* Critical Card */}
        <div className="p-6 rounded-xl bg-[#11271b] border border-[#183925] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#a0b5a6]">Risco Crítico</span>
            <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono-code text-[#f2f6f3]">{summary.criticalCount}</span>
            <p className="text-xs text-[#8da595] mt-1">Chaves expostas & backups sensíveis acessíveis</p>
          </div>
        </div>

        {/* Warnings Card */}
        <div className="p-6 rounded-xl bg-[#11271b] border border-[#183925] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#a0b5a6]">Avisos & PII</span>
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[#dcae4d]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono-code text-[#f2f6f3]">{summary.warningCount}</span>
            <p className="text-xs text-[#8da595] mt-1">Dados pessoais (CPF, telefones, e-mails) não-ofuscados</p>
          </div>
        </div>

        {/* Secure Items Card */}
        <div className="p-6 rounded-xl bg-[#11271b] border border-[#183925] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#a0b5a6]">Arquivos Seguros</span>
            <div className="p-2 rounded bg-[#183925] border border-[#235033] text-[#dcae4d]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold font-mono-code text-[#f2f6f3]">{summary.secureCount}</span>
            <p className="text-xs text-[#8da595] mt-1">De 13 caminhos críticos testados sem acesso livre</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#183925] pb-2 overflow-x-auto font-mono-code">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#dcae4d] text-[#0c1f14] shadow-md shadow-[#dcae4d]/20 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          Todos os Resultados ({piiLeaks.totalCount + secretsLeaks.totalCount + contentLeaks.accessibleCount})
        </button>
        <button
          onClick={() => setActiveTab('pii')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'pii'
              ? 'bg-[#dcae4d] text-[#0c1f14] shadow-md shadow-[#dcae4d]/20 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          <span>Pilar 1: PII e LGPD</span>
          <span className="px-1.5 py-0.5 rounded bg-[#183925] text-[#dcae4d] text-[10px]">
            {piiLeaks.totalCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'secrets'
              ? 'bg-red-500 text-[#0c1f14] shadow-md shadow-red-500/20 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          <span>Pilar 2: Hardcoded Secrets</span>
          <span className="px-1.5 py-0.5 rounded bg-[#183925] text-red-400 text-[10px]">
            {secretsLeaks.totalCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('leaks')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'leaks'
              ? 'bg-[#235033] text-[#dcae4d] shadow-md border border-[#dcae4d]/40 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          <span>Pilar 3: Content Leak</span>
          <span className="px-1.5 py-0.5 rounded bg-[#0a1b11] text-[#dcae4d] text-[10px]">
            {contentLeaks.accessibleCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'advanced'
              ? 'bg-[#28573a] text-[#dcae4d] shadow-md border border-[#dcae4d]/40 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          <span>Pilar 4: Auditoria Avançada</span>
          <span className="px-1.5 py-0.5 rounded bg-[#0a1b11] text-[#dcae4d] text-[10px] font-bold">
            9 Verificações
          </span>
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded text-xs font-semibold transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'suggestions'
              ? 'bg-[#dcae4d] text-[#0c1f14] shadow-md shadow-[#dcae4d]/20 font-bold'
              : 'bg-[#0a1b11] text-[#a0b5a6] hover:text-[#e8eee9] border border-[#183925]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Guia de Correção (Hardening)</span>
        </button>
      </div>

      {/* SUGGESTIONS TAB */}
      {activeTab === 'suggestions' && <SecuritySuggestions />}

      {/* PILAR 4: AUDITORIA AVANÇADA DE SEGURANÇA */}
      {(activeTab === 'all' || activeTab === 'advanced') && result.advancedAudit && (
        <section className="bg-[#11271b] border border-[#183925] rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] text-xs font-mono-code font-bold uppercase tracking-wider">
                  Pilar 4
                </span>
                <h3 className="text-lg font-serif-display font-bold text-[#f2f6f3]">Auditoria de Segurança & Código Front-End</h3>
              </div>
              <p className="text-xs text-[#8da595]">
                Inspeções avançadas cobrindo 9 verificações: GitLeaks, RLS, Injeção HTML, Fetch sem Auth, Validações Front-End, CSP, SRI, Iframes e Cabeçalhos HTTP.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. GitLeaks */}
            <div className={`p-4 rounded-xl border text-xs space-y-3 ${
              result.advancedAudit.gitLeaks.status === 'Critico'
                ? 'bg-red-950/30 border-red-900/50'
                : 'bg-[#0a1b11] border-[#183925]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode2 className="w-4 h-4 text-[#dcae4d]" />
                  <span className="font-bold text-[#e8eee9]">1. GitLeaks (Repositório Público .git)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                  result.advancedAudit.gitLeaks.status === 'Critico'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                }`}>
                  {result.advancedAudit.gitLeaks.status === 'Critico' ? 'VULNERÁVEL' : 'SEGURO'}
                </span>
              </div>
              <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.gitLeaks.details}</p>
              <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.gitLeaks.recommendation}
              </div>
            </div>

            {/* 2. RLS Check */}
            <div className={`p-4 rounded-xl border text-xs space-y-3 ${
              result.advancedAudit.rlsCheck.status === 'Alerta'
                ? 'bg-amber-950/20 border-amber-800/40'
                : 'bg-[#0a1b11] border-[#183925]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#dcae4d]" />
                  <span className="font-bold text-[#e8eee9]">2. Row Level Security (RLS)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                  result.advancedAudit.rlsCheck.status === 'Alerta'
                    ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                    : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                }`}>
                  {result.advancedAudit.rlsCheck.status === 'Alerta' ? 'ALERTA RLS' : 'SEGURO'}
                </span>
              </div>
              <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.rlsCheck.details}</p>
              <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.rlsCheck.recommendation}
              </div>
            </div>

            {/* 3. Input Sanitization */}
            <div className={`p-4 rounded-xl border text-xs space-y-3 ${
              result.advancedAudit.inputSanitization.status === 'Alto'
                ? 'bg-red-950/20 border-red-900/50'
                : 'bg-[#0a1b11] border-[#183925]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-[#e8eee9]">3. Tratamento de Inputs (HTML Injection)</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                  result.advancedAudit.inputSanitization.status === 'Alto'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                }`}>
                  {result.advancedAudit.inputSanitization.status === 'Alto' ? 'RISCO XSS' : 'SEGURO'}
                </span>
              </div>
              <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.inputSanitization.details}</p>
              <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.inputSanitization.recommendation}
              </div>
            </div>

            {/* 4. Unauth Fetch */}
            <div className={`p-4 rounded-xl border text-xs space-y-3 ${
              result.advancedAudit.unauthFetch.status === 'Alto'
                ? 'bg-amber-950/20 border-amber-800/40'
                : 'bg-[#0a1b11] border-[#183925]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#dcae4d]" />
                  <span className="font-bold text-[#e8eee9]">4. Requisicões Fetch Anônimas</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                  result.advancedAudit.unauthFetch.status === 'Alto'
                    ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                    : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                }`}>
                  {result.advancedAudit.unauthFetch.status === 'Alto' ? 'FETCH SEM AUTH' : 'SEGURO'}
                </span>
              </div>
              <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.unauthFetch.details}</p>
              <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.unauthFetch.recommendation}
              </div>
            </div>

            {/* 5. Frontend Validation */}
            <div className="p-4 rounded-xl border border-[#183925] bg-[#0a1b11] text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[#dcae4d]" />
                  <span className="font-bold text-[#e8eee9]">5. Validações Exclusivas no Front-end</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-amber-500/20 text-[#dcae4d] border border-amber-500/30">
                  {result.advancedAudit.frontendValidation.status === 'Alerta' ? 'ATENÇÃO' : 'SEGURO'}
                </span>
              </div>
              <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.frontendValidation.details}</p>
              <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.frontendValidation.recommendation}
              </div>
            </div>

            {/* 6. Content Security Policy (CSP) */}
            {result.advancedAudit.cspCheck && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                result.advancedAudit.cspCheck.status === 'Alto' || result.advancedAudit.cspCheck.status === 'Critico'
                  ? 'bg-red-950/20 border-red-900/50'
                  : 'bg-[#0a1b11] border-[#183925]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-[#dcae4d]" />
                    <span className="font-bold text-[#e8eee9]">6. Content Security Policy (CSP)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                    result.advancedAudit.cspCheck.hasCsp
                      ? 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {result.advancedAudit.cspCheck.hasCsp ? 'CSP ATIVO' : 'SEM CSP'}
                  </span>
                </div>
                <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.cspCheck.details}</p>
                {result.advancedAudit.cspCheck.cspDirectives && (
                  <code className="block p-2 rounded bg-[#08170e] border border-[#183925] font-mono-code text-[10px] text-[#dcae4d] truncate">
                    {result.advancedAudit.cspCheck.cspDirectives}
                  </code>
                )}
                <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                  <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.cspCheck.recommendation}
                </div>
              </div>
            )}

            {/* 7. Subresource Integrity (SRI) */}
            {result.advancedAudit.sriCheck && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                result.advancedAudit.sriCheck.status === 'Alerta' || result.advancedAudit.sriCheck.status === 'Alto'
                  ? 'bg-amber-950/20 border-amber-800/40'
                  : 'bg-[#0a1b11] border-[#183925]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-[#dcae4d]" />
                    <span className="font-bold text-[#e8eee9]">7. Subresource Integrity (SRI)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                    result.advancedAudit.sriCheck.missingIntegrityAssets.length > 0
                      ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                      : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                  }`}>
                    {result.advancedAudit.sriCheck.missingIntegrityAssets.length > 0 ? 'SEM SRI' : 'SRI OK'}
                  </span>
                </div>
                <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.sriCheck.details}</p>
                {result.advancedAudit.sriCheck.missingIntegrityAssets.length > 0 && (
                  <div className="p-2 rounded bg-[#08170e] border border-[#183925] text-[10px] font-mono-code text-red-400 space-y-1">
                    {result.advancedAudit.sriCheck.missingIntegrityAssets.map((asset, i) => (
                      <div key={i} className="truncate">• {asset}</div>
                    ))}
                  </div>
                )}
                <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                  <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.sriCheck.recommendation}
                </div>
              </div>
            )}

            {/* 8. Iframe Sandboxing */}
            {result.advancedAudit.iframeSandboxCheck && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                result.advancedAudit.iframeSandboxCheck.status === 'Alerta' || result.advancedAudit.iframeSandboxCheck.status === 'Alto'
                  ? 'bg-amber-950/20 border-amber-800/40'
                  : 'bg-[#0a1b11] border-[#183925]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-[#dcae4d]" />
                    <span className="font-bold text-[#e8eee9]">8. Iframe Sandboxing (Isolamento)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                    result.advancedAudit.iframeSandboxCheck.unprotectedIframes.length > 0
                      ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                      : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                  }`}>
                    {result.advancedAudit.iframeSandboxCheck.unprotectedIframes.length > 0 ? 'IFRAME EXPOSTO' : 'SEGURO'}
                  </span>
                </div>
                <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.iframeSandboxCheck.details}</p>
                <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                  <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.iframeSandboxCheck.recommendation}
                </div>
              </div>
            )}

            {/* 9. Security Headers & COOP */}
            {result.advancedAudit.securityHeadersCheck && (
              <div className={`p-4 rounded-xl border text-xs space-y-3 col-span-1 md:col-span-2 ${
                result.advancedAudit.securityHeadersCheck.missingHeaders.length >= 2
                  ? 'bg-red-950/20 border-red-900/50'
                  : 'bg-[#0a1b11] border-[#183925]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#dcae4d]" />
                    <span className="font-bold text-[#e8eee9]">9. Cabeçalhos de Segurança HTTP & COOP/COEP</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                    result.advancedAudit.securityHeadersCheck.missingHeaders.length > 0
                      ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                      : 'bg-[#183925] text-[#dcae4d] border border-[#235033]'
                  }`}>
                    {result.advancedAudit.securityHeadersCheck.missingHeaders.length > 0
                      ? `${result.advancedAudit.securityHeadersCheck.missingHeaders.length} AUSENTES`
                      : 'CABEÇALHOS OK'}
                  </span>
                </div>
                <p className="text-[#a0b5a6] leading-relaxed">{result.advancedAudit.securityHeadersCheck.details}</p>
                
                {result.advancedAudit.securityHeadersCheck.missingHeaders.length > 0 && (
                  <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-red-300">
                    <span className="font-semibold text-red-400 block mb-1">Cabeçalhos Ausentes:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {result.advancedAudit.securityHeadersCheck.missingHeaders.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-2.5 rounded bg-[#08170e] border border-[#183925] text-[11px] text-[#8da595]">
                  <strong className="text-[#e8eee9]">Recomendação:</strong> {result.advancedAudit.securityHeadersCheck.recommendation}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PILAR 1: VAZAMENTO DE PII E LGPD */}
      {(activeTab === 'all' || activeTab === 'pii') && (
        <section className="bg-[#11271b] border border-[#183925] rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-[#183925] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] text-xs font-mono-code font-bold uppercase">
                  Pilar 1
                </span>
                <h3 className="text-lg font-serif-display font-bold text-[#f2f6f3]">Vazamento de PII e LGPD Localizado</h3>
              </div>
              <p className="text-xs text-[#8da595] mt-1">
                Varredura automatizada em busca de dados pessoais de identificação brasileiros no HTML e arquivos JS estáticos.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono-code text-[#dcae4d]">{piiLeaks.totalCount}</span>
              <span className="block text-[11px] font-mono-code text-[#6a8775]">instâncias encontradas</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded bg-[#0a1b11] border border-[#183925] text-xs text-[#a0b5a6] flex items-center space-x-2">
              <span className="font-semibold text-[#dcae4d]">CPFs:</span>
              <span>{piiLeaks.summaryByType.cpf}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#0a1b11] border border-[#183925] text-xs text-[#a0b5a6] flex items-center space-x-2">
              <span className="font-semibold text-[#dcae4d]">Telefones:</span>
              <span>{piiLeaks.summaryByType.phone}</span>
            </div>
            <div className="px-3 py-1.5 rounded bg-[#0a1b11] border border-[#183925] text-xs text-[#a0b5a6] flex items-center space-x-2">
              <span className="font-semibold text-[#dcae4d]">E-mails:</span>
              <span>{piiLeaks.summaryByType.email}</span>
            </div>
          </div>

          {/* SAC / Public Contact Triage Info Box */}
          <div className="p-3 rounded bg-[#0a1b11] border border-[#183925] text-[11px] text-[#a0b5a6] flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#dcae4d] shrink-0" />
            <span>
              <strong className="text-[#dcae4d]">Filtro de Contatos Públicos de Atendimento (SAC):</strong> E-mails institucionais oficiais (<code className="font-mono-code text-[#e8eee9]">sac@</code>, <code className="font-mono-code text-[#e8eee9]">suporte@</code>, <code className="font-mono-code text-[#e8eee9]">contato@</code>, <code className="font-mono-code text-[#e8eee9]">dpo@</code>) e centrais telefônicas (<code className="font-mono-code text-[#e8eee9]">0800</code>, <code className="font-mono-code text-[#e8eee9]">4004</code>) são filtrados automaticamente.
            </span>
          </div>

          {piiLeaks.items.length === 0 ? (
            <div className="p-6 rounded bg-[#0a1b11] border border-[#183925] text-[#dcae4d] text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Nenhum padrão de CPF, telefone ou e-mail pessoal exposto foi detectado no código público verificado.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {piiLeaks.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded bg-[#0a1b11] border border-[#183925] hover:border-[#235033] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-[#183925] text-[#dcae4d] font-mono-code font-bold text-[10px] uppercase border border-[#235033]">
                        {item.type}
                      </span>
                      <span className="font-mono-code text-[#e8eee9] font-semibold text-sm">{item.masked}</span>
                    </div>
                    <p className="text-[#8da595] text-[11px]">
                      Localização: <span className="text-[#e8eee9] font-medium">{item.location}</span> ({item.sourceType})
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-[#11271b] px-3 py-2 rounded border border-[#183925] text-[11px] text-[#a0b5a6] max-w-sm">
                    <span className="text-[#dcae4d] font-semibold block mb-0.5">Risco LGPD:</span>
                    Dados pessoais em texto simples no front-end podem ser capturados por robôs de raspagem.
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded bg-[#0a1b11] border border-[#183925] text-xs text-[#8da595] flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#dcae4d] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#e8eee9]">Recomendação de Correção LGPD:</span>
              <p className="mt-0.5 leading-relaxed">
                Remova referências diretas a CPFs ou telefones fixos nos bundles JavaScript ou HTML estático. Mantenha essa lógica restrita ao servidor backend autenticado.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* PILAR 2: HARDCODED SECRETS */}
      {(activeTab === 'all' || activeTab === 'secrets') && (
        <section className="bg-[#11271b] border border-[#183925] rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-[#183925] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono-code font-bold uppercase">
                  Pilar 2
                </span>
                <h3 className="text-lg font-serif-display font-bold text-[#f2f6f3]">Hardcoded Secrets (Chaves de API)</h3>
              </div>
              <p className="text-xs text-[#8da595] mt-1">
                Identificação de chaves e credenciais de serviços externos integradas inadvertidamente ao front-end.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono-code text-red-400">{secretsLeaks.totalCount}</span>
              <span className="block text-[11px] font-mono-code text-[#6a8775]">chaves críticas</span>
            </div>
          </div>

          {secretsLeaks.items.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Nenhuma chave de API privada conhecida (Stripe, AWS, Google Cloud) foi encontrada no front-end.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {secretsLeaks.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-950/80 border border-red-900/40 hover:border-red-800/60 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-extrabold text-[10px] uppercase border border-red-500/30">
                        RISCO CRÍTICO
                      </span>
                      <span className="font-bold text-slate-100 text-sm">{item.service}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Local: <strong className="text-slate-200">{item.location}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block mb-1">Chave Encontrada (Anonimizada):</span>
                      <code className="font-mono text-red-400 font-bold text-xs bg-slate-950 px-2 py-1 rounded border border-red-900/30 block truncate">
                        {item.maskedKey}
                      </code>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 text-[11px] block mb-1">Ação de Mitigação:</span>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{item.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PILAR 3: CONTENT LEAK */}
      {(activeTab === 'all' || activeTab === 'leaks') && (
        <section className="bg-[#11271b] border border-[#183925] rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-[#183925] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] text-xs font-mono-code font-bold uppercase">
                  Pilar 3
                </span>
                <h3 className="text-lg font-serif-display font-bold text-[#f2f6f3]">Content Leak (Arquivos Esquecidos)</h3>
              </div>
              <p className="text-xs text-[#8da595] mt-1">
                Teste ético direto de 13 caminhos padrão de arquivos de configuração e backups sensíveis.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono-code text-[#dcae4d]">{contentLeaks.accessibleCount}</span>
              <span className="block text-[11px] font-mono-code text-[#6a8775]">acessíveis publicamente</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(showAllFiles ? contentLeaks.items : contentLeaks.items.slice(0, 6)).map((file, idx) => {
              const isAlertOnly = file.riskLevel === 'Alerta' || file.path === 'robots.txt' || file.path === 'sitemap.xml';
              const isDanger = file.accessible && file.riskLevel === 'Crítico';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded border text-xs flex items-center justify-between gap-3 ${
                    isDanger
                      ? 'bg-red-950/20 border-red-900/50'
                      : file.accessible && isAlertOnly
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : file.accessible
                      ? 'bg-[#0a1b11] border-[#183925]'
                      : 'bg-[#0a1b11]/50 border-[#183925]/50 opacity-70'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center space-x-2">
                      <code className="font-mono-code font-bold text-[#e8eee9] truncate">{file.path}</code>
                      <span
                        className={`px-1.5 py-0.2 text-[9px] rounded font-mono-code font-bold uppercase ${
                          file.riskLevel === 'Crítico'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : file.riskLevel === 'Alto' || file.riskLevel === 'Alerta'
                            ? 'bg-amber-500/20 text-[#dcae4d] border border-amber-500/30'
                            : 'bg-[#183925] text-[#8da595]'
                        }`}
                      >
                        {file.riskLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8da595]">{file.type}</p>
                  </div>

                  <div className="text-right shrink-0">
                    {file.accessible ? (
                      <div className="flex items-center space-x-2">
                        {isAlertOnly ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[#dcae4d] font-mono-code font-bold text-[10px]">
                            Alerta / Mapeamento
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono-code font-bold text-[10px]">
                            200 OK (Acessível!)
                          </span>
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#a0b5a6] hover:text-[#dcae4d] transition-colors"
                          title="Testar requisição direta"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#183925] text-[#8da595] font-mono-code text-[10px]">
                        Bloqueado / {file.status || '404'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {contentLeaks.items.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllFiles(!showAllFiles)}
                className="text-xs font-mono-code font-semibold text-[#dcae4d] hover:text-[#f2f6f3] flex items-center justify-center space-x-1 mx-auto cursor-pointer"
              >
                <span>{showAllFiles ? 'Ocultar parte da lista' : `Ver todos os ${contentLeaks.items.length} caminhos auditados`}</span>
                {showAllFiles ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* Specific Risk Explanations for Public Mapping Files (robots.txt & sitemap.xml) */}
          <div className="p-4 rounded bg-[#0a1b11] border border-[#183925] text-xs space-y-3">
            <div className="flex items-center space-x-2 text-[#dcae4d] font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Análise Detalhada de Risco: Arquivos de Mapeamento (Classificação: Alerta - Amarelo)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#a0b5a6] text-[11px] leading-relaxed">
              <div className="p-3 rounded bg-[#11271b] border border-[#183925] space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <code className="font-mono-code font-bold text-[#dcae4d]">robots.txt</code>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[#dcae4d] text-[9px] font-mono-code font-bold uppercase">Nível: Alerta</span>
                </div>
                <p>
                  <strong>Risco de Mapeamento de Rotas Ocultas:</strong> O arquivo <code className="font-mono-code text-[#e8eee9]">robots.txt</code> orienta motores de busca, mas pode expor diretamente diretórios internos, painéis administrativos (<code className="font-mono-code text-[#e8eee9]">/admin</code>, <code className="font-mono-code text-[#e8eee9]">/wp-admin</code>) ou rotas privadas para robôs maliciosos e atacantes.
                </p>
              </div>

              <div className="p-3 rounded bg-[#11271b] border border-[#183925] space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <code className="font-mono-code font-bold text-[#dcae4d]">sitemap.xml</code>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[#dcae4d] text-[9px] font-mono-code font-bold uppercase">Nível: Alerta</span>
                </div>
                <p>
                  <strong>Risco de Reconhecimento de Estrutura:</strong> O <code className="font-mono-code text-[#e8eee9]">sitemap.xml</code> lista o mapa completo de URLs e rotas da aplicação, facilitando o enquadramento em ferramentas de raspagem em massa (scraping) e descoberta de páginas legadas/esquecidas.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Legal & Ethical Disclaimer Footer Card */}
      <div id="disclaimer" className="p-6 rounded-xl bg-[#11271b] border border-[#183925] text-xs text-[#8da595] space-y-2">
        <div className="flex items-center space-x-2 text-[#f2f6f3] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#dcae4d]" />
          <span>Disclaimer Legal e Varredura Ética Polida</span>
        </div>
        <p className="leading-relaxed">
          O <strong>TurtleEye</strong> realiza apenas inspeções não-invasivas de código-fonte público (HTML, CSS, JS estático e cabeçalhos HTTP públicos). Esta ferramenta destina-se exclusivamente a fins educacionais e de conformidade LGPD para desenvolvedores e proprietários de domínios. Certifique-se de que possui autorização prévia para analisar o domínio informado.
        </p>
      </div>
    </div>
  );
};
