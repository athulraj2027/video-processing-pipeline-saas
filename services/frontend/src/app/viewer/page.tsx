'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Compass, Sparkles, Film, Star, Play, CreditCard, X, RefreshCw } from 'lucide-react';

export default function ViewerBrowsePage() {
  const [films] = useState([
    { id: 'film-1', title: 'The Midnight Cyber', price: 4.99, duration: '2h 14m', views: 824, rating: 4.8, status: 'Published', slug: 'midnight-cyber' },
    { id: 'film-2', title: 'Cooking With Fire', price: 19.99, duration: '45m', views: 310, rating: 4.6, status: 'Published', slug: 'cooking-fire' },
    { id: 'film-3', title: 'Editing Masterclass', price: 9.99, duration: '1h 30m', views: 142, rating: 4.9, status: 'Draft', slug: 'editing-masterclass' }
  ]);

  const [rentals, setRentals] = useState<string[]>(['film-1']); 
  const [showRentModal, setShowRentModal] = useState<any | null>(null); 
  const [showPlayerModal, setShowPlayerModal] = useState<any | null>(null); 
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paying, setPaying] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRentModal) return;

    setPaying(true);
    setTimeout(() => {
      setRentals(prev => [...prev, showRentModal.id]);
      setPaying(false);
      setShowRentModal(null);
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-3xl p-6 md:p-8 border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Featured Storefront
          </span>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-foreground">
            Unlock Unlimited Streaming
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rent premium blockbusters or educational streams directly. Unlock 48-hour access windows via immediate credit card checkout.
          </p>
        </div>
        <div className="h-28 w-28 bg-emerald-500/5 rounded-full absolute -right-6 -bottom-6 blur-2xl pointer-events-none" />
      </div>

      {/* Films Browse List */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">Available Storefront Catalog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {films.map((film) => {
            const isUnlocked = rentals.includes(film.id);
            return (
              <Card key={film.id} className="border-border bg-card shadow-sm flex flex-col justify-between overflow-hidden group">
                <div className="p-5 space-y-4">
                  <div className="h-40 bg-muted/40 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors relative">
                    <Film className="h-10 w-10" />
                    {isUnlocked && (
                      <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Unlocked
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-base text-foreground group-hover:text-emerald-500 transition-colors truncate">
                      {film.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{film.duration}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" /> {film.rating}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-muted/10 border-t border-border p-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">${film.price.toFixed(2)}</span>
                  
                  {isUnlocked ? (
                    <Button 
                      onClick={() => setShowPlayerModal(film)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-emerald-500/10"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Watch Now
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowRentModal(film)}
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Rent Stream
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* STRIPE CHECKOUT MODAL */}
      {showRentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card border-border p-6 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setShowRentModal(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Checkout / Payment Gateway</span>
              <h3 className="text-xl font-heading font-extrabold text-foreground mt-1">Unlock Video Access</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You are renting <strong>{showRentModal.title}</strong> for <strong>${showRentModal.price.toFixed(2)}</strong>.
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="card-number" className="text-xs font-semibold">Credit Card Number</Label>
                <Input 
                  id="card-number" 
                  placeholder="4242 4242 4242 4242" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19} 
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card-expiry" className="text-xs font-semibold">Expiration Date</Label>
                  <Input 
                    id="card-expiry" 
                    placeholder="MM/YY" 
                    value={cardExpiry} 
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5} 
                    required
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-cvc" className="text-xs font-semibold">CVC / Security Code</Label>
                  <Input 
                    id="card-cvc" 
                    placeholder="123" 
                    value={cardCvc} 
                    onChange={(e) => setCardCvc(e.target.value)}
                    maxLength={4} 
                    required
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Charge</span>
                <span className="text-base font-extrabold text-foreground">${showRentModal.price.toFixed(2)}</span>
              </div>

              <Button 
                type="submit" 
                disabled={paying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md flex items-center justify-center gap-2 h-11"
              >
                {paying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Rent and Start Watching
                  </>
                )}
              </Button>
            </form>
          </Card>
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
