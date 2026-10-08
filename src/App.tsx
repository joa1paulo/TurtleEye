import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { ScanProgress } from './components/ScanProgress';
import { ResultsReport } from './components/ResultsReport';
import { ValueSection } from './components/ValueSection';
import { ScanModulesSummary } from './components/ScanModulesSummary';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ScanResult } from './types';
import { SAMPLE_SCAN_RESULT } from './data/sampleScan';

export default function App() {
  const [viewState, setViewState] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);

  const handleStartScan = async (urlToScan: string) => {
    setScanError(null);
    setTargetUrl(urlToScan);
    setViewState('scanning');

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlToScan })
      });

      const data = await response.json();

      if (!response.ok) {
        setScanError(data.error || 'Falha ao realizar a varredura do site.');
        setViewState('idle');
        return;
      }

      setScanResult(data);
      setViewState('results');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError('Erro de conexão com o servidor de inspeção. Tente novamente.');
      setViewState('idle');
    }
  };

  const handleLoadDemo = () => {
    setScanError(null);
    setTargetUrl(SAMPLE_SCAN_RESULT.targetUrl);
    setScanResult(SAMPLE_SCAN_RESULT);
    setViewState('results');
  };

  const handleReset = () => {
    setViewState('idle');
    setScanError(null);
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-forest-grid text-[#e8eee9] flex flex-col font-sans antialiased selection:bg-[#dcae4d] selection:text-[#0c1f14]">
      <Header
        onReset={handleReset}
        isScanning={viewState === 'scanning'}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
      />

      <main className="flex-1">
        {viewState === 'idle' && (
          <>
            <HeroSearch
              onStartScan={handleStartScan}
              onLoadDemo={handleLoadDemo}
              isScanning={false}
              error={scanError}
            />
            <ScanModulesSummary />
            <ValueSection onStartDemo={handleLoadDemo} />
          </>
        )}

        {viewState === 'scanning' && (
          <ScanProgress targetUrl={targetUrl} />
        )}

        {viewState === 'results' && scanResult && (
          <>
            <ResultsReport result={scanResult} onNewScan={handleReset} />
            <div className="border-t border-[#183925] bg-[#08170e]">
              <ScanModulesSummary />
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#183925] py-8 text-center text-xs text-[#6a8775] bg-[#08170e]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-code">
          <p>© {new Date().getFullYear()} TurtleEye — Vigilante LGPD & Front-End Security Inspector</p>
          <div className="flex items-center space-x-4 text-[#8da595]">
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="hover:text-[#dcae4d] transition-colors underline cursor-pointer bg-transparent border-0 p-0"
            >
              Aviso Legal & Disclaimer
            </button>
            <span>•</span>
            <span>Conformidade LGPD Brasil</span>
            <span>•</span>
            <span>Varredura Cortês</span>
          </div>
        </div>
      </footer>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
