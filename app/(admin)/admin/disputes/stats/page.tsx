import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';
import { DisputeStatsPage } from '@/components/admin/disputes/DisputeStatsPage';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export const metadata = {
  title: 'Statistiques Litiges — Admin',
};

export default async function DisputeStatsPageRoute() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/admin');
  }

  return <DisputeStatsPage />;
}
