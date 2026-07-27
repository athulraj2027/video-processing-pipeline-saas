'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, Film, User as UserIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeRole, ROLE_THEMES } from '@/lib/role-colors';

export function NavigationHeader() {
  const { user, isAuthenticated, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();

  const activeTheme = user ? ROLE_THEMES[normalizeRole(user.role)] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight transition-colors hover:text-role-main">
          <Film className="h-6 w-6 text-role-main" style={{ color: activeTheme?.main }} />
          <span>VOD<span className="text-role-main font-extrabold" style={{ color: activeTheme?.main }}>SaaS</span></span>
        </Link>

        {/* Dynamic Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/creator" className="transition-colors hover:text-foreground">
            For Creators
          </Link>
        </nav>

        {/* Actions / Right Side */}
        <div className="flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <div className="flex items-center rounded-full border border-border p-0.5 bg-muted">
            <button
              onClick={() => setTheme('light')}
              className={`rounded-full p-1.5 transition-all duration-200 ${
                theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Light Mode"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`rounded-full p-1.5 transition-all duration-200 ${
                theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Dark Mode"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`rounded-full p-1.5 transition-all duration-200 ${
                theme === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="System Default"
            >
              <Laptop className="h-4 w-4" />
            </button>
          </div>

          {/* Auth Actions */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div 
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border"
                style={{
                  backgroundColor: 'var(--role-light-bg)',
                  borderColor: 'var(--role-main)',
                  color: 'var(--role-dark-bg)',
                }}
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>{user.role}</span>
              </div>
              <span className="hidden lg:inline text-xs text-muted-foreground max-w-[120px] truncate">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-1.5 text-xs hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/viewer/signin">
                <Button variant="ghost" size="sm" className="text-xs">
                  Viewer Sign In
                </Button>
              </Link>
              <Link href="/creator/signin">
                <Button 
                  size="sm" 
                  className="text-xs bg-role-main hover:bg-role-main/90 text-role-text"
                  style={{
                    backgroundColor: 'var(--role-main)',
                    color: 'var(--role-text)',
                  }}
                >
                  Creator Portal
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
