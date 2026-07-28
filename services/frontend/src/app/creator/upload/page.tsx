'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, Film, X } from 'lucide-react';

export default function CreatorUploadPage() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
            setUploading(false);
            setUploadFile(null);
            alert('Upload success! Video sent to HLS transcoder work queue.');
          }, 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
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
  );
}
