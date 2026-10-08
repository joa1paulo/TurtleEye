# TurtleEye

TurtleEye é uma aplicação web para avaliar a segurança front-end e a conformidade com a LGPD de um site público. A ferramenta aponta possíveis vazamentos de dados pessoais, segredos expostos, arquivos sensíveis, problemas de segurança no navegador e erros de configuração do servidor.

> **Importante:** TurtleEye é uma ferramenta de diagnóstico e educação em segurança. Ela não substitui uma auditoria profissional, testes de invasão autorizados ou a análise de um especialista em LGPD.

## Visão geral

A aplicação consiste em um frontend React e um servidor Express. O usuário informa uma URL pública e o servidor:

- valida a URL e protege contra SSRF;
- baixa o HTML e até cinco arquivos JavaScript vinculados;
- procura dados pessoais brasileiros (CPF, telefone e e-mail) em conteúdo público;
- procura segredos hardcoded, como chaves do Google, Stripe e AWS;
- tenta acessar caminhos críticos que podem revelar configurações ou backups;
- verifica sinais de exposição de repositório Git, RLS desativado, HTML injection, requisições sem autenticação e problemas de navegador;
- inspeciona cabeçalhos HTTP e políticas de segurança;
- retorna um relatório visual com pontuação e recomendações.

## Funcionalidades

### 1. PII e LGPD

Identifica CPFs, telefones brasileiros e e-mails pessoais encontrados no HTML ou nos bundles JavaScript. Os valores são mascarados no relatório para evitar exibição completa.

### 2. Hardcoded Secrets

Procura padrões de segredos em arquivos públicos, incluindo:

- Google Maps / Cloud API keys;
- Stripe secret keys;
- AWS access key IDs;
- configurações Firebase com `apiKey` exposto.

### 3. Content Leak

Testa caminhos sensíveis como `.env`, `.git/config`, `backup.sql`, `wp-config.php`, `robots.txt`, `sitemap.xml` e outros arquivos de configuração.

### 4. Auditoria avançada

A auditoria verifica:

- exposição do diretório `.git`;
- referências a Supabase, Firebase, Hasura ou PostgREST sem evidência clara de autenticação;
- uso de `innerHTML` e outras atribuições inseguras de HTML;
- chamadas `fetch()` para rotas de API sem cabeçalho de autenticação;
- validações somente no navegador;
- Content Security Policy;
- Subresource Integrity (SRI);
- atributos `sandbox` ausentes em `iframe`;
- cabeçalhos HTTP e políticas COOP/COEP.

## Tecnologias

- React 19
- TypeScript
- Vite 6
- Express
- Tailwind CSS 4
- Cheerio
- Lucide React
- Motion
- esbuild
- Node.js + TypeScript

## Requisitos

- Node.js 20 ou superior
- npm
- Acesso à internet para baixar o site informado
- Permissão explícita do proprietário para realizar testes no domínio

## Instalação

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd TurtleEye
```

Instale as dependências:

```bash
npm install
```

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

Preencha as variáveis locais, se necessário:

```dotenv
GEMINI_API_KEY="SUA_CHAVE"
APP_URL="http://localhost:3000"
```

> O projeto atualmente não utiliza a variável `GEMINI_API_KEY` diretamente no código. Ela pode ser necessária para integrações futuras ou por serviços de runtime.

## Executando localmente

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Para gerar a versão de produção:

```bash
npm run build
npm start
```

Para apenas visualizar a compilação de produção:

```bash
npm run preview
```

Para verificar tipos TypeScript:

```bash
npm run lint
```

Para remover a pasta de build:

```bash
npm run clean
```

## API

### `POST /api/scan`

Realiza a inspeção de uma URL.

#### Corpo da requisição

```json
{
  "url": "https://exemplo.com.br"
}
```

#### Resposta de sucesso

```json
{
  "status": "success",
  "targetUrl": "https://exemplo.com.br",
  "scannedAt": "2026-10-08T12:00:00.000Z",
  "durationMs": 1234,
  "score": 75,
  "summary": {
    "criticalCount": 0,
    "warningCount": 2,
    "secureCount": 11
  },
  "piiLeaks": {
    "totalCount": 0,
    "items": []
  },
  "secretsLeaks": {
    "totalCount": 0,
    "items": []
  },
  "contentLeaks": {
    "totalTested": 13,
    "accessibleCount": 0,
    "items": []
  },
  "advancedAudit": {},
  "meta": {
    "pageTitle": "Exemplo",
    "jsFilesAnalyzed": 2,
    "contentLengthBytes": 4567
  }
}
```

#### Erros comuns

- `400`: URL ausente, inválida ou bloqueada por proteção SSRF;
- `429`: limite de requisições excedido;
- `500`: erro interno durante a inspeção.

## Segurança implementada no servidor

O backend aplica diversas medidas de proteção:

- limite de requisições por IP;
- tamanho máximo da URL;
- bloqueio de URLs com protocolo diferente de HTTP/HTTPS;
- rejeição de localhost, domínios `.local`, `.internal`, `.lan` e IPs privados;
- validação DNS e IPs reservados;
- limite de redirects;
- timeout nas requisições;
- proteção de cabeçalhos e políticas de segurança;
- uso de `x-powered-by` desativado;
- bloqueio de `X-Frame-Options`, `X-Content-Type-Options` e políticas de navegação;
- validação estrutural de números de CPF e telefone brasileiros;
- mascaramento de dados encontrados antes de apresentar no relatório.

## Limitações

- A análise depende da disponibilidade e do conteúdo público do domínio.
- A ferramenta analisa apenas o HTML principal e até cinco arquivos JavaScript externos.
- O modo de inspeção não garante que todos os endpoints ou lógica interna tenham sido avaliados.
- A detecção de RLS, autenticação e validações é heurística e pode gerar falso-positivos ou falso-negativos.
- O teste de arquivos sensíveis é deliberadamente limitado a um conjunto de caminhos críticos.
- O uso de um domínio sem autorização pode ser ilegal ou contrário às políticas do serviço.

## Uso ético

Use TurtleEye somente em:

- sistemas próprios;
- domínios que você possui ou recebeu autorização para testar;
- ambientes de desenvolvimento ou homologação;
- laboratórios de segurança e treinamentos.

Não execute a ferramenta contra serviços de terceiros sem autorização. A exposição de arquivos, segredos ou dados pessoais pode resultar em incidentes de segurança e violação de leis aplicáveis.

## Estrutura do projeto

```text
.
├── src/
│   ├── components/
│   ├── data/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── server.ts
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## Licença

Este projeto não possui uma licença definida no repositório. Consulte o proprietário do código antes de reutilizá-lo em produção ou distribuí-lo publicamente.

## Aviso legal

O TurtleEye fornece informações para apoio à segurança e conformidade. Não garante que um site esteja livre de vulnerabilidades nem que a avaliação seja completa. A responsabilidade por decisões técnicas, correções e conformidade continua sendo do responsável pela aplicação.
