# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Edge Network                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 App Router Application              │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Pages      │  │  Components  │  │   API Routes    │  │ │
│  │  │              │  │              │  │                 │  │ │
│  │  │ • Dashboard  │  │ • Navigation │  │ • /api/ingest/  │  │ │
│  │  │ • Tickets    │  │ • Tenant     │  │   tickets/      │  │ │
│  │  │ • Time       │  │   Switcher   │  │   [tenant]      │  │ │
│  │  │ • Apps       │  │              │  │                 │  │ │
│  │  │ • Reports    │  │              │  │                 │  │ │
│  │  │ • Settings   │  │              │  │                 │  │ │
│  │  │ • Finances   │  │              │  │                 │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              Middleware (Session Management)          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ Supabase Client (SSR)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                            │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Auth Service  │  │   PostgreSQL   │  │  Edge Functions  │  │
│  │                │  │    Database    │  │                  │  │
│  │ • Email/Pwd    │  │                │  │ • Realtime       │  │
│  │ • OAuth        │  │ • RLS Enabled  │  │ • Triggers       │  │
│  │ • Sessions     │  │ • Row Level    │  │                  │  │
│  │                │  │   Security     │  │                  │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────┐
│   tenants   │
│─────────────│
│ id          │───┐
│ name        │   │
│ is_personal │   │
└─────────────┘   │
                  │
    ┌─────────────┴─────────────────────────────────────┐
    │                                                     │
    ▼                                                     │
┌─────────────┐                                          │
│   members   │                                          │
│─────────────│                                          │
│ id          │                                          │
│ tenant_id   │◄─────────────────────────────────────────┤
│ user_id     │                                          │
│ role        │                                          │
└─────────────┘                                          │
                                                         │
┌─────────────┐                                          │
│    apps     │                                          │
│─────────────│                                          │
│ id          │───┐                                      │
│ tenant_id   │◄──┼──────────────────────────────────────┤
│ name        │   │                                      │
│ status      │   │                                      │
└─────────────┘   │                                      │
                  │                                      │
    ┌─────────────┴──────┐                               │
    │                    │                               │
    ▼                    │                               │
┌─────────────┐          │                               │
│   tickets   │          │                               │
│─────────────│          │                               │
│ id          │───┐      │                               │
│ tenant_id   │◄──┼──────┼───────────────────────────────┤
│ app_id      │◄──┘      │                               │
│ title       │          │                               │
│ status      │          │                               │
│ priority    │          │                               │
└─────────────┘          │                               │
                         │                               │
    ┌────────────────────┘                               │
    │                                                    │
    ▼                                                    │
┌──────────────┐                                         │
│ time_entries │                                         │
│──────────────│                                         │
│ id           │                                         │
│ tenant_id    │◄────────────────────────────────────────┤
│ member_id    │                                         │
│ ticket_id    │                                         │
│ hours        │                                         │
└──────────────┘                                         │
                                                         │
┌───────────────────┐                                    │
│ finance_accounts  │ (Personal Tenant Only)             │
│───────────────────│                                    │
│ id                │───┐                                │
│ tenant_id         │◄──┼────────────────────────────────┘
│ name              │   │
│ type              │   │
│ balance           │   │
└───────────────────┘   │
                        │
    ┌───────────────────┘
    │
    ▼
┌───────────────────────┐
│ finance_transactions  │ (Personal Tenant Only)
│───────────────────────│
│ id                    │
│ tenant_id             │
│ account_id            │◄─────┘
│ type                  │
│ amount                │
│ date                  │
└───────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Next.js Page → Middleware → Supabase Auth → Session Cookie → User Data
```

### 2. Tenant Switching Flow
```
User Selects Tenant → TenantSwitcher Component → localStorage → Page Reload → 
New Tenant Context → RLS Filters Data
```

### 3. Ticket Creation via UI
```
User → Form → Server Action → Supabase Client → PostgreSQL → RLS Check → 
Insert Data → Return Success
```

### 4. Ticket Ingestion via Webhook
```
External System → POST /api/ingest/tickets/[tenant] → 
API Route Handler → Validate Tenant → Supabase Client → 
PostgreSQL → RLS Check → Insert Ticket → Return JSON Response
```

### 5. Data Fetching Flow
```
Page Component (Server) → Supabase Server Client → PostgreSQL → 
RLS Filter by tenant_id → Return Data → Render Page
```

## Security Model

### Row Level Security (RLS)

Every table has RLS policies that ensure:

1. **Tenant Isolation**: Users can only access data from tenants they are members of
2. **Personal Tenant Restriction**: Finance tables only accessible from personal tenants
3. **Action Control**: Separate policies for SELECT, INSERT, UPDATE operations

Example RLS Policy:
```sql
CREATE POLICY "Users can view tickets of their tenants"
  ON public.tickets FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );
