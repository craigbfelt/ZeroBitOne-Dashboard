-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create apps table
CREATE TABLE IF NOT EXISTS public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  app_id UUID REFERENCES public.apps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to UUID REFERENCES public.members(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  external_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  description TEXT,
  hours DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create finance_accounts table (personal tenant only)
CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bank', 'credit_card', 'cash', 'investment', etc.
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT personal_tenant_only_accounts CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
  )
);

-- Create finance_transactions table (personal tenant only)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.finance_accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT personal_tenant_only_transactions CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
  )
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "Users can view tenants they are members of"
  ON public.tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for members
CREATE POLICY "Users can view members of their tenants"
  ON public.members FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert members to their tenants"
  ON public.members FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for apps
CREATE POLICY "Users can view apps of their tenants"
  ON public.apps FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert apps to their tenants"
  ON public.apps FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update apps of their tenants"
  ON public.apps FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for tickets
CREATE POLICY "Users can view tickets of their tenants"
  ON public.tickets FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tickets to their tenants"
  ON public.tickets FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tickets of their tenants"
  ON public.tickets FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for time_entries
CREATE POLICY "Users can view time entries of their tenants"
  ON public.time_entries FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert time entries to their tenants"
  ON public.time_entries FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update time entries of their tenants"
  ON public.time_entries FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for finance_accounts
CREATE POLICY "Users can view finance accounts of their personal tenant"
  ON public.finance_accounts FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

CREATE POLICY "Users can insert finance accounts to their personal tenant"
  ON public.finance_accounts FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

CREATE POLICY "Users can update finance accounts of their personal tenant"
  ON public.finance_accounts FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

-- RLS Policies for finance_transactions
CREATE POLICY "Users can view finance transactions of their personal tenant"
  ON public.finance_transactions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

CREATE POLICY "Users can insert finance transactions to their personal tenant"
  ON public.finance_transactions FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

CREATE POLICY "Users can update finance transactions of their personal tenant"
  ON public.finance_transactions FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND tenant_id IN (SELECT id FROM public.tenants WHERE is_personal = true)
    )
  );

-- Create indexes for performance
CREATE INDEX idx_members_tenant_id ON public.members(tenant_id);
CREATE INDEX idx_members_user_id ON public.members(user_id);
CREATE INDEX idx_apps_tenant_id ON public.apps(tenant_id);
CREATE INDEX idx_tickets_tenant_id ON public.tickets(tenant_id);
CREATE INDEX idx_tickets_app_id ON public.tickets(app_id);
CREATE INDEX idx_time_entries_tenant_id ON public.time_entries(tenant_id);
CREATE INDEX idx_time_entries_member_id ON public.time_entries(member_id);
CREATE INDEX idx_finance_accounts_tenant_id ON public.finance_accounts(tenant_id);
CREATE INDEX idx_finance_transactions_tenant_id ON public.finance_transactions(tenant_id);
CREATE INDEX idx_finance_transactions_account_id ON public.finance_transactions(account_id);
