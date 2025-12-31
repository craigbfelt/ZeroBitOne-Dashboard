# ZeroBitOne Dashboard - Setup Guide

This guide will walk you through setting up the ZeroBitOne multi-tenant dashboard from scratch.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Vercel account (free tier works)

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be created (this may take a few minutes)
3. Once created, note down your project URL and anon key

### Run Database Migrations

1. In your Supabase project, go to the **SQL Editor**
2. Click **+ New Query**
3. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and run the query
5. Create another new query
6. Copy the contents of `supabase/migrations/20240101000001_seed_data.sql`
7. Paste and run the query

This will create:
- All necessary tables (tenants, members, apps, tickets, time_entries, finance_accounts, finance_transactions)
- Row Level Security policies
- Three seed tenants (oricol-es, soca5, personal)
- Sample apps for each tenant
- Sample finance accounts for the personal tenant
- A member entry for "Leigh" with admin role in the personal tenant

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   You can find these values in your Supabase project:
   - Go to **Settings** → **API**
   - Copy the **Project URL** for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon public** key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the **service_role** key for `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Set Up Authentication (Optional but Recommended)

To use the app with actual authentication:

1. In Supabase, go to **Authentication** → **Providers**
2. Enable **Email** provider (it's enabled by default)
3. Optionally, enable other providers like Google, GitHub, etc.
4. Create test users in **Authentication** → **Users** → **Add User**
5. After creating a user, add them to a tenant:
   - Go to **SQL Editor**
   - Run a query to insert into the `members` table:
   ```sql
   INSERT INTO public.members (tenant_id, user_id, email, name, role)
   VALUES (
     '11111111-1111-1111-1111-111111111111', -- oricol-es tenant
     'your-user-id-from-auth-users',
     'user@example.com',
     'John Doe',
     'member'
   );
   ```

## Step 6: Test the Webhook API

You can test the ticket ingestion webhook using curl or any HTTP client:

```bash
# Test with oricol-es tenant
curl -X POST http://localhost:3000/api/ingest/tickets/oricol-es \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket from Webhook",
    "description": "This is a test ticket created via the webhook API",
    "status": "open",
    "priority": "high",
    "external_id": "EXT-001",
    "metadata": {
      "source": "test",
      "created_by": "setup-guide"
    }
  }'
```

Expected response:
```json
{
  "message": "Ticket created successfully",
  "ticket": { ... }
}
```

## Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure environment variables in Vercel:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `SUPABASE_SERVICE_ROLE_KEY`
6. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

## Features Overview

### Tenant Switcher
- Located in the top-right header
- Allows switching between different tenants
- Stored in localStorage for persistence

### Pages

1. **Dashboard** - Overview with summary cards
2. **Tickets** - View and manage tickets
3. **Time** - Track time entries
4. **Apps** - Manage applications/projects
5. **Reports** - View analytics and summaries
6. **Settings** - User and tenant settings
7. **Finances** - Personal financial tracking (personal tenant only)

### API Endpoints

- `GET/POST /api/ingest/tickets/[tenant]` - Ticket ingestion webhook

## Troubleshooting

### Issue: "No tenants available" in tenant switcher

**Solution**: Make sure you ran the seed migration and that RLS policies allow your user to see the tenants. If testing without authentication, you may need to temporarily disable RLS or use the service role key.

### Issue: "Error loading tickets/apps/etc."

**Solution**: Check that:
1. Your Supabase credentials are correct in `.env.local`
2. The migrations were run successfully
3. RLS policies are set up correctly
4. If using authentication, your user is a member of at least one tenant

### Issue: Build fails

**Solution**: 
1. Clear the Next.js cache: `rm -rf .next`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Try building again: `npm run build`

## Security Notes

1. **Never commit `.env.local`** - It contains sensitive keys
2. **Service Role Key** - This bypasses RLS, keep it secret and only use it server-side
3. **RLS Policies** - Always test that users can only access data from their tenants
4. **Webhook Authentication** - Consider adding authentication to the webhook endpoints for production

## Next Steps

1. Implement authentication UI (login/signup pages)
2. Add forms for creating new tickets, time entries, etc.
3. Enhance the UI with more detailed views and editing capabilities
4. Add real-time subscriptions using Supabase Realtime
5. Implement user role-based permissions
6. Add webhook authentication/API keys
7. Create data export functionality
8. Add email notifications
9. Implement comprehensive error handling

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the code comments and README.md

## License

MIT
