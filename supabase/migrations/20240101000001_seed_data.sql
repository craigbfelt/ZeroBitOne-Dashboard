-- Seed data for tenants and members
-- Insert tenants
INSERT INTO public.tenants (id, name, display_name, is_personal) VALUES
  ('11111111-1111-1111-1111-111111111111', 'oricol-es', 'Oricol ES', false),
  ('22222222-2222-2222-2222-222222222222', 'soca5', 'Soca5', false),
  ('33333333-3333-3333-3333-333333333333', 'personal', 'Personal', true)
ON CONFLICT (name) DO NOTHING;

-- Insert a placeholder member for 'Leigh' in the personal tenant with admin role
-- Note: In a real scenario, user_id would come from Supabase Auth after user signs up
-- This is a placeholder that should be updated when the actual user is created
INSERT INTO public.members (tenant_id, user_id, email, name, role) VALUES
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'leigh@example.com', 'Leigh', 'admin')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Insert some sample apps for each tenant
INSERT INTO public.apps (tenant_id, name, description, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Website', 'Company website', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Mobile App', 'Mobile application', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Personal Project', 'Personal development project', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample finance accounts for personal tenant
INSERT INTO public.finance_accounts (tenant_id, name, type, balance, currency) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Main Checking', 'bank', 5000.00, 'USD'),
  ('33333333-3333-3333-3333-333333333333', 'Savings Account', 'bank', 10000.00, 'USD'),
  ('33333333-3333-3333-3333-333333333333', 'Credit Card', 'credit_card', 0.00, 'USD')
ON CONFLICT DO NOTHING;
