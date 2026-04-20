# Gym — Frontend Architecture (Next.js 14)

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (with CSS variables for white-label theming)
- **TanStack Query v5** (server state / data fetching)
- **Zustand** (UI state)
- **shadcn/ui** (component library, Radix-based)
- **React Hook Form + Zod** (forms & validation)
- **date-fns** (date handling, PT-BR locale)

## Setup

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @tanstack/react-query zustand zod react-hook-form date-fns
npx shadcn-ui@latest init
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Public marketing pages
│   │   │   ├── page.tsx           # Landing page (/)
│   │   │   ├── layout.tsx
│   │   │   └── demo/
│   │   │       └── page.tsx       # Demo academy showcase
│   │   ├── (academy)/             # White-labeled academy pages
│   │   │   ├── layout.tsx         # WhiteLabelProvider wrapper
│   │   │   ├── [subdomain]/
│   │   │   │   ├── page.tsx       # Academy home
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── page.tsx   # Student dashboard
│   │   │   │       ├── schedule/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── workouts/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── payments/
│   │   │   │           └── page.tsx
│   │   ├── admin/                 # Academy admin panel
│   │   │   ├── layout.tsx         # Admin sidebar layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Metrics overview
│   │   │   ├── students/
│   │   │   │   ├── page.tsx       # Student list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Student detail
│   │   │   ├── finance/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx       # Logo, colors, plans
│   │   ├── layout.tsx             # Root layout (QueryProvider, fonts)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── landing/               # Landing page sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── CtaBannerSection.tsx
│   │   │   └── Footer.tsx
│   │   ├── academy/               # White-labeled student pages
│   │   │   ├── WhiteLabelProvider.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   ├── ClassCard.tsx
│   │   │   ├── PaymentBadge.tsx
│   │   │   └── WorkoutCard.tsx
│   │   └── admin/                 # Admin panel components
│   │       ├── AdminSidebar.tsx
│   │       ├── MetricsCard.tsx
│   │       ├── StudentCard.tsx
│   │       ├── StudentForm.tsx
│   │       ├── PaymentTable.tsx
│   │       └── ScheduleManager.tsx
│   ├── lib/
│   │   ├── api.ts                 # Strapi API client (axios/fetch)
│   │   ├── auth.ts                # JWT token management
│   │   └── utils.ts               # cn(), formatCurrency(), formatDate()
│   ├── hooks/
│   │   ├── useAcademy.ts          # Fetch academy by subdomain
│   │   ├── useStudents.ts
│   │   ├── useSchedule.ts
│   │   ├── usePayments.ts
│   │   └── useAuth.ts
│   ├── stores/
│   │   ├── authStore.ts           # Zustand: user session
│   │   └── themeStore.ts          # Zustand: current academy theme
│   └── types/
│       └── index.ts               # TypeScript interfaces (Academy, Student, etc.)
└── public/
    └── gym-logo.svg               # Default/demo logo
```

## White-Label Theming

Theming is done via CSS variables injected dynamically per academy:

```css
/* globals.css */
:root {
  --color-primary: #6366f1;     /* default indigo */
  --color-secondary: #8b5cf6;
}

.btn-primary {
  background-color: var(--color-primary);
}
```

```tsx
// WhiteLabelProvider.tsx
"use client";
import { useEffect } from "react";
import { useAcademy } from "@/hooks/useAcademy";

export function WhiteLabelProvider({ subdomain, children }) {
  const { data: academy } = useAcademy(subdomain);

  useEffect(() => {
    if (academy) {
      document.documentElement.style.setProperty("--color-primary", academy.primaryColor);
      document.documentElement.style.setProperty("--color-secondary", academy.secondaryColor);
    }
  }, [academy]);

  return <>{children}</>;
}
```

## Routing & Middleware

Use Next.js middleware to handle subdomain routing:

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "gym.app";

  // If it's a subdomain (not www, not admin), rewrite to /[subdomain]/...
  if (host !== appDomain && host !== `www.${appDomain}`) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## API Client

```ts
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

## TypeScript Interfaces

