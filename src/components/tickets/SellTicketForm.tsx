'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadedFileInfo } from '@/config/uploadcare';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    AlertCircle, AlertTriangle,
    Barcode,
    Calendar,
    CheckCircle,
    Euro,
    Loader2,
    Lock,
    MapPin,
    Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EventSelect } from './EventSelect';
import { SimpleUploadWidget } from './SimpleUploadWidget';

// ============================================================================
// TYPES
// ============================================================================

interface TicketItem {
  seatCategory: string | null;
  row: string | null;
  seatNumber: string | null;
  barcode: string | null;
  barcodeType: string | null;
  // PDF individuel de la page correspondant à ce billet (généré côté serveur)
  pdfUrl?: string;
  pdfUuid?: string;
}

interface ExtractionResult {
  pdfHash: string;
  pdfSizeBytes: number;
  confidence: number;
  warnings: string[];
  extractedData: {
    eventName: string | null;
    eventDate: string | null;
    venueName: string | null;
    city: string | null;
    originalPrice: number | null;
    seatCategory: string | null;
    row: string | null;
    seatNumber: string | null;
    barcode: string | null;
    barcodeType: string | null;
    tickets: TicketItem[];
  };
}

interface NewEventDraft {
  title: string;
  eventDate: string; // ISO string (datetime)
  venue: string | null;
  city: string | null;
  artist: string | null;
  category: string | null;
  doorsOpenTime: string | null; // "HH:MM"
  country: string | null;
}

const EVENT_CATEGORIES = [
  'Rock', 'Pop', 'Jazz', 'Électro', 'Hip-Hop', 'Classique',
  'Folk', 'R&B', 'Metal', 'Reggae', 'Comédie', 'Théâtre', 'Sport', 'Autre',
];

// ============================================================================
// SCHÉMA VALIDATION
// ============================================================================

const sellTicketSchema = z.object({
  // Peut être vide si l'événement est créé automatiquement à la soumission (eventNotFound)
  eventId: z.string().uuid('Sélectionnez un événement valide').or(z.literal('')),
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
    .min(1, 'Catégorie / section requise')
    .max(100, 'Catégorie trop longue'),
  row: z.string().max(50).optional(),
  seatNumber: z.string().max(50).optional(),
  pdfUrl: z.string().url('PDF requis — uploadez votre billet'),
  barcodeNumber: z.string().min(5).max(50).optional().or(z.literal('')),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial (loi française)',
    path: ['sellingPrice'],
  }
);

type SellTicketFormData = z.infer<typeof sellTicketSchema>;

interface SellTicketFormProps {
  eventId?: string;
  onSuccess?: (ticketId: string) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function SellTicketForm({ eventId = '', onSuccess, onError }: SellTicketFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  // Référence au fichier brut sélectionné (pour l'envoyer à extract-pdf après l'upload Uploadcare)
  const selectedFileRef = useRef<File | null>(null);

  // Extraction state
  const [extracting, setExtracting] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Sélection des billets (multi-places dans un même PDF)
  const [selectedTicketIndices, setSelectedTicketIndices] = useState<Set<number>>(new Set());
  const [submitProgress, setSubmitProgress] = useState<{ current: number; total: number } | null>(null);

  // État "événement non trouvé"
  const [eventNotFound, setEventNotFound] = useState(false);
  const [newEventDraft, setNewEventDraft] = useState<NewEventDraft | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState('');       // YYYY-MM-DD
  const [draftArtist, setDraftArtist] = useState('');
  const [draftVenue, setDraftVenue] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftCountry, setDraftCountry] = useState('France');
  const [draftCategory, setDraftCategory] = useState('');
  const [draftDoorsOpenTime, setDraftDoorsOpenTime] = useState('20:00');
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellTicketFormData>({
    resolver: zodResolver(sellTicketSchema),
    defaultValues: { eventId },
  });

  const selectedEventId = watch('eventId');
  const originalPrice = watch('originalPrice');
  const sellingPrice = watch('sellingPrice');

  // ============================================================================
  // UPLOAD → EXTRACTION AUTOMATIQUE
  // ============================================================================