```

## Component Hierarchy

```
RootLayout
├── Header
│   ├── Logo/Title
│   └── TenantSwitcher
├── Navigation (Sidebar)
│   ├── Dashboard Link
│   ├── Tickets Link
│   ├── Time Link
│   ├── Apps Link
│   ├── Reports Link
│   ├── Settings Link
│   └── Finances Link
└── Main Content
    └── Page Component
        ├── Page Header
        ├── Action Buttons
        └── Data Display (Tables/Cards/Grids)
```

## API Endpoint Structure

```
/api/ingest/tickets/[tenant]
│
├── GET  → Returns endpoint documentation
│   └── Response: JSON with usage info and example
│
└── POST → Creates a ticket for the specified tenant
    ├── Input: JSON with ticket data
    ├── Validates: tenant exists, required fields present
    ├── Creates: ticket in database with tenant_id
    └── Response: JSON with created ticket or error
```

## Tenant Types

```
┌────────────────────┐
│  Standard Tenants  │
│────────────────────│
│ • oricol-es        │  Can access:
│ • soca5            │  - Tickets
│                    │  - Time Entries
│                    │  - Apps
│                    │  - Reports
│                    │  - Settings
└────────────────────┘

┌────────────────────┐
│  Personal Tenant   │
│────────────────────│
│ • personal         │  Can access everything above PLUS:
│                    │  - Finance Accounts
│ (Leigh: admin)     │  - Finance Transactions
└────────────────────┘
```

## Deployment Architecture

```
GitHub Repository
      │
      │ (git push)
      ▼
Vercel Platform
      │
      ├─ Build Process (npm run build)
      │  └─ Next.js Static + Server Components
      │
      ├─ Environment Variables
      │  ├─ NEXT_PUBLIC_SUPABASE_URL
      │  ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
      │  └─ SUPABASE_SERVICE_ROLE_KEY
      │
      └─ Deploy to Edge Network
         └─ Global CDN with Edge Functions
```

## Development Workflow

```
1. Local Development
   npm run dev → http://localhost:3000

2. Database Setup
   Supabase Dashboard → SQL Editor → Run Migrations

3. Environment Config
   .env.local → Configure Supabase keys

4. Testing
   npm run build → Check for errors
   npm run lint → Check code quality

5. Deployment
   git push → Vercel Auto-Deploy
```

## Feature Access Matrix

| Feature             | Standard Tenant | Personal Tenant |
|---------------------|----------------|-----------------|
| Dashboard           | ✅             | ✅              |
| Tickets             | ✅             | ✅              |
| Time Tracking       | ✅             | ✅              |
| Apps                | ✅             | ✅              |
| Reports             | ✅             | ✅              |
| Settings            | ✅             | ✅              |
| Finance Accounts    | ❌             | ✅              |
| Finance Transactions| ❌             | ✅              |
| Webhook API         | ✅             | ✅              |

## Technology Stack Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  • React Components                 │
│  • Tailwind CSS                     │
│  • TypeScript                       │
└─────────────────────────────────────┘
           │
┌─────────────────────────────────────┐
│     Application Layer               │
│  • Next.js 14 App Router            │
│  • Server Components                │
│  • API Routes                       │
│  • Middleware                       │
└─────────────────────────────────────┘
           │
┌─────────────────────────────────────┐
│     Data Access Layer               │
│  • Supabase JS Client               │
│  • Server/Client Adapters           │
└─────────────────────────────────────┘
           │
┌─────────────────────────────────────┐
│     Backend Services                │
│  • Supabase Auth                    │
│  • PostgreSQL + RLS                 │
│  • Edge Functions                   │
└─────────────────────────────────────┘
```

This architecture provides:
- ✅ Scalability (Vercel Edge + Supabase)
- ✅ Security (RLS + Auth)
- ✅ Performance (SSR + Edge Caching)
- ✅ Developer Experience (TypeScript + Modern Stack)
- ✅ Multi-tenancy (RLS-based isolation)
