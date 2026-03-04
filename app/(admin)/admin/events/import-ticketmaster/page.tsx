import Link from 'next/link';
import { Suspense } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TicketmasterImportInterface } from '@/components/admin/events/TicketmasterImportInterface';

export const metadata = {
  title: 'Import Ticketmaster — Admin AVA',
  description: 'Importer automatiquement les événements musicaux depuis Ticketmaster',
};

export default function TicketmasterImportPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/events" className="hover:text-gray-900 transition-colors">
          Événements
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Import Ticketmaster</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Événements Ticketmaster</h1>
        <p className="text-sm text-gray-500 mt-1">
          Importez automatiquement les prochains concerts musicaux en France avec détection des doublons
        </p>
      </div>

      {/* Info box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-medium text-blue-900">Comment fonctionne l&apos;import ?</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Récupère les 50 plus grands concerts musicaux en France sur 18 mois, classés par prestige de salle</li>
              <li>Détection automatique des doublons (même artiste + date + ville)</li>
              <li>
                <strong>Vert — Nouveau</strong> : à importer · <strong>Orange — Doublon ?</strong> : vérifier ·{' '}
                <strong>Gris — Existe déjà</strong> : ignoré
              </li>
              <li>Images artistes récupérées automatiquement via Spotify/Last.fm</li>
              <li>Tous les événements importés sont marqués « vérifiés »</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Limitation notice */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium text-amber-900">Périmètre de l&apos;API Ticketmaster</p>
            <p className="mt-1">
              L&apos;API Discovery Ticketmaster couvre les <strong>tournées internationales</strong> (artistes étrangers jouant en France).
              Les concerts d&apos;artistes français vendus via <strong>France Billet</strong> (ex. Aya Nakamura, OrelSan, Indochine...)
              ne sont pas exposés par cette API — ils utilisent un système régional distinct.
              Pour ces événements, utilisez la création manuelle via{' '}
              <a href="/admin/events/create" className="underline font-medium">Créer un événement</a>.
            </p>
          </div>
        </div>
      </Card>

      {/* Interface d'import */}
      <Suspense
        fallback={
          <Card className="p-12 text-center">
            <p className="text-gray-500">Chargement de l&apos;interface d&apos;import…</p>
          </Card>
        }
      >
        <TicketmasterImportInterface />
      </Suspense>
    </div>
  );
}
