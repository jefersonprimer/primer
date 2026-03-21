'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');

  useEffect(() => {
    // Construct Google URL with state preserving source
    const source = searchParams.get('source') || 'web';
    const pollId = searchParams.get('poll_id');
    const state = JSON.stringify({ source, pollId });

    // We can fetch the URL from an API or just construct it if we had the client ID client-side.
    // Since we moved the route to /api/auth/google-init, we can link there.
    const params = new URLSearchParams();
    if (source) params.set('source', source);
    if (pollId) params.set('poll_id', pollId);

    setGoogleUrl(`/api/auth/google-init?${params.toString()}`);
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.exists) {
        setStep('password');
      } else {
        // Option: Redirect to signup or show error
        // Prompt says: "Nao tem uma conta? cadastra-se" is below.
        // But if I enter a non-existent email and click continue, what happens?
        // Usually, we redirect to signup, or tell them to signup.
        // I'll show a link or redirect.
        // "No account found with this email."
        setError('No account found. Please sign up.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const source = searchParams.get('source');
    const pollId = searchParams.get('poll_id');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, source, poll_id: pollId }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.notVerified) {
          const params = new URLSearchParams();
          params.set('email', email);
          if (source) params.set('source', source);
          if (pollId) params.set('poll_id', pollId);
          router.push(`/auth/verify?${params.toString()}`);
          return;
        }

        // Success - redirect to auth-success
        const params = new URLSearchParams();
        if (source) params.set('source', source);
        // Use session from response (for desktop flow) or token (for web flow)
        if (data.session) params.set('session', data.session);
        else if (data.token) params.set('session', data.token);

        router.push(`/auth-success?${params.toString()}`);
      } else {
        if (data.notVerified) {
          const params = new URLSearchParams();
          params.set('email', email);
          if (source) params.set('source', source);
          if (pollId) params.set('poll_id', pollId);
          router.push(`/auth/verify?${params.toString()}`);
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col text-center">
          <h1 className="text-white text-xl">P</h1>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
            Entrar 
          </h2>
        </div>

        <div className="mt-6 space-y-6 border border-white/10 p-12 rounded-xl">
          {step === 'email' ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  E-mail
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu endereço de email"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-white"
                  />
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <div className="flex flex-col gap-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  E-mail
                </label>

                  <p className="text-sm text-white">{email}</p>
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border pr-10 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-white">Ou</span>
            </div>
          </div>

          <div>
            <a
              href={googleUrl}
              className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </a>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <Link
                href={`/auth/signup${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className="font-medium text-blue-400 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
