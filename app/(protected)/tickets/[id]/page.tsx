import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  MapPin, 
  Calendar, 
  Euro,
  Home,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Page de détail d'un billet créé
 * Affiche le statut de validation et les informations du billet
 */
export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  // 1. Vérifier l'authentification
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. Récupérer l'utilisateur depuis la DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    redirect('/login');
  }

  // 3. Récupérer le billet avec l'événement
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      seller: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  // 4. Vérifier que l'utilisateur est le propriétaire du billet
  if (ticket.sellerId !== dbUser.id) {
    redirect('/dashboard');
  }

  // 5. Déterminer le statut de validation
  const getStatusBadge = () => {
    switch (ticket.verificationStatus) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          En attente de validation
        </Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Validé
        </Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          ❌ Rejeté
        </Badge>;
      default:
        return null;
    }
  };

  const getTicketStatusBadge = () => {
    switch (ticket.status) {
      case 'PENDING_VALIDATION':
        return <Badge variant="outline">En validation</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Actif</Badge>;
      case 'SOLD':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Vendu</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Annulé</Badge>;
      default:
        return <Badge variant="outline">{ticket.status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* En-tête avec navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Détails du billet</h1>
          <p className="text-muted-foreground mt-1">Référence: {ticket.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/seller">
              <Home className="w-4 h-4 mr-2" />
              Tableau de bord
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerte de succès ou de statut */}
      {ticket.verificationStatus === 'PENDING' && (
        <Alert className="mb-6 border-blue-300 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Billet créé avec succès !</AlertTitle>
          <AlertDescription className="text-blue-700">
            Votre billet est en cours de validation par notre équipe. 
            Vous recevrez une notification par email dès que la validation sera terminée.
            <strong className="block mt-2">Temps moyen de validation : 2-4 heures</strong>
          </AlertDescription>
        </Alert>
      )}

      {ticket.verificationStatus === 'APPROVED' && (
        <Alert className="mb-6 border-green-300 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Billet validé !</AlertTitle>
          <AlertDescription className="text-green-700">
            Votre billet a été approuvé et est maintenant visible sur la plateforme.
          </AlertDescription>
        </Alert>
      )}

      {ticket.verificationStatus === 'REJECTED' && ticket.rejectionReason && (
        <Alert className="mb-6 border-red-300 bg-red-50">
          <AlertTitle className="text-red-800">Billet rejeté</AlertTitle>
          <AlertDescription className="text-red-700">
            <strong>Raison :</strong> {ticket.rejectionReason}
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tickets/new">Créer un nouveau billet</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Statut du billet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Statut du billet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Statut de validation</p>
              {getStatusBadge()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Statut du billet</p>
              {getTicketStatusBadge()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Créé le</p>
              <p className="font-medium">
                {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'événement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Événement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nom</p>
              <p className="font-medium">{ticket.event.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date</p>
              <p className="font-medium">
                {new Date(ticket.event.eventDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lieu</p>
              <p className="font-medium flex items-start gap-1">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>
                  {ticket.event.venue}
                  {ticket.event.city && `, ${ticket.event.city}`}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Détails du billet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails du billet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Catégorie / Section</p>
              <p className="font-medium">{ticket.section || 'Non spécifié'}</p>
            </div>
            {ticket.row && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rangée</p>
                <p className="font-medium">{ticket.row}</p>
              </div>
            )}
            {ticket.seatNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Siège</p>
                <p className="font-medium">{ticket.seatNumber}</p>
              </div>
            )}
            {ticket.barcodeNumber && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Code-barres</p>
                <p className="font-mono text-sm">{ticket.barcodeNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Tarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticket.originalPrice && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prix facial</p>
                <p className="font-medium">{Number(ticket.originalPrice).toFixed(2)} €</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Prix de vente</p>
              <p className="text-2xl font-bold text-primary">{Number(ticket.price).toFixed(2)} €</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF */}
      {ticket.pdfUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Document PDF</CardTitle>
            <CardDescription>
              Le fichier PDF du billet que vous avez uploadé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Billet PDF</p>
                  <p className="text-sm text-muted-foreground">
                    Uploadé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href={ticket.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/tickets/new">Créer un autre billet</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/seller">Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  );
}
