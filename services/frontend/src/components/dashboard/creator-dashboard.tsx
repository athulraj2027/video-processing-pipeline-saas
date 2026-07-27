'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { 
  LayoutDashboard, UploadCloud, Film, Globe, DollarSign, Users, Shield, 
  Activity, RefreshCw, X, Plus, Edit3, Trash2, Check, Star 
} from 'lucide-react';

export function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Creator state
  const [revenue, setRevenue] = useState(12840.50);
  const [jobs, setJobs] = useState([
    { id: 'job-101', name: 'cyberpunk_cityscape_hdr.mp4', status: 'Completed', resolution: '4K, 1080p, 720p', progress: 100, timestamp: '10 mins ago' },
    { id: 'job-102', name: 'cooking_masterclass_ep1.mov', status: 'Processing', resolution: '1080p, 720p', progress: 68, timestamp: 'Just now' },
  ]);
  
  const [films, setFilms] = useState([
    { id: 'film-1', title: 'The Midnight Cyber', price: 4.99, duration: '2h 14m', views: 824, rating: 4.8, status: 'Published', slug: 'midnight-cyber' },
    { id: 'film-2', title: 'Cooking With Fire', price: 19.99, duration: '45m', views: 310, rating: 4.6, status: 'Published', slug: 'cooking-fire' },
    { id: 'film-3', title: 'Editing Masterclass', price: 9.99, duration: '1h 30m', views: 142, rating: 4.9, status: 'Draft', slug: 'editing-masterclass' }
  ]);
  
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Tenant Config state
  const [customDomain, setCustomDomain] = useState('studio.mybrand.tv');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [savedSettings, setSavedSettings] = useState(false);

  // Simulated upload and transcode pipeline
  const handleMockUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newJob = {
              id: `job-${Math.floor(Math.random() * 1000)}`,
              name: uploadFile.name,
              status: 'Processing',
              resolution: '1080p, 720p',
              progress: 0,
              timestamp: 'Just now'
            };
            setJobs(prevJobs => [newJob, ...prevJobs]);
            setUploading(false);
            setUploadFile(null);
            simulateTranscoding(newJob.id);
          }, 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const simulateTranscoding = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          if (progress >= 100) {
            clearInterval(interval);
            const baseName = job.name.substring(0, job.name.lastIndexOf('.')) || job.name;
            const formattedTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const newFilm = {
              id: `film-${Math.floor(Math.random() * 1000)}`,
              title: formattedTitle,
              price: 5.99,
              duration: '1h 15m',
              views: 0,
              rating: 5.0,
              status: 'Published',
              slug: baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            };
            setFilms(prevFilms => [newFilm, ...prevFilms]);
            return { ...job, progress: 100, status: 'Completed' };
          }
          return { ...job, progress, status: 'Processing' };
        }
        return job;
      }));
    }, 1000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Navigation Sidebar */}
      <nav className="w-full md:w-64 border-r border-border bg-muted/10 p-4 shrink-0 flex flex-row md:flex-col gap-2 md:gap-1.5 overflow-x-auto md:overflow-x-visible">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'overview' 
              ? 'bg-blue-600/10 text-blue-600 font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Storefront Metrics</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'upload' 
              ? 'bg-blue-600/10 text-blue-600 font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Ingest Master File</span>
        </button>

        <button 
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'catalog' 
              ? 'bg-blue-600/10 text-blue-600 font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Film className="h-4 w-4" />
          <span>Storefront Catalog</span>
        </button>

        <button 
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full shrink-0 text-left ${
            activeTab === 'branding' 
              ? 'bg-blue-600/10 text-blue-600 font-semibold' 
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Branding Config</span>
        </button>
      </nav>

      {/* Creator Workstation */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
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
        )}

        {/* INGEST UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-heading font-extrabold tracking-tight">Upload Master Video File</h1>
              <p className="text-sm text-muted-foreground">Upload raw film formats (mp4, mov, mkv) to trigger adaptive bitrate transcoding (HLS/DASH).</p>
            </div>

            <Card className="p-8 border-border bg-card shadow-sm border-dashed border-2 flex flex-col items-center justify-center text-center">
              {!uploadFile ? (
                <>
                  <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-pulse">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Drag and drop file here</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mb-6">
                    Supports high-resolution ProRes master files and standard MP4 containers up to 10GB.
                  </p>
                  <Label className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10 transition-all font-semibold">
                    Browse Local Files
                    <input 
                      type="file" 
                      accept="video/*" 
                      className="hidden" 
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </Label>
                </>
              ) : (
                <form onSubmit={handleMockUploadSubmit} className="w-full space-y-6">
                  <div className="bg-muted/20 p-4 rounded-xl flex items-center gap-4 text-left border border-border">
                    <div className="h-10 w-10 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center">
                      <Film className="h-5 w-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm text-foreground truncate">{uploadFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setUploadFile(null)} 
                      disabled={uploading}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Uploading File...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-200" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={uploading}
                      onClick={() => setUploadFile(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                    >
                      Start Upload Pipeline
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}

        {/* STOREFRONT CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-extrabold tracking-tight">Storefront Catalog</h1>
                <p className="text-sm text-muted-foreground">Configure pricing tier rules, digital rights windows, and launch streaming rentals.</p>
              </div>
              <Button 
                onClick={() => setActiveTab('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 rounded-lg shadow-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Video
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {films.map((film) => (
                <Card key={film.id} className="border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden group">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-blue-500 transition-colors">
                        <Film className="h-5 w-5" />
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        film.status === 'Published' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {film.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-base text-foreground leading-snug group-hover:text-blue-500 transition-colors truncate">
                        {film.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>{film.duration}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" /> {film.rating}
                        </span>
                      </p>
                    </div>

                    <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Rental Price</span>
                        <span className="font-bold text-foreground text-sm">${film.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Active Streams</span>
                        <span className="font-semibold text-foreground text-sm">{film.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/10 border-t border-border p-3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit pricing
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/5 font-semibold">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* BRANDING CONFIG TAB */}
        {activeTab === 'branding' && (
          <div className="max-w-xl space-y-6">
            <div>
              <h1 className="text-2xl font-heading font-extrabold tracking-tight">Storefront Branding</h1>
              <p className="text-sm text-muted-foreground">Setup subdomains, custom themes, and Bind DNS assets for White-Label storefront delivery.</p>
            </div>

            <Card className="p-6 border-border bg-card shadow-sm">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Domain Name */}
                <div className="space-y-2">
                  <Label htmlFor="custom-domain" className="text-sm font-semibold">Binding Domain (DNS)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="custom-domain" 
                      value={customDomain} 
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button type="button" variant="outline" className="flex items-center gap-1 text-xs font-semibold">
                      <Globe className="h-4 w-4" />
                      Verify CNAME
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Point a CNAME record in your DNS settings (e.g. cloudflare) to <span className="font-mono bg-muted px-1 py-0.5 rounded">domains.edgevod.tv</span>.
                  </p>
                </div>

                {/* Theme Accent Color */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold block">Storefront Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-9 w-9 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={accentColor} 
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="font-mono text-xs max-w-[120px]"
                    />
                  </div>
                </div>

                {/* Mock Save Settings */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  {savedSettings && (
                    <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                      <Check className="h-4 w-4" /> DNS & settings compiled successfully.
                    </span>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold ml-auto shadow-md"
                  >
                    Save Branding Layout
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
