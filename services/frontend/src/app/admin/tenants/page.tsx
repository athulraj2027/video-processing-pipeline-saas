'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Globe, Trash2, ToggleRight, ToggleLeft, X } from 'lucide-react';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState([
    { id: 'tenant-1', name: 'Default Storefront', domain: 'localhost:3000', status: 'Active', storageLimit: '50 GB', videoLimit: 100, storageUsed: '2.4 GB', videosCount: 8, createdAt: '3 months ago' },
    { id: 'tenant-2', name: 'Studio Storefront', domain: 'studio.localhost:3000', status: 'Active', storageLimit: '10 GB', videoLimit: 20, storageUsed: '450 MB', videosCount: 3, createdAt: '1 month ago' },
    { id: 'tenant-3', name: 'Alpha Cinema', domain: 'alpha.cinema.tv', status: 'Suspended', storageLimit: '100 GB', videoLimit: 250, storageUsed: '12.8 GB', videosCount: 42, createdAt: '2 weeks ago' }
  ]);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');
  const [newTenantLimit, setNewTenantLimit] = useState('10 GB');
  const [newTenantVideoLimit, setNewTenantVideoLimit] = useState(50);

  const handleToggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return t;
    }));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantDomain) return;

    const newTenant = {
      id: `tenant-${Math.floor(Math.random() * 1000)}`,
      name: newTenantName,
      domain: newTenantDomain,
      status: 'Active',
      storageLimit: newTenantLimit,
      videoLimit: newTenantVideoLimit,
      storageUsed: '0 B',
      videosCount: 0,
      createdAt: 'Just now'
    };

    setTenants(prev => [...prev, newTenant]);
    setNewTenantName('');
    setNewTenantDomain('');
    setNewTenantLimit('10 GB');
    setNewTenantVideoLimit(50);
    setShowCreateTenantModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">SaaS Storefronts</h1>
          <p className="text-sm text-muted-foreground">Deploy new white-label tenant storefront instances and audit allocated limits.</p>
        </div>
        <Button 
          onClick={() => setShowCreateTenantModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 rounded-lg shadow-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create Storefront
        </Button>
      </div>

      {/* Tenants Management Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground">
              <th className="p-4">Tenant Name</th>
              <th className="p-4">DNS Binding</th>
              <th className="p-4">Allocated Limits</th>
              <th className="p-4">Usage Profile</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-muted/10 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-foreground">{tenant.name}</div>
                  <div className="text-[10px] text-muted-foreground">Registered {tenant.createdAt}</div>
                </td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{tenant.domain}</td>
                <td className="p-4">
                  <div className="text-xs">Storage: <span className="font-semibold">{tenant.storageLimit}</span></div>
                  <div className="text-xs text-muted-foreground">Max Videos: {tenant.videoLimit}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs">Used: <span className="font-semibold">{tenant.storageUsed}</span></div>
                  <div className="text-xs text-muted-foreground">Videos Ingested: {tenant.videosCount}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tenant.status === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-destructive/10 text-destructive dark:text-destructive'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleTenantStatus(tenant.id)}
                      className="h-8 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {tenant.status === 'Active' ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/5 flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE TENANT MODAL */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowCreateTenantModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Super Admin Console</span>
              <h3 className="text-xl font-heading font-extrabold text-foreground mt-1">Deploy Storefront Instance</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure a new white-label tenant storefront with specialized resource allocation.
              </p>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tenant-name" className="text-xs font-semibold">Storefront Name</Label>
                <Input 
                  id="tenant-name" 
                  placeholder="e.g. Beta Streaming" 
                  value={newTenantName} 
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tenant-domain" className="text-xs font-semibold">DNS Domain Binding</Label>
                <Input 
                  id="tenant-domain" 
                  placeholder="e.g. beta.localhost:3000" 
                  value={newTenantDomain} 
                  onChange={(e) => setNewTenantDomain(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tenant-limit" className="text-xs font-semibold">Storage Limit</Label>
                  <select 
                    id="tenant-limit"
                    value={newTenantLimit}
                    onChange={(e) => setNewTenantLimit(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg h-9 text-xs px-3 focus:outline-none"
                  >
                    <option value="10 GB">10 GB</option>
                    <option value="50 GB">50 GB</option>
                    <option value="100 GB">100 GB</option>
                    <option value="500 GB">500 GB</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tenant-video-limit" className="text-xs font-semibold">Max Videos Count</Label>
                  <Input 
                    id="tenant-video-limit"
                    type="number"
                    value={newTenantVideoLimit}
                    onChange={(e) => setNewTenantVideoLimit(parseInt(e.target.value) || 50)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md flex items-center justify-center gap-2 h-11"
              >
                <Globe className="h-4 w-4" />
                Initialize Storefront Node
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
