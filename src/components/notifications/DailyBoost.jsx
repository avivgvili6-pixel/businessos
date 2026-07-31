import React, { useEffect, useState } from 'react'
import { t } from '../../theme/tokens'
import { Card, Button, Badge } from '../ui/UI'
import { quoteOfDay } from '../../data/motivation'
import { todayKey } from '../../utils/date'

// Daily motivation card - shown on home page.
// Also handles Web Notifications API opt-in for those who want a
// push-style reminder when the app is open at a specific time.

const NOTIF_KEY = 'hfos:daily_notif'
const LAST_SHOWN_KEY = 'hfos:daily_shown'
const NOTIF_TIME_KEY = 'hfos:notif_time' // "HH:MM"

export function DailyBoost({ userName }) {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default')
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(LAST_SHOWN_KEY) === todayKey())
  const [showOptIn, setShowOptIn] = useState(false)

  const quote = quoteOfDay()

  // Fire an in-app Web Notification at the user-picked time (roughly)
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (permission !== 'granted') return
    if (localStorage.getItem(NOTIF_KEY) === todayKey()) return

    const notifTime = localStorage.getItem(NOTIF_TIME_KEY) || '08:00'
    const [nH, nM] = notifTime.split(':').map(Number)
    const now = new Date()
    const [curH, curM] = [now.getHours(), now.getMinutes()]
    // If we're past the notif time today AND haven't shown one yet - show now
    if (curH > nH || (curH === nH && curM >= nM)) {
      try {
        new Notification('💪 המשפט של היום', {
          body: quote.text,
          badge: '/logo.svg',
          icon: '/logo.svg',
          tag: 'hfos-daily',
        })
        localStorage.setItem(NOTIF_KEY, todayKey())
      } catch (e) { /* silent */ }
    }
  }, [permission, quote])

  const dismiss = () => {
    localStorage.setItem(LAST_SHOWN_KEY, todayKey())
    setDismissed(true)
  }

  const requestPerm = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        localStorage.setItem(NOTIF_TIME_KEY, '08:00')
        setShowOptIn(false)
      }
    } catch (e) { /* silent */ }
  }

  if (dismissed) return null

  return (
    <Card style={{
      padding: 20,
      background: `linear-gradient(135deg, ${t.color.goldGlow} 0%, ${t.color.bgElevated} 100%)`,
      border: `1px solid ${t.color.gold}`,
      position: 'relative',
      animation: 'hfos-slide-in 0.5s ease',
    }}>
      <button onClick={dismiss} aria-label="סגור" style={{
        position: 'absolute', top: 10, left: 10, background: 'transparent',
        border: 'none', color: t.color.textDim, cursor: 'pointer',
        fontSize: 18, width: 24, height: 24,
      }}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>🌅</span>
        <Badge color={t.color.gold}>המשפט של היום</Badge>
      </div>

      <div style={{
        fontSize: t.font.lg, fontWeight: 700, lineHeight: 1.5,
        color: t.color.text, marginBottom: 8, fontStyle: 'italic',
      }}>
        "{quote.text}"
      </div>

      <div style={{ fontSize: t.font.xs, color: t.color.gold, fontWeight: 600, marginBottom: 12 }}>
        — {quote.author}
      </div>

      {/* Notification opt-in */}
      {permission === 'default' && !showOptIn && typeof Notification !== 'undefined' && (
        <button onClick={() => setShowOptIn(true)} style={{
          background: 'transparent', border: 'none', color: t.color.gold,
          fontFamily: 'inherit', fontSize: t.font.xs, cursor: 'pointer',
          textDecoration: 'underline',
        }}>🔔 קבל תזכורת בוקר בכל יום</button>
      )}

      {showOptIn && permission !== 'granted' && (
        <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, marginTop: 10 }}>
          <div style={{ fontSize: t.font.sm, marginBottom: 8 }}>
            📱 האם תרצה לקבל תזכורת בוקר יומית עם משפט מוטיבציה?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" onClick={requestPerm}>כן, אני מוכן</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowOptIn(false)}>לא עכשיו</Button>
          </div>
        </div>
      )}

      {permission === 'granted' && (
        <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
          🔔 מקבל תזכורות בבוקר · <button onClick={() => {
            const newT = prompt('שעה לתזכורת (HH:MM):', localStorage.getItem(NOTIF_TIME_KEY) || '08:00')
            if (newT && /^\d{1,2}:\d{2}$/.test(newT)) localStorage.setItem(NOTIF_TIME_KEY, newT)
          }} style={{
            background: 'transparent', border: 'none', color: t.color.gold,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit',
            textDecoration: 'underline',
          }}>שנה שעה</button>
        </div>
      )}

      <style>{`
        @keyframes hfos-slide-in {
          from { transform: translateY(-10px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
      `}</style>
    </Card>
  )
}
