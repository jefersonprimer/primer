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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setResendStatus('Sending...');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus('Code resent!');
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verify your email
            </h2>
            <p className="text-gray-300 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-indigo-300 font-medium mt-1">
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
                    w-11 h-14 sm:w-12 sm:h-16 
                    text-center text-2xl font-bold 
                    bg-white/10 border-2 rounded-xl
                    text-white placeholder-gray-400
                    transition-all duration-200 ease-out
                    focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${focusedIndex === index
                      ? 'border-indigo-400 bg-white/20 scale-105 shadow-lg shadow-indigo-500/30'
                      : digit
                        ? 'border-indigo-500/50 bg-white/15'
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

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || digits.some(d => d === '')}
              className={`
                w-full py-3 px-4 rounded-xl font-semibold text-white
                transition-all duration-200 ease-out
                ${isLoading || digits.some(d => d === '')
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify Code'}
            </button>
          </form>

          {/* Resend Section */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-200 hover:underline"
            >
              Resend Code
            </button>
            {resendStatus && (
              <p className={`text-xs mt-2 ${resendStatus.includes('resent') ? 'text-green-400' : 'text-gray-400'}`}>
                {resendStatus}
              </p>
            )}
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
            Go back
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