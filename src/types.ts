export interface PiiMatch {
  type: 'CPF' | 'Telefone' | 'E-mail';
  match: string;
  masked: string;
  location: string;
  sourceType: 'HTML' | 'JavaScript';
}

export interface SecretMatch {
  service: string;
  matchedKey: string;
  maskedKey: string;
  location: string;
  risk: 'Crítico';
  recommendation: string;
}

export interface ContentLeakFile {
  path: string;
  url: string;
  status: number;
  accessible: boolean;
  type: string;
  riskLevel: 'Crítico' | 'Alto' | 'Médio' | 'Alerta' | 'Informativo';
}

export interface ScanProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

export interface AdvancedSecurityAudit {
  gitLeaks: {
    status: 'Critico' | 'Seguro' | 'Alerta';
    exposedFiles: string[];
    details: string;
    recommendation: string;
  };
  rlsCheck: {
    status: 'Critico' | 'Seguro' | 'Alerta';
    detectedEndpoints: string[];
    details: string;
    recommendation: string;
  };
  inputSanitization: {
    status: 'Alto' | 'Seguro' | 'Alerta';
    vulnerabilitiesFound: string[];
    details: string;
    recommendation: string;
  };
  unauthFetch: {
    status: 'Alto' | 'Seguro' | 'Alerta';
    endpoints: string[];
    details: string;
    recommendation: string;
  };
  frontendValidation: {
    status: 'Medio' | 'Seguro' | 'Alerta';
    findings: string[];
    details: string;
    recommendation: string;
  };
  cspCheck: {
    status: 'Critico' | 'Alto' | 'Seguro' | 'Alerta';
    hasCsp: boolean;
    cspDirectives?: string;
    details: string;
    recommendation: string;
  };
  sriCheck: {
    status: 'Alto' | 'Seguro' | 'Alerta';
    missingIntegrityAssets: string[];
    details: string;
    recommendation: string;
  };
  iframeSandboxCheck: {
    status: 'Alto' | 'Seguro' | 'Alerta';
    unprotectedIframes: string[];
    details: string;
    recommendation: string;
  };
  securityHeadersCheck: {
    status: 'Alto' | 'Seguro' | 'Alerta';
    missingHeaders: string[];
    presentHeaders: string[];
    details: string;
    recommendation: string;
  };
}

export interface ScanResult {
  targetUrl: string;
  scannedAt: string;
  durationMs: number;
  score: number; // 0 to 100 security index
  summary: {
    criticalCount: number;
    warningCount: number;
    secureCount: number;
  };
  piiLeaks: {
    totalCount: number;
    items: PiiMatch[];
    summaryByType: {
      cpf: number;
      phone: number;
      email: number;
    };
  };
  secretsLeaks: {
    totalCount: number;
    items: SecretMatch[];
  };
  contentLeaks: {
    totalTested: number;
    accessibleCount: number;
    items: ContentLeakFile[];
  };
  advancedAudit?: AdvancedSecurityAudit;
  meta: {
    pageTitle?: string;
    jsFilesAnalyzed: number;
    contentLengthBytes: number;
  };
}
