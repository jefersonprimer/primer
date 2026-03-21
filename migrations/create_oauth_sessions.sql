CREATE TABLE IF NOT EXISTS public.oauth_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  provider text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT oauth_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_oauth_sessions_source ON public.oauth_sessions(source);
CREATE INDEX IF NOT EXISTS idx_oauth_sessions_expires_at ON public.oauth_sessions(expires_at);
