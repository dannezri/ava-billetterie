import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { EventForm } from '@/components/admin/events/EventForm';

export const metadata = {
  title: 'Créer un événement — Admin AVA',
};

export default function CreateEventPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/events" className="hover:text-gray-900">
          Événements
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Créer</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Créer un événement</h1>
        <p className="text-sm text-gray-500 mt-1">
          L&apos;événement sera vérifié et visible dans le catalogue après validation.
        </p>
      </div>

      {/* Formulaire */}
      <EventForm mode="create" />
    </div>
  );
}
