'use client'

/**
 * /dev — Agent Pipeline Dashboard
 *
 * Trigger ImproverAgent → ReviewerAgent → DeployAgent and watch live logs.
 * Dev-only page. Add auth middleware before exposing to public.
 */

import { useState, useRef, useCallback } from 'react'
import { Play, Square, ChevronRight, CheckCircle, XCircle, AlertCircle, Loader, Terminal } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogEntry {
  ts:    string
  agent: string
  type:  'info' | 'warn' | 'error' | 'result'
  msg:   string
  result?: PipelineResult
}

interface PipelineResult {
  status:    'deployed' | 'rejected' | 'error'
  rounds:    number
  summary:   string
  deployLog?: string
  error?:    string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AGENT_COLORS: Record<string, string> = {
  ImproverAgent: 'text-violet-400',
  ReviewerAgent: 'text-cyan-400',
  DeployAgent:   'text-emerald-400',
  Pipeline:      'text-white/60',
  ApplyPatch:    'text-amber-400',
}

const TYPE_COLORS: Record<string, string> = {
  info:   'text-white/50',
  warn:   'text-amber-400',
  error:  'text-red-400',
  result: 'text-white',
}

function agentColor(agent: string) {
  return AGENT_COLORS[agent] ?? 'text-white/40'
}

function typeColor(type: string) {
  return TYPE_COLORS[type] ?? 'text-white/40'
}

function fmtTs(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour12: false })
}

