'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TicketUploadWidget } from './TicketUploadWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadedFileInfo } from '@/config/uploadcare';

/**
 * Schéma de validation pour le formulaire de vente de billet
 */
const sellTicketSchema = z.object({
  eventId: z.string().uuid('ID événement invalide'),
  originalPrice: z
    .number({ invalid_type_error: 'Le prix doit être un nombre' })
    .min(1, 'Prix minimum 1€')
    .max(5000, 'Prix maximum 5000€'),
  sellingPrice: z
    .number({ invalid_type_error: 'Le prix doit être un nombre' })
    .min(1, 'Prix minimum 1€')
    .max(5000, 'Prix maximum 5000€'),
  section: z
    .string()
    .min(1, 'Section requise')
    .max(100, 'Section trop longue'),
  row: z
    .string()
    .max(50, 'Rangée trop longue')
    .optional(),
  seatNumber: z
    .string()
    .max(50, 'Numéro de siège trop long')
    .optional(),
  pdfUrl: z.string().url('URL PDF invalide'),
  barcodeNumber: z
    .string()
    .min(5, 'Code-barres invalide')
    .max(50, 'Code-barres trop long')
    .optional(),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial',
    path: ['sellingPrice'],
  }
);

type SellTicketFormData = z.infer<typeof sellTicketSchema>;

interface SellTicketFormProps {
  eventId: string;
  onSuccess?: (ticketId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Formulaire de vente de billet avec upload PDF intégré
 */
export function SellTicketForm({ eventId, onSuccess, onError }: SellTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SellTicketFormData>({
    resolver: zodResolver(sellTicketSchema),
    defaultValues: {
      eventId,
    },
  });

  const handleUploadComplete = (fileInfo: UploadedFileInfo) => {
    setUploadedFile(fileInfo);
    setValue('pdfUrl', fileInfo.cdnUrl, { shouldValidate: true });
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    setSubmitStatus('error');
    onError?.(error);
  };

  const onSubmit = async (data: SellTicketFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Appel API pour créer le billet
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          pdfHash: uploadedFile?.uuid, // UUID Uploadcare utilisé comme hash temporaire
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du billet');
      }

      const result = await response.json();
      setSubmitStatus('success');
      onSuccess?.(result.ticketId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorMessage(message);
      setSubmitStatus('error');
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section Upload PDF */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Billet PDF *</Label>
        <TicketUploadWidget
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          disabled={isSubmitting}
        />
        {errors.pdfUrl && (
          <p className="text-sm text-red-600">{errors.pdfUrl.message}</p>
        )}
      </div>

      {/* Section Prix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Prix facial (€) *</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            placeholder="150.00"
            disabled={isSubmitting}
            {...register('originalPrice', { valueAsNumber: true })}
          />
          {errors.originalPrice && (
            <p className="text-sm text-red-600">{errors.originalPrice.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Prix de vente (€) *</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            placeholder="120.00"
            disabled={isSubmitting}
            {...register('sellingPrice', { valueAsNumber: true })}
          />
          {errors.sellingPrice && (
            <p className="text-sm text-red-600">{errors.sellingPrice.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Le prix de vente ne peut pas dépasser le prix facial
          </p>
        </div>
      </div>

      {/* Section Emplacement */}
      <div className="space-y-4">
        <h3 className="font-semibold">Emplacement du billet</h3>
        
        <div className="space-y-2">
          <Label htmlFor="section">Section / Catégorie *</Label>
          <Input
            id="section"
            type="text"
            placeholder="Carré Or, Fosse, Gradin A..."
            disabled={isSubmitting}
            {...register('section')}
          />
          {errors.section && (
            <p className="text-sm text-red-600">{errors.section.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="row">Rangée (optionnel)</Label>
            <Input
              id="row"
              type="text"
              placeholder="15"
              disabled={isSubmitting}
              {...register('row')}
            />
            {errors.row && (
              <p className="text-sm text-red-600">{errors.row.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seatNumber">Numéro de siège (optionnel)</Label>
            <Input
              id="seatNumber"
              type="text"
              placeholder="42"
              disabled={isSubmitting}
              {...register('seatNumber')}
            />
            {errors.seatNumber && (
              <p className="text-sm text-red-600">{errors.seatNumber.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Code-barres */}
      <div className="space-y-2">
        <Label htmlFor="barcodeNumber">
          Code-barres / Numéro de billet (optionnel)
        </Label>
        <Input
          id="barcodeNumber"
          type="text"
          placeholder="123456789"
          disabled={isSubmitting}
          {...register('barcodeNumber')}
        />
        {errors.barcodeNumber && (
          <p className="text-sm text-red-600">{errors.barcodeNumber.message}</p>
        )}
        <p className="text-xs text-gray-500">
          Si visible sur votre billet, cela aide à la validation
        </p>
      </div>

      {/* Messages de statut */}
      {submitStatus === 'success' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Billet créé avec succès ! Il sera vérifié par notre équipe dans les prochaines heures.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Bouton Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !uploadedFile}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Mettre en vente'
          )}
        </Button>
      </div>

      {!uploadedFile && (
        <p className="text-sm text-gray-500 text-center">
          Veuillez uploader votre billet PDF pour continuer
        </p>
      )}
    </form>
  );
}
