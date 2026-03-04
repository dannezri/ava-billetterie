'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { validateFile, type UploadedFileInfo } from '@/config/uploadcare';
import { AlertCircle, FileCheck, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface SimpleUploadWidgetProps {
  onUploadComplete: (fileInfo: UploadedFileInfo) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  /** Appelé avec le File brut dès la sélection (avant l'upload Uploadcare) */
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Widget d'upload simple utilisant l'Upload Client API d'Uploadcare
 * Plus fiable que le widget legacy
 */
export function SimpleUploadWidget({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onFileSelect,
  disabled = false,
  className = '',
}: SimpleUploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error || 'Fichier invalide');
      onUploadError?.(validation.error || 'Fichier invalide');
      return;
    }

    setError(null);
    // Notifier immédiatement avec le File brut (avant l'upload Uploadcare)
    onFileSelect?.(file);
    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      // Upload via notre route API → Supabase Storage (contourne FileTypeForbiddenError d'Uploadcare)
      const formData = new FormData();
      formData.append('file', file);

      // Simuler une progression indéterminée pendant l'upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 85));
      }, 200);

      const response = await fetch('/api/upload/ticket-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Erreur serveur (${response.status})`);
      }

      const result: UploadedFileInfo = await response.json();

      setUploadedFile(result);
      setIsUploading(false);
      setUploadProgress(100);
      onUploadComplete(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMsg);
      setIsUploading(false);
      setUploadProgress(0);
      onUploadError?.(errorMsg);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {!uploadedFile && !isUploading && (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <Button
                type="button"
                variant="outline"
                onClick={handleButtonClick}
                disabled={disabled}
              >
                Sélectionner un fichier PDF
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              PDF uniquement, maximum 5 MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Upload en cours... {uploadProgress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadedFile && !isUploading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <FileCheck className="h-6 w-6" />
              <span className="text-sm font-medium">
                Fichier uploadé avec succès
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="mt-2"
            >
              <X className="h-4 w-4 mr-2" />
              Supprimer et réuploader
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedFile && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Nom:</span>
            <span className="font-medium">{uploadedFile.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taille:</span>
            <span className="font-medium">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{uploadedFile.mimeType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
