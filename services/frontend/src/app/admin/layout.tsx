'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, LogOut, LayoutDashboard, Globe, Activity } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading, logoutMutation } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'super_admin')) {
      router.push('/');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-purple-500/20">
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg leading-none block">EdgeVOD</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Platform Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">{user?.email}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</span>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="w-full md:w-64 border-r border-border bg-muted/10 p-4 shrink-0 flex flex-row md:flex-col gap-2 md:gap-1.5 overflow-x-auto md:overflow-x-visible">
          <Link href="/admin" className="w-full">
            <Button
              variant="ghost"
              className={`flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left h-auto ${
                pathname === '/admin' 
                  ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400 hover:bg-purple-600/20 hover:text-purple-600' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Platform Overview</span>
            </Button>
          </Link>
          
          <Link href="/admin/tenants" className="w-full">
            <Button
              variant="ghost"
              className={`flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left h-auto ${
                pathname === '/admin/tenants' 
                  ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400 hover:bg-purple-600/20 hover:text-purple-600' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Manage Storefronts</span>
            </Button>
          </Link>

          <Link href="/admin/logs" className="w-full">
            <Button
              variant="ghost"
              className={`flex items-center justify-start gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left h-auto ${
                pathname === '/admin/logs' 
                  ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400 hover:bg-purple-600/20 hover:text-purple-600' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Platform Audit Logs</span>
            </Button>
          </Link>
        </nav>

        {/* Workstation */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
