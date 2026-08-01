import { useEffect, useRef } from 'react'
import { useApp } from '../../store/AppStore'
import { dueReminders, fireReminder } from '../../utils/reminders'

// Silent background component — mount once in App tree.
// Every 30 seconds it checks if any reminder is due right now (±1 min)
// and fires a browser Notification if so. Also runs once on mount so a
// reminder that was due while the tab was closed can still fire
// right after it opens (within the same minute window).

export function NotificationScheduler() {
  const { state } = useApp()
  const settings = state.reminders
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    const tick = () => {
      const s = settingsRef.current
      if (!s?.enabled) return
      if (Notification.permission !== 'granted') return
      const due = dueReminders(s)
      due.forEach(r => {
        fireReminder(r.id, r.title, r.body, {
          onClick: () => {
            // Best-effort: bring app to focus and route to Home
            try { window.focus() } catch {}
          },
        })
      })
    }

    // Initial tick + every 30s
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, []) // one-shot interval; reads latest settings via ref

  return null
}
