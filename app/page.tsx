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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit bg-[#e879f9]/10 border border-[#e879f9]/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e879f9] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e879f9]" />
        </span>
        <span className="text-[#f0abfc] text-[11px] font-semibold tracking-wide">AI generating ideas</span>
      </div>

      {/* Cycling idea card */}
      <div key={active} className="demo-card rounded-2xl p-5 flex flex-col gap-3 bg-[#2a2640] border border-white/[0.08] shadow-sm"
        style={{ animation: 'cardIn 0.38s cubic-bezier(0.23,1,0.32,1) both', boxShadow: '0 2px 24px rgba(232,121,249,0.07)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#f0abfc] mb-1">{idea.niche}</div>
            <div className="text-[#f3e8ff] font-bold text-base leading-snug">{idea.title}</div>
          </div>
          <div className="flex flex-col items-center shrink-0 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-400 font-black text-xl leading-none">{idea.score}</span>
            <span className="text-emerald-400/70 text-[9px] mt-0.5">score</span>
          </div>
        </div>

        {/* Opportunity bar */}
        <div>
          <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
            <span>Opportunity score</span><span>{idea.score}/100</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${idea.score}%`, background: 'linear-gradient(90deg, #e879f9, #f0abfc)' }} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e879f9]/10 text-[#f0abfc] border border-[#e879f9]/20">
            ${idea.price} suggested
          </span>
          <span className="text-white/40 text-[10px]">↑ {idea.trend}</span>
        </div>

        {/* Action row */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-2 rounded-xl text-xs font-bold text-[#1e1b2e] text-center bg-[#e879f9]">
            Write Full Guide →
          </div>
          <div className="px-3 py-2 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-300">
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
              background: i === active ? '#e879f9' : 'rgba(255,255,255,0.12)',
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
          <div key={s.label} className="rounded-xl p-3 text-center bg-white/[0.04] border border-white/[0.08]">
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-white/50 text-[10px] leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const isHigh = score >= 75
  return (
    <div className={`flex flex-col items-center px-2 py-1.5 rounded-xl shrink-0 ${isHigh ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
      <span className={`text-xl font-extrabold leading-none ${isHigh ? 'text-emerald-400' : 'text-amber-400'}`}>{score}</span>
      <span className="text-white/40 text-[9px] mt-0.5">score</span>
    </div>
  )
}

function IdeaCard({ idea, index, savedIds, onToggleSave }: {
  idea: Idea; index: number; savedIds: Set<string>; onToggleSave: (idea: Idea) => void
}) {
  const isSaved = savedIds.has(idea.title)
  const BADGE: Record<string, string> = {
    high: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    low: 'bg-red-500/10 text-red-300 border border-red-500/20',
    rising: 'bg-[#e879f9]/10 text-[#f0abfc] border border-[#e879f9]/20',
    stable: 'bg-white/[0.04] text-white/50 border border-white/[0.08]',
    falling: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 bg-[#2a2640] border border-white/[0.08] hover:border-[#e879f9]/30 transition-colors duration-200 hover:shadow-sm"
      style={{
        animationDelay: `${index * 55}ms`,
        animation: 'fadeSlideIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-[#f3e8ff] text-sm leading-snug mb-1">{idea.title}</h3>
          <p className="text-white/50 text-xs leading-snug">{idea.subtitle}</p>
        </div>
        <ScoreBadge score={idea.opportunityScore} />
      </div>

      <p className="text-white/40 text-xs flex items-center gap-1.5">
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
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
          <DollarSign size={9}/>${idea.suggestedPrice}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${idea.opportunityScore}%`, background: 'linear-gradient(90deg, #e879f9, #f0abfc)' }} />
      </div>

      <div className="flex gap-2 mt-auto flex-wrap">
        <a href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters))}`}
          className="flex-1 py-2 rounded-xl text-xs font-bold text-[#1e1b2e] text-center flex items-center justify-center gap-1.5 bg-[#e879f9] hover:bg-[#f0abfc] transition-colors duration-150 active:scale-[0.97]"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <ArrowRight size={12}/> Write Guide
        </a>
        <a href={`https://app.gumroad.com/products/new?name=${encodeURIComponent(idea.gumroadTitle || idea.title)}&price=${idea.suggestedPrice * 100}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold active:scale-[0.97] flex items-center gap-1 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 transition-colors duration-150"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <DollarSign size={10}/> Gumroad
        </a>
        <a href="https://www.etsy.com/sell/digital" target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs font-bold border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 active:scale-[0.97] flex items-center gap-1"
          style={{ transition: 'background-color 150ms, transform 100ms' }}>
          <Store size={10}/> Etsy
        </a>
        <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just found a PDF idea: "${idea.title}" — selling at $${idea.suggestedPrice}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl text-xs border border-white/[0.08] text-white/40 hover:text-white/70 active:scale-[0.97]"
          style={{ transition: 'color 150ms, transform 100ms' }}>
          <Share2 size={11}/>
        </a>
        <button onClick={() => onToggleSave(idea)}
          className={`px-3 py-2 rounded-xl text-xs font-medium border active:scale-[0.97] ${isSaved ? 'bg-[#e879f9]/10 text-[#f0abfc] border-[#e879f9]/30' : 'border-white/[0.08] text-white/40 hover:border-white/20'}`}
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
    <div className="min-h-screen bg-[#1e1b2e]" style={{ color: '#f3e8ff' }}>
      <style>{`
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @media (prefers-reduced-motion: reduce) {
          .hero-animate, .panel-animate, .fade-slide { animation: none !important; }
        }
        .form-input {
          width: 100%;
          background: #2a2640;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 14px;
          color: #f3e8ff;
          font-size: 14px;
          outline: none;
          transition: border-color 200ms, box-shadow 200ms;
        }
        .form-input:focus {
          border-color: #e879f9;
          box-shadow: 0 0 0 3px rgba(232,121,249,0.12);
        }
        .form-input::placeholder { color: #9b95b3; }
        select.form-input option { background: #2a2640; color: #f3e8ff; }
      `}</style>

      {/* ── HERO — split layout ── */}
      <section className="px-6 py-16 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — headline + generator form */}
          <div className="hero-animate" style={{ animation: mounted ? 'heroIn 0.55s cubic-bezier(0.23,1,0.32,1) both' : undefined }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 bg-[#e879f9]/10 border border-[#e879f9]/20">
              <Sparkles size={11} className="text-[#f0abfc]" />
              <span className="text-[#f0abfc] text-[11px] font-bold uppercase tracking-widest">AI-powered · Free to start</span>
            </div>

            <h1 className="font-black text-[#f3e8ff] mb-4 leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', letterSpacing: '-0.03em' }}>
              Turn niches into<br />
              <span className="text-[#e879f9]">PDF bestsellers</span>
            </h1>

            <p className="text-white/50 mb-8 leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.4vw, 1.1rem)', maxWidth: 460 }}>
              AI scores real search demand and writes the full guide — ready to list on Gumroad, Etsy, or Ko-fi.
            </p>

            {/* Generator card */}
            <div className="rounded-2xl p-5 mb-5 bg-[#2a2640] border border-white/[0.08] shadow-sm">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block font-medium">Topic (optional)</label>
                  <input className="form-input"
                    placeholder="e.g. meal prep for busy mums..."
                    value={topic} onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && generate()} />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block font-medium">
                    Niche <span className="text-[#f0abfc]">*</span>
                  </label>
                  <select className="form-input"
                    value={niche} onChange={e => setNiche(e.target.value)}>
                    <option value="">Select niche...</option>
                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-white/50 text-xs mb-2 block font-medium">
                  Ideas to generate: <span className="text-[#f3e8ff] font-bold">{count}</span>
                </label>
                <input type="range" min={3} max={20} value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  className="w-full accent-[#e879f9]" />
                <div className="flex justify-between text-white/30 text-[10px] mt-1"><span>3</span><span>10</span><span>20</span></div>
              </div>

              {error && <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5">⚠ {error}</p>}

              <button onClick={generate} disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-[#1e1b2e] text-sm flex items-center justify-center gap-2 disabled:opacity-50 bg-[#e879f9] hover:bg-[#f0abfc] active:scale-[0.97]"
                style={{ transition: 'background-color 150ms, transform 100ms', boxShadow: loading ? 'none' : '0 4px 16px rgba(232,121,249,0.25)' }}>
                {loading
                  ? <><span className="animate-spin inline-block">⟳</span> Generating ideas...</>
                  : <><Zap size={16}/> Generate Ideas</>}
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 text-xs text-white/40">
              {['No account needed', 'Free to start', 'Instant results'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> {t}
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
            <div key={s.label} className="rounded-xl p-3 text-center bg-[#2a2640] border border-white/[0.08]">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-white/50 text-[10px] leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-16 max-w-7xl mx-auto border-t border-white/[0.08]">
        <div className="text-center mb-12">
          <h2 className="text-[#f3e8ff] font-black text-3xl mb-3" style={{ letterSpacing: '-0.025em' }}>From idea to income in 3 steps</h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">No writing experience needed. AI handles research, structure, and content.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', icon: <Target size={22}/>, title: 'Pick your niche', desc: 'Choose from 20 proven niches. AI scores each idea by real search demand and competition gap.', accent: '#e879f9' },
            { n: '02', icon: <Sparkles size={22}/>, title: 'AI writes the guide', desc: 'Full chapter outline, hooks, and body content generated in under 60 seconds. Export as PDF.', accent: '#f0abfc' },
            { n: '03', icon: <DollarSign size={22}/>, title: 'Publish and earn', desc: 'One-click listing to Gumroad, Etsy, or Ko-fi. Passive income from guides that sell themselves.', accent: '#34d399' },
          ].map(s => (
            <div key={s.n} className="rounded-2xl p-6 flex flex-col gap-4 bg-[#2a2640] border border-white/[0.08] hover:border-[#e879f9]/30 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black text-white/30 font-mono">{s.n}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.accent}1a`, border: `1px solid ${s.accent}30`, color: s.accent }}>
                  {s.icon}
                </div>
              </div>
              <div>
                <h3 className="text-[#f3e8ff] font-bold text-base mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESULTS ── */}
      {hasResults && (
        <section className="px-6 pb-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl border border-white/[0.08] bg-[#2a2640] w-fit">
            {(['generate', 'saved'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                  tab === t ? 'text-[#f0abfc] bg-[#e879f9]/10' : 'text-white/40 hover:text-white/70'
                }`}>
                {t === 'generate' ? `Ideas (${ideas.length})` : `Saved (${savedIdeas.length})`}
              </button>
            ))}
          </div>

          {displayIdeas.length === 0
            ? <div className="text-center py-16 text-white/40 text-sm">
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
          <div className="rounded-2xl p-12 text-center bg-[#2a2640] border border-white/[0.08]">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-[#f3e8ff] font-bold text-lg mb-2">Ready to find your next bestseller?</h3>
            <p className="text-white/40 text-sm max-w-sm mx-auto">Pick a niche above and hit Generate — AI surfaces high-opportunity PDF ideas with scores, pricing, and full chapter outlines.</p>
          </div>
        </section>
      )}
    </div>
  )
}
