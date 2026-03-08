import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-24 md:py-32 max-w-5xl">
        <div className="text-center">

          {/* Trust badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-clean-sm border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            <span>Revente 100% sécurisée et éthique</span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-6xl leading-tight">
            Achetez et vendez vos billets{' '}
            <span className="text-blue-600">au prix facial</span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            La marketplace éthique qui lutte contre la fraude. Chaque billet est vérifié,
            chaque transaction est sécurisée par séquestre bancaire.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/events" className="gap-2">
                Trouver des billets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/sell-ticket">
                Vendre mes billets
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            {[
              'Paiement sécurisé Stripe',
              'Vérification KYC vendeurs',
              'Garantie Sérénité incluse',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 pt-12 border-t border-gray-100 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10k+</div>
              <div className="text-sm text-gray-500 mt-1">Billets vendus</div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-500 mt-1">Note moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">0%</div>
              <div className="text-sm text-gray-500 mt-1">Fraude détectée</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
