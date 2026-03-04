/**
 * Onglet Zone de danger du profil (export données, suppression compte)
 */

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
};

export function ProfileDangerZoneTab({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmations, setConfirmations] = useState({
    understand: false,
    irreversible: false,
    dataDeleted: false,
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/export-data');
      if (!res.ok) throw new Error('Failed to export data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-donnees-${profile.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ title: 'Export réussi', description: 'Vos données ont été téléchargées' });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (data: { password: string; confirmations: string[] }) => {
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé et vos données ont été anonymisées.',
      });
      router.push('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast({
        title: 'Mot de passe requis',
        description: 'Veuillez entrer votre mot de passe',
        variant: 'destructive',
      });
      return;
    }

    const allConfirmed = Object.values(confirmations).every((c) => c);
    if (!allConfirmed) {
      toast({
        title: 'Confirmations requises',
        description: 'Veuillez cocher toutes les cases de confirmation',
        variant: 'destructive',
      });
      return;
    }

    deleteAccountMutation.mutate({
      password: deletePassword,
      confirmations: Object.keys(confirmations).filter((key) => confirmations[key as keyof typeof confirmations]),
    });
  };

  return (
    <div className="space-y-6">
      {/* Export des données (RGPD) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter mes données
          </CardTitle>
          <CardDescription>
            Téléchargez une copie de toutes vos données personnelles (conforme RGPD)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Vous recevrez un fichier JSON contenant toutes vos informations : profil, achats, avis, notifications,
            etc.
          </p>
          <Button onClick={() => exportDataMutation.mutate()} disabled={exportDataMutation.isPending}>
            {exportDataMutation.isPending ? 'Export en cours...' : 'Télécharger mes données'}
          </Button>
        </CardContent>
      </Card>

      {/* Suppression du compte */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>Actions irréversibles sur votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La suppression de votre compte est définitive et irréversible. Toutes vos données seront anonymisées et
              vous ne pourrez plus accéder à votre compte.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est définitive et ne peut pas être annulée. Votre compte sera définitivement supprimé
                  et vos données personnelles seront anonymisées.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deletePassword">Mot de passe *</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    placeholder="Entrez votre mot de passe pour confirmer"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="understand"
                      checked={confirmations.understand}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, understand: checked as boolean })
                      }
                    />
                    <label htmlFor="understand" className="text-sm cursor-pointer">
                      Je comprends que cette action est irréversible
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="irreversible"
                      checked={confirmations.irreversible}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, irreversible: checked as boolean })
                      }
                    />
                    <label htmlFor="irreversible" className="text-sm cursor-pointer">
                      J'ai conscience que je ne pourrai plus récupérer mon compte
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dataDeleted"
                      checked={confirmations.dataDeleted}
                      onCheckedChange={(checked) =>
                        setConfirmations({ ...confirmations, dataDeleted: checked as boolean })
                      }
                    />
                    <label htmlFor="dataDeleted" className="text-sm cursor-pointer">
                      J'accepte que mes données soient définitivement anonymisées
                    </label>
                  </div>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? 'Suppression...' : 'Supprimer définitivement'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