```ts
// types/index.ts

export interface Academy {
  id: number;
  name: string;
  slug: string;
  logo?: { url: string };
  primaryColor: string;
  secondaryColor: string;
  plan: "starter" | "business" | "pro";
  isActive: boolean;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo?: { url: string };
  birthdate?: string;
  status: "active" | "inactive" | "suspended";
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  billingCycle: "monthly" | "quarterly" | "annual";
  features: string[];
}

export interface ClassSchedule {
  id: number;
  name: string;
  instructor: string;
  weekdays: number[];   // 0=Sun, 1=Mon...
  startTime: string;    // "06:00"
  endTime: string;      // "07:00"
  maxCapacity: number;
  modality: "presential" | "online";
}

export interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  method: "pix" | "credit_card" | "boleto";
  receiptUrl?: string;
}
```

---

## Pages — Detailed Spec

### `/` — Landing Page

Sections (all in PT-BR):

#### 1. Hero
- Headline: **"Gerencie sua academia do jeito certo"**
- Subheadline: "Plataforma completa para controle de alunos, pagamentos, aulas e treinos — com o app na identidade visual da sua academia."
- CTA buttons: **"Teste grátis por 14 dias"** (primary) + "Ver demonstração" (secondary)
- Background: gradient with gym/fitness imagery or abstract shape
- Trust bar: "Mais de X academias confiam no Gym" (with logos)

#### 2. Features (6 cards)
| Icon | Title             | Description                                           |
|------|-------------------|-------------------------------------------------------|
| 📅   | Agenda de Aulas   | Grade semanal, reservas e controle de presença        |
| 👥   | Gestão de Alunos  | Cadastro completo, status, histórico e avaliações     |
| 💰   | Financeiro        | Cobranças automáticas, PIX, boleto e cartão           |
| 💪   | Fichas de Treino  | Treinos personalizados direto no app do aluno         |
| 📱   | App White-Label   | O aluno acessa com a logo e cores da sua academia     |
| 📊   | Relatórios        | Inadimplência, frequência e receita em tempo real     |

#### 3. How It Works (3 steps)
1. **Personalize** — Coloque a logo e as cores da sua academia
2. **Configure** — Cadastre planos, turmas e sua equipe
3. **Lance** — Compartilhe o link com seus alunos e comece a cobrar

#### 4. Pricing (3 plans)
| Plan     | Price       | Highlight         | Features                                              |
|----------|-------------|-------------------|-------------------------------------------------------|
| Starter  | R$99/mês    | Para começar      | Até 50 alunos, agenda, cobranças básicas              |
| Business | R$199/mês   | Mais popular ⭐   | Até 200 alunos, relatórios, marketing automatizado   |
| Pro      | R$399/mês   | Para escalar      | Alunos ilimitados, multi-unidades, CRM, API           |

All plans: 14-day free trial, no credit card required.

#### 5. Testimonials
Placeholder with 3 cards (name, academy, quote). Real content to be added later.

#### 6. CTA Banner
- "Comece agora, sem cartão de crédito"
- Button: "Criar conta grátis"
- Sub-text: "Cancele quando quiser."

#### 7. Footer
- Logo + tagline
- Links: Recursos, Preços, Blog, Suporte, Termos, Privacidade
- Social: Instagram, WhatsApp

---

### `/admin/dashboard` — Admin Overview

Metrics cards (top row):
- Total de alunos ativos
- Receita do mês (R$)
- Inadimplentes (%)
- Aulas hoje

Charts (below):
- Line chart: receita últimos 6 meses
- Bar chart: frequência por modalidade

Quick actions: Adicionar aluno, Registrar pagamento, Ver agenda

---

### `/admin/students` — Student Management

- Table with columns: Foto, Nome, Plano, Status, Próximo vencimento, Ações
- Filters: Status, Plano, Busca por nome/email
- Bulk actions: Enviar mensagem, Exportar CSV
- "Adicionar aluno" button → modal with StudentForm

---

### `/admin/finance` — Financial Overview

- Summary cards: A receber (mês), Recebido (mês), Em atraso
- Payment table: Aluno, Valor, Vencimento, Status, Método, Ação
- Filter by: Status, Período, Plano

---

### `/admin/schedule` — Class Schedule

- Weekly calendar grid
- Click on slot → create/edit class
- Each class shows: Nome, Instrutor, Vagas, Horário
- Manage bookings: list of students enrolled per class

---

### `/admin/settings` — Academy Settings

