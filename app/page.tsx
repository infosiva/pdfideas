'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Bookmark, BookmarkCheck, Check, Loader2 } from 'lucide-react'

const NICHES = [
  'Parenting', 'Health & Wellness', 'Personal Finance', 'Productivity', 'Relationships',
  'Fitness', 'Anxiety & Mental Health', 'Side Hustles', 'Home Organisation', 'Sleep',
  'Nutrition & Diet', 'Career & Job Search', 'Small Business', 'Social Media', 'Travel Hacking',
  'Pet Care', 'Pregnancy & Baby', 'Minimalism', 'Dating', 'Study & Learning',
]
const LS_KEY = 'pdfideas_saved'

interface Idea {
  title: string; subtitle: string; audience: string; painPoint: string
  searchVolume: string; competition: string; trend: string
  opportunityScore: number; suggestedPrice: number; gumroadTitle: string; chapters: string[]
}

const OUTLINE = [
  { id: 'generate', label: 'Generate ideas' },
  { id: 'how', label: 'How it works' },
  { id: 'pricing', label: 'Free vs Pro' },
]

function GuidePreview() {
  // Format preview only: shows the shape of an output, not real results.
  const rows = ['Title + subtitle', 'Who buys it', 'Chapter outline', 'Price range']
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-[320px]" style={{ animation: 'pageFloat 7s ease-in-out infinite' }}>
      <div className="rounded-2xl border p-5 shadow-2xl" style={{ background: '#fff', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: 'var(--accent-ink)' }}>Format preview</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>one idea card</span>
        </div>
        {rows.map((r, i) => (
          <div key={r} className="mb-3" style={{ animation: `fadeSlideIn .6s ${0.2 + i * 0.25}s both` }}>
            <div className="text-[11px] mb-1.5 font-semibold" style={{ color: 'var(--text-2)' }}>{r}</div>
            <div className="h-2.5 rounded-full origin-left" style={{ background: i % 2 ? 'var(--surface-2)' : 'rgba(74,217,38,0.45)', width: `${92 - i * 14}%`, animation: `lineDraw .8s ${0.4 + i * 0.25}s both` }} />
            <div className="h-2.5 rounded-full mt-1.5 origin-left" style={{ background: 'var(--surface-2)', width: `${64 - i * 6}%`, animation: `lineDraw .8s ${0.6 + i * 0.25}s both` }} />
          </div>
        ))}
        <div className="mt-4 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>Write this guide</div>
      </div>
    </div>
  )
}

