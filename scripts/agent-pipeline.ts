/**
 * scripts/agent-pipeline.ts
 *
 * Multi-agent pipeline for pdfideas:
 *   ImproverAgent  → analyses site, proposes + applies code changes
 *   ReviewerAgent  → reads the diff, approves or rejects with reasons
 *   DeployAgent    → on approval: scp + ssh rebuild + pm2 restart on VPS
 *
 * Run locally:
 *   npx tsx scripts/agent-pipeline.ts
 *
 * Or trigger via API:
 *   POST /api/agent-run  { "task": "improve landing page conversion" }
 *
 * Requires env vars:
 *   ANTHROPIC_API_KEY      — Claude API key
 *   VPS_HOST               — e.g. root@31.97.56.148
 *   VPS_SSH_PASS           — sshpass password (or leave blank to use SSH key)
 *   PIPELINE_MAX_ROUNDS    — max improver→reviewer loops (default: 3)
 */

import { execSync, exec } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT        = path.resolve(__dirname, '..')
const MAX_ROUNDS  = parseInt(process.env.PIPELINE_MAX_ROUNDS ?? '3', 10)
const VPS_HOST    = process.env.VPS_HOST    ?? 'root@31.97.56.148'
const VPS_PASS    = process.env.VPS_SSH_PASS ?? ''
const VPS_APP_DIR = process.env.VPS_APP_DIR ?? '/root/pdfideas'
const PM2_NAME    = process.env.PM2_NAME    ?? 'pdfideas'

// ── Logger ────────────────────────────────────────────────────────────────────

export type LogEntry = { ts: string; agent: string; type: 'info' | 'warn' | 'error' | 'result'; msg: string }
type LogSink = (entry: LogEntry) => void

let _sink: LogSink = (e) => console.log(`[${e.ts}] [${e.agent}] ${e.msg}`)

export function setLogSink(fn: LogSink) { _sink = fn }

function log(agent: string, type: LogEntry['type'], msg: string) {
  _sink({ ts: new Date().toISOString(), agent, type, msg })
}

// ── AI caller — uses lib/ai.ts fallback chain (Groq→Gemini→Cerebras→OpenAI→Anthropic) ──

// Direct OpenAI-compat call (no Next.js dependency)
async function callOpenAICompat(
  baseUrl: string, providerName: string, key: string,
  model: string, system: string, userMsg: string, maxTokens: number,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
    }),
  })
  if (!res.ok) {
    const e = await res.text()
    throw new Error(`${providerName}/${model} ${res.status}: ${e.slice(0, 200)}`)
  }
  const data = await res.json() as { choices: { message: { content: string } }[] }
  return data.choices?.[0]?.message?.content ?? ''
}

