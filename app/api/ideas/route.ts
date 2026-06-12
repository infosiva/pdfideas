/**
 * POST /api/ideas
 * Generates trending PDF guide ideas for a niche using AI.
 * Returns scored ideas with title, subtitle, target audience,
 * estimated search volume tier, competition level, and opportunity score.
 */
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const SYSTEM = `You are a digital product research expert specialising in PDF guides and ebooks sold on Gumroad, Etsy, and Payhip.

Given a niche and optional topic, generate PDF guide ideas that:
- Solve a SPECIFIC painful problem (not generic advice)
- Have a buyer-ready audience (people with money who want this NOW)
- Can be sold for $9–$27 on Gumroad/Etsy
- Can be written in 15–25 pages of actionable content

Return ONLY valid JSON — no markdown, no explanation. Format:
{
  "ideas": [
    {
      "title": "Exact PDF title",
      "subtitle": "Specific benefit subtitle",
      "audience": "Who buys this (1 sentence)",
      "painPoint": "The problem it solves",
      "searchVolume": "high|medium|low",
      "competition": "high|medium|low",
      "trend": "rising|stable|falling",
      "opportunityScore": 85,
      "suggestedPrice": 17,
      "gumroadTitle": "Short punchy Gumroad listing title",
      "chapters": ["Chapter 1 title", "Chapter 2 title", "Chapter 3 title", "Chapter 4 title", "Chapter 5 title"]
    }
  ]
}

opportunityScore: 0-100. High = high search + low competition + rising trend.
Generate exactly the number of ideas requested.`

const NICHES = [
  'Parenting', 'Health & Wellness', 'Personal Finance', 'Productivity',
  'Relationships', 'Fitness', 'Anxiety & Mental Health', 'Side Hustles',
  'Home Organisation', 'Sleep', 'Nutrition & Diet', 'Career & Job Search',
  'Small Business', 'Social Media', 'Travel Hacking', 'Pet Care',
  'Pregnancy & Baby', 'Minimalism', 'Dating', 'Study & Learning',
]

export async function GET() {
  return NextResponse.json({ niches: NICHES })
}

export async function POST(req: NextRequest) {
  try {
    const { niche, topic, count = 10 } = await req.json() as {
      niche: string
      topic?: string
      count?: number
    }

    if (!niche) return NextResponse.json({ error: 'niche required' }, { status: 400 })
    if (typeof niche !== 'string' || niche.length > 100) {
      return NextResponse.json({ error: 'Invalid niche' }, { status: 400 })
    }
    if (topic && (typeof topic !== 'string' || topic.length > 200)) {
      return NextResponse.json({ error: 'Topic too long' }, { status: 400 })
    }

    const clampedCount = Math.min(Math.max(count, 3), 10)
    const topicHint    = topic ? ` Topic hint: "${topic}".` : ''

    const { text, provider, model } = await callAI(
      SYSTEM,
      [{
        role:    'user',
        content: `Niche: ${niche}.${topicHint} Generate ${clampedCount} PDF guide ideas. Return JSON only.`,
      }],
      2048,
      'best',
    )

    // Parse JSON — strip any accidental markdown fences
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed  = JSON.parse(cleaned) as { ideas: unknown[] }

    return NextResponse.json({
      ideas:    parsed.ideas,
      niche,
      provider,
      model,
      count:    parsed.ideas.length,
    })

  } catch (err) {
    console.error('[pdfideas][/api/ideas]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
