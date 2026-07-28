'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Users, Shield, Activity, RefreshCw } from 'lucide-react';

export default function CreatorOverviewPage() {
  const [revenue] = useState(12840.50);
  const [jobs] = useState([
    { id: 'job-101', name: 'cyberpunk_cityscape_hdr.mp4', status: 'Completed', resolution: '4K, 1080p, 720p', progress: 100, timestamp: '10 mins ago' },
    { id: 'job-102', name: 'cooking_masterclass_ep1.mov', status: 'Processing', resolution: '1080p, 720p', progress: 68, timestamp: 'Just now' },
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Storefront Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor real-time revenue, active viewers, and transcoder workers.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">
              ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-emerald-500 font-medium mt-1">▲ 14.2% from last week</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Renters</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">428</h2>
            <p className="text-[10px] text-emerald-500 font-medium mt-1">▲ 8.1% vs average</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Capacity</span>
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">1.2 TB</h2>
            <p className="text-[10px] text-muted-foreground mt-1">Used of 5.0 TB allocated</p>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Transcoder Pipeline</span>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold tracking-tight text-foreground">Active</h2>
            <p className="text-[10px] text-blue-500 font-medium mt-1">1 worker active in queue</p>
          </div>
        </Card>
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">Media Ingest Work Queue</h3>
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground">
                <th className="p-4">Filename</th>
                <th className="p-4">Outputs</th>
                <th className="p-4">Status</th>
                <th className="p-4">Progress</th>
                <th className="p-4 text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 font-semibold text-foreground">{job.name}</td>
                  <td className="p-4 text-xs font-mono text-muted-foreground">{job.resolution}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'Completed' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {job.status === 'Processing' && <RefreshCw className="h-3 w-3 animate-spin" />}
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            job.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-xs text-muted-foreground">{job.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
