-- Master account registry
CREATE TABLE accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT UNIQUE NOT NULL,
  company_name TEXT,
  status TEXT DEFAULT 'demo_processed',
  pipeline_a_completed_at TIMESTAMPTZ,
  pipeline_b_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account memos (v1 and v2 stored as separate rows)
CREATE TABLE account_memos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(account_id),
  version TEXT NOT NULL CHECK (version IN ('v1', 'v2')),
  memo JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('demo_call', 'onboarding_call')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, version)
);

-- Retell agent specs (v1 and v2 stored as separate rows)
CREATE TABLE agent_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(account_id),
  version TEXT NOT NULL CHECK (version IN ('v1', 'v2')),
  spec JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, version)
);

-- Changelogs (one per account, updated after onboarding)
CREATE TABLE changelogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(account_id) UNIQUE,
  changes_json JSONB NOT NULL,
  summary TEXT,
  total_fields_changed INTEGER DEFAULT 0,
  total_fields_added INTEGER DEFAULT 0,
  total_fields_resolved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline run logs (every execution logged here)
CREATE TABLE pipeline_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id TEXT,
  pipeline TEXT NOT NULL CHECK (pipeline IN ('A', 'B')),
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  input_file TEXT,
  output_path TEXT,
  error_message TEXT,
  duration_seconds FLOAT,
  run_at TIMESTAMPTZ DEFAULT NOW()
);