Tabs:
1. **Identidade Visual**: upload logo, pick primaryColor/secondaryColor (color picker), preview
2. **Planos**: list/create/edit membership plans
3. **Dados da Academia**: name, address, phone, email
4. **Integrações**: Asaas API key, webhook URL

---

### `/[subdomain]/dashboard` — Student Dashboard

- Welcome header with academy logo/colors
- Quick links: Agendar aula, Ver treino, Histórico de pagamentos
- Next class card
- Active payment badge (due date, amount)
- Recent workout plan

---

### `/[subdomain]/schedule` — Class Booking (Student View)

- Weekly calendar view
- Available classes per day (with capacity bar)
- Book / Cancel button
- Filter by modality

---

## Hooks

```ts
// hooks/useAcademy.ts
export function useAcademy(slug: string) {
  return useQuery({
    queryKey: ["academy", slug],
    queryFn: () => apiFetch(`/academies/by-slug/${slug}`),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

// hooks/useStudents.ts
export function useStudents(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["students", filters],
    queryFn: () => apiFetch(`/students?${new URLSearchParams(filters as any)}`),
  });
}

// hooks/useAuth.ts
export function useAuth() {
  const store = useAuthStore();
  const login = async (email: string, password: string) => {
    const { jwt, user } = await apiFetch("/auth/local", {
      method: "POST",
      body: JSON.stringify({ identifier: email, password }),
    });
    localStorage.setItem("jwt", jwt);
    store.setUser(user);
  };
  return { ...store, login };
}
```

---

## 📋 v2 — Módulo de Controle de Custos (Frontend)

> Disponível nos planos **Business** e **Pro**. Acessível via `/admin/finance`.

### Nova aba na página `/admin/finance`

A página de financeiro ganha uma segunda aba: **Despesas** (além da já planejada aba de Receitas).

#### Aba Receitas (MVP)
- Cards: A receber, Recebido, Em atraso
- Tabela de pagamentos

#### Aba Despesas (v2)
- Cards de resumo: Total de Despesas, Custos Fixos, Custos Variáveis, Margem de Lucro
- Botão "Nova Despesa" → modal com formulário
- Tabela de despesas: Descrição, Categoria, Tipo (Fixo/Variável), Valor, Data, Comprovante
- Filtro por mês/ano e categoria

#### Nova seção: DRE Simplificado

```
/admin/finance/dre
```

Página com visão consolidada:
- Seletor de mês/ano
- Card grande: **Receita Bruta − Despesas = Lucro Líquido** com barra de margem
- Gráfico de barras: Receita vs Despesas por mês (últimos 6 meses)
- Tabela detalhada por categoria de custo
- Botão "Exportar PDF" (v3)

### Novos Componentes

| Componente | Localização |
|---|---|
| `ExpenseForm` | `src/components/admin/ExpenseForm.tsx` |
| `ExpenseTable` | `src/components/admin/ExpenseTable.tsx` |
| `DRESummaryCard` | `src/components/admin/DRESummaryCard.tsx` |
| `CashflowChart` | `src/components/admin/CashflowChart.tsx` |

### Novo Hook

```ts
// hooks/useFinance.ts
export function useFinanceSummary(month: number, year: number) {
  return useQuery({
    queryKey: ["finance-summary", month, year],
    queryFn: () => apiFetch(`/finance/summary?month=${month}&year=${year}`),
  });
}

export function useExpenses(month: number, year: number) {
  return useQuery({
    queryKey: ["expenses", month, year],
    queryFn: () => apiFetch(`/finance/expenses?month=${month}&year=${year}`),
  });
}
```

---

## Implementation Order

1. Project setup (Next.js, Tailwind, shadcn/ui, TanStack Query)
2. `lib/api.ts` and `lib/utils.ts`
3. Landing page (`/`) — all 7 sections
4. Admin login + dashboard (static/mock data first)
5. Admin students page (CRUD)
6. Admin finance page
7. Admin schedule page
8. Admin settings (white-label config)
9. WhiteLabelProvider + middleware (subdomain routing)
10. Student-facing pages (`/[subdomain]/dashboard`, `/schedule`)
11. Connect all to real Strapi API
12. Asaas payment flow integration

**v2 (pós-MVP):**
13. Módulo de despesas (Expense CRUD)
14. DRE simplificado (`/admin/finance/dre`)
15. Cashflow chart (receita vs despesas 6 meses)
16. Export PDF do DRE

## UI/UX Notes