// ── Components ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PipelineResult['status'] | null }) {
  if (!status) return null
  const map = {
    deployed: { label: 'Deployed',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={13}/> },
    rejected: { label: 'Rejected',  color: 'bg-amber-500/20  text-amber-400  border-amber-500/30',  icon: <AlertCircle size={13}/> },
    error:    { label: 'Error',     color: 'bg-red-500/20    text-red-400    border-red-500/30',    icon: <XCircle size={13}/> },
  }
  const { label, color, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${color}`}>
      {icon}{label}
    </span>
  )
}

function AgentPill({ name, active }: { name: string; active: boolean }) {
  const colorMap: Record<string, string> = {
    ImproverAgent: active ? 'border-violet-500/60 bg-violet-500/10 text-violet-300' : 'border-white/10 text-white/20',
    ReviewerAgent: active ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'       : 'border-white/10 text-white/20',
    DeployAgent:   active ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-white/20',
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${colorMap[name] ?? 'border-white/10 text-white/20'}`}>
      {active && <Loader size={12} className="animate-spin"/>}
      <span className="text-xs font-semibold">{name}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DevPage() {
  const [task,      setTask]      = useState('Improve landing page conversion rate and UX clarity')
  const [dryRun,    setDryRun]    = useState(true)
  const [running,   setRunning]   = useState(false)
  const [logs,      setLogs]      = useState<LogEntry[]>([])
  const [result,    setResult]    = useState<PipelineResult | null>(null)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const abortRef  = useRef<AbortController | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const runPipeline = useCallback(async () => {
    if (running) return
    setRunning(true)
    setLogs([])
    setResult(null)
    setActiveAgent(null)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/agent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, dryRun }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error: string }
        setLogs([{ ts: new Date().toISOString(), agent: 'Client', type: 'error', msg: err.error }])
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buf     = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const entry = JSON.parse(line.slice(6)) as LogEntry
            setLogs(prev => [...prev, entry])
            setActiveAgent(entry.agent)
            if (entry.result) {
              setResult(entry.result)
              setActiveAgent(null)
            }
            setTimeout(scrollToBottom, 50)
          } catch { /* skip malformed */ }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setLogs(prev => [...prev, { ts: new Date().toISOString(), agent: 'Client', type: 'error', msg: e.message }])
      }
    } finally {
      setRunning(false)
      setActiveAgent(null)
    }
  }, [task, dryRun, running])

  function stop() {
    abortRef.current?.abort()
    setRunning(false)
    setActiveAgent(null)
  }

  return (
    <div className="min-h-screen" style={{ background: '#080712' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,7,18,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-extrabold text-xl bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              PDFIdeas
            </a>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              DEV
            </span>
          </div>
          <span className="text-white/20 text-xs">Agent Pipeline Dashboard</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Agent Pipeline</h1>
          <p className="text-white/40 text-sm">
            ImproverAgent → ReviewerAgent → DeployAgent. Agents collaborate to improve, review, and ship changes to VPS.
          </p>
        </div>

        {/* Agent flow diagram */}
        <div className="flex items-center gap-2 flex-wrap">
          <AgentPill name="ImproverAgent" active={activeAgent === 'ImproverAgent'} />
          <ChevronRight size={14} className="text-white/20" />
          <AgentPill name="ReviewerAgent" active={activeAgent === 'ReviewerAgent'} />
          <ChevronRight size={14} className="text-white/20" />
          <AgentPill name="DeployAgent"   active={activeAgent === 'DeployAgent'} />
          {result && (
            <>
              <ChevronRight size={14} className="text-white/20" />
              <StatusBadge status={result.status} />
            </>
          )}
        </div>

        {/* Config */}
        <div className="rounded-2xl border border-white/[0.08] p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h2 className="text-white font-bold text-sm uppercase tracking-widest">Task</h2>

          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            disabled={running}
            rows={3}
            placeholder="Describe what the Improver agent should focus on..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none disabled:opacity-50"
          />

          <div className="flex items-center justify-between flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => !running && setDryRun(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${dryRun ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${dryRun ? 'left-0.5' : 'left-5'}`} />
              </div>
              <span className="text-white/60 text-sm">
                {dryRun
                  ? <span className="text-amber-400">Dry run <span className="text-white/30">(no file changes, no deploy)</span></span>
                  : <span className="text-emerald-400">Live mode <span className="text-white/30">(writes files, deploys to VPS)</span></span>
                }
              </span>
            </label>

            <div className="flex gap-3">
              {running
                ? <button onClick={stop}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
                    <Square size={14}/> Stop
                  </button>
                : <button onClick={runPipeline} disabled={!task.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Play size={14}/> Run Pipeline
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Live logs */}
        {(logs.length > 0 || running) && (
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <Terminal size={14} className="text-white/30"/>
              <span className="text-white/40 text-xs font-mono">Live output</span>
              {running && <Loader size={12} className="ml-auto text-violet-400 animate-spin"/>}
            </div>
            <div className="font-mono text-xs p-4 space-y-1 max-h-96 overflow-y-auto">
              {logs.map((entry, i) => (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-white/20 shrink-0 w-20">{fmtTs(entry.ts)}</span>
                  <span className={`shrink-0 w-28 ${agentColor(entry.agent)}`}>{entry.agent}</span>
                  <span className={typeColor(entry.type)}>{entry.msg}</span>
                </div>
              ))}
              <div ref={logsEndRef}/>
            </div>
          </div>
        )}

        {/* Result panel */}
        {result && (
          <div className={`rounded-2xl border p-6 space-y-3 ${
            result.status === 'deployed' ? 'border-emerald-500/20 bg-emerald-500/5' :
            result.status === 'rejected' ? 'border-amber-500/20 bg-amber-500/5' :
                                           'border-red-500/20 bg-red-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <StatusBadge status={result.status} />
              <span className="text-white/30 text-xs">Round {result.rounds}</span>
            </div>
            <p className="text-white/80 text-sm">{result.summary}</p>
            {result.error && (
              <p className="text-red-400 text-xs font-mono">{result.error}</p>
            )}
            {result.deployLog && (
              <details className="mt-2">
                <summary className="text-emerald-400 text-xs cursor-pointer">Deploy log</summary>
                <pre className="mt-2 text-white/40 text-xs font-mono whitespace-pre-wrap bg-black/30 rounded-lg p-3 overflow-x-auto">
                  {result.deployLog}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Info box */}
        <div className="rounded-xl border border-white/[0.06] px-5 py-4 text-white/25 text-xs space-y-1">
          <p><span className="text-violet-400 font-bold">ImproverAgent</span> — reads source files, proposes targeted code changes, applies patches</p>
          <p><span className="text-cyan-400 font-bold">ReviewerAgent</span> — reviews git diff for security issues, broken imports, and correctness</p>
          <p><span className="text-emerald-400 font-bold">DeployAgent</span> — SCPs changed files to VPS, runs remote build, restarts PM2</p>
          <p className="text-amber-400/60 pt-1">Agents loop up to {3} rounds if reviewer rejects — feeding concerns back to improver each time.</p>
        </div>

      </div>
    </div>
  )
}
