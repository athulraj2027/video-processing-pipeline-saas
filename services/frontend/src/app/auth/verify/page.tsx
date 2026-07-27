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
import { useAuth } from '@/context/auth-context';

function VerifyContent() {
  const { loginWithData } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'tenant_admin'>('viewer');
  const [otp, setOtp] = useState('');
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

  const verifyMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (data) => {
      loginWithData(data);
      setIsSuccess(true);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !otp) {
      setErrorMsg('Code is required');
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg('Verification code must be exactly 6 characters long');
      return;
    }

    verifyMutation.mutate({
      email,
      otp,
    });
  };

  const handleProceed = () => {
    router.push('/');
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
      <h3 className="text-lg font-bold text-foreground">Email Verified!</h3>
      <p className="text-sm text-muted-foreground">
        Your email address has been successfully verified, and you have been signed in automatically.
      </p>
      <Button
        onClick={handleProceed}
        className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg"
        style={{
          backgroundColor: 'var(--role-main)',
          color: 'var(--role-text)',
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );

  return (
    <AuthCard
      title="Verify Your Email"
      description={`We sent a 6-digit confirmation code to ${email || 'your email'}.`}
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
            <Label htmlFor="otp">Enter Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              disabled={verifyMutation.isPending}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full bg-role-main hover:bg-role-main/90 text-role-text transition-all font-semibold rounded-lg mt-2"
            style={{
              backgroundColor: 'var(--role-main)',
              color: 'var(--role-text)',
            }}
          >
            {verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
