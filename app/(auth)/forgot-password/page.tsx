'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormData) {
    setIsLoading(true);
    const { error } = await resetPassword(values.email);
    setIsLoading(false);
    if (!error) setEmailSent(true);
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Link href="/" className="mb-8 text-2xl font-bold text-blue-600">Ava</Link>
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-clean shadow-clean p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-clean bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
          <p className="text-sm text-gray-500 mb-6">
            Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser
            votre mot de passe dans quelques minutes.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-clean p-4 mb-6 text-left">
            <p className="text-sm text-blue-700">
              Vérifiez votre boîte mail et vos spams. Le lien est valable 1 heure.
            </p>
          </div>
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <Link href="/" className="mb-8 text-2xl font-bold text-blue-600">Ava</Link>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-clean shadow-clean p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-clean bg-blue-50">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Adresse email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="vous@exemple.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" fullWidth loading={isLoading}>
              {isLoading ? 'Envoi…' : 'Envoyer le lien'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
