import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: {
    title: 'Produit',
    links: [
      { label: 'Acheter des billets', href: '/events' },
      { label: 'Vendre mes billets', href: '/sell-ticket' },
      { label: 'Comment ça marche', href: '/how-it-works' },
      { label: 'Tarifs', href: '/pricing' },
    ],
  },
  company: {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Garantie Sérénité', href: '/serenity-guarantee' },
    ],
  },
  legal: {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '/legal' },
      { label: 'Conditions générales', href: '/terms' },
      { label: 'Politique de confidentialité', href: '/privacy' },
      { label: 'Politique de cookies', href: '/cookies' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: "Centre d'aide", href: '/help' },
      { label: 'Litiges', href: '/disputes' },
    ],
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">

        {/* Main */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-blue-600">Ava</span>
            </Link>
            <p className="mb-6 text-sm text-gray-500 leading-relaxed">
              La plateforme de revente de billets 100% sécurisée et éthique.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-clean-sm border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-clean-sm border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-gray-100" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-400">
            © {currentYear} Ava Billetterie. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { label: 'Mentions légales', href: '/legal' },
              { label: 'CGU', href: '/terms' },
              { label: 'Confidentialité', href: '/privacy' },
              { label: 'Cookies', href: '/cookies' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-gray-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
