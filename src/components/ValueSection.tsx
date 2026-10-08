import React from 'react';

interface ValueSectionProps {
  onStartDemo: () => void;
}

export const ValueSection: React.FC<ValueSectionProps> = ({ onStartDemo }) => {
  return (
    <section id="aviso-legal" className="py-16 px-4 max-w-6xl mx-auto space-y-16">
      {/* Hero Value comparison */}
      <div className="bg-[#11271b] border border-[#183925] rounded-xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-[#f2f6f3]">
            Por que o <span className="text-[#dcae4d] italic">TurtleEye</span> é diferente do Pentest tradicional?
          </h2>
          <p className="text-[#a0b5a6] text-sm md:text-base leading-relaxed">
            Ferramentas corporativas de teste de intrusão são complexas e cobram assinaturas pesadas. Nós focamos estritamente no código front-end e no que afeta a segurança e conformidade da <strong className="text-[#e8eee9]">LGPD no Brasil</strong>.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded bg-[#0a1b11] border border-[#183925] space-y-3">
            <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#7e9987]">Ferramentas Tradicionais</span>
            <ul className="space-y-2 text-xs text-[#8da595]">
              <li className="flex items-center space-x-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Relatórios de 50 páginas cheios de falso-positivos técnicos.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Sem foco específico nas regras de PII/LGPD brasileiras (CPFs e Telefones).</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Exigem cadastros extensos e assinaturas mensais caras.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded bg-[#133020] border border-[#dcae4d]/30 space-y-3">
            <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#dcae4d]">TurtleEye (Oceano Azul)</span>
            <ul className="space-y-2 text-xs text-[#e8eee9]">
              <li className="flex items-center space-x-2">
                <span className="text-[#dcae4d] font-bold">✓</span>
                <span>Varredura rápida focada no código JavaScript público e arquivos expostos.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#dcae4d] font-bold">✓</span>
                <span>Inspeção de CPFs soltos, GitLeaks (.git/HEAD), RLS, Injeção HTML e Unauth Fetch.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#dcae4d] font-bold">✓</span>
                <span>Análise cortês, sem persistência de dados e respeitosa com seu domínio.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <h3 className="font-serif-display text-2xl font-bold text-[#f2f6f3] text-center">Perguntas Frequentes (FAQ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded bg-[#11271b] border border-[#183925] space-y-2">
            <h4 className="font-bold text-[#e8eee9]">Como esta ferramenta evita problemas de CORS?</h4>
            <p className="text-[#8da595] leading-relaxed">
              O front-end conecta-se a um servidor proxy em Node.js / Express que efetua as requisições HTTP do lado do servidor, contornando com segurança as restrições de CORS do navegador.
            </p>
          </div>

          <div className="p-5 rounded bg-[#11271b] border border-[#183925] space-y-2">
            <h4 className="font-bold text-[#e8eee9]">Meus dados de varredura são salvos no banco de dados?</h4>
            <p className="text-[#8da595] leading-relaxed">
              Não! O TurtleEye foi desenhado sem persistência de banco de dados. Os relatórios são gerados em tempo real na sessão atual e descartados.
            </p>
          </div>

          <div className="p-5 rounded bg-[#11271b] border border-[#183925] space-y-2">
            <h4 className="font-bold text-[#e8eee9]">Qual é o risco de ter um CPF solto no front-end?</h4>
            <p className="text-[#8da595] leading-relaxed">
              Robôs e scrapers maliciosos automatizados varrem constantemente sites públicos. Expor dados de clientes sem consentimento configura infração grave perante a LGPD.
            </p>
          </div>

          <div className="p-5 rounded bg-[#11271b] border border-[#183925] space-y-2">
            <h4 className="font-bold text-[#e8eee9]">O que abrange a Auditoria Avançada?</h4>
            <p className="text-[#8da595] leading-relaxed">
              Testa a existência do repositório público (.git/), verificação do status RLS (Row Level Security), HTML Injection / DOM XSS, requisições fetch sem Auth e validações exclusivas no front-end.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