async function askAI(
  system: string,
  userMsg: string,
  maxTokens = 4096,
  _quality: 'fast' | 'balanced' | 'best' = 'best',
): Promise<string> {
  type Provider = { name: string; fn: () => Promise<string> }

  const groqKey     = process.env.GROQ_API_KEY ?? ''
  const geminiKey   = process.env.GEMINI_API_KEY ?? ''
  const cerebrasKey = process.env.CEREBRAS_API_KEY ?? ''
  const openaiKey   = process.env.OPENAI_API_KEY ?? ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? ''

  const providers: Provider[] = [
    // 1. Ollama local — free, highest priority
    ...(process.env.OLLAMA_HOST ? [
      { name: 'ollama/qwen3.6', fn: () => callOpenAICompat(`${process.env.OLLAMA_HOST}/v1`, 'Ollama', '', 'qwen3.6:latest', system, userMsg, maxTokens) },
      { name: 'ollama/gemma4',  fn: () => callOpenAICompat(`${process.env.OLLAMA_HOST}/v1`, 'Ollama', '', 'gemma4:latest',  system, userMsg, maxTokens) },
      { name: 'ollama/llama3.2',fn: () => callOpenAICompat(`${process.env.OLLAMA_HOST}/v1`, 'Ollama', '', 'llama3.2:latest',system, userMsg, maxTokens) },
    ] : []),
    // 2. Groq — free tier
    ...(groqKey ? [
      { name: 'groq/llama-4-scout', fn: () => callOpenAICompat('https://api.groq.com/openai/v1', 'Groq', groqKey, 'meta-llama/llama-4-scout-17b-16e-instruct', system, userMsg, Math.min(maxTokens, 8000)) },
      { name: 'groq/llama-3.3-70b', fn: () => callOpenAICompat('https://api.groq.com/openai/v1', 'Groq', groqKey, 'llama-3.3-70b-versatile', system, userMsg, Math.min(maxTokens, 8000)) },
    ] : []),
    // 3. Gemini — free tier
    ...(geminiKey ? [
      { name: 'gemini/2.5-flash', fn: () => callOpenAICompat('https://generativelanguage.googleapis.com/v1beta/openai', 'Gemini', geminiKey, 'gemini-2.5-flash', system, userMsg, maxTokens) },
    ] : []),
    // 4. Cerebras — free tier
    ...(cerebrasKey ? [
      { name: 'cerebras/qwen3', fn: () => callOpenAICompat('https://api.cerebras.ai/v1', 'Cerebras', cerebrasKey, 'qwen-3-235b-a22b-instruct-2507', system, userMsg, maxTokens) },
    ] : []),
    // 5. OpenAI — paid
    ...(openaiKey ? [
      { name: 'openai/gpt-4o', fn: () => callOpenAICompat('https://api.openai.com/v1', 'OpenAI', openaiKey, 'gpt-4o', system, userMsg, maxTokens) },
    ] : []),
    // 6. Anthropic — paid, last resort
    ...(anthropicKey ? [
      { name: 'anthropic', fn: async () => {
        const { default: Anthropic } = await import('@anthropic-ai/sdk')
        const client = new Anthropic({ apiKey: anthropicKey })
        const res = await client.messages.create({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, system, messages: [{ role: 'user', content: userMsg }] })
        const block = res.content.find(b => b.type === 'text') as { text: string } | undefined
        return block?.text ?? ''
      }},
    ] : []),
  ]

  const tried: string[] = []
  for (const { name, fn } of providers) {
    try {
      const text = await fn()
      if (text) {
        if (tried.length) log('AI', 'warn', `fell back to ${name} after: ${tried.join(' → ')}`)
        else log('AI', 'info', `using ${name}`)
        return text
      }
    } catch (e: any) {
      tried.push(`${name}(${(e.message ?? '').slice(0, 60)})`)
    }
  }
  throw new Error(`All AI providers exhausted. Tried: ${tried.join(' | ')}`)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readProjectFiles(): string {
  const targets = [
    'app/page.tsx',
    'app/generate/page.tsx',
    'app/api/ideas/route.ts',
    'app/api/generate/route.ts',
    'lib/ai.ts',
    'vertical.config.ts',
  ]
  const parts: string[] = []
  for (const rel of targets) {
    const full = path.join(ROOT, rel)
    if (existsSync(full)) {
      parts.push(`\n\n=== ${rel} ===\n${readFileSync(full, 'utf-8')}`)
    }
  }
  return parts.join('')
}

// Scope diff to only source files — excludes package-lock.json, node_modules, etc.
const DIFF_PATHS = 'app/ lib/ components/ vertical.config.ts'

function getGitDiff(): string {
  try {
    return execSync(`git diff HEAD -- ${DIFF_PATHS}`, { cwd: ROOT, encoding: 'utf-8' })
  } catch {
    return ''
  }
}

function getStagedDiff(): string {
  try {
    return execSync(`git diff --cached -- ${DIFF_PATHS}`, { cwd: ROOT, encoding: 'utf-8' })
  } catch {
    return ''
  }
}

function applyChanges(patches: PatchInstruction[]): string[] {
  const applied: string[] = []
  for (const patch of patches) {
    const fullPath = path.join(ROOT, patch.file)
    try {
      if (patch.action === 'replace' && existsSync(fullPath)) {
        const original = readFileSync(fullPath, 'utf-8')
        if (!original.includes(patch.oldStr!)) {
          log('ApplyPatch', 'warn', `Could not find oldStr in ${patch.file} — skipping`)
          continue
        }
        const updated = original.replace(patch.oldStr!, patch.newStr!)
        writeFileSync(fullPath, updated, 'utf-8')
        applied.push(`REPLACE in ${patch.file}`)
      } else if (patch.action === 'write') {
        writeFileSync(fullPath, patch.content!, 'utf-8')
        applied.push(`WRITE ${patch.file}`)
      }
    } catch (e: any) {
      log('ApplyPatch', 'error', `Failed to apply patch to ${patch.file}: ${e.message}`)
    }
  }
  return applied
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PatchInstruction {
  action:  'replace' | 'write'
  file:    string
  oldStr?: string   // for action=replace
  newStr?: string   // for action=replace
  content?: string  // for action=write
}

interface ImproverOutput {
  summary:  string
  patches:  PatchInstruction[]
  rationale: string
}

interface ReviewerOutput {
  approved:  boolean
  score:     number   // 0-100
  reasoning: string
  concerns:  string[]
  suggestions: string[]
}

export interface PipelineResult {
  status:    'deployed' | 'rejected' | 'error'
  rounds:    number
  summary:   string
  deployLog?: string
  error?:    string
}

// ── ImproverAgent ─────────────────────────────────────────────────────────────

const IMPROVER_SYSTEM = `You are an expert Next.js 15 developer and UX designer.
You analyse a web application's source code and propose CONCRETE, SAFE improvements.

Rules:
- Only change existing files — no new dependencies
- Changes must improve: conversion rate, UX clarity, performance, or reliability
- Each patch must be minimal and targeted — do not rewrite entire files
- Return ONLY valid JSON matching the schema below — no markdown fences, no explanation outside JSON

Response schema:
{
  "summary": "1-2 sentence human-readable summary of what you changed and why",
  "rationale": "why these specific changes improve the product",
  "patches": [
    {
      "action": "replace",
      "file": "app/page.tsx",
      "oldStr": "exact string to find (must be unique in the file)",
      "newStr": "replacement string"
    }
  ]
}

Focus areas: landing page copy, loading states, error messages, CTA clarity, accessibility.
Be conservative — prefer 1-3 high-impact changes over many small ones.`

async function runImproverAgent(
  task: string,
  previousConcerns: string[] = [],
): Promise<ImproverOutput | null> {
  log('ImproverAgent', 'info', `Starting — task: "${task}"`)

  const codeSnapshot = readProjectFiles()
  const concernsNote = previousConcerns.length
    ? `\n\nPrevious reviewer concerns to address:\n${previousConcerns.map(c => `- ${c}`).join('\n')}`
    : ''

  const userMsg = `Task: ${task}${concernsNote}

Current codebase:
${codeSnapshot}

Analyse the code and propose improvements. Return JSON only.`

  try {
    const raw = await askAI(IMPROVER_SYSTEM, userMsg, 4096, 'best')
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as ImproverOutput
    log('ImproverAgent', 'result', `Proposed ${parsed.patches.length} patches: ${parsed.summary}`)
    return parsed
  } catch (e: any) {
    log('ImproverAgent', 'error', `Failed: ${e.message}`)
    return null
  }
}

// ── ReviewerAgent ─────────────────────────────────────────────────────────────

const REVIEWER_SYSTEM = `You are a senior code reviewer and QA engineer.
You review git diffs of a Next.js 15 App Router application.

Your job: decide if the changes are SAFE TO DEPLOY to a VPS running PM2.

Approve if:
- No security vulnerabilities introduced (XSS, injection, auth bypass, data exposure)
- No broken imports or missing dependencies
- No TypeScript errors obvious from context
- Changes actually improve the product as claimed
- No infinite loops, unhandled promises, or obvious runtime errors

Reject if any of the above are violated.

Return ONLY valid JSON:
{
  "approved": true/false,
  "score": 0-100,
  "reasoning": "main reason for decision",
  "concerns": ["list of specific issues if rejected or flagged"],
  "suggestions": ["optional improvements for next round"]
}`

async function runReviewerAgent(
  improverSummary: string,
  appliedPatches: string[],
): Promise<ReviewerOutput | null> {
  log('ReviewerAgent', 'info', 'Starting code review...')

  const diff = getGitDiff() || getStagedDiff()
  if (!diff) {
    log('ReviewerAgent', 'warn', 'No diff found — treating as approved with score 50')
    return { approved: true, score: 50, reasoning: 'No changes detected', concerns: [], suggestions: [] }
  }

  const userMsg = `Improver claimed: "${improverSummary}"
Applied patches: ${appliedPatches.join(', ')}

Git diff:
\`\`\`diff
${diff.slice(0, 8000)}
\`\`\`

Review these changes and return JSON only.`

  try {
    const raw = await askAI(REVIEWER_SYSTEM, userMsg, 2048, 'balanced')
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as ReviewerOutput
    log('ReviewerAgent', parsed.approved ? 'result' : 'warn',
      `${parsed.approved ? 'APPROVED' : 'REJECTED'} (score: ${parsed.score}) — ${parsed.reasoning}`)
    return parsed
  } catch (e: any) {
    log('ReviewerAgent', 'error', `Failed: ${e.message}`)
    return null
  }
}

// ── DeployAgent ───────────────────────────────────────────────────────────────

const SSH_CMD = VPS_PASS
  ? `sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no ${VPS_HOST}`
  : `ssh -o StrictHostKeyChecking=no ${VPS_HOST}`

const SCP_CMD = VPS_PASS
  ? `sshpass -p "${VPS_PASS}" scp -o StrictHostKeyChecking=no`
  : `scp -o StrictHostKeyChecking=no`

async function runDeployAgent(patches: PatchInstruction[]): Promise<string> {
  log('DeployAgent', 'info', `Deploying ${patches.length} changed files to ${VPS_HOST}`)

  const deployLog: string[] = []

  try {
    // 1. Upload changed files
    for (const patch of patches) {
      const localPath  = path.join(ROOT, patch.file)
      const remotePath = `${VPS_HOST}:${VPS_APP_DIR}/${patch.file}`
      if (!existsSync(localPath)) continue

      log('DeployAgent', 'info', `Uploading ${patch.file}...`)
      const { stdout, stderr } = await execAsync(`${SCP_CMD} "${localPath}" "${remotePath}"`)
      deployLog.push(`scp ${patch.file}: ${stdout || stderr || 'ok'}`)
    }

    // 2. Remote rebuild
    log('DeployAgent', 'info', 'Running remote build...')
    const buildCmd = `${SSH_CMD} "cd ${VPS_APP_DIR} && npm run build 2>&1 | tail -20"`
    const { stdout: buildOut } = await execAsync(buildCmd, { timeout: 120_000 })
    deployLog.push(`build: ${buildOut.slice(0, 500)}`)

    // 3. PM2 restart
    log('DeployAgent', 'info', `Restarting PM2 process: ${PM2_NAME}`)
    const restartCmd = `${SSH_CMD} "pm2 restart ${PM2_NAME} && pm2 status"`
    const { stdout: pm2Out } = await execAsync(restartCmd, { timeout: 30_000 })
    deployLog.push(`pm2: ${pm2Out.slice(0, 300)}`)

    log('DeployAgent', 'result', 'Deploy complete')
    return deployLog.join('\n')

  } catch (e: any) {
    log('DeployAgent', 'error', `Deploy failed: ${e.message}`)
    throw e
  }
}

// ── Pipeline Orchestrator ─────────────────────────────────────────────────────

export async function runPipeline(
  task = 'Improve landing page conversion rate and UX clarity',
  opts: { dryRun?: boolean } = {},
): Promise<PipelineResult> {
  let concerns: string[] = []
  let lastImprover: ImproverOutput | null = null
  let lastApplied: string[] = []

  log('Pipeline', 'info', `Starting pipeline. Task: "${task}" | Max rounds: ${MAX_ROUNDS}`)

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    log('Pipeline', 'info', `── Round ${round}/${MAX_ROUNDS} ──`)

    // ── Step 1: ImproverAgent ────────────────────────────────────────────────
    const improver = await runImproverAgent(task, concerns)
    if (!improver) {
      return { status: 'error', rounds: round, summary: 'ImproverAgent failed to produce output', error: 'ImproverAgent parse error' }
    }
    lastImprover = improver

    // ── Apply patches ────────────────────────────────────────────────────────
    if (!opts.dryRun) {
      lastApplied = applyChanges(improver.patches)
      log('Pipeline', 'info', `Applied: ${lastApplied.join(', ') || 'no patches applied'}`)
    } else {
      lastApplied = improver.patches.map(p => `[DRY-RUN] ${p.action} ${p.file}`)
      log('Pipeline', 'info', `Dry run — would apply: ${lastApplied.join(', ')}`)
    }

    // ── Step 2: ReviewerAgent ────────────────────────────────────────────────
    const reviewer = await runReviewerAgent(improver.summary, lastApplied)
    if (!reviewer) {
      return { status: 'error', rounds: round, summary: 'ReviewerAgent failed', error: 'ReviewerAgent parse error' }
    }

    if (reviewer.approved) {
      log('Pipeline', 'info', `Reviewer approved (score ${reviewer.score}). Proceeding to deploy.`)

      // ── Step 3: DeployAgent ──────────────────────────────────────────────
      if (opts.dryRun) {
        log('Pipeline', 'info', '[DRY-RUN] Skipping deploy')
        return {
          status: 'deployed',
          rounds: round,
          summary: improver.summary,
          deployLog: '[DRY-RUN] Deploy skipped',
        }
      }

      try {
        const deployLog = await runDeployAgent(improver.patches)
        return { status: 'deployed', rounds: round, summary: improver.summary, deployLog }
      } catch (e: any) {
        return { status: 'error', rounds: round, summary: improver.summary, error: `Deploy failed: ${e.message}` }
      }
    }

    // Rejected — feed concerns back to ImproverAgent next round
    concerns = reviewer.concerns
    log('Pipeline', 'warn', `Round ${round} rejected. Concerns: ${concerns.join(' | ')}`)

    if (round === MAX_ROUNDS) {
      return {
        status: 'rejected',
        rounds: round,
        summary: lastImprover?.summary ?? 'No summary',
        error: `Max rounds reached. Final concerns: ${concerns.join('; ')}`,
      }
    }
  }

  return { status: 'error', rounds: MAX_ROUNDS, summary: 'Pipeline exhausted', error: 'Should not reach here' }
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  // Load .env.local for CLI runs (Next.js does this automatically but tsx does not)
  try {
    const envPath = path.resolve(__dirname, '../.env.local')
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (key && !(key in process.env)) process.env[key] = val
    }
  } catch { /* .env.local optional */ }

  const args    = process.argv.slice(2).filter(a => !a.startsWith('--'))
  const dryRun  = process.argv.includes('--dry-run')
  const task    = args.join(' ') || 'Improve landing page conversion rate and UX clarity'

  console.log(`\n🤖 pdfideas Agent Pipeline\n${'─'.repeat(50)}`)
  console.log(`Task:    ${task}`)
  console.log(`Dry run: ${dryRun}`)
  console.log(`${'─'.repeat(50)}\n`)

  runPipeline(task, { dryRun }).then(result => {
    console.log('\n' + '─'.repeat(50))
    console.log(`Status:  ${result.status.toUpperCase()}`)
    console.log(`Rounds:  ${result.rounds}`)
    console.log(`Summary: ${result.summary}`)
    if (result.deployLog) console.log(`Deploy:\n${result.deployLog}`)
    if (result.error) console.log(`Error:   ${result.error}`)
    process.exit(result.status === 'deployed' ? 0 : 1)
  }).catch(e => {
    console.error('Fatal:', e)
    process.exit(1)
  })
}
