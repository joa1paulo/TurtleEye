import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isScanning: boolean;
  onOpenDisclaimer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isScanning, onOpenDisclaimer }) => {
  const handleDisclaimerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenDisclaimer) {
      onOpenDisclaimer();
    }
    const disclaimerElem = document.getElementById('disclaimer');
    if (disclaimerElem) {
      disclaimerElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVarredurasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const varredurasElem = document.getElementById('varreduras');
    if (varredurasElem) {
      varredurasElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      const recursosElem = document.getElementById('recursos');
      if (recursosElem) recursosElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRecursosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const recursosElem = document.getElementById('recursos');
    if (recursosElem) {
      recursosElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b border-[#183925] bg-[#0c1f14]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          id="header-logo-btn"
          onClick={onReset}
          disabled={isScanning}
          className="flex items-center space-x-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="p-1.5 rounded bg-[#153422] border border-[#235035] text-[#dcae4d] group-hover:border-[#dcae4d]/60 transition-all">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-serif-display text-2xl font-bold tracking-tight text-[#f2f6f3] group-hover:text-[#dcae4d] transition-colors">
            TurtleEye
          </span>
        </button>

        <nav className="flex items-center space-x-6">
          <a
            href="#varreduras"
            onClick={handleVarredurasClick}
            className="font-mono-code text-xs uppercase tracking-widest text-[#a0b5a6] hover:text-[#dcae4d] transition-colors hidden md:inline-block cursor-pointer"
          >
            VARREDURAS
          </a>
          <a
            href="#recursos"
            onClick={handleRecursosClick}
            className="font-mono-code text-xs uppercase tracking-widest text-[#a0b5a6] hover:text-[#dcae4d] transition-colors hidden md:inline-block cursor-pointer"
          >
            RECURSOS
          </a>
          <button
            id="header-disclaimer-btn"
            onClick={handleDisclaimerClick}
            className="font-mono-code text-xs uppercase tracking-widest text-[#a0b5a6] hover:text-[#dcae4d] transition-colors hidden md:inline-block cursor-pointer bg-transparent border-0 p-0"
          >
            AVISO LEGAL
          </button>
          <button
            id="header-try-demo-btn"
            onClick={onReset}
            className="font-mono-code text-xs font-semibold px-4 py-2 rounded bg-[#163824] hover:bg-[#1d472e] text-[#dcae4d] border border-[#28573a] transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>NOVA VARREDURA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </nav>
      </div>
    </header>
  );
};
