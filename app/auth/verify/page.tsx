'use client';

import { useState, useRef, useEffect, Suspense, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CODE_LENGTH = 6;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const source = searchParams.get('source');
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto-submit when all digits are filled
  useEffect(() => {
    const code = digits.join('');
    if (code.length === CODE_LENGTH && digits.every(d => d !== '')) {
      handleVerify();
    }
  }, [digits]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) return;

    setIsLoading(true);
    setError('');

    const pollId = searchParams.get('poll_id');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, source, poll_id: pollId }),
      });
      const data = await res.json();

      if (res.ok) {
        const params = new URLSearchParams();
        if (source) params.set('source', source);
        // Use session from response (for desktop flow) or token (for web flow)
        if (data.session) params.set('session', data.session);
        else if (data.token) params.set('session', data.token);

        router.push(`/auth-success?${params.toString()}`);
      } else {
        setError(data.error || 'Verification failed');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    setResendStatus('Sending...');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus('Code resent!');
        setTimeLeft(30);
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        setResendStatus('Failed to resend');
      }
    } catch (e) {
      setResendStatus('Error resending');
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Move to next input if digit entered
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      } else {
        // Clear current input
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);

    if (pastedData) {
      const newDigits = Array(CODE_LENGTH).fill('');
      pastedData.split('').forEach((char, idx) => {
        if (idx < CODE_LENGTH) newDigits[idx] = char;
      });
      setDigits(newDigits);

      // Focus the last filled input or next empty
      const lastIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  if (!email) {
    return <div>Invalid request. Missing email.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black  px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
          <div className="text-center mb-8">
            <div className="text-white text-3xl">
              P  
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifique seu e-mail
            </h2>
          </div>

        <div className="backdrop-blur-xl rounded-xl p-12 shadow-2xl border border-white/20">
           <div className="flex flex-col mb-2">
            <p className="text-white text-sm">
              Digite o código enviado para
            </p>
            <p className="text-white font-semibold mt-1">
              {email}
            </p>
          </div> 
          {/* Code Input Grid */}
          <form onSubmit={handleVerify}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  disabled={isLoading}
                  className={`
                    w-12 h-12 sm:w-12 sm:h-12
                    text-center text-2xl font-bold 
                    border-2 rounded-lg
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-out
                    focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${focusedIndex === index
                      ? 'border-blue-400 scale-105'
                      : digit
                        ? 'border-blue-500'
                        : 'border-white/20 hover:border-white/40'
                    }
                    ${error ? 'border-red-400 animate-shake' : ''}
                  `}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center mb-4 animate-fadeIn">
                <p className="text-red-400 text-sm bg-red-500/10 rounded-lg py-2 px-4 inline-block">
                  {error}
                </p>
              </div>
            )}

          </form>

          {/* Resend Section */}
          <div className="flex flex-col items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm">
                Didn't receive the code?
              </p>
              {timeLeft > 0 ? (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  Reenviar 
                  <span>{timeLeft}s</span>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-white/80 hover:text-indigo-300 font-medium text-sm transition-colors duration-200 hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao login
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
