'use client'
import { useEffect, useState } from 'react'

interface Stats { pdfsProcessed: number; ideasGenerated: number; pagesAnalyzed: number }

export default function LiveStatsBar() {
  const [stats, setStats] = useState<Stats>({ pdfsProcessed: 0, ideasGenerated: 0, pagesAnalyzed: 0 })

  useEffect(() => {
    fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    const t = setInterval(() => {
      fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  if (stats.pdfsProcessed === 0 && stats.ideasGenerated === 0 && stats.pagesAnalyzed === 0) return null

  const items = [
    { label: 'PDFs processed', value: stats.pdfsProcessed },
    { label: 'Ideas generated', value: stats.ideasGenerated },
    { label: 'Pages analyzed', value: stats.pagesAnalyzed },
  ].filter(i => i.value > 0)

  return (
    <div style={{ borderTop: '1px solid var(--border, #c7d2fe)', borderBottom: '1px solid var(--border, #c7d2fe)', padding: '10px 20px', background: 'var(--surface-2, #eef2ff)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent, #6366f1)', fontVariantNumeric: 'tabular-nums' }}>
              {item.value.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{item.label} this session</span>
          </div>
        ))}
      </div>
    </div>
  )
}
