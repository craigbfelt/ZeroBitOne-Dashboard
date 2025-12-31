export type Tenant = {
  id: string;
  name: string;
  display_name: string;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  tenant_id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export type App = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Ticket = {
  id: string;
  tenant_id: string;
  app_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_by: string | null;
  external_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type TimeEntry = {
  id: string;
  tenant_id: string;
  member_id: string;
  ticket_id: string | null;
  description: string | null;
  hours: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export type Finance = {
  id: string;
  tenant_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export type FinanceAccount = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type FinanceTransaction = {
  id: string;
  tenant_id: string;
  account_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};
