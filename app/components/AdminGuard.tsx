'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setIsChecking(false);
      return;
    }

    const checkAdmin = () => {
      try {
        const customerId = localStorage.getItem('customerId');
        const isAdmin = localStorage.getItem('isAdmin');

        if (!customerId) {
          // Not logged in at all
          router.push('/login');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        // Check if isAdmin is 'true' (string comparison)
        if (isAdmin !== 'true') {
          // Not an admin
          router.push('/');
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        // User is admin
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login');
        setIsAuthorized(false);
        setIsChecking(false);
      }
    };

    // Small delay to ensure localStorage is ready
    const timer = setTimeout(checkAdmin, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading while checking
  if (isChecking || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render children (redirect is happening)
  if (!isAuthorized) {
    return null;
  }

  // User is authorized, render children
  return <>{children}</>;
}