- Language: **PT-BR throughout** (labels, messages, date formats)
- Date format: `DD/MM/YYYY` (use `date-fns/locale/pt-BR`)
- Currency: `R$ 1.234,56` (use `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`)
- Mobile-first for student pages; desktop-first for admin
- Accessible: ARIA labels, keyboard navigation on all interactive elements
- Loading states: skeleton loaders (shadcn Skeleton)
- Error states: toast notifications (shadcn Sonner)

---

## 📋 v2 — Módulo de Dependentes (Frontend)

> Para academias com alunos menores (natação, ballet, artes marciais, etc.)

### Fluxo do Responsável (app do aluno)

#### Tela: `/[subdomain]/dashboard` — com dependentes

Quando `student.isGuardian === true`, o dashboard muda:

- Header mostra: "Olá, Ana! Você tem **2 dependentes**"
- Seletor de perfil no topo: **[ Ana (Você) | 👧 Sofia | 👦 Pedro ]**
- Ao selecionar um dependente, toda a tela recarrega com os dados dele (agenda, treino, etc.)

#### Tela: `/[subdomain]/dependents` — Gerenciar Dependentes

- Lista de dependentes cadastrados com foto, nome, idade
- Botão "+ Adicionar dependente"
- Modal `DependentForm`:
  - Nome, data de nascimento, foto
  - Tipo sanguíneo, alergias, observações médicas
  - Contato de emergência (nome + telefone)
  - Relacionamento com o responsável

#### Tela: `/[subdomain]/dashboard` — visão do dependente selecionado

Igual ao dashboard normal, mas:
- Header mostra o nome da criança + idade
- Breadcrumb: "← Voltar para meus dependentes"
- Próxima aula, ficha de treino, histórico de pagamentos (do responsável)

### Fluxo do Admin

#### `/admin/students` — tabela com indicador de família

- Nova coluna "Dependentes" — mostra badge com número: `👨‍👩‍👧 2`
- Ao clicar no aluno responsável → perfil mostra aba "Dependentes" com lista
- Ao clicar num dependente → vai para perfil do dependente (com link "Responsável: Ana Costa")

#### `/admin/students/[id]` — perfil do responsável

Nova aba: **Dependentes**
- Lista com: foto, nome, idade, plano, status, próxima aula
- Botão "Adicionar dependente"
- Botão "Matricular dependente" → abre flow de matrícula vinculada ao responsável

#### `/admin/students/dependent/[id]` — perfil do dependente

- Header: foto, nome, idade, tipo sanguíneo
- Alerta visual se há alergias ou observações médicas ⚠️
- Contato de emergência destacado (para o instrutor ver rápido)
- Abas: Matrículas, Agenda, Ficha de Treino, Avaliações

### Novos Componentes

| Componente | Localização |
|---|---|
| `DependentForm` | `src/components/academy/DependentForm.tsx` |
| `DependentSelector` | `src/components/academy/DependentSelector.tsx` |
| `DependentCard` | `src/components/academy/DependentCard.tsx` |
| `FamilyBadge` | `src/components/admin/FamilyBadge.tsx` |
| `EmergencyContactCard` | `src/components/admin/EmergencyContactCard.tsx` |

### Novo Hook

```ts
// hooks/useDependents.ts
export function useDependents() {
  return useQuery({
    queryKey: ["dependents"],
    queryFn: () => apiFetch("/students/me/dependents"),
  });
}

export function useSelectedProfile() {
  // Zustand store: { type: 'guardian' | 'dependent', id: number }
  return useProfileStore((s) => s.selectedProfile);
}
```


---

## 🏊 v2 — Módulo Escola de Natação / Qualidade da Piscina (Frontend)

### Novo item no menu admin
Quando `academy.poolModuleEnabled === true`:
- **Piscina / Qualidade da Água**

### Nova página
```
/admin/pool
```

### Estrutura da tela
#### 1. Cards do dia
Dois cards principais:
- **Manhã — 08:00**
- **Tarde — 18:00**

Cada card contém:
- Campo Cloro
- Campo pH
- Campo Temperatura
- Campo Pessoas na piscina
- Badge da origem: `Agenda` ou `Manual`
- Status visual: OK / Alerta / Crítico
- Botão Salvar

