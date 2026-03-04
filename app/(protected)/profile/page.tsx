/**
 * Page Profil Utilisateur
 * Gestion du profil, sécurité et paramètres
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ProfileGeneralTab } from '@/components/buyer/profile/ProfileGeneralTab';
import { ProfileSecurityTab } from '@/components/buyer/profile/ProfileSecurityTab';
import { ProfileDangerZoneTab } from '@/components/buyer/profile/ProfileDangerZoneTab';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const json = await res.json();
      return json.data;
    },
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Impossible de charger votre profil.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground mt-2">Gérez vos informations personnelles et vos paramètres</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="danger">Zone de danger</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {isLoading ? <div>Chargement...</div> : profile && <ProfileGeneralTab profile={profile} />}
        </TabsContent>

        <TabsContent value="security">
          {isLoading ? <div>Chargement...</div> : profile && <ProfileSecurityTab profile={profile} />}
        </TabsContent>

        <TabsContent value="danger">
          {isLoading ? <div>Chargement...</div> : profile && <ProfileDangerZoneTab profile={profile} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
