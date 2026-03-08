'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Sparkles, Loader2, X, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ButtonClean } from '@/components/ui/button-clean';
import { CATEGORY_ACCENT, CATEGORY_FILL_SELECTED } from './venue-sections-config';
import type { ISectionPrice, IVenueSection } from './types';

type Priority   = 'VIEW' | 'PROXIMITY' | 'COMFORT' | 'AMBIANCE';
type SeatingPref = 'STANDING' | 'SEATED' | 'ANY';

interface IRecommendation {
  section_id:   string;
  section_name: string;
  reasoning:    string;
  confidence:   number;
}

interface ISeatAssistantModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  eventTitle:    string;
  sections:      IVenueSection[];
  sectionPrices: Map<string, ISectionPrice>;
  onRecommendation: (sectionId: string) => void;
}

const PRIORITIES: { value: Priority; label: string; emoji: string; desc: string }[] = [
  { value: 'VIEW',      label: 'Meilleure vue',      emoji: '👀', desc: 'Voir scène sans obstruction' },
  { value: 'PROXIMITY', label: 'Proche de la scène', emoji: '🎤', desc: 'Proximité avec l\'artiste' },
  { value: 'COMFORT',   label: 'Confort',            emoji: '🪑', desc: 'Assis, espace, bonne acoustique' },
  { value: 'AMBIANCE',  label: 'Ambiance',           emoji: '🔥', desc: 'Énergie de la foule, fête' },
];

const SEATING_PREFS: { value: SeatingPref; label: string; emoji: string; desc: string }[] = [
  { value: 'STANDING', label: 'Debout',            emoji: '🕺', desc: 'Liberté de mouvement, énergie maximale' },
  { value: 'SEATED',   label: 'Assis',             emoji: '🪑', desc: 'Confort, vue dégagée' },
  { value: 'ANY',      label: 'Peu importe',       emoji: '🤷', desc: 'Je suis flexible' },
];

