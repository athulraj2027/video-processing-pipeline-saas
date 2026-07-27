'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavigationHeader } from '@/components/navigation-header';
import { AuthCard } from '@/components/auth-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { AlertCircle, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'tenant_admin'>('viewer');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const roleParam = searchParams.get('role');
    
    if (emailParam) setEmail(emailParam);
    if (roleParam === 'tenant_admin' || roleParam === 'super_admin') {
      setRole('tenant_admin');
    } else {
      setRole('viewer');
    }
  }, [searchParams]);

  const resetMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Reset failed. Please check your code and try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !otp || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg('Code must be exactly 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    resetMutation.mutate({
      email,
      otp,
      password,
    });
  };

  const handleProceed = () => {
    if (role === 'tenant_admin') {
      router.push('/creator/signin');
    } else {
      router.push('/viewer/signin');
    }
  };

  const successContent = (
    <div className="text-center py-6 space-y-4">
      <div 
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-role-light-bg"
        style={{ 
          backgroundColor: 'var(--role-light-bg)',
          color: 'var(--role-main)' 
        }}
      >
        <CheckCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Password Reset Successful!</h3>
      <p className="text-sm text-muted-foreground">
        Your password has been successfully updated. You can now proceed to log in with your new credentials.
      </p>
      <Button
        onClick={handleProceed}
        className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg"
        style={{
          backgroundColor: 'var(--role-main)',
          color: 'var(--role-text)',
        }}
      >
        Proceed to Sign In
      </Button>
    </div>
  );

  return (
    <AuthCard
      title="Create New Password"
      description={`Enter the reset code sent to ${email || 'your email'} and set a new password.`}
      role={role}
    >
      {isSuccess ? (
        successContent
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="otp">Reset Code (6 Digits)</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-xl tracking-[0.5em] font-mono"
              disabled={resetMutation.isPending}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={resetMutation.isPending}
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
              disabled={resetMutation.isPending}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg mt-2"
            style={{
              backgroundColor: 'var(--role-main)',
              color: 'var(--role-text)',
            }}
          >
            {resetMutation.isPending ? 'Updating...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