  const handleUploadComplete = (fileInfo: UploadedFileInfo) => {
    setUploadedFile(fileInfo);
    setValue('pdfUrl', fileInfo.cdnUrl, { shouldValidate: true });
    if (selectedFileRef.current) {
      runExtraction(selectedFileRef.current, fileInfo.uuid, fileInfo.cdnUrl);
    }
  };

  const handleFileSelect = (file: File) => {
    // Stocker le fichier brut pour l'envoyer après l'upload Uploadcare
    selectedFileRef.current = file;
  };

  const runExtraction = async (file: File, storageUuid?: string, storageCdnUrl?: string) => {
    setExtracting(true);
    setExtraction(null);
    setExtractionError(null);
    // Réinitialiser état "non trouvé" à chaque nouveau PDF
    setEventNotFound(false);
    setNewEventDraft(null);
    setCreateEventError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (storageUuid)   formData.append('storageUuid', storageUuid);
      if (storageCdnUrl) formData.append('storageCdnUrl', storageCdnUrl);

      const res = await fetch('/api/tickets/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Erreur serveur (${res.status})`;
        try {
          const body = await res.json();
          errorMsg = body.error || errorMsg;
        } catch { /* corps non-JSON */ }
        throw new Error(errorMsg);
      }

      const data: ExtractionResult = await res.json();
      setExtraction(data);

      const { extractedData } = data;

      // Sélectionner tous les billets par défaut
      const ticketCount = extractedData.tickets?.length ?? 0;
      setSelectedTicketIndices(new Set(Array.from({ length: Math.max(ticketCount, 1) }, (_, i) => i)));

      if (extractedData.originalPrice) {
        setValue('originalPrice', extractedData.originalPrice, { shouldValidate: true });
        setValue('sellingPrice', extractedData.originalPrice, { shouldValidate: false });
      }
      // Pré-remplir les champs siège depuis le premier billet détecté
      const firstTicket = extractedData.tickets?.[0];
      if (firstTicket?.seatCategory || extractedData.seatCategory) {
        setValue('section', firstTicket?.seatCategory ?? extractedData.seatCategory ?? '', { shouldValidate: true });
      }
      if (firstTicket?.row || extractedData.row) {
        setValue('row', firstTicket?.row ?? extractedData.row ?? '');
      }
      if (firstTicket?.seatNumber || extractedData.seatNumber) {
        setValue('seatNumber', firstTicket?.seatNumber ?? extractedData.seatNumber ?? '');
      }
      if (firstTicket?.barcode || extractedData.barcode) {
        setValue('barcodeNumber', firstTicket?.barcode ?? extractedData.barcode ?? '');
      }

    } catch (err: any) {
      const msg = err.message || 'Erreur lors de l\'analyse du PDF';
      setExtractionError(msg);
      console.error('[SellTicketForm] Extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    setSubmitStatus('error');
    onError?.(error);
  };

  // ============================================================================
  // ÉVÉNEMENT NON TROUVÉ
  // ============================================================================

  const handleEventNotFound = useCallback(() => {
    if (!extraction) return;

    const { extractedData } = extraction;

    const draft: NewEventDraft = {
      title:         extractedData.eventName ?? '',
      eventDate:     extractedData.eventDate ?? '',
      venue:         extractedData.venueName,
      city:          extractedData.city,
      // Heuristique artiste : prendre uniquement la partie avant " – " ou " - "
      // Ex: "Fabrice Eboué – Nouveau spectacle" → "Fabrice Eboué"
      artist: extractedData.eventName
        ? extractedData.eventName.split(/\s+[–\-]\s+/)[0].trim()
        : null,
      category:      extractedData.seatCategory ?? null, // Peut servir d'indice
      doorsOpenTime: '20:00',
      country:       'France',
    };

    setNewEventDraft(draft);
    setEventNotFound(true);
    setCreateEventError(null);

    // Pré-remplir tous les champs éditables
    setDraftTitle(draft.title);
    setDraftArtist(draft.artist ?? '');
    setDraftVenue(draft.venue ?? '');
    setDraftCity(draft.city ?? '');
    setDraftCountry('France');
    setDraftCategory('');
    setDraftDoorsOpenTime('20:00');
    setDraftDate(draft.eventDate ? draft.eventDate.substring(0, 10) : '');
  }, [extraction]);

  // Crée l'événement depuis le draft et retourne son ID
  const createEventFromDraft = async (): Promise<string> => {
    if (!draftTitle.trim()) throw new Error("Le titre de l'événement est requis");
    if (!draftDate)          throw new Error('La date est requise');
    if (!draftDoorsOpenTime) throw new Error("L'heure d'ouverture des portes est requise");

    const res = await fetch('/api/events/create-from-extraction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:         draftTitle.trim(),
        artist:        draftArtist.trim() || null,
        category:      draftCategory || null,
        eventDate:     new Date(`${draftDate}T${draftDoorsOpenTime}:00`).toISOString(),
        doorsOpenTime: draftDoorsOpenTime,
        venue:         draftVenue.trim() || null,
        city:          draftCity.trim() || null,
        country:       draftCountry.trim() || 'France',
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || `Erreur création événement ${res.status}`);
    }

    const { event } = await res.json();
    return event.id as string;
  };

