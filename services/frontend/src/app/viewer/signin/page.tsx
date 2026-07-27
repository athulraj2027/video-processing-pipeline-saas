'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/navigation-header';
import { AuthCard } from '@/components/auth-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { AlertCircle } from 'lucide-react';

export default function ViewerSignin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { loginMutation } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('All fields are required');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/');
        },
        onError: (err: any) => {
          setErrorMsg(err.message || 'Login failed. Invalid credentials.');
        },
      }
    );
  };

  const footerContent = (
    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground w-full">
      <div>
        Don't have an account?{' '}
        <Link href="/viewer/signup" className="font-semibold text-role-main hover:underline" style={{ color: 'var(--role-main)' }}>
          Sign Up
        </Link>
      </div>
      <Link href="/auth/forgot-password?role=viewer" className="text-xs hover:underline text-muted-foreground">
        Forgot password?
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthCard
          title="Viewer Sign In"
          description="Log in to access your purchased media, watchlists, and subscriptions."
          role="viewer"
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
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg mt-2"
              style={{
                backgroundColor: 'var(--role-main)',
                color: 'var(--role-text)',
              }}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
