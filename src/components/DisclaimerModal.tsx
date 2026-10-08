import React from 'react';
import { X, ShieldCheck, AlertTriangle, FileText, Check, Lock } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#06110b]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-[#11271b] border border-[#235033] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-[#e8eee9] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#183925] flex items-center justify-between bg-[#0e2116]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#183925] text-[#dcae4d] border border-[#235033]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display text-lg font-bold text-[#f2f6f3]">
                Aviso Legal & Isenção de Responsabilidade
              </h2>
              <p className="font-mono-code text-[11px] text-[#8da595]">
                Termos de Varredura Ética & Proteção de Dados (LGPD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#183925] hover:bg-[#235033] text-[#a0b5a6] hover:text-[#f2f6f3] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#a0b5a6] leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded bg-[#0a1b11] border border-[#183925] space-y-2">
            <div className="flex items-center space-x-2 text-[#dcae4d] font-bold text-sm">
              <FileText className="w-4 h-4 shrink-0" />
              <span>1. Caráter da Inspeção: Estritamente Passiva e Ética</span>
            </div>
            <p>
              O <strong>TurtleEye</strong> opera como uma ferramenta de diagnóstico e auditoria de superfície para desenvolvedores e encarregados de dados (DPOs). As requisições executadas pelo sistema analisam unicamente código-fonte JavaScript público, marcas de marcação HTML e cabeçalhos HTTP estáticos expostos abertamente na internet.
            </p>
            <p className="text-[#8da595]">
              O serviço <strong>NÃO realiza</strong> testes de negação de serviço (DDoS), ataques de força bruta, injeção destrutiva de código em bancos de dados, interceptação de tráfego de terceiros ou desvio de mecanismos de autenticação.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded bg-[#0a1b11] border border-[#183925] space-y-2">
            <div className="flex items-center space-x-2 text-[#dcae4d] font-bold text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>2. Política de Privacidade e Zero Retenção de Dados</span>
            </div>
            <p>
              Em conformidade com os princípios da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), o TurtleEye foi concebido sem persistência de banco de dados. Os relatórios gerados pertencem exclusivamente à sessão do navegador atual e são imediatamente descartados ao fechar a aba ou realizar nova consulta.
            </p>
            <p className="text-[#8da595]">
              Nenhum endereço IP, credencial descoberta ou trecho de código inspecionado é comercializado, armazenado em logs permanentes ou compartilhado com terceiros.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded bg-[#0a1b11] border border-[#183925] space-y-2">
            <div className="flex items-center space-x-2 text-[#dcae4d] font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>3. Responsabilidade do Operador e Isenção Legal</span>
            </div>
            <p>
              O utilizador declara ser o proprietário legítimo do domínio submetido à análise ou possuir prévia autorização técnica para a verificação. O operador assume integral responsabilidade pela utilização do relatório técnico produzido.
            </p>
            <p className="text-[#8da595]">
              As pontuações de risco e sugestões de hardening têm caráter informativo e educativo. A utilização do TurtleEye não substitui auditorias formais de segurança de informação nem constitue parecer jurídico de conformidade perante a ANPD (Autoridade Nacional de Proteção de Dados).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#183925] bg-[#0e2116] flex items-center justify-between">
          <span className="font-mono-code text-[11px] text-[#6a8775]">
            TurtleEye Security Standard • ISO/IEC 27001 & LGPD
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded bg-[#dcae4d] hover:bg-[#ebbd5c] text-[#0c1f14] font-mono-code font-bold text-xs uppercase tracking-wider transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ENTENDI E CONCORDO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
