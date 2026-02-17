'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadcareConfig, validateFile, extractFileInfo, type UploadedFileInfo } from '@/config/uploadcare';
import { AlertCircle, FileCheck, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Props pour le composant TicketUploadWidget
 */
interface TicketUploadWidgetProps {
  onUploadComplete: (fileInfo: UploadedFileInfo) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Widget Uploadcare pour l'upload de billets PDF
 * Respecte les contraintes: 5MB max, PDF uniquement
 */
export function TicketUploadWidget({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  disabled = false,
  className = '',
}: TicketUploadWidgetProps) {
  const widgetRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);

  useEffect(() => {
    // Charger le script Uploadcare dynamiquement
    const script = document.createElement('script');
    script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeWidget();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeWidget = () => {
    if (!widgetRef.current || !window.uploadcare) return;

    const widget = window.uploadcare.Widget(widgetRef.current);

    // Configuration des événements
    widget.onUploadComplete.add((fileInfo: any) => {
      try {
        const extractedInfo = extractFileInfo(fileInfo);
        setUploadedFile(extractedInfo);
        setIsUploading(false);
        setUploadProgress(100);
        setError(null);
        onUploadComplete(extractedInfo);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur lors du traitement du fichier';
        setError(errorMsg);
        setIsUploading(false);
        onUploadError?.(errorMsg);
      }
    });

    widget.onChange.add((fileInfo: any) => {
      if (fileInfo) {
        setIsUploading(true);
        setError(null);
        setUploadProgress(0);
        onUploadStart?.();
        
        // Suivre la progression
        fileInfo.progress((progressInfo: any) => {
          setUploadProgress(Math.round((progressInfo.progress || 0) * 100));
        });
        
        // Gérer les erreurs d'upload
        fileInfo.fail((error: any) => {
          const errorMsg = error?.message || 'Erreur lors de l\'upload';
          setError(errorMsg);
          setIsUploading(false);
          onUploadError?.(errorMsg);
        });
      } else {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadedFile(null);
      }
    });

    // Validation personnalisée avant upload
    widget.validators.push((fileInfo: any) => {
      return fileInfo.promise().then((info: any) => {
        const file = new File([new Blob()], info.name, { type: info.mimeType });
        Object.defineProperty(file, 'size', { value: info.size });
        
        const validation = validateFile(file);
        
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      });
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={widgetRef}
          type="hidden"
          role="uploadcare-uploader"
          data-public-key={uploadcareConfig.publicKey}
          data-tabs={uploadcareConfig.widget.tabs}
          data-multiple={uploadcareConfig.widget.multiple}
          data-clearable={uploadcareConfig.widget.clearable}
          data-preview-step={uploadcareConfig.widget.previewStep}
          data-images-only={uploadcareConfig.widget.imagesOnly}
          data-locale={uploadcareConfig.widget.locale}
          data-max-size={uploadcareConfig.constraints.maxFileSize}
          disabled={disabled}
        />

        {!uploadedFile && !isUploading && (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <label htmlFor="uploadcare-file-input" className="cursor-pointer font-medium text-primary hover:text-primary/80">
                Cliquez pour uploader
              </label>
              {' '}ou glissez-déposez
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
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <FileCheck className="h-6 w-6" />
            <span className="text-sm font-medium">
              Fichier uploadé : {uploadedFile.name}
            </span>
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

// Type pour window.uploadcare
declare global {
  interface Window {
    uploadcare: any;
  }
}
