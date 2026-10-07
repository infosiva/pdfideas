import { NextRequest, NextResponse } from 'next/server'
import { aiChat } from '@/lib/ai'
import { CHAT_LIMITER } from '@/lib/rateLimit'

const SYSTEM = `You are the PDFIdeas assistant. PDFIdeas generates ideas for PDF guides, checklists and workbooks that people sell on Gumroad or Etsy. Help with niche choice, guide outlines, titles, pricing and where to sell. Keep answers short and practical. Do not claim the tool measures real search demand; scores are AI estimates. If asked anything outside PDF guide products, reply exactly: "I'm trained for PDFIdeas. For that, try Google or ChatGPT!"`

export async function POST(req: NextRequest) {
  const limited = CHAT_LIMITER.check(req)
  if (limited) return limited
  let body: { messages?: { role: string; content: string }[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const msgs = (body.messages ?? [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-8)
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 1000) }))
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return NextResponse.json({ error: 'No message' }, { status: 400 })
  try {
    const reply = await aiChat(msgs, SYSTEM, 500, 'fast')
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('/api/chat', err)
    return NextResponse.json({ reply: 'Sorry, the assistant is busy right now. Please try again in a minute.' })
  }
}
