/**
 * Example Server Component using tRPC
 * This shows how to use tRPC in a server component
 */

import { createCaller } from '@/lib/trpc/server';

export async function ServerEventList() {
  const caller = await createCaller();
  const { events } = await caller.event.getAll({ limit: 10 });

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">Aucun événement disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Événements à venir (SSR)</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold">{event.title}</h3>
            {event.artist && (
              <p className="text-sm text-gray-600">{event.artist}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">{event.venue}</p>
            <p className="text-xs text-gray-400">
              {new Date(event.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
