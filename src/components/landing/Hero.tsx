import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-20 blur-3xl dark:from-blue-950 dark:to-purple-950" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
            <span>Revente 100% sécurisée et éthique</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-6xl lg:text-7xl">
            Revendez vos billets{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              en toute sécurité
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-lg text-zinc-600 dark:text-zinc-400 md:text-xl lg:text-2xl">
            Pas d'arnaques, pas de surtarification. Ava protège chaque transaction avec un système de séquestre intelligent.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group h-12 gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              asChild
            >
              <Link href="/tickets">
                Voir les billets
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-2 px-8 text-base font-semibold"
              asChild
            >
              <Link href="/sell">Vendre mes billets</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                10,000+
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Billets vendus
              </div>
            </div>
            <div className="hidden h-12 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                4.9/5
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Note moyenne
              </div>
            </div>
            <div className="hidden h-12 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                0%
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Fraude détectée
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
