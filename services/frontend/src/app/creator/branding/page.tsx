'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Check } from 'lucide-react';

export default function CreatorBrandingPage() {
  const [customDomain, setCustomDomain] = useState('studio.mybrand.tv');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
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
  );
}
