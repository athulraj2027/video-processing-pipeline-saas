'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getRoleThemeStyles, ROLE_THEMES, normalizeRole } from '@/lib/role-colors';
import { Film } from 'lucide-react';

interface AuthCardProps {
  title: string;
  description: string;
  role: 'viewer' | 'tenant_admin' | 'super_admin';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, role, children, footer }: AuthCardProps) {
  const themeStyles = getRoleThemeStyles(role);
  const rawTheme = ROLE_THEMES[normalizeRole(role)];

  return (
    <div style={themeStyles} className="w-full max-w-md mx-auto">
      {/* Background radial gradient wrapper for premium feel */}
      <div className="relative overflow-hidden rounded-xl border border-border shadow-2xl bg-card transition-all duration-300">
        {/* Dynamic accent color bar at the top of the card */}
        <div 
          className="h-1.5 w-full bg-role-main" 
          style={{ backgroundColor: 'var(--role-main)' }}
        />
        
        {/* Subtle dynamic glow spot in dark mode */}
        <div 
          className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-10 blur-3xl pointer-events-none dark:opacity-20"
          style={{ backgroundColor: 'var(--role-main)' }}
        />

        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-2 text-center pt-8">
            <div 
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-role-light-bg"
              style={{ 
                backgroundColor: 'var(--role-light-bg)',
                color: 'var(--role-main)' 
              }}
            >
              <Film className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            {children}
          </CardContent>

          {footer && (
            <CardFooter className="flex flex-col gap-4 bg-muted/30 border-t border-border/50 px-6 py-4">
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
