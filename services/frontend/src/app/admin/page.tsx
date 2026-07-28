'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Globe, Server, Activity } from 'lucide-react';

export default function AdminOverviewPage() {
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

  return (
    <div className="space-y-8 animate-fade-in">
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
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">3</h2>
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
  );
}
