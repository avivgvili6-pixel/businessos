// Calendar sync utilities.
// Two flows, both browser-only (no backend, no OAuth):
//   1. ICS export → downloadable .ics file, works with any calendar app
//   2. Deep-link "Add to Google Calendar" URLs for one-off events

// ─── ICS helpers ────────────────────────────────────────
function toICSDate(date) {
  // Format: 20260801T180000Z (UTC)
  const d = date instanceof Date ? date : new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) + 'Z'
}

function escapeICS(text) {
  if (!text) return ''
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

// Fold long lines at 75 octets per RFC 5545
function foldLine(line) {
  if (line.length <= 75) return line
  const parts = []
  let i = 0
  while (i < line.length) {
    parts.push(line.slice(i, i + 73))
    i += 73
  }
  return parts.join('\r\n ')
}

// Build an ICS VEVENT block
function buildEvent(event) {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${event.id || Math.random().toString(36).slice(2)}@holisticfit`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(event.start)}`,
    `DTEND:${toICSDate(event.end)}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ]
  if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`)
  if (event.location)    lines.push(`LOCATION:${escapeICS(event.location)}`)
  if (event.category)    lines.push(`CATEGORIES:${escapeICS(event.category)}`)
  if (event.reminderMinutes) {
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS('תזכורת - ' + event.title)}`,
      `TRIGGER:-PT${event.reminderMinutes}M`, 'END:VALARM')
  }
  lines.push('END:VEVENT')
  return lines.map(foldLine).join('\r\n')
}

// Build a full ICS calendar with N events
export function buildICS(events, calendarName = 'Holistic Fitness OS') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Holistic Fitness OS//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Jerusalem',
    ...events.map(buildEvent),
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadICS(events, filename = 'holistic-fit.ics') {
  const ics = buildICS(events, filename.replace(/\.ics$/i, ''))
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Google Calendar deep link ──────────────────────────
// Opens a Google Calendar tab pre-filled with the event.
// User clicks "Save" to add it - no OAuth needed.
export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || '',
    dates: `${toICSDate(event.start)}/${toICSDate(event.end)}`,
    details: event.description || '',
    location: event.location || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// ─── Event builders for our domain ──────────────────────
// Turn a workout session on a given date into a calendar event.
export function workoutEvent({ session, date, plan, defaults = {} }) {
  const start = date instanceof Date ? date : new Date(date)
  const end = new Date(start.getTime() + 60 * 60 * 1000) // 60 min default
  const lines = []
  if (session.wodType) lines.push(`פורמט: ${session.wodType}`)
  if (session.prescription) lines.push(session.prescription, '')
  if (session.exercises?.length) {
    lines.push('תרגילים:')
    for (const ex of session.exercises) {
      const intensity = Array.isArray(ex.intensity) ? ex.intensity[0] : ex.intensity
      const parts = [ex.name]
      if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`)
      if (intensity) parts.push(`@ ${Math.round(intensity * 100)}%`)
      if (ex.suggestedWeight) parts.push(`(${ex.suggestedWeight} ק"ג)`)
      lines.push('• ' + parts.join(' '))
    }
  }
  return {
    id: `workout-${session.name}-${start.toISOString()}`,
    title: ` ${session.name}${plan?.name ? ' · ' + plan.name : ''}`,
    start, end,
    description: lines.join('\n'),
    location: defaults.location || 'חדר כושר',
    category: 'Fitness',
    reminderMinutes: defaults.reminderMinutes ?? 30,
  }
}

// Turn a meal from the weekly planner into a calendar event.
export function mealEvent({ meal, date, defaults = {} }) {
  const start = date instanceof Date ? date : new Date(date)
  // Meals last 30 min
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return {
    id: `meal-${meal.name}-${start.toISOString()}`,
    title: ` ${meal.name}${meal.idea ? ' · ' + meal.idea : ''}`,
    start, end,
    description: `${meal.kcal || 0} קק"ל${meal.idea ? '\n' + meal.idea : ''}`,
    category: 'Nutrition',
    reminderMinutes: defaults.reminderMinutes ?? 15,
  }
}

// Turn a habit into a recurring reminder event (single occurrence for now).
export function habitEvent({ habit, date, defaults = {} }) {
  const start = date instanceof Date ? date : new Date(date)
  const end = new Date(start.getTime() + 10 * 60 * 1000)
  return {
    id: `habit-${habit.id}-${start.toISOString()}`,
    title: `${habit.icon} ${habit.name}`,
    start, end,
    description: `הרגל יומי · streak: ${habit.streak} ימים`,
    category: 'Habits',
    reminderMinutes: defaults.reminderMinutes ?? 5,
  }
}

