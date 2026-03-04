import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { DisputeDetailClient } from '@/components/admin/disputes/DisputeDetailClient';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

interface PageProps {
  params: { disputeId: string };
}

export async function generateMetadata({ params }: PageProps) {
  return { title: `Litige #${params.disputeId.slice(0, 8).toUpperCase()} — Admin` };
}

export default async function DisputeAdminDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/admin');
  }

  return (
    <DisputeDetailClient
      disputeId={params.disputeId}
      adminEmail={user.email ?? ''}
    />
  );
}
