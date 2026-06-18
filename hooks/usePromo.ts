'use client'
import { useState, useEffect } from 'react'

export function usePromo() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    try {
      const raw = document.cookie.split(';').find(c => c.trim().startsWith('promo_unlocked='))
      if (!raw) return
      const data = JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('=')))
      const elapsed = (Date.now() - data.activatedAt) / 86400000
      const remaining = data.daysUnlocked - elapsed
      if (remaining > 0) { setIsUnlocked(true); setDaysLeft(Math.ceil(remaining)) }
    } catch {}
  }, [])

  return { isUnlocked, daysLeft }
}
