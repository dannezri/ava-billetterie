/**
 * Ticket Card Component
 * Displays ticket information for marketplace
 * Shows: price, category, seller (pseudo + trust score), verification badge
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ShoppingCart, 
  MapPin, 
  Shield, 
  CheckCircle2,
  Star,
  User
} from 'lucide-react';

export interface TicketCardProps {
  id: string;
  price: number;
  originalPrice?: number;
  section?: string;
  row?: string;
  seatNumber?: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  seller: {
    id: string;
    name?: string;
    email: string;
    trustScore: number;
  };
  eventTitle?: string;
  eventDate?: Date;
  eventVenue?: string;
  onBuy?: () => void;
  className?: string;
}

export function TicketCard({
  id,
  price,
  originalPrice,
  section,
  row,
  seatNumber,
  verificationStatus,
  seller,
  onBuy,
  className = '',
}: TicketCardProps) {
  const isVerified = verificationStatus === 'APPROVED';
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  // Get seller display name
  const sellerName = seller.name || seller.email.split('@')[0];
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  
  // Trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Category badge (section/row/seat)
  const categoryLabel = section || 'Placement général';
  const seatInfo = [row, seatNumber].filter(Boolean).join(' - ');

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${className}`}>
      <CardContent className="p-6">
        {/* Verification Badge */}
        {isVerified && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Vérifié
            </Badge>
          </div>
        )}

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              {price.toFixed(2)}€
            </span>
            {originalPrice && originalPrice > price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice.toFixed(2)}€
                </span>
                <Badge variant="destructive" className="ml-1">
                  -{discount}%
                </Badge>
              </>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Prix tout compris
          </p>
        </div>

        {/* Category/Seat Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{categoryLabel}</span>
          </div>
          {seatInfo && (
            <p className="ml-6 text-sm text-muted-foreground">
              {seatInfo}
            </p>
          )}
        </div>

        {/* Seller Info */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Vendeur
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {sellerInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{sellerName}</p>
                <div className="flex items-center gap-1">
                  <Star className={`h-3 w-3 ${getTrustScoreColor(seller.trustScore)}`} />
                  <span className={`text-xs font-semibold ${getTrustScoreColor(seller.trustScore)}`}>
                    {seller.trustScore}/100
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Trust Score
                  </span>
                </div>
              </div>
            </div>
            {isVerified && (
              <Shield className="h-5 w-5 text-green-600" />
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Paiement sécurisé avec séquestre</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span>Protection acheteur garantie</span>
          </div>
          {isVerified && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span>Billet vérifié par l'équipe AVA</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 p-4">
        <Button 
          className="w-full" 
          size="lg"
          onClick={onBuy}
          disabled={!isVerified}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          {isVerified ? 'Acheter ce billet' : 'En attente de vérification'}
        </Button>
      </CardFooter>
    </Card>
  );
}
