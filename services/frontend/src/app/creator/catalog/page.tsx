'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Star, Plus, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CreatorCatalogPage() {
  const [films, setFilms] = useState([
    { id: 'film-1', title: 'The Midnight Cyber', price: 4.99, duration: '2h 14m', views: 824, rating: 4.8, status: 'Published', slug: 'midnight-cyber' },
    { id: 'film-2', title: 'Cooking With Fire', price: 19.99, duration: '45m', views: 310, rating: 4.6, status: 'Published', slug: 'cooking-fire' },
    { id: 'film-3', title: 'Editing Masterclass', price: 9.99, duration: '1h 30m', views: 142, rating: 4.9, status: 'Draft', slug: 'editing-masterclass' }
  ]);

  const handleDeleteFilm = (id: string) => {
    setFilms(prev => prev.filter(film => film.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">Storefront Catalog</h1>
          <p className="text-sm text-muted-foreground">Configure pricing tier rules, digital rights windows, and launch streaming rentals.</p>
        </div>
        <Link href="/creator/upload">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 rounded-lg shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Button>
        </Link>
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteFilm(film.id)}
                className="h-8 rounded-lg flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/5 font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
