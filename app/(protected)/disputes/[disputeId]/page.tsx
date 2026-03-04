/**
 * Page Détail d'un Litige
 * Timeline des échanges, preuves, et suivi du statut
 */

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { DisputeDetail } from '@/components/disputes/DisputeDetail';

export const metadata: Metadata = {
  title: 'Détail du litige | Ava',
};

interface PageProps {
  params: { disputeId: string };
}

export default async function DisputeDetailPage({ params }: PageProps) {
  // Récupérer l'ID utilisateur pour identifier les messages "vous"
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <DisputeDetail
        disputeId={params.disputeId}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
