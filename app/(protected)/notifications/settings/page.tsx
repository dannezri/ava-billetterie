/**
 * Page Paramètres Notifications
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationSettingsForm } from '@/components/notifications/NotificationSettingsForm';
import { prisma } from '@/lib/db/prisma';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Paramètres notifications — AVA',
};

export default async function NotificationSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let prefs = await prisma.notificationPreferences.findUnique({
    where: { userId: user.id },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreferences.create({
      data: { userId: user.id },
    });
  }

  const initialPrefs = {
    emailTransactions: prefs.emailTransactions,
    emailDisputes: prefs.emailDisputes,
    emailPriceAlerts: prefs.emailPriceAlerts,
    emailSystem: prefs.emailSystem,
    pushEnabled: prefs.pushEnabled,
    pushSound: prefs.pushSound,
    dailyDigest: prefs.dailyDigest,
    digestTime: prefs.digestTime,
    priceAlertFrequency: prefs.priceAlertFrequency,
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/notifications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux notifications
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Paramètres de notifications</h1>
        </div>
        <p className="text-muted-foreground mt-1.5">
          Personnalisez la façon dont vous souhaitez être notifié.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <NotificationSettingsForm initialPrefs={initialPrefs} />
      </div>
    </div>
  );
}
