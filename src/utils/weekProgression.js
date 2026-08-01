// Week-by-week progression engine.
// Handles current-week calculation (with 75% completion gate), difficulty
// modifiers per program style, and cycle end/reset.

const MS_DAY = 86400000
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'elite']
export const DIFFICULTY_LABELS = {
  easy:   { icon: '', label: 'קל',      hint: 'התחלה נוחה או שבוע דלוד' },
  medium: { icon: '', label: 'בינוני',  hint: 'המומלץ ברוב השבועות' },
  hard:   { icon: '', label: 'מתקדם',   hint: 'לוחצים על המערכת' },
  elite:  { icon: '', label: 'אליט',    hint: 'רמה תחרותית - סופרסטים, דרופסטים, AMRAP' },
}

// Detect program style from programId - determines which difficulty profile
// and progression scheme to use.
export function detectStyle(plan) {
  const id = (plan?.programId || '').toLowerCase()
  const name = (plan?.name || '').toLowerCase()
  if (id.includes('crossfit') || id.includes('metcon') || name.includes('crossfit')) return 'crossfit'
  if (id.includes('wendler') || id.includes('sheiko') || id.includes('starting_strength')) return 'powerlifting'
  if (id.includes('stronglifts') || id.includes('bodyweight')) return 'bodyweight'
  if (id.includes('ppl') || id.includes('gvt') || id.includes('hypertrophy')) return 'bodybuilding'
  return 'bodybuilding' // sensible default
}

// How many "plan weeks" have elapsed since the plan was started (1-indexed)
export function calendarWeekOf(plan) {
  const start = new Date(plan?.startedAt || plan?.createdAt || Date.now()).getTime()
  const days = Math.floor((Date.now() - start) / MS_DAY)
  return Math.max(1, Math.min(plan?.weeks || 12, Math.floor(days / 7) + 1))
}

// The week to compute plan-week for a new log at THIS moment
export function planWeekAtNow(plan) {
  return calendarWeekOf(plan)
}

// Group logs by planWeek and return {week: sessionCount}
function logsByWeek(plan, logs) {
  const counts = {}
  ;(logs || []).forEach(l => {
    if (l.planId && plan?.id && l.planId !== plan.id) return
    const w = l.planWeek
    if (!w) return
    counts[w] = (counts[w] || 0) + 1
  })
  return counts
}

export function weekCompletion(plan, logs, week) {
  const counts = logsByWeek(plan, logs)
  const done = counts[week] || 0
  const total = plan?.days || 3
  const pct = Math.min(100, Math.round((done / total) * 100))
  return { done, total, pct, complete: pct >= 75 }
}

// Current active week - user is "stuck" at a week until it hits 75%.
// After 75%, calendar can advance them.
export function currentWeekOf(plan, logs) {
  if (!plan) return 1
  const cal = calendarWeekOf(plan)
  let cw = 1
  for (let w = 1; w < cal; w++) {
    if (weekCompletion(plan, logs, w).complete) cw = w + 1
    else break // stuck at this incomplete week
  }
  return Math.min(plan.weeks || 12, cw)
}

// Whether the whole plan cycle is finished
export function isPlanCycleComplete(plan, logs) {
  if (!plan) return false
  const last = plan.weeks || 12
  return weekCompletion(plan, logs, last).complete
}

// ─── Difficulty modifiers per style ─────────────────────
// A modifier describes what to do to the base session for that difficulty.

const BODYBUILDING = {
  easy:   { setsAdd: -1, repsAdd: +3, intensityMul: 0.85, rir: '3-4', rest: 75, superset: false, dropSet: false, restPause: false, note: 'נפח נמוך יותר, שמרו על טכניקה' },
  medium: { setsAdd:  0, repsAdd:  0, intensityMul: 1.00, rir: '2-3', rest: 90, superset: true,  dropSet: false, restPause: false, note: 'סופרסט על תרגילי בידוד' },
  hard:   { setsAdd: +1, repsAdd: -2, intensityMul: 1.05, rir: '1-2', rest: 90, superset: true,  dropSet: true,  restPause: false, note: 'סופרסטים + דרופסט בסט האחרון של תרגילי המפתח' },
  elite:  { setsAdd: +2, repsAdd: -3, intensityMul: 1.10, rir: '0-1', rest: 60, superset: true,  dropSet: true,  restPause: true,  note: 'סופרסטים + דרופסטים כפולים + Rest-Pause · רמה תחרותית' },
}

const POWERLIFTING = {
  easy:   { intensitySet: [0.40, 0.50, 0.55], setsAdd: -1, repsAdd: +2, note: 'שבוע דלוד · 40-55% מ-1RM · טכניקה מרעננת' },
  medium: { intensitySet: [0.65, 0.75, 0.85], setsAdd:  0, repsAdd:  0, note: '5/3/1 Week 1 · 5-5-5+' },
  hard:   { intensitySet: [0.70, 0.80, 0.90], setsAdd:  0, repsAdd:  0, note: '5/3/1 Week 2 · 3-3-3+' },
  elite:  { intensitySet: [0.75, 0.85, 0.95], setsAdd:  0, repsAdd: -1, amrap: true, note: '5/3/1 Week 3 · 5-3-1+ AMRAP · שיא אישי אפשרי' },
}

