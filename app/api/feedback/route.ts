import { NextRequest, NextResponse } from 'next/server'
import { FEEDBACK_LIMITER } from '@/lib/rateLimit'

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : undefined)

export async function POST(req: NextRequest) {
  const limited = FEEDBACK_LIMITER.check(req)
  if (limited) return limited
  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const message = clip(b.message, 2000)
  const type = clip(b.type, 20) || 'general'
  const rating = Number(b.rating)
  if (!message && !(rating >= 1 && rating <= 5)) return NextResponse.json({ error: 'message or rating required' }, { status: 400 })
  const entry = {
    type, rating: rating >= 1 && rating <= 5 ? rating : undefined, message,
    email: clip(b.email, 200), page: clip(b.page, 200), site: clip(b.site, 60) || 'pdfideas',
  }
  console.log('[feedback]', JSON.stringify(entry))
  const tok = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID
  if (tok && chat) {
    const text = `Feedback (${entry.site}) ${entry.type}${entry.rating ? ` ${entry.rating}/5` : ''}\n${entry.message ?? ''}\n${entry.page ?? ''}`.slice(0, 3500)
    await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }),
    }).catch(() => {})
  }
  return NextResponse.json({ ok: true })
}
