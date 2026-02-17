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
    <footer className="w-full border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Ticket className="h-6 w-6" />
              <span className="font-bold text-xl">AVA</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              La plateforme de revente de billets éthique et sécurisée.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} AVA Billetterie. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a
              href="mailto:contact@ava-billetterie.com"
              className="hover:text-primary transition-colors"
            >
              contact@ava-billetterie.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