const CROSSFIT = {
  easy:   { weightMul: 0.65, repsMul: 0.75, roundsMul: 0.75, label: 'Scaled', note: 'משקלים קלים, פחות חזרות/סבבים' },
  medium: { weightMul: 0.85, repsMul: 0.90, roundsMul: 1.00, label: "Rx'",    note: 'משקלי ביניים, כמעט Rx' },
  hard:   { weightMul: 1.00, repsMul: 1.00, roundsMul: 1.00, label: 'Rx',     note: 'כמו שנקבע - התכנית המקורית' },
  elite:  { weightMul: 1.15, repsMul: 1.10, roundsMul: 1.10, label: 'Rx+',    note: 'משקלים כבדים יותר + סבב נוסף' },
}

const BODYWEIGHT = {
  easy:   { repsMul: 0.60, restMul: 1.5, tempo: null,   progression: 'assisted', note: 'פחות חזרות, מנוחות ארוכות, גרסה נעזרת' },
  medium: { repsMul: 1.00, restMul: 1.0, tempo: null,   progression: 'standard', note: 'גרסה סטנדרטית' },
  hard:   { repsMul: 1.20, restMul: 0.8, tempo: '3-1-1', progression: 'tempo',   note: 'טמפו איטי (3 שנ׳ ירידה) + עצירות' },
  elite:  { repsMul: 1.30, restMul: 0.6, tempo: '4-2-1', progression: 'advanced', note: 'פרוגרסיות מתקדמות: Pistol Squat, One-Arm Push-up' },
}

const PROFILES = {
  bodybuilding: BODYBUILDING,
  powerlifting: POWERLIFTING,
  crossfit: CROSSFIT,
  bodyweight: BODYWEIGHT,
}

export function difficultyProfile(style, difficulty) {
  return PROFILES[style]?.[difficulty] || PROFILES.bodybuilding.medium
}

// Apply difficulty to a base session. Returns a session with adjusted
// sets/reps/intensity and superset/dropset flags on exercises.
export function applyDifficultyToSession(session, style, difficulty, week = 1) {
  if (!session) return session
  const prof = difficultyProfile(style, difficulty)
  const exercises = (session.exercises || []).map((ex, idx, arr) =>
    applyDifficultyToExercise(ex, prof, style, week, idx, arr)
  )
  return { ...session, exercises, _difficultyNote: prof.note }
}

function applyDifficultyToExercise(ex, prof, style, week, idx, all) {
  const isIsolation = /flye|curl|extension|raise|lateral|rear|pushdown|lift/i.test(ex.name || '')
  const isCompound = /squat|bench|deadlift|press|row|pull.?up|clean|snatch|jerk/i.test(ex.name || '')

  const out = { ...ex }

  // Bodybuilding modifiers
  if (style === 'bodybuilding') {
    out.sets = Math.max(2, (ex.sets || 3) + (prof.setsAdd || 0))
    const baseReps = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps) || 10
    out.reps = Math.max(5, baseReps + (prof.repsAdd || 0))
    if (ex.intensity && typeof ex.intensity === 'number') {
      out.intensity = Math.min(0.95, ex.intensity * prof.intensityMul)
    }
    out.rir = prof.rir
    out.restSec = prof.rest
    // Pair isolation exercises into supersets
    if (prof.superset && isIsolation) {
      const nextIso = all.slice(idx + 1).find(e => /flye|curl|extension|raise|lateral|rear|pushdown|lift/i.test(e.name || ''))
      if (nextIso && nextIso.name !== ex.name) {
        out.supersetWith = nextIso.name
      }
    }
    // Drop-set on last set of compound / elite adds another
    if (prof.dropSet && isCompound) {
      out.dropSetOnLast = true
    }
    if (prof.restPause && idx >= all.length - 2) {
      out.restPause = true
    }
  }

  // Powerlifting - override intensity to wave
  if (style === 'powerlifting' && ex.intensity && Array.isArray(prof.intensitySet)) {
    out.intensity = prof.intensitySet
    out.intensityLabel = `${(prof.intensitySet[0] * 100).toFixed(0)}/${(prof.intensitySet[1] * 100).toFixed(0)}/${(prof.intensitySet[2] * 100).toFixed(0)}%`
    if (prof.amrap && idx === 0) out.amrap = true
  }

  // CrossFit - relabel prescription
  if (style === 'crossfit') {
    out.crossfitScale = prof.label
    if (ex.reps && typeof ex.reps === 'number') {
      out.reps = Math.max(1, Math.round(ex.reps * prof.repsMul))
    }
  }

  // Bodyweight - reps mod + tempo
  if (style === 'bodyweight') {
    if (typeof ex.reps === 'number') {
      out.reps = Math.max(3, Math.round(ex.reps * prof.repsMul))
    }
    if (prof.tempo) out.tempo = prof.tempo
    if (prof.progression && prof.progression !== 'standard') out.progression = prof.progression
  }

  return out
}
