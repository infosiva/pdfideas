/**
 * POST /api/generate
 * Generates full PDF guide content for a given idea.
 * Returns structured chapters ready for PDF rendering.
 *
 * Uses streaming-friendly chunked generation:
 *   1. Generate outline (fast)
 *   2. Generate each chapter (best quality)
 * Returns complete guide as JSON.
 */
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface Chapter {
  title:   string
  content: string   // markdown-ish paragraphs
  tips:    string[] // bullet takeaways
}

interface Guide {
  title:        string
  subtitle:     string
  audience:     string
  introduction: string
  chapters:     Chapter[]
  conclusion:   string
  bonusTips:    string[]
  gumroadBlurb: string   // copy-paste product description for Gumroad listing
}

const CHAPTER_SYSTEM = `You are a bestselling self-help and how-to guide author.
Write in a warm, direct, expert voice. Use real-world examples and specific actionable steps.
No fluff, no vague advice. Every paragraph must give the reader something they can DO today.
Format each chapter as plain text paragraphs followed by 3-5 bullet takeaways.
Do not use markdown headers — return only the prose and bullet points.`

async function generateChapter(
  title: string,
  subtitle: string,
  audience: string,
  chapterTitle: string,
  chapterIndex: number,
  totalChapters: number,
): Promise<Chapter> {
  const { text } = await callAI(
    CHAPTER_SYSTEM,
    [{
      role: 'user',
      content: `Guide: "${title} — ${subtitle}" for ${audience}.
Chapter ${chapterIndex + 1} of ${totalChapters}: "${chapterTitle}"
Write 300-400 words of actionable content for this chapter.
End with exactly 4 bullet takeaways prefixed with "•".
Return plain text only.`,
    }],
    700,
    'best',
  )

  // Split bullets from prose
  const lines    = text.split('\n')
  const tips     = lines.filter(l => l.trim().startsWith('•')).map(l => l.replace('•', '').trim())
  const prose    = lines.filter(l => !l.trim().startsWith('•')).join('\n').trim()

  return { title: chapterTitle, content: prose, tips }
}

export async function POST(req: NextRequest) {
  try {
    const { title, subtitle, audience, chapters: chapterTitles, painPoint } = await req.json() as {
      title:    string
      subtitle: string
      audience: string
      chapters: string[]
      painPoint: string
    }

    if (!title || !chapterTitles?.length) {
      return NextResponse.json({ error: 'title and chapters required' }, { status: 400 })
    }
    if (title.length > 200 || (subtitle && subtitle.length > 200)) {
      return NextResponse.json({ error: 'Title too long' }, { status: 400 })
    }
    if (!Array.isArray(chapterTitles) || chapterTitles.length > 10) {
      return NextResponse.json({ error: 'Max 10 chapters' }, { status: 400 })
    }
    if (chapterTitles.some((c: unknown) => typeof c !== 'string' || c.length > 150)) {
      return NextResponse.json({ error: 'Chapter title too long' }, { status: 400 })
    }

    // 1. Introduction
    const { text: introText } = await callAI(
      CHAPTER_SYSTEM,
      [{
        role: 'user',
        content: `Write an engaging 200-word introduction for the PDF guide:
Title: "${title}"
Subtitle: "${subtitle}"
Audience: ${audience}
Problem: ${painPoint}
Hook the reader immediately. Tell them what they'll learn and why it matters NOW.`,
      }],
      400,
      'balanced',
    )

    // 2. All chapters (sequential — each builds on context)
    const chapters: Chapter[] = []
    for (let i = 0; i < chapterTitles.length; i++) {
      const chapter = await generateChapter(
        title, subtitle, audience,
        chapterTitles[i], i, chapterTitles.length,
      )
      chapters.push(chapter)
    }

    // 3. Conclusion + bonus tips
    const { text: outroText } = await callAI(
      CHAPTER_SYSTEM,
      [{
        role: 'user',
        content: `Write a 150-word conclusion for "${title}".
Summarise the transformation the reader has achieved.
End with 5 bonus quick-win tips prefixed with "•".`,
      }],
      350,
      'balanced',
    )

    const outroLines  = outroText.split('\n')
    const bonusTips   = outroLines.filter(l => l.trim().startsWith('•')).map(l => l.replace('•', '').trim())
    const conclusion  = outroLines.filter(l => !l.trim().startsWith('•')).join('\n').trim()

    // 4. Gumroad listing blurb
    const { text: blurb } = await callAI(
      'You write high-converting product descriptions for digital products sold on Gumroad and Etsy.',
      [{
        role: 'user',
        content: `Write a 100-word Gumroad product description for:
Title: "${title} — ${subtitle}"
Audience: ${audience}
Problem solved: ${painPoint}
Format: 2-3 short punchy paragraphs. End with "Get instant access →"`,
      }],
      200,
      'fast',
    )

    const guide: Guide = {
      title,
      subtitle,
      audience,
      introduction: introText,
      chapters,
      conclusion,
      bonusTips,
      gumroadBlurb: blurb,
    }

    return NextResponse.json({ guide })

  } catch (err) {
    console.error('/api/generate error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
