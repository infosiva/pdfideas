import { NextResponse } from 'next/server'

let sessionCounts = { pdfsProcessed: 0, ideasGenerated: 0, pagesAnalyzed: 0 }

export async function GET() { return NextResponse.json(sessionCounts) }

export async function POST(req: Request) {
  const { event } = await req.json()
  if (event === 'pdf_processed') sessionCounts.pdfsProcessed++
  if (event === 'idea_generated') sessionCounts.ideasGenerated++
  if (event === 'page_analyzed') sessionCounts.pagesAnalyzed++
  return NextResponse.json({ ok: true })
}
