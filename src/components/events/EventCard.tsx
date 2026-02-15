/**
 * Event Card Component
 * Displays event information with image, date, location, and ticket availability
 */

'use client';

import { Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  date: Date;
  location: string;
  country?: string;
  availableTickets: number;
  minPrice?: number;
  maxPrice?: number;
}

export function EventCard({
  id,
  title,
  description,
  category,
  imageUrl,
  date,
  location,
  country,
  availableTickets,
  minPrice,
  maxPrice,
}: EventCardProps) {
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const priceRange =
    minPrice && maxPrice
      ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
      : minPrice
        ? `À partir de ${formatPrice(minPrice)}`
        : null;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group">
      <Link href={`/events/${id}`}>
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={imageUrl.includes('unsplash')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Ticket className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <Badge className="absolute top-3 left-3" variant="secondary">
              {category}
            </Badge>
          )}

          {/* Availability Badge */}
          <Badge
            className="absolute top-3 right-3"
            variant={availableTickets > 10 ? 'default' : availableTickets > 0 ? 'outline' : 'destructive'}
          >
            {availableTickets > 0 ? `${availableTickets} billets` : 'Complet'}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}

          {/* Date */}
          <div className="mb-2 flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {location}
              {country && `, ${country}`}
            </span>
          </div>

          {/* Price Range */}
          {priceRange && (
            <div className="mt-3 text-sm font-semibold text-primary">
              {priceRange}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full group" variant="default">
            Voir les billets
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