#### 2. Sugestão automática de ocupação
Ao abrir o card:
- sistema consulta agenda do dia
- soma alunos confirmados nas turmas de piscina
- preenche automaticamente o campo `Pessoas na piscina`

#### 3. Histórico
Tabela com:
- Data
- Turno
- Cloro
- pH
- Temperatura
- Pessoas
- Status
- Responsável pelo registro

### Novos Componentes
| Componente | Localização |
|---|---|
| `PoolInspectionCard` | `src/components/admin/PoolInspectionCard.tsx` |
| `PoolInspectionHistoryTable` | `src/components/admin/PoolInspectionHistoryTable.tsx` |
| `WaterStatusBadge` | `src/components/admin/WaterStatusBadge.tsx` |

### Novo Hook
```ts
export function usePoolInspections(date: string) {
  return useQuery({
    queryKey: ['pool-inspections', date],
    queryFn: () => apiFetch(`/pool-inspections/today?date=${date}`),
  });
}
```


### Tela de configuração dos parâmetros ideais
Nova seção em:
```
/admin/settings → aba Piscina
```

Campos:
- Cloro mínimo / máximo
- pH mínimo / máximo
- Temperatura mínima / máxima
- Tolerância de alerta

### Alertas visuais na página `/admin/pool`
Cada medição deve mostrar:
- valor atual
- faixa ideal ao lado
- badge de status (`OK`, `Alerta`, `Crítico`)
- motivo do alerta abaixo do campo, quando existir

#### Exemplos visuais
- `Cloro 0.9` → **Alerta** — abaixo do ideal (1.0–3.0)
- `pH 6.8` → **Crítico** — muito abaixo do ideal (7.2–7.8)
- `Temperatura 29.0` → **OK**


### Configurações > Piscina
Na página `/admin/settings`, quando `poolModuleEnabled === true`, exibir uma nova seção/aba:

**Piscina**
- Cloro mínimo / máximo
- pH mínimo / máximo
- Temperatura mínima / máxima
- Tolerância de alerta
- Botão `Salvar parâmetros`

Essa tela deve ser a origem oficial dos valores usados pelos alertas da página `/admin/pool`.


### Fluxo Agenda → Presença → Piscina
Na página `/admin/schedule`, cada aluno da turma deve poder receber um status:
- Agendado
- Confirmado presente
- Faltou
- Cancelado

O módulo `/admin/pool` deve mostrar:
- Pessoas na piscina = **presenças confirmadas**
- Resumo do turno: agendados / presentes / faltas / cancelados


---

## 📥 v2 — Importação em Massa (Frontend)

### Novo item do menu admin
- **Importação**

### Nova página
```
/admin/import
```

### Etapas da tela
1. Escolher modo de importação
   - Importar alunos
   - Importar famílias / dependentes
2. Baixar modelo de planilha
3. Enviar arquivo `.csv` ou `.xlsx`
4. Mapear colunas
5. Pré-visualizar dados
6. Confirmar importação

### Ações importantes
- botão **Baixar modelo — Alunos**
- botão **Baixar modelo — Dependentes**
- opção de duplicidade:
  - ignorar duplicados
  - atualizar existentes
  - importar mesmo assim

### Novos componentes
| Componente | Localização |
|---|---|
| `ImportUploadCard` | `src/components/admin/ImportUploadCard.tsx` |
| `ColumnMappingTable` | `src/components/admin/ColumnMappingTable.tsx` |
| `ImportPreviewTable` | `src/components/admin/ImportPreviewTable.tsx` |
| `TemplateDownloadCard` | `src/components/admin/TemplateDownloadCard.tsx` |


---

## 📎 v2 — Documentos (Frontend)

### App do aluno
Nova página:
```
/[subdomain]/documents
```
Funções:
- enviar PDF/JPG/PNG
- escolher tipo de documento
- adicionar observação
- ver lista de documentos já enviados

### Admin
No perfil do aluno/dependente:
- botão/aba **Documentos**
- lista com nome, tipo, envio, validade, botão visualizar


### Navegação do app
Adicionar item **Documentos** no menu/bottom-nav do app para acesso direto.

### Admin — perfil do aluno
Adicionar botão/aba **Documentos** diretamente no perfil do aluno/dependente.

### Dashboard admin — alertas
Adicionar card/lista de alertas para:
- documentos vencidos
- documentos vencendo em breve
- ausência de documento obrigatório


