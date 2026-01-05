'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const session = searchParams.get('session');
  const source = searchParams.get('source');
  // If we came from a flow that supports polling, we might not want to force the deep link immediately
  // preventing the "No app available" popup in dev.
  // However, the callback currently redirects here with session & source.
  // We can infer polling if source is desktop (since we enabled it there).
  
  // Actually, let's just make the auto-redirect optional or softer if it fails, 
  // but we can't easily detect failure. 
  // Better approach: If in dev (which we can't easily know client-side without env vars, 
  // but we can guess), show instructions.
  
  useEffect(() => {
    if (!session) return;

    // Only auto-redirect if NOT in development mode ideally, or give user a moment.
    // But since we implemented polling for 'desktop', we can rely on that primarily for dev.
    // Let's rely on the user clicking if the auto-redirect fails, OR the polling.
    
    // We will attempt redirect ONLY if source is desktop AND we are likely in prod (hard to tell).
    // For now, let's comment out the immediate auto-redirect for desktop to avoid the annoyance in dev,
    // OR wrap it in a timeout so the user sees the page first.
    
    const timer = setTimeout(() => {
        if (source === 'desktop') {
             window.location.href = `primerai://auth/callback?session=${session}`;
        } else if (source === 'dev') {
             window.location.href = `http://localhost:5173/auth/callback?session=${session}`;
        }
    }, 1000);

    return () => clearTimeout(timer);
  }, [session, source]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Opening Primer</h1>
        <p className="text-white/90 mb-6">
          You can now view sessions and manage settings directly from the Primer app, if you werent redirected immediately,
          click here.  
        </p>

        {source === 'desktop' && (
           <div className="space-y-4">
             <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm mb-4">
                <strong>Development Mode:</strong> If the app doesn't open automatically, 
                just switch back to the app window. It should log in automatically via polling.
             </div>
             
             <p className="text-sm text-gray-500">Attempting to open the application...</p>
             <a
               href={`primerai://auth/callback?session=${session}`}
               className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
             >
               Open App Manually
             </a>
           </div>
        )}
        
        {source === 'dev' && (
            <div className="space-y-4">
                <p className="text-sm text-gray-500">Redirecting to localhost:5173...</p>
                <a
                 href={`http://localhost:5173/auth/callback?session=${session}`}
                 className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                 >
                 Open Dev App
                </a>
            </div>
        )}
        
        {(!source || source === 'web') && (
            <p className="text-sm text-gray-500">You can now close this tab.</p>
        )}
      </div>
    </div>
  );
}

export default function AuthSuccess() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccessContent />
        </Suspense>
    )
}
