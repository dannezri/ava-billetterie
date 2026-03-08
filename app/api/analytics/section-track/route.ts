import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type TrackType = 'view' | 'hover' | 'click';

interface TrackBody {
  event_id:   string;
  section_id: string;
  type:       TrackType;
}

// Today's date at midnight UTC (for daily de-duplication)
function todayUTC() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  let body: TrackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { event_id, section_id, type } = body;
  if (!event_id || !section_id || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const increment = {
    viewsCount:  type === 'view'  ? 1 : 0,
    hoversCount: type === 'hover' ? 1 : 0,
    clicksCount: type === 'click' ? 1 : 0,
  };

  await prisma.sectionAnalytics.upsert({
    where: {
      eventId_sectionId_date: {
        eventId:   event_id,
        sectionId: section_id,
        date:      todayUTC(),
      },
    },
    create: {
      eventId:    event_id,
      sectionId:  section_id,
      date:       todayUTC(),
      viewsCount:  increment.viewsCount,
      hoversCount: increment.hoversCount,
      clicksCount: increment.clicksCount,
    },
    update: {
      viewsCount:  { increment: increment.viewsCount },
      hoversCount: { increment: increment.hoversCount },
      clicksCount: { increment: increment.clicksCount },
    },
  });

  return NextResponse.json({ ok: true });
}
