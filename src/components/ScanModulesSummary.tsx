import React from 'react';
import {
  FileSearch,
  Key,
  FolderLock,
  GitBranch,
  Database,
  Code2,
  Send,
  UserCheck,
  ShieldCheck,
  Globe,
  FileCode,
  Terminal,
  Server
} from 'lucide-react';

export const ScanModulesSummary: React.FC = () => {
  const modules = [
    {
      id: 'pii',
      number: '01',
      title: 'Vazamentos de PII & LGPD',
      category: 'Privacidade de Dados',
      icon: FileSearch,
      description: 'Identifica números de CPF, CNPJ, telefones com DDD e e-mails pessoais expostos diretamente em bundles JavaScript e código HTML público.',
      badge: 'Conformidade LGPD'
    },
    {
      id: 'secrets',
      number: '02',
      title: 'Chaves de API & Credenciais',
      category: 'Segurança de Segredos',
      icon: Key,
      description: 'Varre arquivos estáticos em busca de chaves privadas hardcoded do Stripe, AWS, Google Cloud, Firebase, tokens JWT e Bearer.',
      badge: 'Zero-Exposition'
    },
    {
      id: 'content-leak',
      number: '03',
      title: 'Content Leak & Arquivos Esquecidos',
      category: 'Infraestrutura',
      icon: FolderLock,
      description: 'Fuzzer ético direto de 13 caminhos críticos como .env, backup.sql, wp-config.php, .git/HEAD, robots.txt e sitemap.xml.',
      badge: 'Fuzzer Ético'
    },
    {
      id: 'gitleaks',
      number: '04',
      title: 'GitLeaks & Repositório Exposto',
      category: 'Código Fonte',
      icon: GitBranch,
      description: 'Inspeção de pastas .git/ abertas publicamente na raiz do servidor web, evitando a clonagem completa do código-fonte por atacantes.',
      badge: 'Proteção de Código'
    },
    {
      id: 'rls',
      number: '05',
      title: 'Row Level Security (RLS)',
      category: 'Bancos de Dados BaaS',
      icon: Database,
      description: 'Verificação de tabelas no Supabase ou Firebase acessíveis publicamente sem regras de permissão por usuário (RLS desativado).',
      badge: 'Supabase / Firebase'
    },
    {
      id: 'xss',
      number: '06',
      title: 'Injeção HTML & DOM-XSS',
      category: 'Código Front-End',
      icon: Code2,
      description: 'Auditoria de renderizações inseguras (.innerHTML, innerText sem sanitização) que permitem injeção de scripts maliciosos.',
      badge: 'Anti-XSS'
    },
    {
      id: 'unauth-fetch',
      number: '07',
      title: 'Requisições sem Autenticação',
      category: 'APIs & Integridade',
      icon: Send,
      description: 'Mapeamento de requisições fetch/axios/XHR executadas para APIs internas sem o cabeçalho Authorization ou Bearer token.',
      badge: 'API Security'
    },
    {
      id: 'csp-sri',
      number: '08',
      title: 'CSP, SRI & Isolamento de Iframes',
      category: 'Políticas de Navegador',
      icon: Globe,
      description: 'Inspecção de cabeçalhos Content-Security-Policy, verificação de integridade (SRI) em CDNs externas e atributo sandbox em <iframes>.',
      badge: 'Navegador Seguro'
    },
    {
      id: 'headers',
      number: '09',
      title: 'Cabeçalhos HTTP & COOP/COEP',
      category: 'Hardening do Servidor',
      icon: Server,
      description: 'Validação de HSTS (forçar HTTPS), X-Frame-Options (Clickjacking), X-Content-Type-Options e navegação isolada Cross-Origin.',
      badge: 'HTTP Hardening'
    }
  ];

  return (
    <section id="varreduras" className="py-16 px-4 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[#183925] border border-[#235033] text-[#dcae4d] font-mono-code text-xs uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MOTORES DE AUDITORIA DE PONTA A PONTA</span>
        </div>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#f2f6f3]">
          Visão Geral das <span className="text-[#dcae4d] italic">Varreduras Realizadas</span>
        </h2>
        <p className="text-[#a0b5a6] text-sm leading-relaxed">
          O <strong>TurtleEye</strong> executa 9 categorias completas de análise técnica em tempo real, cobrindo privacidade (LGPD), proteção de segredos, infraestrutura e segurança do navegador.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m) => {
          const IconComponent = m.icon;
          return (
            <div
              key={m.id}
              className="bg-[#11271b] border border-[#183925] hover:border-[#dcae4d]/50 rounded-xl p-5 space-y-3 transition-all duration-300 hover:shadow-xl hover:shadow-[#0c1f14]/50 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033] group-hover:border-[#dcae4d]/40 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="font-mono-code text-xs font-bold text-[#6a8775]">
                      {m.number}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#0a1b11] border border-[#183925] font-mono-code text-[10px] text-[#dcae4d] uppercase font-semibold">
                    {m.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono-code text-[#8da595] block mb-0.5">
                    {m.category}
                  </span>
                  <h3 className="font-bold text-[#f2f6f3] text-sm group-hover:text-[#dcae4d] transition-colors">
                    {m.title}
                  </h3>
                </div>

                <p className="text-xs text-[#a0b5a6] leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#183925]/60 flex items-center justify-between text-[11px] font-mono-code text-[#6a8775]">
                <span>Status: Ativo</span>
                <span className="text-[#dcae4d] font-bold">100% Automatizado</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-xl bg-[#0a1b11] border border-[#183925] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="font-bold text-[#f2f6f3] text-sm">Pronto para testar a segurança do seu domínio?</h4>
          <p className="text-xs text-[#8da595]">Insira qualquer URL pública para receber um diagnóstico detalhado com plano de mitigação.</p>
        </div>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.getElementById('hero-url-input')?.focus();
          }}
          className="px-5 py-2.5 rounded bg-[#dcae4d] hover:bg-[#ebbd5c] text-[#0c1f14] font-mono-code font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
        >
          INICIAR VARREDURA AGORA
        </button>
      </div>
    </section>
  );
};
