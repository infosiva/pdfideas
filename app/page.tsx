'use client'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, DollarSign, BookOpen, ArrowRight, Download, Share2, Bookmark, BookmarkCheck, Store } from 'lucide-react'

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

const BADGE: Record<string, string> = {
  high:    'bg-green-500/20 text-green-400',
  medium:  'bg-amber-500/20 text-amber-400',
  low:     'bg-red-500/20 text-red-400',
  rising:  'bg-violet-500/20 text-violet-400',
  stable:  'bg-blue-500/20 text-blue-400',
  falling: 'bg-red-500/20 text-red-400',
}

const LS_KEY = 'pdfideas:saved'

function loadSaved(): Idea[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function storeSaved(ideas: Idea[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ideas))
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-extrabold ${color}`}>{score}</span>
      <span className="text-white/30 text-[10px]">score</span>
    </div>
  )
}

function IdeaCard({ idea, index, savedIds, onToggleSave }: {
  idea: Idea; index: number
  savedIds: Set<string>; onToggleSave: (idea: Idea) => void
}) {
  const isSaved = savedIds.has(idea.title)
  return (
    <div
      className="rounded-2xl border border-white/[0.08] p-5 flex flex-col gap-3 hover:border-violet-500/30 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        animationDelay: `${index * 60}ms`,
        animation: 'fadeSlideIn 0.35s cubic-bezier(0.23,1,0.32,1) both',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-white text-sm leading-snug mb-1">{idea.title}</h3>
          <p className="text-white/45 text-xs leading-snug">{idea.subtitle}</p>
        </div>
        <ScoreBadge score={idea.opportunityScore} />
      </div>

      {/* Audience */}
      <p className="text-white/35 text-xs flex items-center gap-1.5">
        <BookOpen size={11} /> {idea.audience}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.searchVolume]}`}>
          {idea.searchVolume === 'high' ? 'High' : idea.searchVolume === 'medium' ? 'Med' : 'Low'} Interest
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.competition]}`}>
          {idea.competition === 'high' ? 'High' : idea.competition === 'medium' ? 'Med' : 'Low'} Competition
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE[idea.trend]}`}>
          {idea.trend.charAt(0).toUpperCase() + idea.trend.slice(1)}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
          <DollarSign size={9}/>${idea.suggestedPrice}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1 flex-wrap">
        <a
          href={`/generate?title=${encodeURIComponent(idea.title)}&subtitle=${encodeURIComponent(idea.subtitle)}&audience=${encodeURIComponent(idea.audience)}&painPoint=${encodeURIComponent(idea.painPoint)}&chapters=${encodeURIComponent(JSON.stringify(idea.chapters))}`}
          className="flex-1 py-2 rounded-lg text-xs font-medium text-white text-center flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          <ArrowRight size={12}/> Write Guide
        </a>
        {/* Gumroad */}
        <a
          href={`https://app.gumroad.com/products/new?name=${encodeURIComponent(idea.gumroadTitle || idea.title)}&price=${idea.suggestedPrice * 100}&description=${encodeURIComponent(idea.subtitle)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.97] flex items-center gap-1"
          style={{ background: '#ff90e8', color: '#000' }}
          title="List on Gumroad"
        >
          <DollarSign size={10}/> Gumroad
        </a>
        {/* Etsy */}
        <a
          href={`https://www.etsy.com/sell/digital`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg text-xs font-bold border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-all active:scale-[0.97] flex items-center gap-1"
          title="Sell on Etsy"
        >
          <Store size={10}/> Etsy
        </a>
        {/* Share on X */}
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(`Just found a 🔥 PDF idea: "${idea.title}" — ${idea.audience} — selling at $${idea.suggestedPrice}\n\nGenerate yours free →`)}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-lg text-xs font-bold border border-white/10 text-white/40 hover:text-white transition-all active:scale-[0.97]"
          title="Share on X"
        >
          <Share2 size={11}/>
        </a>
        {/* Save */}
        <button
          onClick={() => onToggleSave(idea)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-[0.97] border ${
            isSaved
              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
              : 'border-white/10 text-white/40 hover:border-white/25'
          }`}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          {isSaved ? <BookmarkCheck size={13}/> : <Bookmark size={13}/>}
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [niche, setNiche]     = useState('')
  const [topic, setTopic]     = useState('')
  const [count, setCount]     = useState(10)
  const [ideas, setIdeas]     = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([])
  const [tab, setTab]         = useState<'generate' | 'saved'>('generate')

  // Hydrate from localStorage
  useEffect(() => {
    const stored = loadSaved()
    setSavedIdeas(stored)
    setSavedIds(new Set(stored.map(i => i.title)))
  }, [])

  async function generate() {
    if (!niche) { setError('Select a niche'); return }
    setError('')
    setLoading(true)
    setIdeas([])
    setTab('generate')
    try {
      const res  = await fetch('/api/ideas', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ niche, topic, count }),
      })
      const data = await res.json() as { ideas?: Idea[]; error?: string }
      if (!res.ok || !data.ideas) { setError(data.error ?? 'Failed to generate ideas'); return }
      setIdeas(data.ideas)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  function toggleSave(idea: Idea) {
    setSavedIdeas(prev => {
      const exists = prev.some(i => i.title === idea.title)
      const next   = exists ? prev.filter(i => i.title !== idea.title) : [...prev, idea]
      storeSaved(next)
      setSavedIds(new Set(next.map(i => i.title)))
      return next
    })
  }

  const displayIdeas = tab === 'saved' ? savedIdeas : ideas

  return (
    <div className="min-h-screen" style={{ background: '#080712' }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20 mb-4">
            <Zap size={12} /> Find trending PDF ideas · AI writes the full guide · Sell for $9–$27
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Generate PDF Guide Ideas
          </h1>
          <p className="text-white/45 text-lg">Find trending PDF guide ideas based on real search data</p>
        </div>

        {/* Generator card */}
        <div className="rounded-2xl border border-white/[0.08] p-6 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)' }}>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Topic */}
            <div className="md:col-span-1">
              <label className="text-white/40 text-xs mb-1.5 block">Topic or Problem (Optional)</label>
              <input
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-violet-500/50 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)' }}
                placeholder="e.g. healthy meal planning for busy parents..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </div>

            {/* Niche */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Niche <span className="text-red-400">*</span></label>
              <select
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white border border-white/10 outline-none focus:border-violet-500/50 transition-colors"
                style={{ background: 'rgba(15,12,30,0.9)' }}
                value={niche}
                onChange={e => setNiche(e.target.value)}
              >
                <option value="">Select niche...</option>
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">
                Number of Ideas: <span className="text-white font-bold">{count}</span>
              </label>
              <input type="range" min={3} max={20} value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-violet-500 mt-2" />
              <div className="flex justify-between text-white/25 text-xs mt-1">
                <span>3</span><span>10</span><span>20</span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
          >
            <Zap size={16} />
            {loading ? 'Generating ideas...' : 'Generate Ideas'}
          </button>
        </div>

        {/* Tab bar — shown when we have ideas or saved */}
        {(ideas.length > 0 || savedIdeas.length > 0) && (
          <div className="flex items-center gap-1 mb-5 p-1 rounded-xl border border-white/[0.06] w-fit"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <button
              onClick={() => setTab('generate')}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === 'generate'
                  ? 'bg-violet-500/25 text-violet-300'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Generated {ideas.length > 0 ? `(${ideas.length})` : ''}
            </button>
            <button
              onClick={() => setTab('saved')}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                tab === 'saved'
                  ? 'bg-violet-500/25 text-violet-300'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Bookmark size={11}/> Saved {savedIdeas.length > 0 ? `(${savedIdeas.length})` : ''}
            </button>
          </div>
        )}

        {/* Results header */}
        {displayIdeas.length > 0 && (
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-white/40 text-sm">
              {tab === 'generate'
                ? <>Generated <strong className="text-white">{ideas.length}</strong> ideas for <strong className="text-violet-400">{niche}</strong></>
                : <><strong className="text-white">{savedIdeas.length}</strong> saved ideas</>
              }
            </p>
            {tab === 'generate' && ideas.length > 0 && (
              <button
                onClick={() => {
                  const text = ideas.map((idea, i) =>
                    `#${i+1} ${idea.title}\n${idea.subtitle}\nAudience: ${idea.audience}\nPrice: $${idea.suggestedPrice}\nChapters: ${idea.chapters.join(', ')}`
                  ).join('\n\n---\n\n')
                  const blob = new Blob([text], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href = url
                  a.download = `${niche.replace(/\s/g,'-')}-pdf-ideas.txt`
                  a.click(); URL.revokeObjectURL(url)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white border border-white/10 hover:border-violet-500/40 transition-all"
              >
                <Download size={13}/> Export All
              </button>
            )}
          </div>
        )}

        {/* Ideas grid */}
        {displayIdeas.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {displayIdeas.map((idea, i) => (
              <IdeaCard key={`${idea.title}-${i}`} idea={idea} index={i} savedIds={savedIds} onToggleSave={toggleSave} />
            ))}
          </div>
        )}

        {/* Saved empty state */}
        {tab === 'saved' && savedIdeas.length === 0 && (
          <div className="text-center py-16 text-white/25">
            <Bookmark size={36} className="mx-auto mb-4 opacity-30" />
            <p>No saved ideas yet — bookmark ideas with the <Bookmark size={12} className="inline"/> button</p>
          </div>
        )}

        {/* Generate empty state */}
        {!loading && tab === 'generate' && ideas.length === 0 && (
          <div className="text-center py-16 text-white/25">
            <TrendingUp size={40} className="mx-auto mb-4 opacity-30" />
            <p>Select a niche and hit Generate Ideas</p>
          </div>
        )}
      </div>
    </div>
  )
}
