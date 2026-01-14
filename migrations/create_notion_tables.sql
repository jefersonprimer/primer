-- Migration: Add Notion Integration Support
-- Adapted from Primer Desktop

BEGIN;

CREATE TABLE IF NOT EXISTS public.notion_integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  bot_id text NOT NULL,
  workspace_id text NOT NULL,
  workspace_name text,
  workspace_icon text,
  owner_type text NOT NULL,
  duplicated_template_id text,
  token_type text DEFAULT 'bearer'::text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notion_integrations_pkey PRIMARY KEY (id),
  CONSTRAINT notion_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT notion_integrations_user_id_key UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.notion_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notion_page_id text NOT NULL UNIQUE,
  parent_page_id text,
  parent_database_id text,
  title text NOT NULL,
  url text NOT NULL,
  source_chat_id uuid, -- Reference to local chat ID (no FK constraint)
  source_message_id uuid, -- Reference to local message ID (no FK constraint)
  created_by text DEFAULT 'agent'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notion_pages_pkey PRIMARY KEY (id),
  CONSTRAINT notion_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notion_integrations_user_id ON public.notion_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_user_id ON public.notion_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_notion_page_id ON public.notion_pages(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_source_chat_id ON public.notion_pages(source_chat_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_created_at ON public.notion_pages(created_at DESC);

COMMIT;
