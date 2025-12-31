# ZeroBitOne Dashboard

A multi-tenant Next.js dashboard with Supabase backend (Auth, Postgres, Edge Functions) for project management, ticket tracking, time tracking, and financial management. Deployed on Vercel.

## Features

- 🏢 **Multi-tenancy**: Support for multiple tenants with Row Level Security (RLS)
- 🎫 **Ticket Management**: Track and manage tickets across projects
- ⏰ **Time Tracking**: Log and monitor time spent on tasks
- 📱 **App Management**: Organize your applications and projects
- 📊 **Reports**: View analytics and summaries
- 💰 **Finances**: Personal financial tracking with accounts and transactions (personal tenant only)
- 🔄 **Webhook API**: Ingest tickets via tenant-specific webhook endpoints
- 🔐 **Supabase Auth**: Secure authentication with Supabase

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Edge)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Vercel account (for deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/craigbfelt/ZeroBitOne-Dashboard.git
cd ZeroBitOne-Dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your Supabase project, go to SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_seed_data.sql`

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase project settings under API.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **tenants**: Organizations or workspaces
- **members**: Users associated with tenants (includes role: admin, member, etc.)
- **apps**: Applications/projects within tenants
- **tickets**: Task/issue tracking
- **time_entries**: Time tracking records
- **finance_accounts**: Financial accounts (personal tenant only)
- **finance_transactions**: Financial transactions linked to accounts (personal tenant only)

All tables use Row Level Security (RLS) with tenant_id for data isolation.

## Seeded Tenants

The seed migration creates three default tenants:

1. **oricol-es**: Standard tenant
2. **soca5**: Standard tenant
3. **personal**: Personal tenant (with Leigh as admin member)

Sample finance accounts are also created for the personal tenant.

## API Endpoints

### Ticket Ingestion Webhook

**Endpoint**: `POST /api/ingest/tickets/[tenant]`

Create tickets via tenant-specific webhook. Useful for integrating with external systems.

**Example**: `POST /api/ingest/tickets/oricol-es`

**Request Body**:
```json
{
  "title": "Bug: Login not working",
  "description": "Users cannot log in with their credentials",
  "status": "open",
  "priority": "high",
  "app_id": "uuid (optional)",
  "external_id": "JIRA-123 (optional)",
  "metadata": { "source": "external-system" }
}
```

**Response**:
```json
{
  "message": "Ticket created successfully",
  "ticket": { ... }
}
```

**Test the endpoint**: `GET /api/ingest/tickets/[tenant]` returns endpoint documentation.

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel project settings
4. Deploy

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ingest/        # Ingestion endpoints
│   │       └── tickets/   # Ticket webhook endpoints
│   │           └── [tenant]/ # Dynamic tenant routing
│   ├── tickets/           # Tickets page
│   ├── time/              # Time tracking page
│   ├── apps/              # Apps page
│   ├── reports/           # Reports page
│   ├── settings/          # Settings page
│   ├── finances/          # Finances page (personal tenant)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navigation.tsx     # Sidebar navigation
│   └── TenantSwitcher.tsx # Tenant selector
├── lib/                   # Utilities and configurations
│   ├── supabase/          # Supabase client configs
│   └── types.ts           # TypeScript types
├── supabase/              # Supabase files
│   └── migrations/        # Database migrations
└── middleware.ts          # Next.js middleware for auth

```

## Development

### Building the project

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
