/**
 * Email Verification Page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/browser-client';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const resendEmail = async () => {
    setIsResending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error('Utilisateur non trouvé');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Email renvoyé !',
        description: 'Vérifiez votre boîte mail.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container flex min-h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Vérifiez votre email
          </CardTitle>
          <CardDescription>
            Nous avons envoyé un lien de vérification à votre adresse email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Cliquez sur le lien dans l&apos;email pour confirmer votre compte.
              Si vous ne voyez pas l&apos;email, vérifiez votre dossier spam.
            </AlertDescription>
          </Alert>

          {emailSent && (
            <Alert>
              <AlertDescription>
                ✉️ Email renvoyé avec succès ! Vérifiez votre boîte mail.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Vous n&apos;avez pas reçu l&apos;email ?
            </p>
            <Button
              onClick={resendEmail}
              disabled={isResending || emailSent}
              variant="outline"
              className="w-full"
            >
              {isResending ? 'Envoi...' : 'Renvoyer l\'email'}
            </Button>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/"
        className="mt-4 text-sm text-muted-foreground hover:text-primary"
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  );
}
