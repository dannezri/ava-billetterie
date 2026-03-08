/**
 * Footer Component
 * Site-wide footer with links and information
 */

import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Mail, Ticket, Twitter } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  product: [
    { label: 'Événements', href: '/events' },
    { label: 'Comment ça marche', href: '/how-it-works' },
    { label: 'Tarifs', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'À propos', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carrières', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Conditions d\'utilisation', href: '/terms' },
    { label: 'Politique de confidentialité', href: '/privacy' },
    { label: 'Mentions légales', href: '/legal' },
    { label: 'Cookies', href: '/cookies' },
  ],
  support: [
    { label: 'Centre d\'aide', href: '/help' },
    { label: 'Sécurité', href: '/security' },
    { label: 'Signaler un problème', href: '/report' },
    { label: 'Statut', href: '/status' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/ava', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/ava', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/ava', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 no-underline">
              <Ticket className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">AVA</span>
            </Link>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              La plateforme de revente de billets éthique et sécurisée.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-clean-sm border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 no-underline"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Produit', links: footerLinks.product },
            { title: 'Entreprise', links: footerLinks.company },
            { title: 'Support', links: footerLinks.support },
            { title: 'Légal', links: footerLinks.legal },
          ].map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors no-underline"
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

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} AVA Billetterie. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="h-4 w-4" />
            <a
              href="mailto:contact@ava-billetterie.com"
              className="hover:text-gray-700 transition-colors no-underline"
            >
              contact@ava-billetterie.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
