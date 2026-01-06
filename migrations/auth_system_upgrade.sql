-- 1.1 Tornar password_hash opcional temporariamente (para migração)
ALTER TABLE public.users
ALTER COLUMN password_hash DROP NOT NULL;

-- 1.2 Adicionar verificação de email
ALTER TABLE public.users
ADD COLUMN email_verified boolean NOT NULL DEFAULT false;

-- 2. CRIAR user_auth_methods (CORE DA AUTENTICAÇÃO)
CREATE TABLE public.user_auth_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  provider text NOT NULL,
  -- 'email' | 'google'

  provider_user_id text,
  -- google_id, github_id, etc

  password_hash text,
  -- apenas para provider = 'email'

  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT user_auth_provider_check
    CHECK (
      (provider = 'email' AND password_hash IS NOT NULL)
      OR
      (provider <> 'email' AND provider_user_id IS NOT NULL)
    ),

  UNIQUE (provider, provider_user_id),
  UNIQUE (user_id, provider)
);

-- 3. MIGRAR DADOS EXISTENTES (CRÍTICO)

-- 3.1 Migrar usuários EMAIL/SENHA
INSERT INTO public.user_auth_methods (
  user_id,
  provider,
  password_hash
)
SELECT
  id,
  'email',
  password_hash
FROM public.users
WHERE password_hash IS NOT NULL;

-- 3.2 Migrar usuários GOOGLE
INSERT INTO public.user_auth_methods (
  user_id,
  provider,
  provider_user_id
)
SELECT
  id,
  'google',
  google_id
FROM public.users
WHERE google_id IS NOT NULL;

-- 3.3 Marcar emails Google como verificados
UPDATE public.users
SET email_verified = true
WHERE google_id IS NOT NULL;

-- 4. CRIAR VERIFICAÇÃO DE EMAIL (VOCÊ NÃO TINHA)
CREATE TABLE public.email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,

  created_at timestamp with time zone DEFAULT now()
);

CREATE UNIQUE INDEX email_verification_one_active
ON public.email_verification_codes (user_id)
WHERE used_at IS NULL;

-- 5. REMOVER COLUNAS ANTIGAS DO users (LIMPEZA)
-- ⚠️ SÓ FAÇA ISSO DEPOIS DE MIGRAR OS DADOS
ALTER TABLE public.users
DROP COLUMN password_hash,
DROP COLUMN google_id,
DROP COLUMN google_access_token,
DROP COLUMN google_refresh_token,
DROP COLUMN google_expires_at;

-- 6. AJUSTE DE SEGURANÇA (RECOMENDADO)
-- Bloquear login sem método de auth
CREATE UNIQUE INDEX users_must_have_auth
ON public.user_auth_methods (user_id);
