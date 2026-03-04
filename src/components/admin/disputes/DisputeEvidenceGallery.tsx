'use client';

import { useState } from 'react';
import { ImageIcon, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DisputeEvidenceGalleryProps {
  title: string;
  urls: string[];
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) || url.includes('ucarecdn') || url.includes('cloudinary');
}

export function DisputeEvidenceGallery({ title, urls }: DisputeEvidenceGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!urls || urls.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
            <ImageIcon className="h-4 w-4" />
            Aucune preuve fournie
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center justify-between">
            {title}
            <span className="text-xs font-normal text-gray-400">{urls.length} fichier{urls.length > 1 ? 's' : ''}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-1.5">
            {urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-square rounded-md overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors group bg-gray-50"
              >
                {isImage(url) ? (
                  <img
                    src={url}
                    alt={`Preuve ${i + 1}`}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500 flex-col gap-1">
                    <ExternalLink className="h-4 w-4" />
                    <span>Fichier</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            {isImage(urls[lightboxIndex]) ? (
              <img
                src={urls[lightboxIndex]}
                alt={`Preuve ${lightboxIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <ExternalLink className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-700 mb-4">Pièce jointe non prévisualisable</p>
                <Button asChild>
                  <a href={urls[lightboxIndex]} target="_blank" rel="noopener noreferrer">
                    Ouvrir le fichier
                  </a>
                </Button>
              </div>
            )}
            <p className="text-gray-400 text-center text-sm mt-2">
              {lightboxIndex + 1} / {urls.length}
            </p>
          </div>

          {lightboxIndex < urls.length - 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300 p-2"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
