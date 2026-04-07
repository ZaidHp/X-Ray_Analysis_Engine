"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if running on the client
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Redirect to login, potentially preserving the intended destination
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router, pathname]);

  if (!isAuthorized) {
    // Render a pleasant loading state until verification is complete
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
