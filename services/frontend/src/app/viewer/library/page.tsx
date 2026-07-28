'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Compass, Play, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function ViewerLibraryPage() {
  const [films] = useState([
    { id: 'film-1', title: 'The Midnight Cyber', price: 4.99, duration: '2h 14m', views: 824, rating: 4.8, status: 'Published', slug: 'midnight-cyber' },
    { id: 'film-2', title: 'Cooking With Fire', price: 19.99, duration: '45m', views: 310, rating: 4.6, status: 'Published', slug: 'cooking-fire' },
    { id: 'film-3', title: 'Editing Masterclass', price: 9.99, duration: '1h 30m', views: 142, rating: 4.9, status: 'Draft', slug: 'editing-masterclass' }
  ]);

  const [rentals] = useState<string[]>(['film-1']); // default unlocked
  const [showPlayerModal, setShowPlayerModal] = useState<any | null>(null);

  const purchasedFilms = films.filter(f => rentals.includes(f.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">My Purchased Content</h1>
        <p className="text-sm text-muted-foreground">Browse video streaming windows active for your account.</p>
      </div>

      {purchasedFilms.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-border flex flex-col items-center">
          <PlayCircle className="h-12 w-12 text-muted-foreground mb-3 animate-pulse" />
          <h3 className="font-bold text-foreground text-base">No active rentals found</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Explore our catalog of films, transcode assets, and purchase digital access codes.
          </p>
          <Link href="/viewer">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-xs font-semibold">
              <Compass className="h-4 w-4" /> Browse Catalog
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedFilms.map((film) => (
            <Card key={film.id} className="border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden group">
              <div className="p-5 space-y-4">
                <div className="h-40 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors">
                  <PlayCircle className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base text-foreground leading-snug group-hover:text-emerald-500 transition-colors truncate">
                    {film.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>{film.duration}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-500">
                      <Check className="h-3.5 w-3.5" /> Rented
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-muted/10 border-t border-border p-4">
                <Button 
                  onClick={() => setShowPlayerModal(film)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold shadow-md shadow-emerald-500/10"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Launch Video Player
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-4 relative">
            <button 
              onClick={() => setShowPlayerModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-emerald-400 p-1 flex items-center gap-1.5 text-sm"
            >
              <X className="h-5 w-5" />
              <span>Close Player</span>
            </button>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-2xl flex flex-col justify-between relative">
              <div className="p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center text-white z-10">
                <span className="font-heading font-semibold text-sm truncate">{showPlayerModal.title}</span>
                <span className="text-[10px] bg-emerald-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">HLS Stream</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-emerald-600/90 rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25">
                  <Play className="h-6 w-6 fill-current ml-1" />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs z-10">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 fill-current cursor-pointer" />
                  <span>0:00 / {showPlayerModal.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono border border-white/20 px-1 py-0.5 rounded cursor-pointer hover:bg-white/10">1080p</span>
                  <span className="cursor-pointer font-semibold">Auto CC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
