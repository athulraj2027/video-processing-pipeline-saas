'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationHeader } from '@/components/navigation-header';
import { AuthCard } from '@/components/auth-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ViewerSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      // Redirect to verification view with email in query parameter
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&role=viewer`);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    signupMutation.mutate({
      email,
      password,
      role: 'viewer',
    });
  };

  const footerContent = (
    <div className="text-center text-sm text-muted-foreground w-full">
      Already have an account?{' '}
      <Link href="/viewer/signin" className="font-semibold text-role-main hover:underline" style={{ color: 'var(--role-main)' }}>
        Sign In
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthCard
          title="Create Viewer Account"
          description="Register to rent videos, buy passes, and manage your watch history."
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
                disabled={signupMutation.isPending}
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
                disabled={signupMutation.isPending}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={signupMutation.isPending}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg mt-2"
              style={{
                backgroundColor: 'var(--role-main)',
                color: 'var(--role-text)',
              }}
            >
              {signupMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
