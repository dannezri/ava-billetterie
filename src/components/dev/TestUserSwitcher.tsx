'use client';

/**
 * TestUserSwitcher — Switcher de profil réservé aux tests (dev uniquement)
 * Visible uniquement si NEXT_PUBLIC_TEST_USER_SWITCHER=true dans .env.local
 *
 * Permet de basculer en un clic entre :
 *   🛒 Acheteur  (NEXT_PUBLIC_TEST_BUYER_EMAIL / _PASSWORD)
 *   💼 Vendeur   (NEXT_PUBLIC_TEST_SELLER_EMAIL / _PASSWORD)
 */

import { createClient } from '@/lib/supabase/browser-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TestProfile {
  key: 'buyer' | 'seller';
  label: string;
  icon: string;
  email: string | undefined;
  password: string | undefined;
  badgeClass: string;
}

const PROFILES: TestProfile[] = [
  {
    key: 'buyer',
    label: 'Acheteur',
    icon: '🛒',
    email: process.env.NEXT_PUBLIC_TEST_BUYER_EMAIL,
    password: process.env.NEXT_PUBLIC_TEST_BUYER_PASSWORD,
    badgeClass: 'bg-trustBlue-100 text-trustBlue-800 hover:bg-trustBlue-200',
  },
  {
    key: 'seller',
    label: 'Vendeur',
    icon: '💼',
    email: process.env.NEXT_PUBLIC_TEST_SELLER_EMAIL,
    password: process.env.NEXT_PUBLIC_TEST_SELLER_PASSWORD,
    badgeClass: 'bg-accentGreen-100 text-accentGreen-800 hover:bg-accentGreen-200',
  },
];

export function TestUserSwitcher({ currentEmail }: { currentEmail?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'buyer' | 'seller' | null>(null);

  const handleSwitch = async (profile: TestProfile) => {
    if (!profile.email || !profile.password) return;
    if (profile.email === currentEmail) return;

    setLoading(profile.key);
    const supabase = createClient();

    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: profile.password,
    });

    if (error) {
      console.error('[TestUserSwitcher] signIn error:', error.message);
      setLoading(null);
      return;
    }

    const target = profile.key === 'buyer' ? '/dashboard' : '/dashboard/seller';
    router.push(target);
    router.refresh();
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-orange-300 bg-orange-50">
      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mr-1">
        TEST
      </span>
      {PROFILES.map((profile) => {
        const isActive = profile.email === currentEmail;
        const isLoading = loading === profile.key;

        return (
          <button
            key={profile.key}
            onClick={() => handleSwitch(profile)}
            disabled={isActive || isLoading || !profile.email}
            title={profile.email ?? `${profile.label} (non configuré)`}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-all',
              isActive
                ? cn(profile.badgeClass, 'ring-1 ring-offset-1',
                    profile.key === 'buyer' ? 'ring-trustBlue-400' : 'ring-accentGreen-400')
                : cn(profile.badgeClass, 'opacity-60 cursor-pointer hover:opacity-100'),
              (isLoading) && 'opacity-40 cursor-wait'
            )}
          >
            <span>{profile.icon}</span>
            <span className="hidden sm:inline">{profile.label}</span>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
            {isLoading && (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        );
      })}
    </div>
  );
}