function IdeaCard({ idea, saved, onSave }: { idea: Idea; saved: boolean; onSave: () => void }) {
  return (
    <article className="rounded-2xl border p-5 flex flex-col gap-3" style={{ background: '#fff', borderColor: 'var(--border)', animation: 'fadeSlideIn .5s both' }}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-base leading-snug" style={{ color: 'var(--foreground)' }}>{idea.title}</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{idea.subtitle}</p>
        </div>
        <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--accent-ink)' }} title="AI estimate, not measured demand">
          {idea.opportunityScore}<span className="font-normal"> est.</span>
        </span>
      </header>
      <p className="text-sm" style={{ color: 'var(--text-2)' }}><strong>Buyer:</strong> {idea.audience}</p>
      <p className="text-sm" style={{ color: 'var(--text-2)' }}><strong>Problem:</strong> {idea.painPoint}</p>
      <ol className="text-sm list-decimal pl-5 space-y-0.5" style={{ color: 'var(--text-2)' }}>
        {idea.chapters?.map((c, i) => <li key={i}>{c}</li>)}
      </ol>
      <div className="text-xs" style={{ color: 'var(--text-3)' }}>
        Search {idea.searchVolume} · competition {idea.competition} · trend {idea.trend} · suggested ${idea.suggestedPrice}
      </div>
      <footer className="flex gap-2 mt-auto pt-1">
        <Link href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters ?? []))}`}
          className="btn-accent flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl min-h-11 text-sm">Write this guide <ArrowRight size={14} /></Link>
        <button onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save idea'}
          className="w-11 h-11 rounded-xl border flex items-center justify-center" style={{ borderColor: 'var(--border)', color: 'var(--accent-ink)' }}>
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </footer>
    </article>
  )
}

export default function Home() {
  const [niche, setNiche] = useState(NICHES[0])
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(6)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [saved, setSaved] = useState<Idea[]>([])

  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(LS_KEY) || '[]')) } catch { /* ignore */ } }, [])
  const persist = (n: Idea[]) => { setSaved(n); try { localStorage.setItem(LS_KEY, JSON.stringify(n)) } catch { /* ignore */ } }
  const toggle = (i: Idea) => persist(saved.some(s => s.title === i.title) ? saved.filter(s => s.title !== i.title) : [...saved, i])

  async function generate() {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche, topic: topic.trim() || undefined, count }) })
      const d = await r.json()
      if (!r.ok) throw new Error(r.status === 429 ? 'Too many requests. Wait a minute and retry.' : 'Could not generate ideas. Please retry.')
      setIdeas(d.ideas ?? [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <div className="aurora" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 pt-16 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>On this page</p>
            <ul className="border-l" style={{ borderColor: 'var(--border)' }}>
              {OUTLINE.map(o => (
                <li key={o.id}><a href={`#${o.id}`} className="block -ml-px pl-4 py-2 border-l-2 border-transparent hover:border-[#1a6b0a] min-h-11" style={{ color: 'var(--text-2)' }}>{o.label}</a></li>
              ))}
            </ul>
            {saved.length > 0 && <p className="mt-6 text-xs" style={{ color: 'var(--text-3)' }}>{saved.length} saved on this device</p>}
          </nav>
        </aside>

        <div className="min-w-0 pb-24">
          <section className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center pt-12 sm:pt-16 pb-14">
            <div style={{ animation: 'heroIn .7s both' }}>
              <p className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-5" style={{ background: 'var(--surface-2)', color: 'var(--accent-ink)', border: '1px solid var(--border)' }}>PDF guide ideas for Gumroad and Etsy</p>
              <h1 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(2.1rem, 5.5vw, 3.6rem)', lineHeight: 1.05, color: 'var(--foreground)' }}>
                Pick the PDF guide <span style={{ color: 'var(--accent-ink)' }}>worth writing.</span>
              </h1>
              <p className="mt-4 text-lg max-w-xl" style={{ color: 'var(--text-2)' }}>Pick a niche. Get titles, buyers, chapter outlines and a price range to test. Scores are AI estimates, so check demand before you write.</p>
              <a href="#generate" className="btn-accent mt-7 inline-flex items-center gap-2 px-7 rounded-xl min-h-12 text-base">Generate ideas <ArrowRight size={18} /></a>
            </div>
            <GuidePreview />
          </section>

          <section id="generate" className="scroll-mt-24 rounded-3xl border p-5 sm:p-7" style={{ background: 'rgba(255,255,255,0.85)', borderColor: 'var(--border)' }} aria-labelledby="gen-h">
            <h2 id="gen-h" className="text-2xl font-extrabold mb-5" style={{ color: 'var(--foreground)' }}>Generate ideas</h2>
            <form onSubmit={e => { e.preventDefault(); generate() }} className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>Niche
                <select className="form-input mt-1.5" value={niche} onChange={e => setNiche(e.target.value)}>{NICHES.map(n => <option key={n}>{n}</option>)}</select>
              </label>
              <label className="text-sm font-semibold" style={{ color: 'var(--text-2)' }}>Topic (optional)
                <input className="form-input mt-1.5" value={topic} onChange={e => setTopic(e.target.value)} maxLength={200} placeholder="e.g. toddler sleep schedules" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2" style={{ color: 'var(--text-2)' }}>Ideas: {count}
                <input type="range" min={3} max={10} value={count} onChange={e => setCount(+e.target.value)} className="w-full mt-1.5" style={{ accentColor: '#2fa812', minHeight: 44 }} />
              </label>
              {error && <p role="alert" className="sm:col-span-2 text-sm" style={{ color: '#b91c1c' }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-accent sm:col-span-2 rounded-xl min-h-12 inline-flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <>Generate ideas</>}
              </button>
            </form>
            {ideas.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4 mt-7" aria-live="polite">
                {ideas.map((idea, i) => <IdeaCard key={idea.title + i} idea={idea} saved={saved.some(s => s.title === idea.title)} onSave={() => toggle(idea)} />)}
              </div>
            )}
          </section>

          <section id="how" className="scroll-mt-24 pt-16" aria-labelledby="how-h">
            <h2 id="how-h" className="text-2xl font-extrabold mb-5" style={{ color: 'var(--foreground)' }}>How it works</h2>
            <ol className="space-y-4 max-w-2xl" style={{ color: 'var(--text-2)' }}>
              {[['Choose a niche', 'Optionally add a topic to narrow it.'], ['Review the ideas', 'Each has a buyer, a problem, a chapter outline and a price to test.'], ['Write the guide', 'Open an idea in the guide writer, copy it, then publish on Gumroad or Etsy yourself.']].map(([t, d], i) => (
                <li key={t} className="flex gap-4"><span className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>{i + 1}</span><span><strong style={{ color: 'var(--foreground)' }}>{t}.</strong> {d}</span></li>
              ))}
            </ol>
          </section>

          <section id="pricing" className="scroll-mt-24 pt-16" aria-labelledby="price-h">
            <h2 id="price-h" className="text-2xl font-extrabold mb-5" style={{ color: 'var(--foreground)' }}>Free vs Pro</h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
              <div className="rounded-2xl border p-6" style={{ background: '#fff', borderColor: 'var(--accent-ink)' }}>
                <h3 className="font-bold text-lg">Free</h3>
                <p className="text-3xl font-extrabold mt-1">$0</p>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: 'var(--text-2)' }}>
                  {['Idea generation for 20 niches', 'Guide writer and copy/download', 'Saved ideas stored on your device', 'Fair-use limit: 10 generations per minute'].map(f => <li key={f} className="flex gap-2"><Check size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-ink)' }} />{f}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border p-6" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-lg">Pro</h3>
                <p className="text-xl font-extrabold mt-2" style={{ color: 'var(--text-2)' }}>Not available yet</p>
                <p className="mt-4 text-sm" style={{ color: 'var(--text-2)' }}>No paid plan exists today and nothing is locked. If you would pay for higher limits or real keyword data, tell us with the Feedback button.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
