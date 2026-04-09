# DWV · Teses de Investimento

Plataforma conversacional para criação de teses de investimento imobiliário com IA.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **IA**: Claude Sonnet (Anthropic API)
- **Auth + DB**: Supabase (magic link login + PostgreSQL)
- **Email**: SparkPost (SMTP)
- **Hospedagem**: Vercel

---

## Deploy passo a passo

### 1. Supabase — Banco de dados e autenticação

1. Acesse [supabase.com](https://supabase.com) → New Project
2. Anote: `Project URL`, `anon key`, `service_role key`
3. Vá em **SQL Editor** → cole o conteúdo de `supabase/schema.sql` → Execute
4. Vá em **Authentication → Settings**:
   - Site URL: `https://seuapp.vercel.app`
   - Redirect URLs: `https://seuapp.vercel.app/api/auth/callback`
   - (Opcional) Desabilite o email do Supabase para usar apenas o SparkPost

### 2. SparkPost — Email transacional

1. Acesse [sparkpost.com](https://sparkpost.com) → Create Account
2. Verifique seu domínio (ou use domínio sandbox para testes)
3. Vá em **Account → API Keys** → Create API Key com permissão de envio
4. Anote: API Key, domínio verificado

### 3. Anthropic — API key

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. API Keys → Create Key
3. Anote a chave

### 4. GitHub — Repositório

```bash
cd dwv-teses
git init
git add .
git commit -m "feat: initial commit"
git remote add origin https://github.com/SEU_USER/dwv-teses.git
git push -u origin main
```

### 5. Vercel — Deploy

1. Acesse [vercel.com](https://vercel.com) → New Project
2. Importe o repositório do GitHub
3. Adicione as variáveis de ambiente:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SPARKPOST_API_KEY=...
SPARKPOST_SMTP_HOST=smtp.sparkpostmail.com
SPARKPOST_SMTP_PORT=587
SPARKPOST_SMTP_USER=SMTP_Injection
SPARKPOST_FROM_EMAIL=noreply@seudominio.com.br
SPARKPOST_FROM_NAME=DWV Teses
NEXT_PUBLIC_APP_URL=https://seuapp.vercel.app
```

4. Deploy → aguardar build
5. Copiar a URL gerada e atualizar:
   - `NEXT_PUBLIC_APP_URL` na Vercel
   - Site URL e Redirect URLs no Supabase

### 6. Desenvolvimento local

```bash
cp .env.local.example .env.local
# Preencha as variáveis no .env.local

npm install
npm run dev
```

Acesse `http://localhost:3000`

---

## Como funciona

1. Usuário acessa a plataforma e insere email
2. Recebe link de acesso por email (magic link)
3. Clica no link → autenticado automaticamente
4. Interface conversacional: cola dados do produto + mercado em qualquer ordem
5. Solicita compilação → IA gera as tabelas comparativas diretamente no chat
6. Histórico de todas as teses salvo no banco

## Estrutura das tabelas geradas

Sempre na sequência:
1. **Perfil do produto** — dados isolados do imóvel
2. **Comparativo de m²** — produto vs mercado (cidade/segmento/bairro)
3. **Ticket médio** — idem
4. **VSO** — velocidade de vendas
5. **Histórico de valorização** — se fornecido
6. **ROI por aluguel** — se fornecido
7. **Comparativo regional** — outras cidades, menor → maior custo
