-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public._sqlx_migrations (
  version bigint NOT NULL,
  description text NOT NULL,
  installed_on timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL,
  checksum bytea NOT NULL,
  execution_time bigint NOT NULL,
  CONSTRAINT _sqlx_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE public.changelogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT changelogs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.email_verification_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_verification_codes_pkey PRIMARY KEY (id),
  CONSTRAINT email_verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.google_calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  google_event_id text NOT NULL,
  calendar_id text NOT NULL DEFAULT 'primary'::text,
  title text NOT NULL,
  description text,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  timezone text NOT NULL,
  created_by text NOT NULL DEFAULT 'agent'::text,
  source_chat_id uuid,
  status text NOT NULL DEFAULT 'confirmed'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_calendar_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.google_calendar_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  channel text NOT NULL,
  trigger_at timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT google_calendar_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT google_calendar_notifications_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.google_calendar_events(id)
);
CREATE TABLE public.notion_integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
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
  CONSTRAINT notion_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notion_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notion_page_id text NOT NULL UNIQUE,
  parent_page_id text,
  parent_database_id text,
  title text NOT NULL,
  url text NOT NULL,
  source_chat_id uuid,
  source_message_id uuid,
  created_by text DEFAULT 'agent'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notion_pages_pkey PRIMARY KEY (id),
  CONSTRAINT notion_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.oauth_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  provider text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT oauth_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.shared_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_chat_id uuid,
  title text,
  messages jsonb NOT NULL,
  shared_by_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT shared_chats_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL DEFAULT 'free'::text,
  status text NOT NULL DEFAULT 'active'::text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_auth_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  provider_user_id text,
  password_hash text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_auth_methods_pkey PRIMARY KEY (id),
  CONSTRAINT user_auth_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  profile_picture text,
  plan text NOT NULL DEFAULT 'free'::text CHECK (plan = ANY (ARRAY['free'::text, 'plus'::text, 'pro'::text])),
  google_calendar_token text,
  google_calendar_refresh_token text,
  google_calendar_connected_at timestamp with time zone,
  email_verified boolean NOT NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);