export function SeatAssistantModal({
  isOpen,
  onClose,
  eventTitle,
  sections,
  sectionPrices,
  onRecommendation,
}: ISeatAssistantModalProps) {
  const [step,        setStep]        = useState<1 | 2 | 3 | 4>(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [budgetMax,   setBudgetMax]   = useState<number>(0);
  const [priority,    setPriority]    = useState<Priority | null>(null);
  const [seatingPref, setSeatingPref] = useState<SeatingPref | null>(null);
  const [result,      setResult]      = useState<IRecommendation | null>(null);

  const prices = Array.from(sectionPrices.values()).map((d) => d.min_price);
  const globalMin = prices.length ? Math.min(...prices) : 0;
  const globalMax = prices.length ? Math.max(...prices) : 500;

  // Initialise budget to globalMax on first open
  const effectiveBudget = budgetMax === 0 ? globalMax : budgetMax;

  const sectionList = Array.from(sectionPrices.entries())
    .map(([id, data]) => {
      const sec = sections.find((s) => s.section_id === id);
      return sec
        ? { section_id: id, section_name: sec.name, category: sec.category, min_price: data.min_price, max_price: data.max_price, tickets_count: data.tickets_count }
        : null;
    })
    .filter(Boolean) as Array<{
      section_id: string; section_name: string; category: string;
      min_price: number; max_price: number; tickets_count: number;
    }>;

  const handleSubmit = async () => {
    if (!priority || !seatingPref) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/recommend-seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_max:   effectiveBudget,
          priority,
          seating_pref: seatingPref,
          sections:     sectionList,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: IRecommendation = await res.json();
      setResult(data);
      setStep(4);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      onRecommendation(result.section_id);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setLoading(false);
    setError(null);
    setBudgetMax(0);
    setPriority(null);
    setSeatingPref(null);
    setResult(null);
    onClose();
  };

  const recommendedSection = result
    ? sections.find((s) => s.section_id === result.section_id)
    : null;
  const accentColor = recommendedSection ? CATEGORY_ACCENT[recommendedSection.category] : '#2563EB';
  const bgColor     = recommendedSection ? CATEGORY_FILL_SELECTED[recommendedSection.category] : '#2563EB';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.18)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-gray-900 leading-tight">
                  Trouvez votre place idéale
                </Dialog.Title>
                <p className="mt-0.5 text-xs text-gray-400 truncate max-w-[240px]">{eventTitle}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 px-6 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  step === 4 || s < step ? 'w-6 bg-violet-600' : s === step ? 'w-6 bg-violet-400' : 'w-3 bg-gray-200',
                ].join(' ')}
              />
            ))}
          </div>

          <div className="px-6 pb-6 pt-4">

            {/* ── Step 1 : Budget ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Quel est votre budget ?</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Billets disponibles : {Math.round(globalMin)}€ – {Math.round(globalMax)}€
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 ring-1 ring-violet-100">
                  <div className="mb-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-medium text-violet-700">Budget maximum</span>
                      <p className="text-[10px] text-gray-400">Billets dès {Math.round(globalMin)}€</p>
                    </div>
                    <span className="text-4xl font-black text-violet-600">{Math.round(effectiveBudget)}€</span>
                  </div>
                  <SliderPrimitive.Root
                    value={[effectiveBudget]}
                    onValueChange={([v]) => setBudgetMax(v)}
                    min={globalMin}
                    max={globalMax}
                    step={Math.max(1, Math.round((globalMax - globalMin) / 40))}
                    className="relative flex h-5 w-full touch-none select-none items-center"
                  >
                    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-gray-300">
                      <SliderPrimitive.Range className="absolute h-full rounded-full bg-violet-500" />
                    </SliderPrimitive.Track>
                    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-violet-500 bg-white shadow-md transition hover:scale-110 focus:outline-none" />
                  </SliderPrimitive.Root>
                </div>

                <ButtonClean onClick={() => setStep(2)} className="w-full bg-violet-600 hover:bg-violet-700">
                  Continuer →
                </ButtonClean>
              </div>
            )}

            {/* ── Step 2 : Priorité ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <button onClick={() => setStep(1)} className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                    <ArrowLeft className="h-3 w-3" /> Retour
                  </button>
                  <h3 className="text-base font-semibold text-gray-900">Votre priorité ?</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Ce qui compte le plus pour vous</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={[
                        'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                        priority === p.value
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <span className="text-xl">{p.emoji}</span>
                      <span className="text-xs font-semibold text-gray-900">{p.label}</span>
                      <span className="text-[10px] text-gray-500">{p.desc}</span>
                    </button>
                  ))}
                </div>

                <ButtonClean
                  onClick={() => setStep(3)}
                  disabled={!priority}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
                >
                  Continuer →
                </ButtonClean>
              </div>
            )}

            {/* ── Step 3 : Debout / Assis ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <button onClick={() => setStep(2)} className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                    <ArrowLeft className="h-3 w-3" /> Retour
                  </button>
                  <h3 className="text-base font-semibold text-gray-900">Debout ou assis ?</h3>
                </div>

                <div className="space-y-2">
                  {SEATING_PREFS.map((sp) => (
                    <button
                      key={sp.value}
                      onClick={() => setSeatingPref(sp.value)}
                      className={[
                        'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                        seatingPref === sp.value
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <span className="text-xl">{sp.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{sp.label}</p>
                        <p className="text-xs text-gray-500">{sp.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <ButtonClean
                  onClick={handleSubmit}
                  disabled={!seatingPref || loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours…</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Trouver ma place idéale</>
                  )}
                </ButtonClean>
              </div>
            )}

            {/* ── Step 4 : Résultat ── */}
            {step === 4 && result && (
              <div className="space-y-4">
                {/* Section highlight */}
                <div
                  className="rounded-xl p-5 text-center"
                  style={{ background: `${bgColor}18`, border: `2px solid ${bgColor}40` }}
                >
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8" style={{ color: accentColor }} />
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
                    Recommandation IA
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">{result.section_name}</h3>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <div className="h-1.5 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.round(result.confidence * 100)}%`, background: accentColor }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(result.confidence * 100)}% confiance
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Pourquoi cette section</p>
                  <p className="text-sm leading-relaxed text-gray-700">{result.reasoning}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setResult(null); setStep(1); }}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                  >
                    Recommencer
                  </button>
                  <ButtonClean onClick={handleAccept} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    Voir les billets →
                  </ButtonClean>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
