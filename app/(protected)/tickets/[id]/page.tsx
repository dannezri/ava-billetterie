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
  Eye,
  Tag,
  ShoppingBag,
  Banknote,
  Circle,
} from 'lucide-react';
import Link from 'next/link';
import { DevPayoutButton } from './DevPayoutButton';

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Page de détail d'un billet créé
 * Affiche le statut de validation et les informations du billet
 */
// ---------------------------------------------------------------------------
// Timeline helpers
// ---------------------------------------------------------------------------

type TimelineStep = {
  label: string;
  description: string;
  date: Date | null;
  status: 'done' | 'active' | 'pending';
  icon: React.ReactNode;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TicketTimeline({
  ticket,
}: {
  ticket: {
    createdAt: Date;
    updatedAt: Date;
    status: string;
    verificationStatus: string;
    transaction: {
      createdAt: Date;
      releasedAt: Date | null;
      status: string;
      autoPayoutStatus: string | null;
      autoPayoutDate: Date | null;
    } | null;
  };
}) {
  const isApproved =
    ticket.verificationStatus === 'APPROVED' ||
    ticket.status === 'ACTIVE' ||
    ticket.status === 'SOLD';

  const isSold = ticket.status === 'SOLD';

  const autoPayoutStatus = ticket.transaction?.autoPayoutStatus ?? null;
  const isPaid = autoPayoutStatus === 'COMPLETED';
  const isPayoutProcessing = autoPayoutStatus === 'PROCESSING';
  const isPayoutFailed = autoPayoutStatus === 'FAILED' || autoPayoutStatus === 'MANUAL_REVIEW';
  const payoutDate = isPaid ? (ticket.transaction?.autoPayoutDate ?? null) : null;

  const getPayoutDescription = () => {
    if (isPaid) return 'Les fonds ont été virés sur votre compte.';
    if (isPayoutProcessing) return 'Le virement est en cours de traitement par Stripe.';
    if (isPayoutFailed) return 'Un problème est survenu. Contactez le support.';
    if (isSold) return 'Le virement sera déclenché automatiquement sous 48h.';
    return 'Le virement sera effectué après confirmation de réception.';
  };

  const getPayoutStepStatus = (): 'done' | 'active' | 'pending' => {
    if (isPaid) return 'done';
    if (isPayoutProcessing || isPayoutFailed) return 'active';
    return 'pending';
  };

  const steps: TimelineStep[] = [
    {
      label: 'Mise en vente',
      description: 'Votre billet a été soumis à la validation.',
      date: ticket.createdAt,
      status: 'done',
      icon: <Tag className="w-4 h-4" />,
    },
    {
      label: 'Publié',
      description: isApproved
        ? 'Votre billet est visible sur la plateforme.'
        : 'En attente de validation par notre équipe.',
      date: isApproved ? ticket.updatedAt : null,
      status: isApproved ? 'done' : 'active',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      label: 'Vendu',
      description: isSold
        ? 'Un acheteur a acheté votre billet.'
        : "En attente d'un acheteur.",
      date: isSold ? (ticket.transaction?.createdAt ?? null) : null,
      status: isSold ? 'done' : 'pending',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      label: 'Virement effectué',
      description: getPayoutDescription(),
      date: payoutDate,
      status: getPayoutStepStatus(),
      icon: <Banknote className="w-4 h-4" />,
    },
  ];

  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className={`relative flex gap-4 ${!isLast ? 'pb-8' : ''}`}>
            {/* Ligne verticale */}
            {!isLast && (
              <span
                className={`absolute left-[17px] top-8 w-0.5 h-full ${
                  step.status === 'done' ? 'bg-primary' : 'bg-border'
                }`}
                aria-hidden
              />
            )}

            {/* Icône */}
            <span
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                step.status === 'done'
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step.status === 'active'
                  ? 'bg-background border-primary text-primary'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              {step.status === 'pending' ? (
                <Circle className="w-4 h-4" />
              ) : (
                step.icon
              )}
            </span>

            {/* Contenu */}
            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`font-semibold text-sm ${
                    step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {step.label}
                </p>
                {step.date && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDate(step.date)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------

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
      transaction: {
        select: {
          id: true,
          createdAt: true,
          releasedAt: true,
          status: true,
          autoPayoutStatus: true,
          autoPayoutDate: true,
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
                <Link href="/sell-ticket">Créer un nouveau billet</Link>
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

      {/* Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Suivi du billet
          </CardTitle>
          <CardDescription>
            Retrouvez chaque étape de la vie de votre billet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketTimeline ticket={ticket} />

          {/* Bouton dev-only pour déclencher le virement manuellement */}
          {process.env.NODE_ENV !== 'production' && ticket.transaction && (
            <DevPayoutButton
              transactionId={ticket.transaction.id}
              autoPayoutStatus={ticket.transaction.autoPayoutStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/sell-ticket">Créer un autre billet</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/seller">Retour au tableau de bord</Link>
        </Button>
      </div>
    </div>
  );
}
