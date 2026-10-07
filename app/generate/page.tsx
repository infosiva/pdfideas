'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Download, Copy, CheckCircle, Loader } from 'lucide-react'

interface Chapter { title: string; content: string; tips: string[] }
interface Guide {
  title: string; subtitle: string; audience: string
  introduction: string; chapters: Chapter[]
  conclusion: string; bonusTips: string[]
  gumroadBlurb: string
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cfe3c4] text-[#4a6040] hover:text-[#0f1a0b] text-xs transition-colors">
      {copied ? <CheckCircle size={12} className="text-[#1a6b0a]"/> : <Copy size={12}/>}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function guideToText(guide: Guide): string {
  let out = `${guide.title}\n${guide.subtitle}\n${'='.repeat(60)}\n\n`
  out += `INTRODUCTION\n${'-'.repeat(40)}\n${guide.introduction}\n\n`
  guide.chapters.forEach((ch, i) => {
    out += `CHAPTER ${i + 1}: ${ch.title}\n${'-'.repeat(40)}\n${ch.content}\n\n`
    if (ch.tips.length) out += `Key Takeaways:\n${ch.tips.map(t => `• ${t}`).join('\n')}\n\n`
  })
  out += `CONCLUSION\n${'-'.repeat(40)}\n${guide.conclusion}\n\n`
  if (guide.bonusTips.length) out += `BONUS TIPS:\n${guide.bonusTips.map(t => `• ${t}`).join('\n')}\n\n`
  return out
}

function downloadTxt(guide: Guide) {
  const text = guideToText(guide)
  const blob  = new Blob([text], { type: 'text/plain' })
  const url   = URL.createObjectURL(blob)
  const a     = document.createElement('a')
  a.href      = url
  a.download  = `${guide.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function renderMd(text: string) {
  return text.split('\n').map((line, i) => {
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#{1,3}\s/, '')
      return <p key={i} className="text-[#0f1a0b] font-semibold text-sm mt-4 mb-1">{content}</p>
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) =>
      /^\*\*[^*]+\*\*$/.test(part)
        ? <strong key={j} className="text-[#2a3d22] font-semibold">{part.slice(2, -2)}</strong>
        : part
    )
    return line.trim() === ''
      ? <br key={i} />
      : <p key={i} className="text-[#2a3d22] text-sm leading-relaxed">{rendered}</p>
  })
}

function GenerateContent() {
  const params    = useSearchParams()
  const title     = params.get('title')     ?? ''
  const subtitle  = params.get('subtitle')  ?? ''
  const audience  = params.get('audience')  ?? ''
  const painPoint = params.get('painPoint') ?? ''
  const chapters  = JSON.parse(params.get('chapters') ?? '[]') as string[]

  const [guide,   setGuide]   = useState<Guide | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [step,    setStep]    = useState('')

  useEffect(() => {
    if (!title || !chapters.length) return
    generate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate() {
    setLoading(true)
    setError('')
    setGuide(null)
    setStep('Writing introduction...')
    try {
      const res  = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, subtitle, audience, painPoint, chapters }),
      })
      setStep('Generating chapters...')
      const data = await res.json() as { guide?: Guide; error?: string }
      if (!res.ok || !data.guide) { setError(data.error ?? 'Generation failed'); return }
      setStep('')
      setGuide(data.guide)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  if (!title) return (
    <div className="text-center py-24 text-[#4a6040]">
      <p>No guide selected. <a href="/" className="text-[#1a6b0a] underline">Generate ideas first →</a></p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <a href="/" className="flex items-center gap-2 text-[#4a6040] hover:text-[#0f1a0b] text-sm mb-8 transition-colors">
        <ArrowLeft size={16}/> Back to ideas
      </a>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[#0f1a0b] mb-1">{title}</h1>
        <p className="text-[#4a6040]">{subtitle}</p>
        {audience && <p className="text-[#4a6040] text-sm mt-1">For: {audience}</p>}
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#cfe3c4] p-10 text-center"
          style={{ background: '#ffffff' }}>
          <Loader size={32} className="mx-auto mb-4 text-[#1a6b0a] animate-spin" />
          <p className="text-[#0f1a0b] font-semibold mb-1">Writing your guide...</p>
          <p className="text-[#4a6040] text-sm">{step}</p>
          <p className="text-[#4a6040] text-xs mt-3">This takes 30–60 seconds — generating {chapters.length} chapters</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          {error}
          <button onClick={generate} className="ml-3 underline">Retry</button>
        </div>
      )}

      {guide && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => downloadTxt(guide)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#0f1a0b] text-sm font-medium"
              style={{ background: '#4ad926' }}
            >
              <Download size={15}/> Download .txt
            </button>
            <CopyBtn text={guideToText(guide)} />
          </div>

          {/* Gumroad blurb */}
          <div className="rounded-2xl border border-[#cfe3c4] p-5"
            style={{ background: '#eef8e6' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#1a6b0a] text-xs font-bold uppercase tracking-widest">Gumroad Product Description</p>
              <CopyBtn text={guide.gumroadBlurb} />
            </div>
            <p className="text-[#2a3d22] text-sm leading-relaxed whitespace-pre-wrap">{guide.gumroadBlurb}</p>
          </div>

          {/* Introduction */}
          <div className="rounded-2xl border border-[#cfe3c4] p-6"
            style={{ background: '#ffffff' }}>
            <h2 className="text-[#0f1a0b] font-bold text-lg mb-3">Introduction</h2>
            <div className="space-y-1">{renderMd(guide.introduction)}</div>
          </div>

          {/* Chapters */}
          {guide.chapters.map((ch, i) => (
            <div key={i} className="rounded-2xl border border-[#cfe3c4] p-6"
              style={{ background: '#ffffff' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-[#e4f6d8] text-[#1a6b0a] text-xs font-bold">
                  Chapter {i + 1}
                </span>
                <h2 className="text-[#0f1a0b] font-bold">{ch.title}</h2>
              </div>
              <div className="space-y-1 mb-4">{renderMd(ch.content)}</div>
              {ch.tips.length > 0 && (
                <div className="border-t border-[#cfe3c4] pt-4">
                  <p className="text-[#4a6040] text-xs font-bold uppercase tracking-wider mb-2">Key Takeaways</p>
                  <ul className="space-y-1">
                    {ch.tips.map((t, j) => (
                      <li key={j} className="text-[#2a3d22] text-sm flex gap-2">
                        <span className="text-[#1a6b0a] mt-0.5">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="rounded-2xl border border-[#cfe3c4] p-6"
            style={{ background: '#ffffff' }}>
            <h2 className="text-[#0f1a0b] font-bold text-lg mb-3">Conclusion</h2>
            <div className="space-y-1">{renderMd(guide.conclusion)}</div>
            {guide.bonusTips.length > 0 && (
              <div className="mt-4 border-t border-[#cfe3c4] pt-4">
                <p className="text-[#4a6040] text-xs font-bold uppercase tracking-wider mb-2">Bonus Tips</p>
                <ul className="space-y-1">
                  {guide.bonusTips.map((t, i) => (
                    <li key={i} className="text-[#2a3d22] text-sm flex gap-2">
                      <span className="text-[#1a6b0a] mt-0.5">•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div className="rounded-2xl border border-[#cfe3c4] p-6 text-center"
            style={{ background: '#eef8e6' }}>
            <p className="text-[#0f1a0b] font-bold text-lg mb-2">Ready to sell this guide?</p>
            <p className="text-[#4a6040] text-sm mb-4">Copy the Gumroad description above → create a product → set a price (start from the suggestion on the idea card) → publish.</p>
            <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[#0f1a0b] text-sm font-medium"
              style={{ background: '#4ad926' }}>
              Open Gumroad → List now
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <Suspense fallback={<div className="text-center py-24 text-[#4a6040]">Loading...</div>}>
        <GenerateContent />
      </Suspense>
    </div>
  )
}
