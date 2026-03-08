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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormData) {
    setIsLoading(true);
    const { error } = await signIn(values.email, values.password);
    setIsLoading(false);
    if (!error) router.push(redirect);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold text-blue-600">
        Ava
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-clean shadow-clean p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-sm text-gray-500">
            Connectez-vous à votre compte AVA Billetterie
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1.5">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Mot de passe
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700 no-underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400">OU</span>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 no-underline">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Trust indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Connexion sécurisée — vos données sont protégées</span>
      </div>

      {/* Legal */}
      <p className="mt-4 text-center text-xs text-gray-400 max-w-sm">
        En vous connectant, vous acceptez nos{' '}
        <Link href="/terms" className="underline hover:text-gray-600">
          Conditions d&apos;utilisation
        </Link>{' '}
        et notre{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-clean shadow-clean p-8 space-y-4">
            <Skeleton className="h-8 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
