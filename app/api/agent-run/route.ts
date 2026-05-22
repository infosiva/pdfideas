/**
 * POST /api/agent-run
 *
 * Triggers the multi-agent pipeline and streams live logs back via SSE.
 *
 * Request body:
 *   { "task": "Improve landing page conversion", "dryRun": false }
 *
 * Response: text/event-stream
 *   data: {"agent":"ImproverAgent","type":"info","msg":"...","ts":"..."}
 *   ...
 *   data: {"agent":"Pipeline","type":"result","msg":"DONE","result":{...}}
 */

import { NextRequest } from 'next/server'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300   // pipeline can take up to 5 min

export async function POST(req: NextRequest) {
  // Dev-only guard — block if not local/dev env
  const host = req.headers.get('host') ?? ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  if (!isLocal && process.env.NODE_ENV === 'production' && !process.env.ALLOW_AGENT_RUN) {
    return new Response(JSON.stringify({ error: 'Agent run disabled in production. Set ALLOW_AGENT_RUN=1 to enable.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let task: string
  let dryRun: boolean

  try {
    const body = await req.json() as { task?: string; dryRun?: boolean }
    task   = (body.task   ?? 'Improve landing page conversion rate and UX clarity').slice(0, 500)
    dryRun = body.dryRun  ?? false
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // SSE stream
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Lazy-import to avoid loading on startup (keeps cold start fast)
        const { runPipeline, setLogSink } = await import('@/scripts/agent-pipeline')

        // Wire log sink → SSE
        setLogSink((entry) => send(entry))

        send({ agent: 'Pipeline', type: 'info', ts: new Date().toISOString(), msg: `Task: "${task}" | dryRun: ${dryRun}` })

        const result = await runPipeline(task, { dryRun })

        send({
          agent:  'Pipeline',
          type:   'result',
          ts:     new Date().toISOString(),
          msg:    `DONE — status: ${result.status}`,
          result,
        })
      } catch (e: any) {
        send({
          agent: 'Pipeline',
          type:  'error',
          ts:    new Date().toISOString(),
          msg:   `Fatal: ${e.message ?? String(e)}`,
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
