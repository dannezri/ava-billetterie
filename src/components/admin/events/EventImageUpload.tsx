'use client';

import { useState } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export function EventImageUpload({ value, onChange }: EventImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File) => {
    // Validation client
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont acceptées (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
      if (!publicKey) throw new Error('Clé Uploadcare manquante (NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY)');

      const { uploadFile } = await import('@uploadcare/upload-client');

      const result = await uploadFile(file, {
        publicKey,
        store: '1',
        fileName: file.name,
        contentType: file.type,
      });

      if (!result.uuid) throw new Error("L'UUID n'a pas été retourné par Uploadcare");

      // Forcer le stockage permanent côté serveur (secret key requise).
      // Le projet Uploadcare utilise un domaine CDN custom (*.ucarecd.net),
      // différent du standard ucarecdn.com — l'endpoint retourne l'original_file_url correcte.
      const storeRes = await fetch('/api/admin/uploadcare/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: result.uuid }),
      });

      const storeData = await storeRes.json();

      if (!storeRes.ok) throw new Error(storeData.error || 'Échec du stockage permanent');

      const cdnUrl = storeData.cdnUrl ?? result.cdnUrl;
      onChange(cdnUrl);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <div className="h-40 w-64 overflow-hidden rounded-lg border border-gray-200">
            {/* <img> natif pour éviter l'optimisation Next/Image côté serveur */}
            <img
              src={value}
              alt="Image événement"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="flex h-40 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-gray-100">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="text-xs">Upload en cours…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs text-center px-2">
                Cliquer ou glisser une image<br />
                <span className="text-gray-300">JPG, PNG, WebP — max 10 MB</span>
              </span>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
              e.target.value = ''; // Reset pour permettre re-sélection même fichier
            }}
          />
        </label>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
