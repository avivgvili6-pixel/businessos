// Distribute workout sessions across a 7-day week with rest days
// in the best pattern for recovery.
// Week starts on Sunday (day 0) - Israeli convention.

const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const DAY_SHORT_HE = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

// Pattern of which weekday-indices to train on, keyed by workout count.
// Values represent day-of-week (0 = Sunday).
const DAY_PATTERNS = {
  1: [1],                          // Mon
  2: [0, 3],                       // Sun, Wed
  3: [0, 2, 4],                    // Sun, Tue, Thu — 1 rest between each
  4: [0, 1, 3, 4],                 // Sun, Mon, Wed, Thu — upper/lower split
  5: [0, 1, 2, 4, 5],              // Sun, Mon, Tue, Thu, Fri
  6: [0, 1, 2, 3, 4, 5],           // Sun–Fri (only Sat rest)
  7: [0, 1, 2, 3, 4, 5, 6],        // every day
}

// Returns an array of length 7 (one entry per weekday), each entry is
// either { type: 'workout', session, sessionIndex } or { type: 'rest', reason }
export function distributeWeek(plan) {
  if (!plan?.sessions?.length) return []
  const sessions = plan.sessions
  const nDays = Math.min(7, plan.days || sessions.length)
  const pattern = DAY_PATTERNS[nDays] || DAY_PATTERNS[3]

  const week = Array.from({ length: 7 }, (_, dayIdx) => ({
    dayIdx,
    dayName: DAY_NAMES_HE[dayIdx],
    dayShort: DAY_SHORT_HE[dayIdx],
    type: 'rest',
    reason: restReason(dayIdx, pattern),
  }))

  pattern.forEach((dayIdx, sessionIdx) => {
    if (sessionIdx >= sessions.length) return
    week[dayIdx] = {
      dayIdx,
      dayName: DAY_NAMES_HE[dayIdx],
      dayShort: DAY_SHORT_HE[dayIdx],
      type: 'workout',
      session: sessions[sessionIdx],
      sessionIndex: sessionIdx,
    }
  })

  return week
}

function restReason(dayIdx, pattern) {
  // Saturday - always dedicated rest for most programs
  if (dayIdx === 6) return 'שבת - יום מנוחה מלא'
  // Between two training days - active recovery
  const prev = pattern.find(d => d === dayIdx - 1)
  const next = pattern.find(d => d === dayIdx + 1)
  if (prev !== undefined && next !== undefined) return 'מנוחה אקטיבית בין אימונים'
  if (prev !== undefined) return 'התאוששות מהאימון הקודם'
  if (next !== undefined) return 'הכנה לאימון של מחר'
  return 'יום מנוחה'
}

// Given a distributed week and a start date (Sunday), return actual Date
// objects for each workout day.
export function weekDates(weekStart) {
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

// Next Sunday from today (or today if it's Sunday)
export function nextSundayOf(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  if (day === 0) return d // already Sunday
  d.setDate(d.getDate() + (7 - day))
  d.setHours(0, 0, 0, 0)
  return d
}
