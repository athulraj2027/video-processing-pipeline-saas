'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { AuthCard } from '@/components/auth-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { AlertCircle } from 'lucide-react';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'tenant_admin'>('viewer');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'tenant_admin' || roleParam === 'super_admin') {
      setRole('tenant_admin');
    } else {
      setRole('viewer');
    }
  }, [searchParams]);

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      // Redirect to reset password route
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&role=${role}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Error requesting reset code. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Email address is required');
      return;
    }

    forgotMutation.mutate({ email });
  };

  const footerContent = (
    <div className="text-center text-sm text-muted-foreground w-full">
      Remembered your password?{' '}
      <Link 
        href={role === 'tenant_admin' ? '/creator/signin' : '/viewer/signin'} 
        className="font-semibold text-role-main hover:underline"
        style={{ color: 'var(--role-main)' }}
      >
        Sign In
      </Link>
    </div>
  );

  return (
    <AuthCard
      title="Recover Password"
      description="Enter your email below and we will send you a 6-digit verification code to reset your password."
      role={role}
      footer={footerContent}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={forgotMutation.isPending}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={forgotMutation.isPending}
          className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg mt-2"
          style={{
            backgroundColor: 'var(--role-main)',
            color: 'var(--role-text)',
          }}
        >
          {forgotMutation.isPending ? 'Sending...' : 'Send Reset Code'}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ForgotPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
