import React, { useEffect, useState } from 'react'
import { t } from '../../theme/tokens'
import { quoteOfDay } from '../../data/motivation'
import { todayKey } from '../../utils/date'
import { useI18n } from '../../i18n/i18n'

// Daily motivation — shown as a floating toast when the user opens
// the home page for the first time each day, then auto-dismisses.
// Not a permanent card (used to take too much room on the dashboard).

const LAST_SHOWN_KEY = 'hfos:daily_shown'
const AUTO_DISMISS_MS = 7000

export function DailyBoost() {
  const { isRTL } = useI18n()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const quote = quoteOfDay()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(LAST_SHOWN_KEY) === todayKey()) return
    // Mount hidden, transition to visible so CSS animation runs
    const enterTimer = setTimeout(() => setVisible(true), 250)
    const leaveTimer = setTimeout(() => setLeaving(true), AUTO_DISMISS_MS)
    const removeTimer = setTimeout(() => {
      localStorage.setItem(LAST_SHOWN_KEY, todayKey())
      setVisible(false)
    }, AUTO_DISMISS_MS + 500)
    return () => { clearTimeout(enterTimer); clearTimeout(leaveTimer); clearTimeout(removeTimer) }
  }, [])

  const dismiss = () => {
    localStorage.setItem(LAST_SHOWN_KEY, todayKey())
    setLeaving(true)
    setTimeout(() => setVisible(false), 300)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(24px + env(safe-area-inset-bottom))',
      insetInlineStart: '50%',
      transform: `translateX(${isRTL ? '50%' : '-50%'}) ${leaving ? 'translateY(20px)' : 'translateY(0)'}`,
      opacity: leaving ? 0 : 1,
      transition: 'opacity 300ms ease, transform 300ms ease',
      zIndex: 400,
      maxWidth: 'min(440px, calc(100vw - 32px))',
      pointerEvents: 'auto',
    }}>
      <div style={{
        position: 'relative',
        padding: '18px 44px 18px 20px',
        background: `linear-gradient(135deg, ${t.color.charcoal} 0%, ${t.color.bgElevated} 100%)`,
        border: `1px solid ${t.color.wineLight}44`,
        borderRadius: t.radius.lg,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        color: t.color.text,
      }}>
        <button
          onClick={dismiss}
          aria-label={isRTL ? 'סגור' : 'Close'}
          style={{
            position: 'absolute',
            top: 8, insetInlineEnd: 8,
            width: 28, height: 28,
            background: 'transparent', border: 'none',
            color: t.color.silver2, cursor: 'pointer',
            fontSize: 20, lineHeight: 1,
          }}
        >×</button>

        <div style={{
          fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: t.color.wineLight, marginBottom: 8,
        }}>
          {isRTL ? 'המשפט של היום' : 'Quote of the day'}
        </div>

        <div style={{
          fontSize: 15, lineHeight: 1.55, fontStyle: 'italic',
          color: t.color.bone, marginBottom: 8,
        }}>
          &ldquo;{quote.text}&rdquo;
        </div>

        <div style={{
          fontSize: 11, color: t.color.silver2, fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          — {quote.author}
        </div>
      </div>
    </div>
  )
}
