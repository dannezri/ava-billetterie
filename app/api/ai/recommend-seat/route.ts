import { NextRequest, NextResponse } from 'next/server';

type Priority    = 'VIEW' | 'PROXIMITY' | 'COMFORT' | 'AMBIANCE';
type SeatingPref = 'STANDING' | 'SEATED' | 'ANY';

interface SectionInput {
  section_id:    string;
  section_name:  string;
  category:      string;
  min_price:     number;
  max_price:     number;
  tickets_count: number;
}

interface RecommendBody {
  budget_max:   number;
  priority:     Priority;
  seating_pref: SeatingPref;
  sections:     SectionInput[];
}

const PRIORITY_FR: Record<Priority, string> = {
  VIEW:      'Meilleure vue sur scène',
  PROXIMITY: 'Proximité avec l\'artiste',
  COMFORT:   'Confort (assis, espace, acoustique)',
  AMBIANCE:  'Ambiance de foule (énergie, fête)',
};

const SEATING_FR: Record<SeatingPref, string> = {
  STANDING: 'Debout uniquement',
  SEATED:   'Assis uniquement',
  ANY:      'Flexible',
};

// Fallback logic when ANTHROPIC_API_KEY is not set
function localRecommend(body: RecommendBody): {
  section_id: string; section_name: string; reasoning: string; confidence: number;
} {
  const { budget_max, priority, seating_pref, sections } = body;

  const inBudget = sections.filter((s) => s.min_price <= budget_max && s.tickets_count > 0);
  if (inBudget.length === 0) {
    const closest = [...sections].sort((a, b) => a.min_price - b.min_price)[0];
    return {
      section_id:   closest.section_id,
      section_name: closest.section_name,
      reasoning:    `Aucune section n'est disponible dans votre budget. La section ${closest.section_name} est la plus abordable à ${Math.round(closest.min_price)}€.`,
      confidence:   0.5,
    };
  }

  let scored = inBudget.map((s) => {
    let score = 0;
    const cat = s.category.toUpperCase();

    if (seating_pref === 'STANDING') score += cat.includes('STANDING') || cat.includes('PIT') ? 30 : 0;
    if (seating_pref === 'SEATED')   score += !cat.includes('STANDING') && !cat.includes('PIT') ? 30 : 0;

    if (priority === 'PROXIMITY')    score += cat.includes('STANDING') || cat.includes('PIT') || cat.includes('FLOOR') ? 25 : 5;
    if (priority === 'VIEW')         score += cat.includes('LOWER') || cat.includes('MIDDLE') ? 25 : cat.includes('UPPER') ? 10 : 5;
    if (priority === 'COMFORT')      score += cat.includes('VIP') ? 30 : !cat.includes('STANDING') ? 15 : 0;
    if (priority === 'AMBIANCE')     score += cat.includes('STANDING') || cat.includes('PIT') ? 30 : 10;

    // Prefer more tickets available
    score += Math.min(s.tickets_count / 5, 10);
    return { ...s, score };
  });

  scored = scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    section_id:   best.section_id,
    section_name: best.section_name,
    reasoning:    `La section ${best.section_name} correspond à votre priorité "${PRIORITY_FR[priority]}" avec ${best.tickets_count} billets disponibles à partir de ${Math.round(best.min_price)}€.`,
    confidence:   Math.min(0.6 + best.score / 200, 0.95),
  };
}

export async function POST(request: NextRequest) {
  let body: RecommendBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { budget_max, priority, seating_pref, sections } = body;

  // If no Gemini key, use lightweight local scorer
  if (!process.env.GEMINI_API_KEY) {
    const result = localRecommend(body);
    return NextResponse.json(result);
  }

  const sectionsText = sections
    .map(
      (s) =>
        `• ${s.section_id} — ${s.section_name} (${s.category})\n  Prix : ${Math.round(s.min_price)}€ – ${Math.round(s.max_price)}€  |  ${s.tickets_count} billets`,
    )
    .join('\n');

  const prompt = `Tu es un expert en placement de salles de spectacle. Recommande LA meilleure section.

BUDGET MAXIMUM : ${Math.round(budget_max)}€
PRIORITÉ : ${PRIORITY_FR[priority]}
PRÉFÉRENCE : ${SEATING_FR[seating_pref]}

SECTIONS DISPONIBLES :
${sectionsText}

RÈGLES :
1. Sélectionne une section dont min_price ≤ budget_max ET tickets_count > 0.
2. Fais correspondre la catégorie à la priorité (STANDING_PIT = proximité/ambiance, tiers hauts = vue, VIP = confort).
3. Explique en 2–3 phrases courtes, directes, personnalisées.
4. Réponds UNIQUEMENT en JSON strict :

{"section_id":"<id>","reasoning":"<2-3 phrases>","confidence":<0.7-0.99>}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const aiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 400,
          temperature:     0.2,
        },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[recommend-seat] Gemini error:', errText);
      return NextResponse.json(localRecommend(body));
    }

    const aiData = await aiRes.json();
    const text   = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

    // Extract JSON even if Gemini wrapped it in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]) as {
      section_id: string; reasoning: string; confidence: number;
    };

    const section = sections.find((s) => s.section_id === parsed.section_id);
    return NextResponse.json({
      ...parsed,
      section_name: section?.section_name ?? parsed.section_id,
    });

  } catch (err) {
    console.error('[recommend-seat] Error:', err);
    return NextResponse.json(localRecommend(body));
  }
}
