'use client';

import React from 'react';
import Link from 'next/link';
import { NavigationHeader } from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import { Film, Compass, Play, Sparkles, Shield } from 'lucide-react';

export function LandingPageView() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <NavigationHeader />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="relative overflow-hidden py-24 sm:py-32 bg-radial-[at_50%_0%] from-emerald-500/10 dark:from-emerald-500/5 via-background to-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/2 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Tagline Badge */}
            <div className="mx-auto max-w-max flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-8 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Video Streaming Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-[1.15]">
              Stream Premium Video-On-Demand Content{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Everywhere
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Access curated high-quality films, courses, and premium content scoped directly to your account. Launch rentals or join subscriptions instantly.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/viewer/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Start Watching
                </Button>
              </Link>
              <Link href="/creator">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-semibold border-border hover:bg-muted/50 flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Create a Storefront
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-emerald-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold">Ultra-low Latency HLS</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Adaptive multi-bitrate HLS packaging streams crystal-clear content smoothly under any network connection.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-emerald-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Secure Playback Protection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Security-first design using short-lived signed URLs, active session tracking, and global DRM configurations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col p-6 rounded-2xl border border-border bg-background transition-all hover:shadow-xl hover:border-emerald-500/20">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                  <Film className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Interactive Subtitles & Chapters</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse timeline bookmarks, resume where you left off, and select language subtitle tracks dynamically.
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