### Melhorias de UX para Documentos
- destacar aluno com pendência documental em vermelho na lista
- filtro rápido: "somente com pendência documental"
- no app, permitir upload por câmera além de arquivo/galeria


### Recebimento manual (Frontend)
Na página `/admin/finance`, adicionar botão:
- **+ Recebimento manual**

Modal/formulário com campos:
- aluno / responsável
- dependente (opcional)
- plano
- valor
- data do pagamento
- forma de pagamento
- referente a
- observação


### Financeiro — recursos extras
Adicionar no `/admin/finance`:
- botão/ação **Estornar**
- card **Desconto / Bolsa**
- bloco **Parcelamento manual**


---

## 🧩 Bloco 1 — Personalização do Produto (Frontend)

### Nova página
```
/admin/configuration
```

### Objetivo
Permitir que a academia escolha:
1. o segmento do negócio
2. os módulos que quer ativar
3. o plano por faixa de alunos

### Estrutura da tela
#### 1. Segmento
Cards de seleção:
- Academia
- Escola de Natação
- Pilates
- Ballet
- Studio
- Outro

#### 2. Módulos ativáveis
Toggles agrupados por categoria:

**Operação**
- Agenda
- Presença
- Reposição
- Recursos físicos

**Alunos**
- Dependentes
- Documentos
- Evolução pedagógica
- Assinatura digital

**Financeiro**
- Financeiro
- Recebimento manual
- Parcelamento
- Desconto / bolsa

**Especializados**
- Piscina
- Treinos

**Gestão**
- Comunicação
- Indicadores
- Importação

#### 3. Plano por quantidade de alunos
- Básico — até 80 alunos
- Intermediário — até 250 alunos
- Premium — até 700 alunos

### Comportamento esperado
- ao escolher o segmento, o sistema sugere automaticamente os módulos mais comuns
- o admin pode ativar/desativar manualmente depois
- menus do admin e app mudam conforme módulos ativos

### Novos componentes
| Componente | Localização |
|---|---|
| `BusinessTypeSelector` | `src/components/admin/BusinessTypeSelector.tsx` |
| `ModuleToggleGrid` | `src/components/admin/ModuleToggleGrid.tsx` |
| `StudentTierSelector` | `src/components/admin/StudentTierSelector.tsx` |
| `SegmentPresetCard` | `src/components/admin/SegmentPresetCard.tsx` |


---

## 🧩 Bloco 3 — Salas / Recursos Físicos (Frontend)

### Nova página
```
/admin/resources
```

### Objetivo
Cadastrar e gerenciar salas, piscina, estúdios e outros espaços físicos.

### Funções da tela
- listar recursos
- criar novo recurso
- editar capacidade e disponibilidade
- bloquear recurso para manutenção
- visualizar agenda por recurso

### Componentes
| Componente | Localização |
|---|---|
| `ResourceCard` | `src/components/admin/ResourceCard.tsx` |
| `ResourceForm` | `src/components/admin/ResourceForm.tsx` |
| `ResourceCalendar` | `src/components/admin/ResourceCalendar.tsx` |


---

## 🧩 Bloco 5 — Reposição de Aula (Frontend)
### Página
`/admin/makeups`
- créditos disponíveis
- usar crédito em outra turma
- aprovar / negar reposição

## 🧩 Bloco 4 — Evolução Pedagógica (Frontend)
### Página
`/admin/progress`
- nível do aluno
- observações técnicas
- checklist de habilidades
- histórico de evolução

## 🧩 Bloco 2 — Comunicação (Frontend)
### Página
`/admin/communications`
- enviar aviso para turma / aluno / responsável
- lembrete de pagamento
- solicitação de documento

## 🧩 Bloco 7 — Indicadores (Frontend)
### Página
`/admin/indicators`
- cards e gráficos gerenciais
- ocupação, inadimplência, ticket médio, retenção

## 🧩 Bloco 6 — Assinatura Digital (Frontend)
### Página
`/admin/terms`
- contratos e autorizações assinadas
- status de assinatura
- solicitar assinatura pendente


### Branding / Identidade visual na personalização
Na página `/admin/configuration`, adicionar uma seção de identidade visual com:
- nome do empreendimento
- upload de logo
- cor principal preferida
- cor secundária preferida

Essa configuração deve refletir o white-label do admin e do app.
