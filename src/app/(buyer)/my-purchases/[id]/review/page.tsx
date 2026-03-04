/**
 * Page Laisser un avis
 * Formulaire pour évaluer un vendeur après une transaction
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LeaveReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  // Récupérer les infos de la transaction pour afficher le vendeur
  const { data: transaction } = useQuery({
    queryKey: ['transaction', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch transaction');
      const json = await res.json();
      return json.data;
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: params.id,
          reviewedUserId: transaction.seller.id,
          rating: data.rating,
          comment: data.comment,
        }),
      });
      if (!res.ok) throw new Error('Failed to create review');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Avis envoyé !',
        description: 'Votre avis a été soumis et sera modéré avant publication.',
      });
      router.push(`/my-purchases/${params.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: 'Note requise',
        description: 'Veuillez sélectionner une note entre 1 et 5 étoiles.',
        variant: 'destructive',
      });
      return;
    }
    createReviewMutation.mutate({ rating, comment: comment.trim() || undefined });
  };

  if (!transaction) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Laisser un avis</h1>
          <p className="text-muted-foreground">Partagez votre expérience avec {transaction.seller.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évaluez votre achat</CardTitle>
          <CardDescription>
            Votre avis sera vérifié par notre équipe avant d'être publié sur le profil du vendeur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note */}
            <div className="space-y-2">
              <Label>Note *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 0 && 'Sélectionnez une note'}
                {rating === 1 && 'Très insatisfait'}
                {rating === 2 && 'Insatisfait'}
                {rating === 3 && 'Correct'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Très satisfait'}
              </p>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience avec ce vendeur..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={5}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500 caractères</p>
            </div>

            {/* Info modération */}
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Tous les avis sont modérés pour garantir leur authenticité. Votre avis sera publié sous 48h après
                vérification.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={createReviewMutation.isPending || rating === 0} className="flex-1">
                {createReviewMutation.isPending ? 'Envoi...' : 'Envoyer mon avis'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
