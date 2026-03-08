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
import { Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Minimum 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: SignupFormData) {
    setIsLoading(true);
    const { error } = await signUp(values.email, values.password, values.name);
    setIsLoading(false);
    if (!error) router.push('/verify-email');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">

      {/* Brand */}
      <Link href="/" className="mb-8 text-2xl font-bold text-blue-600">
        Ava
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-clean shadow-clean p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h1>
          <p className="text-sm text-gray-500">
            Rejoignez AVA Billetterie et achetez ou vendez en toute sécurité
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Nom complet
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Jean Dupont" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Mot de passe
                  </FormLabel>
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </FormLabel>
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
              {isLoading ? 'Création…' : 'Créer mon compte'}
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

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700 no-underline">
            Se connecter
          </Link>
        </p>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-400">
        {['Inscription gratuite', 'Données sécurisées RGPD', 'Vérification par email'].map((item) => (
          <div key={item} className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Legal */}
      <p className="mt-4 text-center text-xs text-gray-400 max-w-sm">
        En créant un compte, vous acceptez nos{' '}
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
