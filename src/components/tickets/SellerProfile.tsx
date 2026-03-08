/**
 * SellerProfile Component
 * Profil vendeur étendu avec trust score et avis
 */

import { User, Star, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ISellerProfileProps {
  seller: {
    id: string;
    name: string | null;
    trustScore: number;
    totalSales: number;
    memberSince: Date;
    avgRating: number;
    reviews: Array<{
      rating: number;
      comment: string | null;
      createdAt: Date;
      reviewer: {
        name: string | null;
      };
    }>;
  };
}

export function SellerProfile({ seller }: ISellerProfileProps) {
  const sellerInitials = seller.name
    ? seller.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AN';

  // Label trust score
  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Très bon', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Bon', color: 'text-yellow-600' };
    return { label: 'Moyen', color: 'text-orange-600' };
  };

  const trustLabel = getTrustScoreLabel(seller.trustScore);

  const memberSince = new Date(seller.memberSince).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profil du vendeur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header vendeur */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-100 text-xl text-blue-700">
              {sellerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {seller.name || 'Vendeur anonyme'}
              </h3>
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Membre depuis {memberSince}</p>
          </div>
        </div>

        <Separator />

        {/* Trust Score */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Score de confiance</h4>
            <span className={cn('text-sm font-semibold', trustLabel.color)}>
              {trustLabel.label}
            </span>
          </div>

          {/* Gauge circulaire simplifiée */}
          <div className="relative mb-2 h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                'h-full transition-all duration-500',
                seller.trustScore >= 80 && 'bg-green-600',
                seller.trustScore >= 60 && seller.trustScore < 80 && 'bg-blue-600',
                seller.trustScore >= 40 && seller.trustScore < 60 && 'bg-yellow-600',
                seller.trustScore < 40 && 'bg-orange-600'
              )}
              style={{ width: `${seller.trustScore}%` }}
            />
          </div>
          <p className="text-center text-2xl font-bold text-gray-900">
            {seller.trustScore}/100
          </p>
        </div>

        <Separator />

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="mb-1 text-2xl font-bold text-blue-600">{seller.totalSales}</p>
            <p className="text-xs text-blue-700">
              Vente{seller.totalSales > 1 ? 's' : ''} réussie{seller.totalSales > 1 ? 's' : ''}
            </p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 text-center">
            <p className="mb-1 flex items-center justify-center text-2xl font-bold text-yellow-600">
              <Star className="mr-1 h-5 w-5 fill-current" />
              {seller.avgRating > 0 ? seller.avgRating.toFixed(1) : 'N/A'}
            </p>
            <p className="text-xs text-yellow-700">Note moyenne</p>
          </div>
        </div>

        {/* Avis récents */}
        {seller.reviews.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-700">Avis récents</h4>
              <div className="space-y-3">
                {seller.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-700">{review.comment}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      par {review.reviewer.name || 'Anonyme'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
