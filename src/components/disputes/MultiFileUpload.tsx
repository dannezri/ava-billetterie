'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@uploadcare/upload-client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  mimeType: string;
  cdnUrl: string;
}

interface MultiFileUploadProps {
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
  disabled?: boolean;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/mpeg',
  'application/pdf',
];

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
  return <FileText className="h-5 w-5 text-orange-500" />;
}

export function MultiFileUpload({
  value,
  onChange,
  maxFiles = 10,
  maxSizeMb = 5,
  disabled = false,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const handleFiles = async (files: FileList) => {
    setError(null);
    const remaining = maxFiles - value.length;

    if (remaining <= 0) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);

    for (const file of filesToUpload) {
      if (file.size > maxSizeBytes) {
        setError(`"${file.name}" dépasse ${maxSizeMb} MB`);
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" — type non supporté (images, vidéos, PDF uniquement)`);
        return;
      }
    }

    if (!publicKey) {
      setError('Configuration upload manquante');
      return;
    }

    setUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of filesToUpload) {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const result = await uploadFile(file, {
          publicKey,
          store: true,
          onProgress: ({ value: progress }) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: Math.round(progress * 100),
            }));
          },
        });

        newFiles.push({
          name: result.name || file.name,
          size: result.size || file.size,
          mimeType: result.mimeType || file.type,
          cdnUrl: result.cdnUrl || '',
        });

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch {
        setError(`Erreur upload "${file.name}". Réessayez.`);
      }
    }

    onChange([...value, ...newFiles]);
    setUploading(false);
    setUploadProgress({});

    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || uploading) return;
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center transition-colors hover:border-muted-foreground/50"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,application/pdf"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Upload en cours...</p>
            {Object.entries(uploadProgress).map(([name, progress]) => (
              <div key={name} className="text-xs text-left space-y-1">
                <span className="text-muted-foreground truncate block">{name}</span>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">
              Glissez vos fichiers ici ou{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || value.length >= maxFiles}
                className="text-primary underline disabled:opacity-50"
              >
                parcourez
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Images, vidéos, PDF — max {maxSizeMb} MB par fichier — {value.length}/{maxFiles} fichiers
            </p>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2"
            >
              <FileIcon mimeType={file.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
