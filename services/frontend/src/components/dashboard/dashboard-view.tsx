'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, LogOut } from 'lucide-react';
import { AdminDashboard } from './admin-dashboard';
import { CreatorDashboard } from './creator-dashboard';
import { ViewerDashboard } from './viewer-dashboard';

export function DashboardView({ user, onLogout }: { user: any; onLogout: () => void }) {
  const isSuperAdmin = user.role === 'super_admin';
  const isCreator = user.role === 'tenant_admin' || user.role === 'creator';

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Premium Admin Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md ${
              isSuperAdmin 
                ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-purple-500/20' 
                : 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/20'
            }`}>
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg leading-none block">EdgeVOD</span>
              <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                {isSuperAdmin ? 'Platform Admin' : 'SaaS Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-foreground">{user.email}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</span>
            </div>
            
            <div className="h-8 w-px bg-border hidden sm:block" />

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Dynamic Sub-Dashboard Mounting */}
      {isSuperAdmin ? (
        <AdminDashboard />
      ) : isCreator ? (
        <CreatorDashboard />
      ) : (
        <ViewerDashboard />
      )}
    </div>
  );
}
