'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { 
  LayoutDashboard, Globe, Activity, Plus, Trash2, 
  ToggleLeft, ToggleRight, X, DollarSign, Users, Server, Shield 
} from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('admin-overview');

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

  const [serviceHealth] = useState([
    { name: 'Identity & Authentication', status: 'Online', latency: '8ms', port: '4001', version: 'v1.2.0' },
    { name: 'Tenant Management', status: 'Online', latency: '6ms', port: '4005', version: 'v1.1.5' },
    { name: 'Catalog Service', status: 'Online', latency: '12ms', port: '4002', version: 'v1.4.2' },
    { name: 'Upload Service', status: 'Online', latency: '15ms', port: '4003', version: 'v1.0.8' },
    { name: 'Playback & DRM Service', status: 'Online', latency: '10ms', port: '4004', version: 'v1.2.1' },
    { name: 'Entitlement Checker', status: 'Online', latency: '9ms', port: '4006', version: 'v1.0.3' },
    { name: 'Billing & Payments', status: 'Online', latency: '24ms', port: '4007', version: 'v1.3.0' },
    { name: 'Job Orchestrator', status: 'Online', latency: '32ms', port: '4012', version: 'v1.5.1' },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-07-27 13:48:10', type: 'INFO', message: 'Tenant "Alpha Cinema" custom domain alpha.cinema.tv verified successfully.' },
    { timestamp: '2026-07-27 13:30:15', type: 'SUCCESS', message: 'Job orchestrator completed transcode job-101 (cyberpunk_cityscape_hdr.mp4).' },
    { timestamp: '2026-07-27 13:14:02', type: 'WARNING', message: 'Tenant "Alpha Cinema" billing automatic renewal failed (insufficient funds).' },
    { timestamp: '2026-07-27 12:45:00', type: 'INFO', message: 'Super Admin verified integration keys for payment processors.' },
    { timestamp: '2026-07-27 12:00:10', type: 'INFO', message: 'Cron manager completed daily backups of catalog database.' },
  ]);

  const handleToggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Active' ? 'Suspended' : 'Active';
        const logMsg = `Super Admin updated Tenant "${t.name}" status to ${nextStatus}.`;
        setAuditLogs(prevLogs => [
          { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'INFO', message: logMsg },
          ...prevLogs
        ]);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDeleteTenant = (id: string) => {
    const tenantToDelete = tenants.find(t => t.id === id);
    if (!tenantToDelete) return;
    setTenants(prev => prev.filter(t => t.id !== id));
    const logMsg = `Super Admin deleted Tenant "${tenantToDelete.name}".`;
    setAuditLogs(prevLogs => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'WARNING', message: logMsg },
      ...prevLogs
    ]);
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
    
    const logMsg = `Super Admin created Tenant "${newTenantName}" with domain "${newTenantDomain}".`;
    setAuditLogs(prevLogs => [
      { timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), type: 'SUCCESS', message: logMsg },
      ...prevLogs
    ]);

    setNewTenantName('');
    setNewTenantDomain('');
    setNewTenantLimit('10 GB');
    setNewTenantVideoLimit(50);
    setShowCreateTenantModal(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Navigation Sidebar */}
      <nav className="w-full md:w-64 border-r border-border bg-muted/10 p-4 shrink-0 flex flex-row md:flex-col gap-2 md:gap-1.5 overflow-x-auto md:overflow-x-visible">
        <button 
          onClick={() => setActiveTab('admin-overview')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'admin-overview' 
              ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Platform Overview</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('admin-tenants')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'admin-tenants' 
              ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Manage Storefronts</span>
        </button>

        <button 
          onClick={() => setActiveTab('admin-logs')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'admin-logs' 
              ? 'bg-purple-600/10 text-purple-600 font-semibold dark:text-purple-400' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Platform Audit Logs</span>
        </button>
      </nav>

      {/* Admin Panel Workstation */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* TAB: PLATFORM OVERVIEW */}
        {activeTab === 'admin-overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-heading font-extrabold tracking-tight">Platform Telemetry</h1>
              <p className="text-sm text-muted-foreground">Monitor real-time microservices node connections and network health metrics.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gross Platform Volume</span>
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">
                    $148,240.50
                  </h2>
                  <p className="text-[10px] text-emerald-500 font-medium mt-1">▲ 8.4% this month</p>
                </div>
              </Card>

              <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Storefronts</span>
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">{tenants.length}</h2>
                  <p className="text-[10px] text-muted-foreground mt-1">SaaS Customers</p>
                </div>
              </Card>

              <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">Transcode Node Load</span>
                  <Server className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">14.2%</h2>
                  <p className="text-[10px] text-purple-500 font-medium mt-1">3 active workers</p>
                </div>
              </Card>

              <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">System Health Uptime</span>
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">99.98%</h2>
                  <p className="text-[10px] text-emerald-500 font-medium mt-1">All systems operational</p>
                </div>
              </Card>
            </div>

            {/* Service Status Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-bold text-foreground">Microservices System Health</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {serviceHealth.map((service, index) => (
                  <Card key={index} className="p-4 border-border bg-card shadow-sm flex items-center justify-between">
                    <div className="space-y-1 overflow-hidden">
                      <p className="font-semibold text-sm text-foreground truncate">{service.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">Port {service.port} • {service.version}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {service.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{service.latency}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: MANAGE STOREFRONTS */}
        {activeTab === 'admin-tenants' && (
          <div className="space-y-6">
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
          </div>
        )}

        {/* TAB: AUDIT LOGS */}
        {activeTab === 'admin-logs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-heading font-extrabold tracking-tight">Platform Audit Logs</h1>
              <p className="text-sm text-muted-foreground">Audit security logs, API events, and billing triggers across the multi-tenant system.</p>
            </div>

            <Card className="p-4 border-border bg-card shadow-sm max-h-[500px] overflow-y-auto font-mono text-xs divide-y divide-border/50">
              {auditLogs.map((log, index) => (
                <div key={index} className="py-2.5 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
                  <span className={`font-bold uppercase tracking-wider shrink-0 ${
                    log.type === 'SUCCESS' ? 'text-emerald-500' : 
                    log.type === 'WARNING' ? 'text-amber-500' : 'text-blue-500'
                  }`}>
                    [{log.type}]
                  </span>
                  <span className="text-foreground leading-relaxed">{log.message}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </main>

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
