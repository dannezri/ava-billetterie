'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DuplicateAlert } from './DuplicateAlert';
import { EventImageUpload } from './EventImageUpload';

// ─── Schéma Zod ──────────────────────────────────────────────────────────────

const eventFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(255),
  artist: z.string().max(255).optional(),
  category: z.string().optional(),
  description: z.string().max(5000).optional(),
  eventDate: z.string().min(1, 'La date est requise'),
  doorsOpenTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Format HH:MM requis (ex: 19:00)'),
  venue: z.string().min(2, 'Le nom de la salle est requis').max(255),
  city: z.string().min(2, 'La ville est requise').max(100),
  country: z.string().default('France'),
  imageUrl: z.string().optional(),
  officialUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  isVerified: z.boolean().default(true),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  initialData?: Partial<EventFormValues>;
  onSaveSuccess?: () => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Rock',
  'Pop',
  'Jazz',
  'Électro',
  'Hip-Hop',
  'Classique',
  'Folk',
  'R&B',
  'Metal',
  'Reggae',
  'Comédie',
  'Théâtre',
  'Sport',
  'Autre',
];

// ─── Composant ───────────────────────────────────────────────────────────────

export function EventForm({ mode, eventId, initialData, onSaveSuccess }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [autoFetchingImage, setAutoFetchingImage] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateEvent, setDuplicateEvent] = useState<any>(null);
  const [impactWarning, setImpactWarning] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      artist: '',
      category: '',
      description: '',
      eventDate: '',
      doorsOpenTime: '19:00',
      venue: '',
      city: '',
      country: 'France',
      imageUrl: '',
      officialUrl: '',
      isVerified: true,
      ...initialData,
    },
  });

  // ─── Vérification doublon ─────────────────────────────────────────────────

  const checkDuplicate = async () => {
    const artist = form.getValues('artist');
    const city = form.getValues('city');
    const eventDate = form.getValues('eventDate');

    if (!artist || !city || !eventDate) return;

    setCheckingDuplicate(true);
    try {
      const res = await fetch('/api/admin/events/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist,
          city,
          eventDate,
          ...(eventId ? { excludeId: eventId } : {}),
        }),
      });

      if (res.ok) {
        const { duplicate } = await res.json();
        setDuplicateEvent(duplicate);
      }
    } catch {
      // Silencieux — ne pas bloquer l'UX pour une vérification de doublon
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const onSubmit = async (data: EventFormValues) => {
    setLoading(true);
    setImpactWarning(null);

    // Vérification doublon avant soumission (mode création)
    if (mode === 'create' && data.artist && data.city && data.eventDate) {
      try {
        const res = await fetch('/api/admin/events/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: data.artist, city: data.city, eventDate: data.eventDate }),
        });
        if (res.ok) {
          const { duplicate } = await res.json();
          if (duplicate && !duplicateEvent) {
            setDuplicateEvent(duplicate);
          }
        }
      } catch {
        // Silencieux
      }
    }

    // Indiquer visuellement que la recherche d'image est en cours.
    // En edit : uniquement si l'événement n'avait pas d'image en DB (initialData).
    const willAutoFetch =
      !data.imageUrl &&
      !!data.artist &&
      (mode === 'create' || !initialData?.imageUrl);
    if (willAutoFetch) setAutoFetchingImage(true);

    try {
      const url =
        mode === 'create' ? '/api/admin/events' : `/api/admin/events/${eventId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          artist: data.artist || undefined,
          category: data.category || undefined,
          description: data.description || undefined,
          doorsOpenTime: data.doorsOpenTime || undefined,
          imageUrl: data.imageUrl || undefined,
          officialUrl: data.officialUrl || undefined,
        }),
      });

      setAutoFetchingImage(false);
      const json = await res.json();

      if (!res.ok) {
        toast({
          title: 'Erreur',
          description: json.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
        return;
      }

      if (json.warning) {
        setImpactWarning(json.warning);
      }

      // Toast différencié selon la présence ou non d'une image auto-récupérée
      if (json.imageAutoFetched) {
        toast({
          title: mode === 'create' ? 'Événement créé avec image ✓' : 'Événement modifié avec image ✓',
          description: `Image de ${data.artist} récupérée automatiquement depuis Spotify/Last.fm.`,
        });
      } else if (mode === 'create') {
        if (json.event?.imageUrl) {
          toast({
            title: 'Événement créé ✓',
            description: `"${data.title}" a été ajouté avec votre image personnalisée.`,
          });
        } else {
          toast({
            title: 'Événement créé ✓',
            description: `"${data.title}" a été ajouté. Aucune image trouvée — vous pouvez en ajouter une manuellement.`,
          });
        }
      } else {
        toast({
          title: 'Événement modifié ✓',
          description: `"${data.title}" a été mis à jour.`,
        });
      }

      if (mode === 'edit' && onSaveSuccess) {
        onSaveSuccess();
      } else {
        router.push('/admin/events');
        router.refresh();
      }
    } catch {
      setAutoFetchingImage(false);
      toast({
        title: 'Erreur réseau',
        description: 'Impossible de contacter le serveur.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Alerte doublon */}
        {duplicateEvent && <DuplicateAlert event={duplicateEvent} />}

        {/* Alerte impact billets */}
        {impactWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">{impactWarning}</AlertDescription>
          </Alert>
        )}

        {/* ── Informations générales ────────────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Informations générales</h2>

          {/* Titre */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de l&apos;événement <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Fabrice Eboué – Nouveau spectacle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Artiste + Catégorie */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artiste / Performer</FormLabel>
                  <FormControl>
                    <Input placeholder="Fabrice Eboué" {...field} onBlur={checkDuplicate} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Date & Heure ─────────────────────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Date & Heure</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de l&apos;événement <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        checkDuplicate();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doorsOpenTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d&apos;ouverture des portes <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Lieu ─────────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Lieu</h2>

          {/* Nom de la salle */}
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la salle <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Folies Bergère" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ville + Pays */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paris"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        checkDuplicate();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Input placeholder="France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Image ────────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-semibold text-gray-900">Image</h2>
            {(mode === 'create' || !initialData?.imageUrl) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                <Sparkles className="h-3 w-3" />
                Auto-récupérée depuis Spotify si vide
              </span>
            )}
          </div>

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image de l&apos;événement</FormLabel>
                <FormControl>
                  <EventImageUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  {(mode === 'create' || !initialData?.imageUrl)
                    ? "Laissez vide pour récupérer automatiquement l'image officielle de l'artiste (Spotify, Last.fm)."
                    : 'JPG, PNG ou WebP — max 10 MB.'}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Bannière recherche image en cours ────────────────────────── */}
        {autoFetchingImage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-indigo-200 bg-white px-5 py-4 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Recherche d&apos;image en cours…</p>
              <p className="text-xs text-gray-500">Interrogation de Spotify, Last.fm…</p>
            </div>
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {autoFetchingImage
              ? 'Recherche image…'
              : mode === 'create'
              ? "Créer l'événement"
              : 'Enregistrer les modifications'}
          </Button>
          {checkingDuplicate && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Vérification doublons…
            </span>
          )}
        </div>
      </form>
    </Form>
  );
}
