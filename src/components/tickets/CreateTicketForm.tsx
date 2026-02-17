'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SimpleUploadWidget } from './SimpleUploadWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { UploadedFileInfo } from '@/config/uploadcare';

/**
 * Type pour un événement disponible
 */
interface EventOption {
  id: string;
  title: string;
  eventDate: string;
  venue: string;
  city: string;
}

/**
 * Schéma de validation avec selling_price <= original_price
 */
const createTicketSchema = z.object({
  eventId: z.string().uuid('Veuillez sélectionner un événement'),
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
    .min(1, 'Catégorie requise')
    .max(100, 'Catégorie trop longue'),
  row: z
    .string()
    .max(50, 'Rangée trop longue')
    .optional(),
  seatNumber: z
    .string()
    .max(50, 'Numéro de siège trop long')
    .optional(),
  pdfUrl: z.string().url('PDF requis'),
  barcodeNumber: z
    .string()
    .min(5, 'Code-barres invalide (minimum 5 caractères)')
    .max(50, 'Code-barres trop long')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial',
    path: ['sellingPrice'],
  }
);

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

interface CreateTicketFormProps {
  events: EventOption[];
  onSuccess?: (ticketId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Formulaire de création de billet en plusieurs étapes
 * Étape 1: Informations générales (événement, prix, catégorie)
 * Étape 2: Upload du PDF
 */
export function CreateTicketForm({ events, onSuccess, onError }: CreateTicketFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    mode: 'onChange',
  });

  const selectedEventId = watch('eventId');
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const originalPrice = watch('originalPrice');
  const sellingPrice = watch('sellingPrice');

  const handleUploadComplete = (fileInfo: UploadedFileInfo) => {
    console.log('✅ Upload terminé, fileInfo:', fileInfo);
    setUploadedFile(fileInfo);
    setValue('pdfUrl', fileInfo.cdnUrl, { shouldValidate: true });
    console.log('📝 pdfUrl défini à:', fileInfo.cdnUrl);
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    setSubmitStatus('error');
    onError?.(error);
  };

  const handleNextStep = async () => {
    // Valider les champs de l'étape 1
    const isValid = await trigger(['eventId', 'originalPrice', 'sellingPrice', 'section']);
    if (isValid) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: CreateTicketFormData) => {
    console.log('🚀 onSubmit appelé avec data:', data);
    console.log('📄 Fichier uploadé:', uploadedFile);
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        pdfUrl: uploadedFile?.cdnUrl,
        pdfHash: uploadedFile?.uuid,
        // Convertir les chaînes vides en undefined pour les champs optionnels
        row: data.row || undefined,
        seatNumber: data.seatNumber || undefined,
        barcodeNumber: data.barcodeNumber || undefined,
      };
      console.log('📤 Envoi payload:', payload);
      
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erreur API:', error);
        
        // Afficher les détails de validation si disponibles
        if (error.details && Array.isArray(error.details)) {
          const validationErrors = error.details.map((e: any) => 
            `${e.path?.join('.')}: ${e.message}`
          ).join(', ');
          throw new Error(`Validation: ${validationErrors}`);
        }
        
        throw new Error(error.message || error.error || 'Erreur lors de la création du billet');
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
      {/* Indicateur d'étape */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center ${step === 1 ? 'text-primary' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 1 ? 'bg-primary text-white' : 'bg-green-600 text-white'
          }`}>
            {step === 2 ? '✓' : '1'}
          </div>
          <span className="ml-2 font-medium">Informations</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300" />
        <div className={`flex items-center ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <span className="ml-2 font-medium">Upload PDF</span>
        </div>
      </div>

      {/* ÉTAPE 1: Informations du billet */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Sélection événement */}
          <div className="space-y-2">
            <Label htmlFor="eventId">Événement *</Label>
            <Select
              onValueChange={(value) => setValue('eventId', value, { shouldValidate: true })}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un événement" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.eventDate).toLocaleDateString('fr-FR')} - {event.venue}, {event.city}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventId && (
              <p className="text-sm text-red-600">{errors.eventId.message}</p>
            )}
            {selectedEvent && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                <p className="font-medium text-blue-900">{selectedEvent.title}</p>
                <p className="text-blue-700">
                  {new Date(selectedEvent.eventDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-blue-600">{selectedEvent.venue}, {selectedEvent.city}</p>
              </div>
            )}
          </div>

          {/* Prix */}
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
              {originalPrice && sellingPrice && sellingPrice <= originalPrice && (
                <p className="text-xs text-green-600">
                  ✓ Prix conforme (économie de {(originalPrice - sellingPrice).toFixed(2)}€)
                </p>
              )}
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="section">Catégorie / Section *</Label>
            <Input
              id="section"
              type="text"
              placeholder="Carré Or, Fosse, Gradin A, Parterre..."
              disabled={isSubmitting}
              {...register('section')}
            />
            {errors.section && (
              <p className="text-sm text-red-600">{errors.section.message}</p>
            )}
            <p className="text-xs text-gray-500">
              La catégorie telle qu'indiquée sur votre billet
            </p>
          </div>

          {/* Détails optionnels */}
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
            </div>
          </div>

          {/* Code-barres optionnel */}
          <div className="space-y-2">
            <Label htmlFor="barcodeNumber">Code-barres (optionnel)</Label>
            <Input
              id="barcodeNumber"
              type="text"
              placeholder="123456789"
              disabled={isSubmitting}
              {...register('barcodeNumber')}
            />
            <p className="text-xs text-gray-500">
              Si visible sur votre billet, cela aide à la validation
            </p>
          </div>

          {/* Bouton suivant */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting || !selectedEventId}
              className="min-w-[200px]"
            >
              Suivant : Upload PDF
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ÉTAPE 2: Upload PDF */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Billet PDF *</Label>
            <p className="text-sm text-gray-600 mb-4">
              Uploadez votre billet au format PDF (maximum 5 MB)
            </p>
            <SimpleUploadWidget
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              disabled={isSubmitting}
            />
            {errors.pdfUrl && (
              <p className="text-sm text-red-600">{errors.pdfUrl.message}</p>
            )}
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

          {/* Boutons navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !uploadedFile}
              className="min-w-[200px]"
              onClick={() => {
                console.log('🖱️ Bouton cliqué');
                console.log('State - isSubmitting:', isSubmitting);
                console.log('State - uploadedFile:', uploadedFile);
                console.log('State - errors:', errors);
              }}
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
        </div>
      )}
    </form>
  );
}