  // ============================================================================
  // SUBMIT
  // ============================================================================

  const onSubmit = async (data: SellTicketFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    setCreateEventError(null);

    try {
      // ── Création automatique de l'événement si pas encore sélectionné ─────
      let finalEventId = data.eventId;
      if (!finalEventId && eventNotFound) {
        try {
          setCreatingEvent(true);
          finalEventId = await createEventFromDraft();
        } catch (err: any) {
          setCreateEventError(err.message || "Erreur lors de la création de l'événement");
          setIsSubmitting(false);
          setCreatingEvent(false);
          return;
        } finally {
          setCreatingEvent(false);
        }
      }

      if (!finalEventId) {
        setErrorMessage('Veuillez sélectionner ou renseigner un événement');
        setIsSubmitting(false);
        return;
      }

      // ── Déterminer les billets à soumettre ────────────────────────────────
      const detectedTickets = extraction?.extractedData.tickets ?? [];
      const isMultiMode = detectedTickets.length > 1;

      // En mode mono (0 ou 1 billet détecté), soumettre le formulaire tel quel
      const ticketsToSubmit: Array<{
        row?: string; seatNumber?: string; barcode?: string; section?: string;
        pdfUrl?: string; pdfUuid?: string;
      }> =
        isMultiMode
          ? [...selectedTicketIndices]
              .filter(i => i < detectedTickets.length)
              .sort((a, b) => a - b)
              .map(i => ({
                section: detectedTickets[i].seatCategory ?? data.section,
                row: detectedTickets[i].row ?? undefined,
                seatNumber: detectedTickets[i].seatNumber ?? undefined,
                barcode: detectedTickets[i].barcode ?? undefined,
                pdfUrl: detectedTickets[i].pdfUrl,
                pdfUuid: detectedTickets[i].pdfUuid,
              }))
          : [{
              section: data.section, row: data.row, seatNumber: data.seatNumber,
              barcode: data.barcodeNumber,
              pdfUrl: detectedTickets[0]?.pdfUrl,
              pdfUuid: detectedTickets[0]?.pdfUuid,
            }];

      if (ticketsToSubmit.length === 0) {
        setErrorMessage('Sélectionnez au moins un billet à mettre en vente');
        setIsSubmitting(false);
        return;
      }

      setSubmitProgress({ current: 0, total: ticketsToSubmit.length });

      const createdIds: string[] = [];
      for (let i = 0; i < ticketsToSubmit.length; i++) {
        const t = ticketsToSubmit[i];
        setSubmitProgress({ current: i + 1, total: ticketsToSubmit.length });

        // Utiliser le PDF individuel de la page si disponible (split côté serveur),
        // sinon fallback sur le PDF complet uploadé par le widget
        const ticketPdfUrl = t.pdfUrl || data.pdfUrl;
        const ticketPdfHash = t.pdfUuid || uploadedFile?.uuid;

        const payload = {
          eventId: finalEventId,
          originalPrice: data.originalPrice,
          sellingPrice: data.sellingPrice,
          section: t.section || data.section,
          row: t.row || undefined,
          seatNumber: t.seatNumber || undefined,
          pdfUrl: ticketPdfUrl,
          pdfHash: ticketPdfHash,
          barcodeNumber: (isMultiMode ? t.barcode : data.barcodeNumber) || undefined,
          extractedPrice: extraction?.extractedData.originalPrice,
          extractionConfidence: extraction?.confidence,
        };

        const response = await fetch('/api/tickets/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.details) {
            const msgs = error.details.map((e: any) => `${e.path?.join('.')}: ${e.message}`).join(', ');
            throw new Error(`Billet #${i + 1} — Validation : ${msgs}`);
          }
          throw new Error(error.message || error.error || `Erreur lors de la création du billet #${i + 1}`);
        }

        const result = await response.json();
        createdIds.push(result.ticketId);
      }

      setSubmitProgress(null);
      setSubmitStatus('success');
      onSuccess?.(createdIds[0]);
      setTimeout(() => router.push('/dashboard/seller'), 1500);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorMessage(message);
      setSubmitStatus('error');
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const confidenceColor = (c: number) => {
    if (c >= 0.7) return 'text-green-600';
    if (c >= 0.4) return 'text-amber-600';
    return 'text-red-600';
  };

  const confidenceLabel = (c: number) => {
    if (c >= 0.7) return 'Bonne';
    if (c >= 0.4) return 'Partielle';
    return 'Faible';
  };

  const formatDateDisplay = (isoStr: string | null) => {
    if (!isoStr) return null;
    try {
      return new Date(isoStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ═══ ÉTAPE 1 : Upload PDF ════════════════════════════════════════════ */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <span>Billet PDF *</span>
          {!uploadedFile && (
            <span className="text-xs font-normal text-muted-foreground">
              → Les champs se rempliront automatiquement
            </span>
          )}
        </Label>
        <SimpleUploadWidget
          onUploadComplete={handleUploadComplete}
          onFileSelect={handleFileSelect}
          onUploadError={handleUploadError}
          disabled={isSubmitting}
        />
        {errors.pdfUrl && (
          <p className="text-sm text-red-600">{errors.pdfUrl.message}</p>
        )}
      </div>

      {/* ═══ LOADER EXTRACTION ═══════════════════════════════════════════════ */}
      {extracting && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800 font-medium">
            🔍 Analyse du billet en cours... Extraction automatique des informations.
          </AlertDescription>
        </Alert>
      )}

      {/* ═══ RÉSULTAT EXTRACTION ══════════════════════════════════════════════ */}
      {extractionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Extraction échouée :</strong> {extractionError}
            <br />
            <span className="text-xs">Remplissez les champs manuellement ci-dessous.</span>
          </AlertDescription>
        </Alert>
      )}

      {extraction && !extracting && (
        <Alert className={extraction.confidence >= 0.5
          ? 'border-green-200 bg-green-50'
          : 'border-amber-200 bg-amber-50'
        }>
          <Sparkles className={`h-4 w-4 ${extraction.confidence >= 0.5 ? 'text-green-600' : 'text-amber-600'}`} />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Extraction automatique</span>
                <span className={`text-sm font-medium ${confidenceColor(extraction.confidence)}`}>
                  Confiance : {confidenceLabel(extraction.confidence)} ({Math.round(extraction.confidence * 100)}%)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {extraction.extractedData.eventName && (
                  <div className="flex items-start gap-1 col-span-2">
                    <Calendar className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-gray-700 truncate">
                      <strong>Événement :</strong> {extraction.extractedData.eventName}
                    </span>
                  </div>
                )}
                {extraction.extractedData.originalPrice && (
                  <div className="flex items-center gap-1">
                    <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                    <span><strong>Prix :</strong> {extraction.extractedData.originalPrice}€</span>
                  </div>
                )}
                {extraction.extractedData.seatCategory && (
                  <div className="flex items-center gap-1">
                    <span>🎫 <strong>Catégorie :</strong> {extraction.extractedData.seatCategory}</span>
                  </div>
                )}
                {extraction.extractedData.venueName && (
                  <div className="flex items-center gap-1 col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">
                      {extraction.extractedData.venueName}
                      {extraction.extractedData.city ? `, ${extraction.extractedData.city}` : ''}
                    </span>
                  </div>
                )}
                {extraction.extractedData.barcode && (
                  <div className="flex items-center gap-1">
                    <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs">{extraction.extractedData.barcode}</span>
                  </div>
                )}
              </div>

              {extraction.warnings.length > 0 && (
                <div className="text-xs text-amber-700 mt-1">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  {extraction.warnings.join(' · ')}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                ✏️ Vérifiez et corrigez les champs ci-dessous si nécessaire
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ═══ CHAMPS FORMULAIRE (visibles dès upload) ════════════════════════ */}
      {uploadedFile && (
        <div className="space-y-6">

          {/* Événement */}
          <div className="space-y-2">
            <Label htmlFor="eventId">
              Événement *
              {extraction?.extractedData.eventName && !selectedEventId && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  🔍 Recherche auto : &quot;{extraction.extractedData.eventName.substring(0, 40)}&quot;
                </span>
              )}
              {selectedEventId && (
                <span className="ml-2 text-xs text-green-600 font-normal">✓ sélectionné</span>
              )}
            </Label>

            {/* EventSelect — masqué si event sélectionné ou si draft en cours */}
            {!selectedEventId && !eventNotFound && (
              <EventSelect
                value={selectedEventId || ''}
                onChange={(id) => {
                  setValue('eventId', id, { shouldValidate: true });
                  if (id) {
                    setEventNotFound(false);
                    setNewEventDraft(null);
                  }
                }}
                defaultSearchQuery={extraction?.extractedData.eventName}
                onNoResults={handleEventNotFound}
                disabled={isSubmitting}
                error={errors.eventId?.message}
              />
            )}

            {/* Événement sélectionné — affichage lecture seule */}
            {selectedEventId && (
              <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="font-medium text-green-900">Événement lié au billet</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue('eventId', '', { shouldValidate: false });
                    setEventNotFound(false);
                    setNewEventDraft(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Modifier
                </button>
              </div>
            )}

            {errors.eventId && (
              <p className="text-sm text-red-600">{errors.eventId.message}</p>
            )}

            {/* ═══ PANNEAU "ÉVÉNEMENT NON TROUVÉ" ══════════════════════════ */}
            {eventNotFound && !selectedEventId && (() => {
              // Détermine quels champs sont verrouillés (issus de l'extraction PDF)
              const locked = {
                title:  !!(newEventDraft?.title?.trim()),
                date:   !!(newEventDraft?.eventDate?.trim()),
                venue:  !!(newEventDraft?.venue?.trim()),
                city:   !!(newEventDraft?.city?.trim()),
              };
              const lockedClass = 'bg-gray-100 text-gray-600 cursor-not-allowed select-none';
              const freeClass   = 'bg-white';

              const LockBadge = () => (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-gray-400 font-normal">
                  <Lock className="h-2.5 w-2.5" /> extrait PDF
                </span>
              );

              return (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Événement introuvable dans notre catalogue
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Les champs <Lock className="inline h-3 w-3 mx-0.5" /> ont été extraits automatiquement du PDF et sont verrouillés. Complétez les champs manquants.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">

                    {/* Titre */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-amber-800">
                        Titre de l&apos;événement <span className="text-red-500">*</span>
                        {locked.title && <LockBadge />}
                      </Label>
                      <Input
                        type="text"
                        placeholder="Ex : Fabrice Eboué – Nouveau spectacle"
                        value={draftTitle}
                        readOnly={locked.title}
                        onChange={locked.title ? undefined : (e) => setDraftTitle(e.target.value)}
                        className={`text-sm h-9 ${locked.title ? lockedClass : freeClass}`}
                      />
                    </div>

                    {/* Artiste + Catégorie — artiste toujours libre, catégorie toujours libre */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">Artiste / Performer</Label>
                        <Input
                          type="text"
                          placeholder="Fabrice Eboué"
                          value={draftArtist}
                          onChange={(e) => setDraftArtist(e.target.value)}
                          className={`text-sm h-9 ${freeClass}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">Catégorie</Label>
                        <select
                          value={draftCategory}
                          onChange={(e) => setDraftCategory(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">Choisir…</option>
                          {EVENT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date + Heure (heure toujours libre) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">
                          Date de l&apos;événement <span className="text-red-500">*</span>
                          {locked.date && <LockBadge />}
                        </Label>
                        <Input
                          type="date"
                          value={draftDate}
                          readOnly={locked.date}
                          onChange={locked.date ? undefined : (e) => setDraftDate(e.target.value)}
                          className={`text-sm h-9 ${locked.date ? lockedClass : freeClass}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">
                          Heure d&apos;ouverture des portes <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="time"
                          value={draftDoorsOpenTime}
                          onChange={(e) => setDraftDoorsOpenTime(e.target.value)}
                          className={`text-sm h-9 ${freeClass}`}
                        />
                      </div>
                    </div>

                    {/* Nom de la salle */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-amber-800">
                        Nom de la salle <span className="text-red-500">*</span>
                        {locked.venue && <LockBadge />}
                      </Label>
                      <Input
                        type="text"
                        placeholder="Folies Bergère"
                        value={draftVenue}
                        readOnly={locked.venue}
                        onChange={locked.venue ? undefined : (e) => setDraftVenue(e.target.value)}
                        className={`text-sm h-9 ${locked.venue ? lockedClass : freeClass}`}
                      />
                    </div>

                    {/* Ville + Pays (pays toujours libre) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">
                          Ville <span className="text-red-500">*</span>
                          {locked.city && <LockBadge />}
                        </Label>
                        <Input
                          type="text"
                          placeholder="Paris"
                          value={draftCity}
                          readOnly={locked.city}
                          onChange={locked.city ? undefined : (e) => setDraftCity(e.target.value)}
                          className={`text-sm h-9 ${locked.city ? lockedClass : freeClass}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-amber-800">Pays</Label>
                        <Input
                          type="text"
                          placeholder="France"
                          value={draftCountry}
                          onChange={(e) => setDraftCountry(e.target.value)}
                          className={`text-sm h-9 ${freeClass}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Erreur création */}
                  {createEventError && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {createEventError}
                    </p>
                  )}

                  <p className="text-xs text-amber-700 pt-1">
                    ℹ️ L&apos;événement sera créé automatiquement lors de la soumission du billet.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* ═══ SÉLECTEUR MULTI-BILLETS ══════════════════════════════════════ */}
          {extraction && !extracting && (extraction.extractedData.tickets?.length ?? 0) > 0 && (() => {
            const tickets = extraction.extractedData.tickets;
            const isMulti = tickets.length > 1;
            const nbSelected = [...selectedTicketIndices].filter(i => i < tickets.length).length;

            if (!isMulti) return null; // 1 seul billet → pas de sélecteur

            return (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎫</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {tickets.length} billets détectés dans ce PDF
                      </p>
                      <p className="text-xs text-blue-700">
                        Sélectionnez les places que vous souhaitez mettre en vente
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-900">{nbSelected}/{tickets.length}</span>
                    <p className="text-xs text-blue-600">sélectionnée(s)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {tickets.map((ticket, idx) => {
                    const isChecked = selectedTicketIndices.has(idx);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 rounded-md border px-3 py-2.5 cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-blue-400 bg-white shadow-sm'
                            : 'border-blue-200 bg-blue-50/50 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedTicketIndices(prev => {
                              const next = new Set(prev);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              return next;
                            });
                          }}
                          className="h-4 w-4 rounded border-blue-400 text-blue-600"
                        />
                        <div className="flex-1 flex items-center gap-3 text-sm">
                          <span className="font-semibold text-gray-800 w-6 text-center">
                            #{idx + 1}
                          </span>
                          {ticket.seatCategory && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium">
                              {ticket.seatCategory}
                            </span>
                          )}
                          {ticket.row && (
                            <span className="text-gray-600">
                              Rang <strong>{ticket.row}</strong>
                            </span>
                          )}
                          {ticket.seatNumber && (
                            <span className="text-gray-600">
                              Place <strong>{ticket.seatNumber}</strong>
                            </span>
                          )}
                          {ticket.barcode && (
                            <span className="text-xs font-mono text-gray-400 ml-auto">
                              {ticket.barcode}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {nbSelected === 0 && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Sélectionnez au moins un billet pour continuer
                  </p>
                )}

                {nbSelected > 1 && (
                  <p className="text-xs text-blue-700">
                    💡 {nbSelected} annonces séparées seront créées (une par place), toutes au même prix
                  </p>
                )}
              </div>
            );
          })()}

          {/* Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">
                Prix facial (€) *
                {extraction?.extractedData.originalPrice && (
                  <span className="ml-1 text-xs text-green-600">✓ auto</span>
                )}
              </Label>
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
              {originalPrice > 0 && sellingPrice > 0 && sellingPrice <= originalPrice && (
                <p className="text-xs text-green-600">
                  ✓ Conforme — économie de {(originalPrice - sellingPrice).toFixed(2)}€ pour l&apos;acheteur
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                ≤ prix facial (loi française Art. 313-6-2)
              </p>
            </div>
          </div>

          {/* Section / Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="section">
              Section / Catégorie *
              {extraction?.extractedData.seatCategory && (
                <span className="ml-1 text-xs text-green-600">✓ auto</span>
              )}
            </Label>
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

          {/* Rangée + Siège — masqués en mode multi-billets (gérés par ticket) */}
          {(extraction?.extractedData.tickets?.length ?? 0) <= 1 && (
            <>
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
                  <Label htmlFor="seatNumber">
                    Numéro de siège (optionnel)
                    {extraction?.extractedData.seatNumber && (
                      <span className="ml-1 text-xs text-green-600">✓ auto</span>
                    )}
                  </Label>
                  <Input
                    id="seatNumber"
                    type="text"
                    placeholder="42"
                    disabled={isSubmitting}
                    {...register('seatNumber')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcodeNumber">
                  Code-barres (optionnel)
                  {extraction?.extractedData.barcode && (
                    <span className="ml-1 text-xs text-green-600">✓ auto</span>
                  )}
                </Label>
                <Input
                  id="barcodeNumber"
                  type="text"
                  placeholder="123456789"
                  disabled={isSubmitting}
                  {...register('barcodeNumber')}
                />
                <p className="text-xs text-muted-foreground">
                  Si visible sur votre billet, cela aide à la vérification par notre équipe
                </p>
              </div>
            </>
          )}

          {/* Messages de statut */}
          {submitStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {(() => {
                  const n = [...selectedTicketIndices].length;
                  return n > 1
                    ? `${n} billets mis en vente ! Ils seront vérifiés par notre équipe. Redirection…`
                    : 'Billet mis en vente ! Il sera vérifié par notre équipe dans les prochaines heures. Redirection…';
                })()}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || extracting || (() => {
                const tickets = extraction?.extractedData.tickets;
                if (!tickets || tickets.length <= 1) return false;
                return [...selectedTicketIndices].filter(i => i < tickets.length).length === 0;
              })()}
              className="min-w-[180px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {creatingEvent
                    ? 'Création événement…'
                    : submitProgress
                      ? `Billet ${submitProgress.current}/${submitProgress.total}…`
                      : 'Mise en vente…'}
                </>
              ) : (() => {
                const tickets = extraction?.extractedData.tickets;
                const nbSelected = tickets && tickets.length > 1
                  ? [...selectedTicketIndices].filter(i => i < tickets.length).length
                  : 0;
                return nbSelected > 1
                  ? `Mettre ${nbSelected} billets en vente`
                  : 'Mettre en vente';
              })()}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
