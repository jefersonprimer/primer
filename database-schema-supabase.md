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
CREATE TABLE public.app_config (
  id integer NOT NULL CHECK (id = 1),
  language text NOT NULL DEFAULT 'en-US'::text,
  enable_smart_rag boolean DEFAULT false,
  CONSTRAINT app_config_pkey PRIMARY KEY (id)
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
CREATE TABLE public.chat_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  topic text NOT NULL,
  summary text NOT NULL,
  source_message_ids ARRAY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_summaries_pkey PRIMARY KEY (id),
  CONSTRAINT chat_summaries_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id)
);
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  model text,
  prompt_preset_id text,
  CONSTRAINT chats_pkey PRIMARY KEY (id),
  CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  summary text,
  message_type text DEFAULT 'chat'::text,
  importance smallint DEFAULT 0,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id)
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
  CONSTRAINT notion_pages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notion_pages_source_chat_id_fkey FOREIGN KEY (source_chat_id) REFERENCES public.chats(id),
  CONSTRAINT notion_pages_source_message_id_fkey FOREIGN KEY (source_message_id) REFERENCES public.messages(id)
);
CREATE TABLE public.prompt_presets (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  prompt text NOT NULL,
  is_built_in boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  preset_type text DEFAULT 'assistant'::text,
  CONSTRAINT prompt_presets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rag_entities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  embedding_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rag_entities_pkey PRIMARY KEY (id)
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
CREATE TABLE public.user_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  provider text NOT NULL,
  api_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  selected_model character varying,
  CONSTRAINT user_api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT user_api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_preferences (
  user_id uuid NOT NULL,
  language text DEFAULT 'en-US'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  google_id text UNIQUE,
  full_name text,
  profile_picture text,
  plan text NOT NULL DEFAULT 'free'::text CHECK (plan = ANY (ARRAY['free'::text, 'plus'::text, 'pro'::text])),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);