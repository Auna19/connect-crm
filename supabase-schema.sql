-- ==============================================================================
-- ConnectCRM — Supabase PostgreSQL Schema Migration
-- ==============================================================================
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ==============================================================================

-- 1. CRM Users Table (Permanent User Accounts & Auth Profiles)
CREATE TABLE IF NOT EXISTS public.crm_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  phone TEXT DEFAULT '+1 (555) 000-0000',
  department TEXT DEFAULT 'Operations',
  title TEXT DEFAULT 'Platform Operator',
  status TEXT DEFAULT 'active',
  avatar TEXT DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_crm_users_email ON public.crm_users(LOWER(email));

-- 2. CRM Password Resets Table (Secure 6-digit OTP verification)
CREATE TABLE IF NOT EXISTS public.crm_password_resets (
  email TEXT PRIMARY KEY,
  otp TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CRM Document / Key-Value Cloud Store (Full CRM Dataset Backup)
CREATE TABLE IF NOT EXISTS public.crm_store (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enable Row Level Security (RLS) & Set Policies
ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_store ENABLE ROW LEVEL SECURITY;

-- Allow server operations (service_role and anon backend handlers) full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_users' AND policyname = 'Allow CRM backend access'
  ) THEN
    CREATE POLICY "Allow CRM backend access" ON public.crm_users FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_password_resets' AND policyname = 'Allow CRM backend access'
  ) THEN
    CREATE POLICY "Allow CRM backend access" ON public.crm_password_resets FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_store' AND policyname = 'Allow CRM backend access'
  ) THEN
    CREATE POLICY "Allow CRM backend access" ON public.crm_store FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 5. Seed Initial Default Demo Users (Admin, QA, Agent, Auditor)
INSERT INTO public.crm_users (id, name, email, password, role, phone, department, title, status, avatar)
VALUES 
  ('usr-admin', 'Alex Rivera', 'admin@connectcrm.internal', 'Password123!', 'admin', '+1 (555) 901-2345', 'Platform Engineering', 'Lead Solutions Architect', 'active', 'AR'),
  ('usr-qa', 'Taylor Swift', 'qa@connectcrm.internal', 'Password123!', 'qa', '+1 (555) 901-6789', 'Quality Assurance', 'QA Lead Engineer', 'active', 'TS'),
  ('usr-agent', 'Jordan Hayes', 'agent@connectcrm.internal', 'Password123!', 'agent', '+1 (555) 901-4433', 'Customer Operations', 'Senior Support Specialist', 'active', 'JH'),
  ('usr-auditor', 'Morgan Reed', 'auditor@connectcrm.internal', 'Password123!', 'auditor', '+1 (555) 901-8822', 'Compliance & Security', 'Security Auditor', 'active', 'MR')
ON CONFLICT (email) DO NOTHING;

