'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { Rocket, Shield, HardDrive, Percent, Settings, Laptop, ArrowRight } from 'lucide-react';

export default function CreatorLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />

      {/* Hero Block */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="relative overflow-hidden py-24 sm:py-32 bg-radial-[at_50%_0%] from-blue-500/10 dark:from-blue-500/5 via-background to-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 dark:bg-blue-500/2 blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Creator Badge */}
            <div className="mx-auto max-w-max flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-8 backdrop-blur-md">
              <Rocket className="h-3.5 w-3.5" />
              <span>Shopify for Streaming Video</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-[1.15]">
              Launch Your Own Branded{" "}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Video Storefront
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Upload your raw films and video assets. We handle the automated transcode pipeline, subtitle generation, thumbnail sprites, dynamic pricing structures, and payouts via Stripe Connect.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/creator/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                  Launch Storefront
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/creator/signin">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-semibold border-border hover:bg-muted/50">
                  Creator Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Everything you need to monetize video</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-blue-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                  <HardDrive className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">1-Click 4K Media Ingest</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Secure direct uploads. Upload huge master files, monitor validation, and trigger automated multi-resolution workers in parallel.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-blue-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                  <Percent className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Flexible Monetization</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sell single items via Pay-Per-View, set rental access windows, bundles, subscription plans, or offer trailers for free.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-blue-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
                  <Laptop className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">White-Label & Branding</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bind custom domains with automated verification, inject logo assets, player skins, and customized color themes dynamically.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} VOD SaaS Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
