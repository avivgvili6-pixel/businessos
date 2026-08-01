// Reminders — browser Notifications API + in-tab minute-poll scheduler.
//
// Approach: we don't rely on Service Worker Push (needs backend +
// subscription). Instead: the app registers a setInterval that checks
// every minute if any configured reminder matches now (±1 min window)
// and, if so, fires a browser Notification. This works while the tab
// is open (including installed PWA in the background on mobile).
//
// For truly background notifications we'd need Firebase Cloud Messaging
// or a self-hosted Web Push server — separate task.

const FIRED_TODAY_KEY = 'hfos:reminders_fired_today'

// Ask for browser permission. Returns the resulting permission state.
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const result = await Notification.requestPermission()
    return result
  } catch {
    return 'error'
  }
}

export function notificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// Fire a notification NOW. Marks it as fired-today so the scheduler
// doesn't duplicate within the same day.
export function fireReminder(id, title, body, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false
  try {
    const n = new Notification(title, {
      body,
      tag: id,
      badge: options.badge,
      icon: options.icon || './logo-mark.svg',
      requireInteraction: false,
      silent: false,
    })
    if (options.onClick) n.onclick = () => { window.focus(); options.onClick() }
    markFiredToday(id)
    return true
  } catch (err) {
    console.warn('[reminders] Notification failed:', err)
    return false
  }
}

// Track which reminders already fired today (dateKey-scoped in localStorage)
export function readFiredToday() {
  const todayKey = new Date().toISOString().slice(0, 10)
  try {
    const raw = localStorage.getItem(FIRED_TODAY_KEY)
    if (!raw) return { day: todayKey, ids: [] }
    const parsed = JSON.parse(raw)
    if (parsed.day !== todayKey) return { day: todayKey, ids: [] }
    return parsed
  } catch { return { day: todayKey, ids: [] } }
}

export function markFiredToday(id) {
  const rec = readFiredToday()
  if (!rec.ids.includes(id)) rec.ids.push(id)
  try { localStorage.setItem(FIRED_TODAY_KEY, JSON.stringify(rec)) } catch {}
}

export function hasFiredToday(id) {
  return readFiredToday().ids.includes(id)
}

// Given the user's reminder settings, return the list of reminders that
// should fire in the next minute. Called by the interval poller.
export function dueReminders(settings, now = new Date()) {
  if (!settings?.enabled) return []
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const dow = now.getDay() // 0=Sunday
  const out = []

  // Meals — configured for every day
  const meals = settings.meals || {}
  for (const [key, time] of Object.entries(meals)) {
    if (!time || !time.enabled) continue
    const [h, m] = (time.at || '00:00').split(':').map(Number)
    const target = h * 60 + m
    if (Math.abs(target - nowMinutes) <= 0 && !hasFiredToday(`meal-${key}`)) {
      out.push({
        id: `meal-${key}`,
        title: time.title || mealTitle(key),
        body: time.body || mealBody(key),
        category: 'meal',
      })
    }
  }

  // Workout — per day of week
  const workouts = settings.workouts || {}
  const dayCfg = workouts[dow]
  if (dayCfg?.enabled && dayCfg.at) {
    const [h, m] = dayCfg.at.split(':').map(Number)
    const target = h * 60 + m
    if (Math.abs(target - nowMinutes) <= 0 && !hasFiredToday(`workout-${dow}`)) {
      out.push({
        id: `workout-${dow}`,
        title: dayCfg.title || 'Time to train',
        body: dayCfg.body || 'Selano · your session is calling.',
        category: 'workout',
      })
    }
  }

  return out
}

function mealTitle(key) {
  const map = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
  return map[key] || 'Meal'
}
function mealBody(key) {
  const map = {
    breakfast: 'Start the day right — log your breakfast.',
    lunch: 'Lunch time. Fuel up.',
    dinner: 'Dinner is calling.',
    snack: 'Time for a snack.',
  }
  return map[key] || 'Time to eat.'
}

// Default settings — shipped with the app for first-time users
export const DEFAULT_REMINDERS = {
  enabled: false,
  meals: {
    breakfast: { at: '08:00', enabled: true },
    lunch:     { at: '13:00', enabled: true },
    dinner:    { at: '19:00', enabled: true },
    snack:     { at: '16:00', enabled: false },
  },
  workouts: {
    // dow index → config. Sunday=0..Saturday=6
    0: { at: '18:00', enabled: false },
    1: { at: '18:00', enabled: true },
    2: { at: '18:00', enabled: false },
    3: { at: '18:00', enabled: true },
    4: { at: '18:00', enabled: false },
    5: { at: '18:00', enabled: true },
    6: { at: '10:00', enabled: false },
  },
}
