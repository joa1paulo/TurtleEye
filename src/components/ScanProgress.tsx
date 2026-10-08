import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ScanProgressProps {
  targetUrl: string;
}

const STEPS = [
  { id: 'connect', label: 'Conectando ao servidor de destino...' },
  { id: 'html', label: 'Analisando o código HTML principal e meta-tags...' },
  { id: 'js', label: 'Auditando pacotes e scripts JavaScript estáticos...' },
  { id: 'pii', label: 'Executando motor de busca por PII (CPF, Telefones, E-mails)...' },
  { id: 'secrets', label: 'Auditando Chaves de API (Google, Stripe, AWS, Firebase)...' },
  { id: 'files', label: 'Verificando acessibilidade de arquivos de backup (.env, .git)...' },
  { id: 'advanced', label: 'Auditoria Avançada: GitLeaks, RLS, Injeção HTML, Fetch e Validações...' },
  { id: 'report', label: 'Compilando relatório final de conformidade...' }
];

export const ScanProgress: React.FC<ScanProgressProps> = ({ targetUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(Math.round(((currentStepIndex + 1) / STEPS.length) * 100), 98);

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="bg-[#11271b] border border-[#183925] rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#183925]">
          <div
            className="h-full bg-[#dcae4d] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#183925] border border-[#dcae4d]/30 text-[#dcae4d] flex items-center justify-center mb-6 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <h2 className="font-serif-display text-2xl font-bold text-[#f2f6f3]">Analisando Segurança do Front-End</h2>
          <p className="mt-1 text-xs text-[#dcae4d] font-mono-code font-medium truncate max-w-md">
            {targetUrl}
          </p>

          {/* Progress bar info */}
          <div className="w-full max-w-md mt-6">
            <div className="flex justify-between text-xs font-mono-code font-semibold text-[#a0b5a6] mb-2">
              <span>Progresso da Inspeção</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#183925] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#dcae4d] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="mt-8 w-full space-y-3 text-left max-w-md">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 text-xs transition-opacity duration-300 ${
                    isDone
                      ? 'text-[#dcae4d] font-medium'
                      : isCurrent
                      ? 'text-[#f2f6f3] font-semibold opacity-100'
                      : 'text-[#506c5b] opacity-60'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#dcae4d]" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-[#dcae4d] animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#235033]" />
                    )}
                  </div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-xs text-[#6a8775] border-t border-[#183925] pt-4 w-full">
            💡 <span className="font-medium text-[#a0b5a6]">Varredura Cortês:</span> Nenhum dado do seu site é armazenado em banco de dados permanente.
          </div>
        </div>
      </div>
    </div>
  );
};
