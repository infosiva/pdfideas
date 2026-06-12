'use client'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, DollarSign, BookOpen, ArrowRight, Share2, Bookmark, BookmarkCheck, Store, Sparkles, Target, BarChart3 } from 'lucide-react'

const NICHES = [
  'Parenting', 'Health & Wellness', 'Personal Finance', 'Productivity',
  'Relationships', 'Fitness', 'Anxiety & Mental Health', 'Side Hustles',
  'Home Organisation', 'Sleep', 'Nutrition & Diet', 'Career & Job Search',
  'Small Business', 'Social Media', 'Travel Hacking', 'Pet Care',
  'Pregnancy & Baby', 'Minimalism', 'Dating', 'Study & Learning',
]

interface Idea {
  title:            string
  subtitle:         string
  audience:         string
  painPoint:        string
  searchVolume:     'high' | 'medium' | 'low'
  competition:      'high' | 'medium' | 'low'
  trend:            'rising' | 'stable' | 'falling'
  opportunityScore: number
  suggestedPrice:   number
  gumroadTitle:     string
  chapters:         string[]
}

const LS_KEY = 'pdfideas:saved'
function loadSaved(): Idea[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function storeSaved(ideas: Idea[]) { localStorage.setItem(LS_KEY, JSON.stringify(ideas)) }

// Animated demo panel — right side hero
const DEMO_IDEAS = [
  { title: '30-Day Budget Reset', score: 91, price: 19, niche: 'Personal Finance', trend: 'Rising' },
  { title: 'Sleep Protocol for Shift Workers', score: 84, price: 14, niche: 'Health & Wellness', trend: 'Rising' },
  { title: 'Toddler Meal Prep Blueprint', score: 88, price: 17, niche: 'Parenting', trend: 'Stable' },
  { title: 'Side Hustle Tax Playbook', score: 79, price: 22, niche: 'Side Hustles', trend: 'Rising' },
]

function DemoPanel() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % DEMO_IDEAS.length), 2800)
    return () => clearInterval(t)
  }, [])
  const idea = DEMO_IDEAS[active]

  return (
    <div className="relative w-full flex flex-col gap-4" aria-label="Live AI idea preview">
      <style>{`
        @keyframes cardIn { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @media (prefers-reduced-motion: reduce) { .demo-card { animation: none !important; } }
      `}</style>

      {/* Status badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit bg-blue-50 border border-blue-100">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        <span className="text-blue-600 text-[11px] font-semibold tracking-wide">AI generating ideas</span>
      </div>

      {/* Cycling idea card */}
      <div key={active} className="demo-card rounded-2xl p-5 flex flex-col gap-3 bg-white border border-gray-100 shadow-sm"
        style={{ animation: 'cardIn 0.38s cubic-bezier(0.23,1,0.32,1) both', boxShadow: '0 2px 24px rgba(37,99,235,0.07)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">{idea.niche}</div>
            <div className="text-gray-900 font-bold text-base leading-snug">{idea.title}</div>
          </div>
          <div className="flex flex-col items-center shrink-0 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <span className="text-emerald-600 font-black text-xl leading-none">{idea.score}</span>
            <span className="text-emerald-500/70 text-[9px] mt-0.5">score</span>
          </div>
        </div>

        {/* Opportunity bar */}
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
            <span>Opportunity score</span><span>{idea.score}/100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${idea.score}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            ${idea.price} suggested
          </span>
          <span className="text-gray-400 text-[10px]">↑ {idea.trend}</span>
        </div>

        {/* Action row */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center bg-blue-600">
            Write Full Guide →
          </div>
          <div className="px-3 py-2 rounded-xl text-xs font-bold bg-pink-100 text-pink-700">
            Gumroad
          </div>
        </div>
      </div>

      {/* Dot nav */}
      <div className="flex gap-1.5 justify-center" role="tablist" aria-label="Idea examples">
        {DEMO_IDEAS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} role="tab" aria-selected={i === active}
            aria-label={`Show idea ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 20 : 6, height: 6,
              background: i === active ? '#2563eb' : '#e2e8f0',
            }} />
        ))}
      </div>

      {/* Feature pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'No signup needed', icon: '✓' },
          { label: 'Gumroad ready', icon: '🛒' },
          { label: 'Free to start', icon: '⚡' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center bg-gray-50 border border-gray-100">
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-gray-500 text-[10px] leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const isHigh = score >= 75
  return (
    <div className={`flex flex-col items-center px-2 py-1.5 rounded-xl shrink-0 ${isHigh ? 'bg-emerald-50' : 'bg-amber-50'}`}>
      <span className={`text-xl font-extrabold leading-none ${isHigh ? 'text-emerald-600' : 'text-amber-600'}`}>{score}</span>
      <span className="text-gray-400 text-[9px] mt-0.5">score</span>
    </div>
  )
}

function IdeaCard({ idea, index, savedIds, onToggleSave }: {
  idea: Idea; index: number; savedIds: Set<string>; onToggleSave: (idea: Idea) => void
}) {
  const isSaved = savedIds.has(idea.title)
  const BADGE: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border border-amber-100',
    low: 'bg-red-50 text-red-700 border border-red-100',
    rising: 'bg-blue-50 text-blue-700 border border-blue-100',
    stable: 'bg-gray-50 text-gray-600 border border-gray-100',
    falling: 'bg-red-50 text-red-600 border border-red-100',
  }
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 bg-white border border-gray-100 hover:border-blue-200 transition-colors duration-200 hover:shadow-sm"
      style={{
        animationDelay: `${index * 55}ms`,
        animation: 'fadeSlideIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{idea.title}</h3>
          <p className="text-gray-500 text-xs leading-snug">{idea.subtitle}</p>
        </div>
        <ScoreBadge score={idea.opportunityScore} />
      </div>

      <p className="text-gray-400 text-xs flex items-center gap-1.5">
        <BookOpen size={11} /> {idea.audience}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: `${idea.searchVolume === 'high' ? 'High' : idea.searchVolume === 'medium' ? 'Med' : 'Low'} Interest`, key: idea.searchVolume },
          { label: `${idea.competition === 'high' ? 'High' : idea.competition === 'medium' ? 'Med' : 'Low'} Competition`, key: idea.competition },
          { label: idea.trend.charAt(0).toUpperCase() + idea.trend.slice(1), key: idea.trend },
        ].map(b => (
          <span key={b.label} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[b.key]}`}>{b.label}</span>
        ))}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
          <DollarSign size={9}/>${idea.suggestedPrice}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1 rounded-full overflow-hidden bg-gray-100">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${idea.opportunityScore}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }} />
      </div>

      <div className="flex gap-2 mt-auto flex-wrap">
        <a href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters))}`}
          className="flex-1 py-2 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors duration-150 active:scale-[0.97]"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <ArrowRight size={12}/> Write Guide
        </a>
        <a href={`https://app.gumroad.com/products/new?name=${encodeURIComponent(idea.gumroadTitle || idea.title)}&price=${idea.suggestedPrice * 100}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold active:scale-[0.97] flex items-center gap-1 bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors duration-150"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <DollarSign size={10}/> Gumroad
        </a>
        <a href="https://www.etsy.com/sell/digital" target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold border border-orange-200 text-orange-600 hover:bg-orange-50 active:scale-[0.97] flex items-center gap-1"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <Store size={10}/> Etsy
        </a>
        <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just found a PDF idea: "${idea.title}" — selling at $${idea.suggestedPrice}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs border border-gray-200 text-gray-400 hover:text-gray-600 active:scale-[0.97]"
          style={{ transition: 'color 150ms, transform 100ms' }}>
          <Share2 size={11}/>
        </a>
        <button onClick={() => onToggleSave(idea)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border active:scale-[0.97] ${isSaved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
          style={{ transition: 'background-color 150ms, border-color 150ms, transform 100ms' }}>
          {isSaved ? <BookmarkCheck size={13}/> : <Bookmark size={13}/>}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [niche, setNiche]       = useState('')
  const [topic, setTopic]       = useState('')
  const [count, setCount]       = useState(10)
  const [ideas, setIdeas]       = useState<Idea[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([])
  const [tab, setTab]           = useState<'generate' | 'saved'>('generate')
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = loadSaved()
    setSavedIdeas(stored)
    setSavedIds(new Set(stored.map(i => i.title)))
  }, [])

  async function generate() {
    if (!niche) { setError('Select a niche first'); return }
    setError(''); setLoading(true); setIdeas([]); setTab('generate')
    try {
      const res  = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ niche, topic, count }) })
      const data = await res.json() as { ideas?: Idea[]; error?: string }
      if (!res.ok || !data.ideas) { setError(data.error ?? 'Failed to generate ideas'); return }
      setIdeas(data.ideas)
    } catch { setError('Network error — try again') }
    finally { setLoading(false) }
  }

  function toggleSave(idea: Idea) {
    setSavedIdeas(prev => {
      const exists = prev.some(i => i.title === idea.title)
      const next   = exists ? prev.filter(i => i.title !== idea.title) : [...prev, idea]
      storeSaved(next); setSavedIds(new Set(next.map(i => i.title))); return next
    })
  }

  const displayIdeas = tab === 'saved' ? savedIdeas : ideas
  const hasResults   = ideas.length > 0 || savedIdeas.length > 0

  return (
    <div className="min-h-screen bg-[#f9fafb]" style={{ color: '#111827' }}>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @media (prefers-reduced-motion: reduce) {
          .hero-animate, .panel-animate, .fade-slide { animation: none !important; }
        }
        .form-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 14px;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: border-color 200ms, box-shadow 200ms;
        }
        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        .form-input::placeholder { color: #9ca3af; }
        select.form-input option { background: #ffffff; color: #111827; }
      `}</style>

      {/* ── HERO — split layout ── */}
      <section className="px-6 py-16 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — headline + generator form */}
          <div className="hero-animate" style={{ animation: mounted ? 'heroIn 0.55s cubic-bezier(0.23,1,0.32,1) both' : undefined }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 bg-blue-50 border border-blue-100">
              <Sparkles size={11} className="text-blue-500" />
              <span className="text-blue-600 text-[11px] font-bold uppercase tracking-widest">AI-powered · Free to start</span>
            </div>

            <h1 className="font-black text-gray-900 mb-4 leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', letterSpacing: '-0.03em' }}>
              Turn niches into<br />
              <span className="text-blue-600">PDF bestsellers</span>
            </h1>

            <p className="text-gray-500 mb-8 leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', maxWidth: 460 }}>
              AI scores real search demand and writes the full guide — ready to list on Gumroad, Etsy, or Ko-fi.
            </p>

            {/* Generator card */}
            <div className="rounded-2xl p-5 mb-5 bg-white border border-gray-100 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block font-medium">Topic (optional)</label>
                  <input className="form-input"
                    placeholder="e.g. meal prep for busy mums..."
                    value={topic} onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generate()} />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block font-medium">
                    Niche <span className="text-blue-500">*</span>
                  </label>
                  <select className="form-input"
                    value={niche} onChange={e => setNiche(e.target.value)}>
                    <option value="">Select niche...</option>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-500 text-xs mb-2 block font-medium">
                  Ideas to generate: <span className="text-gray-900 font-bold">{count}</span>
                </label>
                <input type="range" min={3} max={20} value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-gray-300 text-[10px] mt-1"><span>3</span><span>10</span><span>20</span></div>
              </div>

              {error && <p className="text-red-500 text-xs mb-3 flex items-center gap-1.5">⚠ {error}</p>}

              <button onClick={generate} disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 active:scale-[0.97]"
                style={{ transition: 'background-color 150ms, transform 100ms', boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.25)' }}>
                {loading
                  ? <><span className="animate-spin inline-block">⟳</span> Generating ideas...</>
                  : <><Zap size={16}/> Generate Ideas</>}
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              {['No account needed', 'Free to start', 'Instant results'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — animated demo panel (desktop) */}
          <div className="hidden lg:block panel-animate"
            style={{ animation: mounted ? 'panelIn 0.65s 0.15s cubic-bezier(0.23,1,0.32,1) both' : undefined }}>
            <DemoPanel />
          </div>
        </div>

        {/* Mobile: snap-scroll feature cards */}
        <div className="lg:hidden mt-8 grid grid-cols-3 gap-3">
          {[
            { label: 'Free to start', icon: '⚡' },
            { label: 'Gumroad ready', icon: '🛒' },
            { label: 'Instant results', icon: '✓' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center bg-white border border-gray-100">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-gray-500 text-[10px] leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-16 max-w-7xl mx-auto border-t border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 font-black text-3xl mb-3" style={{ letterSpacing: '-0.025em' }}>From idea to income in 3 steps</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm">No writing experience needed. AI handles research, structure, and content.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', icon: <Target size={22}/>, title: 'Pick your niche', desc: 'Choose from 20 proven niches. AI scores each idea by real search demand and competition gap.', accent: '#2563eb' },
            { n: '02', icon: <Sparkles size={22}/>, title: 'AI writes the guide', desc: 'Full chapter outline, hooks, and body content generated in under 60 seconds. Export as PDF.', accent: '#0ea5e9' },
            { n: '03', icon: <DollarSign size={22}/>, title: 'Publish and earn', desc: 'One-click listing to Gumroad, Etsy, or Ko-fi. Passive income from guides that sell themselves.', accent: '#059669' },
          ].map(s => (
            <div key={s.n} className="rounded-2xl p-6 flex flex-col gap-4 bg-white border border-gray-100 hover:border-blue-200 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black text-gray-300 font-mono">{s.n}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.accent}12`, border: `1px solid ${s.accent}20`, color: s.accent }}>
                  {s.icon}
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-base mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESULTS ── */}
      {hasResults && (
        <section className="px-6 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl border border-gray-100 bg-white w-fit">
            {(['generate', 'saved'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                  tab === t ? 'text-blue-700 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {t === 'generate' ? `Ideas (${ideas.length})` : `Saved (${savedIdeas.length})`}
              </button>
            ))}
          </div>

          {displayIdeas.length === 0
            ? <div className="text-center py-16 text-gray-400 text-sm">
                {tab === 'saved' ? 'No saved ideas yet — generate some above' : 'Generate ideas above'}
              </div>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayIdeas.map((idea, i) => (
                  <IdeaCard key={idea.title} idea={idea} index={i} savedIds={savedIds} onToggleSave={toggleSave} />
                ))}
              </div>
          }
        </section>
      )}

      {/* ── EMPTY STATE ── */}
      {!hasResults && (
        <section className="px-6 pb-20 max-w-7xl mx-auto">
          <div className="rounded-2xl p-12 text-center bg-white border border-gray-100">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">Ready to find your next bestseller?</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">Pick a niche above and hit Generate — AI surfaces high-opportunity PDF ideas with scores, pricing, and full chapter outlines.</p>
          </div>
        </section>
      )}
    </div>
  )
}