// ─── Weekly schedule builder ────────────────────────────
// Given the user's plan + meal plan + habits + logged meals + logged
// workouts, and a starting Sunday, build a full 7-day schedule of events.
// Uses "logged" (real) entries where available, falling back to planned.
export function buildWeeklySchedule({ plan, mealTimes, habitTimes, weekStart, mealPlan, mealLogs, workoutLogs }) {
  const events = []
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  const weekEnd = new Date(start); weekEnd.setDate(start.getDate() + 7)

  // 1. Logged workouts (real, past)
  if (Array.isArray(workoutLogs)) {
    for (const log of workoutLogs) {
      const dt = new Date(log.date || log.completedAt || log.timestamp || 0)
      if (isNaN(dt) || dt < start || dt >= weekEnd) continue
      events.push({
        id: `logged-workout-${log.id || dt.toISOString()}`,
        title: log.name || log.sessionName || 'אימון שבוצע',
        start: dt, end: new Date(dt.getTime() + 60 * 60 * 1000),
        description: `${log.exercises?.length || 0} תרגילים${log.duration ? ` · ${log.duration} דק׳` : ''}`,
        category: 'Fitness',
        logged: true,
      })
    }
  }

  // 2. Planned workouts (upcoming, one per day the plan has)
  //    Skip days where we already have a logged workout.
  if (plan?.sessions?.length) {
    const workoutTime = { h: 18, m: 0 }
    const loggedDays = new Set(
      events.filter(e => e.logged && e.category === 'Fitness').map(e => e.start.toDateString())
    )
    for (let i = 0; i < Math.min(7, plan.sessions.length); i++) {
      const day = new Date(start); day.setDate(start.getDate() + i)
      day.setHours(workoutTime.h, workoutTime.m, 0, 0)
      if (loggedDays.has(day.toDateString())) continue
      events.push(workoutEvent({ session: plan.sessions[i], date: day, plan }))
    }
  }

  // 3. Logged meals (real, from mealLogs by dateKey)
  if (mealLogs && typeof mealLogs === 'object') {
    const times = mealTimes || { 'בוקר': 8, 'צהריים': 13, 'ערב': 20, 'נשנוש': 16 }
    for (let d = 0; d < 7; d++) {
      const day = new Date(start); day.setDate(start.getDate() + d)
      const key = day.toISOString().slice(0, 10)
      const dayMeals = mealLogs[key] || []
      dayMeals.forEach((m, idx) => {
        // Use meal time by index (breakfast, lunch, dinner, snack) as best-effort
        const timeKeys = ['בוקר', 'צהריים', 'ערב', 'נשנוש']
        const hour = times[timeKeys[idx] || 'צהריים'] ?? (8 + idx * 4)
        const dt = new Date(start); dt.setDate(start.getDate() + d); dt.setHours(hour, 0, 0, 0)
        events.push({
          id: `logged-meal-${key}-${idx}`,
          title: m.name || 'ארוחה',
          start: dt, end: new Date(dt.getTime() + 30 * 60 * 1000),
          description: `${Math.round(m.kcal || 0)} קק"ל · ${Math.round(m.p || 0)}P / ${Math.round(m.c || 0)}C / ${Math.round(m.f || 0)}F`,
          category: 'Nutrition',
          logged: true,
        })
      })
    }
  }

  // 4. Planned meals (from AI weekly plan, only for days without logged meals)
  if (mealPlan?.days?.length) {
    const times = mealTimes || { 'בוקר': 8, 'צהריים': 13, 'ערב': 20, 'נשנוש': 16 }
    const loggedMealDays = new Set(
      events.filter(e => e.logged && e.category === 'Nutrition').map(e => e.start.toDateString())
    )
    for (let d = 0; d < Math.min(7, mealPlan.days.length); d++) {
      const day = mealPlan.days[d]
      const dayCheck = new Date(start); dayCheck.setDate(start.getDate() + d)
      if (loggedMealDays.has(dayCheck.toDateString())) continue
      for (const meal of day.meals) {
        const hour = times[meal.name] ?? 12
        const dt = new Date(start); dt.setDate(start.getDate() + d); dt.setHours(hour, 0, 0, 0)
        events.push(mealEvent({ meal, date: dt }))
      }
    }
  }

  // 5. Habits — daily reminders
  if (habitTimes?.length) {
    for (const { habit, hour } of habitTimes) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start); dt.setDate(start.getDate() + d); dt.setHours(hour, 0, 0, 0)
        events.push(habitEvent({ habit, date: dt }))
      }
    }
  }

  return events
}

// Get next Sunday (start of Israeli work week)
export function nextSunday(from = new Date()) {
  const d = new Date(from)
  const day = d.getDay()
  const diff = day === 0 ? 0 : 7 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}
