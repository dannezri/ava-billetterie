'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MultiFileUpload } from '@/components/disputes/MultiFileUpload';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

const DISPUTE_REASONS = [
  { value: 'FAKE_TICKET', label: 'Billet refusé à l\'entrée' },
  { value: 'DUPLICATE', label: 'Code-barres déjà scanné (doublon)' },
  { value: 'NO_ACCESS', label: 'Pas d\'accès à l\'événement' },
  { value: 'EVENT_CANCELLED', label: 'Événement annulé' },
  { value: 'WRONG_TICKET', label: 'Billet ne correspond pas à la description' },
  { value: 'OTHER', label: 'Autre raison' },
] as const;

interface UploadedFile {
  name: string;
  size: number;
  mimeType: string;
  cdnUrl: string;
}

const formSchema = z.object({
  transactionId: z.string().uuid('Sélectionnez une transaction'),
  reason: z.enum([
    'FAKE_TICKET',
    'DUPLICATE',
    'NO_ACCESS',
    'EVENT_CANCELLED',
    'WRONG_TICKET',
    'OTHER',
  ]),
  description: z
    .string()
    .min(50, 'Minimum 50 caractères')
    .max(2000, 'Maximum 2000 caractères'),
  files: z.array(z.any()).max(10),
  attestation: z.boolean().refine((v) => v === true, {
    message: 'Vous devez attester de la véracité des informations',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type Purchase = {
  id: string;
  amount?: number;
  total_amount?: number;
  status: string;
  ticket: {
    event: { id: string; title: string; eventDate?: string; event_date?: string };
  };
  dispute: null | { id: string };
};

function formatEventDate(raw: string | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? '—' : format(d, 'dd MMM yyyy', { locale: fr });
}

export function DisputeCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('transactionId') || '';
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const { data, isLoading } = useQuery<{ transactions: Purchase[] }>({
    queryKey: ['purchases-for-dispute'],
    queryFn: async () => {
      const res = await fetch('/api/transactions/purchases?filter=all&limit=100');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data;
    },
  });

  // Côté client : on affiche toutes les transactions sans dispute existant.
  // La validation de la fenêtre J-1/J+2 et du statut ESCROWED est faite par le serveur.
  const eligibleTransactions = (data?.transactions ?? []).filter(
    (t) => !t.dispute
  );

  const preselectedInList = eligibleTransactions.some((t) => t.id === preselectedId);

  // Si l'ID URL n'est pas dans la liste paginée, on le fetch individuellement
  const { data: singleTxData } = useQuery<{ transaction: Purchase } | null>({
    queryKey: ['transaction-for-dispute', preselectedId],
    enabled: !!preselectedId && !isLoading && !preselectedInList,
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${preselectedId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
  });

  // Fusionner la transaction individuelle si nécessaire
  const singleTx = singleTxData?.transaction ?? null;
  const displayTransactions =
    preselectedId && !preselectedInList && singleTx && !singleTx.dispute
      ? [singleTx, ...eligibleTransactions]
      : eligibleTransactions;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionId: preselectedId,
      description: '',
      files: [],
      attestation: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: values.transactionId,
          reason: values.reason,
          description: values.description,
          evidenceUrls: uploadedFiles.map((f) => f.cdnUrl),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Erreur lors de la création');
      }

      toast({
        title: 'Litige ouvert avec succès',
        description: 'Notre support vous contactera sous 2 heures.',
      });

      router.push(`/disputes/${json.data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (displayTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <AlertCircle className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Aucune transaction éligible</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Vous n'avez pas d'achats en cours de séquestre pour lesquels ouvrir un
            litige. Les litiges ne peuvent être ouverts que sur des transactions en
            séquestre (J-1 à J+2 de l'événement).
          </p>
          <Button variant="outline" asChild>
            <Link href="/my-purchases">Voir mes achats</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction concernée */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transaction concernée</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!preselectedId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre achat..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {displayTransactions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.ticket.event.title} —{' '}
                          {formatEventDate(t.ticket.event.eventDate ?? t.ticket.event.event_date)} —{' '}
                          {Number(t.amount ?? t.total_amount ?? 0).toFixed(2)} €
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Type de problème */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Type de problème *</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid sm:grid-cols-2 gap-3" role="radiogroup">
                      {DISPUTE_REASONS.map((reason) => {
                        const selected = field.value === reason.value;
                        return (
                          <button
                            key={reason.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => field.onChange(reason.value)}
                            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors w-full ${
                              selected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'hover:bg-muted/50 border-border'
                            }`}
                          >
                            <span
                              className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                selected ? 'border-primary' : 'border-muted-foreground/50'
                              }`}
                            >
                              {selected && (
                                <span className="h-2 w-2 rounded-full bg-primary block" />
                              )}
                            </span>
                            <Label className="cursor-pointer leading-tight pointer-events-none">
                              {reason.label}
                            </Label>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description détaillée *</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez précisément ce qui s'est passé, quand, comment... (minimum 50 caractères)"
                      className="min-h-[140px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-right">
                    {field.value?.length ?? 0} / 2000
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preuves */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preuves (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez photos, vidéos ou PDFs pour appuyer votre demande — max 10 fichiers, 5 MB chacun.
            </p>
            <MultiFileUpload
              value={uploadedFiles}
              onChange={setUploadedFiles}
              maxFiles={10}
              maxSizeMb={5}
              disabled={submitting}
            />
          </CardContent>
        </Card>

        {/* Attestation */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-5">
            <FormField
              control={form.control}
              name="attestation"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="font-medium leading-snug">
                      J'atteste que ces informations sont exactes et véridiques
                    </FormLabel>
                    <FormDescription className="mt-0.5">
                      Les fausses déclarations peuvent entraîner la suspension du compte
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Alerte séquestre */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important :</strong> L'ouverture d'un litige bloque automatiquement le
            séquestre. Le vendeur ne recevra pas son paiement tant que le litige est ouvert.
          </AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              'Soumettre le litige'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
