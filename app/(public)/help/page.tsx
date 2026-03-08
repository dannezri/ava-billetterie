/**
 * Centre d'Aide — AVA Billetterie
 * FAQ complète et ressources d'aide catégorisées
 */

import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Ticket,
  Shield,
  CreditCard,
  UserCheck,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export const metadata: Metadata = {
  title: 'Centre d\'Aide — AVA Billetterie',
  description:
    'Trouvez des réponses à vos questions sur AVA Billetterie : achat de billets, vente, séquestre, KYC, Garantie Sérénité, remboursements et plus encore.',
  openGraph: {
    title: 'Centre d\'Aide — AVA Billetterie',
    description:
      'Toutes les réponses à vos questions sur l\'achat et la vente de billets sur AVA.',
  },
};

const categories = [
  {
    icon: ShoppingCart,
    title: 'Acheter un billet',
    description: 'Recherche, paiement, réception du billet',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    count: 12,
  },
  {
    icon: Ticket,
    title: 'Vendre un billet',
    description: 'Mise en vente, vérification, paiement',
    color: 'from-blue-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    count: 10,
  },
  {
    icon: Shield,
    title: 'Garantie Sérénité',
    description: 'Billet refusé, remboursement, litige',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    count: 8,
  },
  {
    icon: CreditCard,
    title: 'Paiements & Séquestre',
    description: 'Frais, virements, remboursements',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    count: 9,
  },
  {
    icon: UserCheck,
    title: 'Vérification KYC',
    description: 'Identité, documents, Stripe Identity',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    count: 6,
  },
  {
    icon: HelpCircle,
    title: 'Mon compte',
    description: 'Profil, paramètres, sécurité',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    count: 7,
  },
];

const buyerFAQ = [
  {
    question: 'Comment rechercher un billet pour un événement ?',
    answer:
      'Rendez-vous sur la page Événements et utilisez la barre de recherche. Vous pouvez filtrer par artiste, lieu, date et prix. Tous les billets affichés sont vérifiés et vendus par des utilisateurs KYC-validés.',
  },
  {
    question: 'Comment est-ce que je reçois mon billet ?',
    answer:
      'Après confirmation de votre paiement, vous recevez un email avec un lien sécurisé pour télécharger votre billet PDF. Ce lien est valable 1h (pour votre sécurité). Vous pouvez le régénérer depuis votre espace "Mes achats" à tout moment.',
  },
  {
    question: 'Puis-je acheter plusieurs billets pour le même événement ?',
    answer:
      'Oui, vous pouvez acheter autant de billets que disponibles. Chaque billet est une transaction séparée avec son propre séquestre. Si vous achetez auprès de plusieurs vendeurs, chaque vendeur reçoit son argent indépendamment.',
  },
  {
    question: 'Mon paiement est sécurisé comment ?',
    answer:
      'Votre paiement est traité par Stripe (le même système utilisé par Amazon, Airbnb, etc.). L\'argent est immédiatement placé en séquestre — ni vous ni le vendeur ne pouvez y accéder. Il est libéré 2 jours après l\'événement si tout s\'est bien passé.',
  },
];

const sellerFAQ = [
  {
    question: 'Comment mettre mon billet en vente ?',
    answer:
      'Créez un compte, complétez la vérification KYC (pièce d\'identité + selfie via Stripe Identity, ~2 min), puis cliquez sur "Vendre un billet". Uploadez le PDF, notre système détecte les informations automatiquement. Notre équipe valide sous 24h.',
  },
  {
    question: 'À quel prix puis-je vendre mon billet ?',
    answer:
      'Vous pouvez vendre à n\'importe quel prix en dessous ou égal au prix facial d\'origine (imprimé sur le billet). Notre système vérifie automatiquement le prix facial lors de l\'upload. Toute tentative de surtarification est rejetée.',
  },
  {
    question: 'Quand est-ce que je reçois mon argent ?',
    answer:
      'Deux jours ouvrés après la date de l\'événement (J+2), si aucun litige n\'a été ouvert. L\'argent est viré sur votre compte bancaire enregistré. Il n\'y a aucun frais de retrait pour les vendeurs.',
  },
  {
    question: 'Que se passe-t-il si mon billet ne se vend pas ?',
    answer:
      'Rien ! Vous pouvez annuler votre annonce à tout moment tant que le billet n\'est pas vendu. Si personne ne l\'achète avant l\'événement, l\'annonce est automatiquement retirée. Pas de frais, pas de pénalité.',
  },
];

const guaranteeFAQ = [
  {
    question: 'Que faire si mon billet est refusé à l\'entrée ?',
    answer:
      'Activez le bouton "SOS Concert" dans l\'app AVA (visible pendant les 4h autour de l\'événement). Prenez une photo du refus ou contactez notre hotline dédiée. Vous serez remboursé du montant total + 50€ en moins de 10 minutes.',
  },
  {
    question: 'Jusqu\'à quand puis-je signaler un problème ?',
    answer:
      'Vous pouvez ouvrir un litige jusqu\'à 48h après la date de l\'événement. Au-delà, le séquestre est automatiquement libéré en faveur du vendeur.',
  },
  {
    question: 'Faut-il avoir été physiquement à l\'entrée pour activer la garantie ?',
    answer:
      'Oui. La Garantie Sérénité s\'active uniquement si vous étiez présent à l\'événement et que votre billet a été refusé. Elle ne couvre pas les situations où vous n\'avez pas pu vous rendre au concert (transport, maladie, etc.).',
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-20 py-16">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            Comment pouvons-nous{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              vous aider ?
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe
          </p>

          {/* Search (visuel only - pas de fonctionnalité server-side requise) */}
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Rechercher dans l'aide... (ex: remboursement, KYC, séquestre)"
              className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
              readOnly
            />
            <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Parcourir par catégorie
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {categories.map((cat, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer hover:shadow-lg transition-all group border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${cat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <cat.icon
                    className={`h-6 w-6 bg-gradient-to-br ${cat.color} bg-clip-text text-transparent`}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {cat.description}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {cat.count} articles
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 flex-shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Questions fréquentes acheteurs */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pour les acheteurs
              </h2>
            </div>
            <FAQAccordion items={buyerFAQ} />
          </div>
        </div>
      </section>

      {/* Questions fréquentes vendeurs */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pour les vendeurs
            </h2>
          </div>
          <FAQAccordion items={sellerFAQ} />
        </div>
      </section>

      {/* Questions Garantie */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Garantie Sérénité
              </h2>
            </div>
            <FAQAccordion items={guaranteeFAQ} />
            <div className="mt-6">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/serenity-guarantee">
                  En savoir plus sur la Garantie Sérénité
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contacter le support */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Notre équipe répond en moins de 2h, même le week-end
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 text-center hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Pour toute question générale. Réponse sous 2h en semaine,
                sous 4h le week-end.
              </p>
              <Button className="rounded-full w-full" asChild>
                <Link href="/contact">
                  Envoyer un message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all group border-2 border-primary/20">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hotline Concert 🚨
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Problème le jour J ? Hotline dédiée disponible
                18h–2h les jours de concerts. Réponse immédiate.
              </p>
              <Button variant="outline" className="rounded-full w-full border-2">
                <a href="tel:+33100000000">Appeler le support</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
