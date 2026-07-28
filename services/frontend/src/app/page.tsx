'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { LandingPageView } from '@/components/landing-page-view';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.role;
      if (role === 'super_admin') {
        router.push('/admin');
      } else if (role === 'tenant_admin' || role === 'creator') {
        router.push('/creator/dashboard');
      } else {
        router.push('/viewer');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600" />
      </div>
    );
  }

  return <LandingPageView />;
}
