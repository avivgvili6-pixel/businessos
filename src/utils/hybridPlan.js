// Hybrid plan builder - combines multiple workout styles into one weekly plan.
// User picks 1-3 styles; first is primary (gets more days). We distribute
// training days smartly so hard sessions don't sit back-to-back.

import { programs } from '../data/programs'

// Style metadata mirrors the WORKOUT_STYLES in PlanBuilder but expanded
export const STYLES = {
  bodybuilding: {
    id: 'bodybuilding', icon: '', label: 'בודיבילדינג',
    programId: 'ppl_hypertrophy', color: '#c8a84b',
    intensity: 'high', category: 'strength',
  },
  powerlifting: {
    id: 'powerlifting', icon: '', label: 'כוח מירבי',
    programId: 'wendler_531', color: '#e05a5a',
    intensity: 'very-high', category: 'strength',
  },
  crossfit: {
    id: 'crossfit', icon: '', label: 'METCONS',
    programId: 'crossfit_wods', color: '#e0a05a',
    intensity: 'very-high', category: 'metcon',
  },
  bodyweight: {
    id: 'bodyweight', icon: '', label: 'משקל גוף',
    programId: 'stronglifts_5x5', color: '#5ac889',
    intensity: 'medium', category: 'strength',
  },
  yoga: {
    id: 'yoga', icon: '', label: 'יוגה',
    programId: null, color: '#a05ae0',
    intensity: 'low', category: 'recovery',
    sessionTemplate: { name: 'Yoga Flow', exercises: [
      { name: 'Sun Salutation A', sets: 3, reps: 5, restSec: 30 },
      { name: 'Warrior Sequence', sets: 2, reps: 8, restSec: 30 },
      { name: 'Balance Poses (Tree/Eagle)', sets: 2, reps: 5, restSec: 30 },
      { name: 'Backbends (Cobra/Bow)', sets: 3, reps: 8, restSec: 30 },
      { name: 'Hip Openers (Pigeon/Butterfly)', sets: 2, reps: 8, restSec: 45 },
      { name: 'Final Relaxation (Savasana)', sets: 1, reps: 1, restSec: 300 },
    ]},
  },
  endurance: {
    id: 'endurance', icon: '', label: 'סבולת',
    programId: null, color: '#5aa0ff',
    intensity: 'medium-high', category: 'cardio',
    sessionTemplate: { name: 'Endurance Run', exercises: [
      { name: 'Dynamic Warmup', sets: 1, reps: 5, restSec: 0 },
      { name: 'Easy Run (Zone 2)', sets: 1, reps: 30, restSec: 0, note: '30 min @ conversational pace' },
      { name: 'Cooldown Walk', sets: 1, reps: 5, restSec: 0 },
      { name: 'Post-Run Stretch', sets: 1, reps: 10, restSec: 0 },
    ]},
  },
}

// Preferred day patterns per session count - avoids back-to-back hard days
// Sunday = 0 (Israeli week start)
const DAY_PATTERNS_HYBRID = {
  2: [[0, 3]],                        // Sun, Wed
  3: [[0, 2, 4]],                     // Sun, Tue, Thu
  4: [[0, 1, 3, 4]],                  // Sun, Mon, Wed, Thu
  5: [[0, 1, 2, 4, 5]],               // Sun, Mon, Tue, Thu, Fri
  6: [[0, 1, 2, 3, 4, 5]],            // Sun-Fri
}

// Given a list of picked style ids (order matters - first is primary)
// and a total day count, distribute days-per-style and build sessions.
export function buildHybridPlan({ styleIds, days, weeks = 12, level = 'medium' }) {
  const picked = styleIds.map(id => STYLES[id]).filter(Boolean)
  if (!picked.length) return null

  // If only one style, use its program directly
  if (picked.length === 1) {
    const prog = programs[picked[0].programId]
    if (prog) {
      return {
        id: 'plan_' + Date.now(),
        name: prog.label,
        programId: prog.id,
        style: picked[0].id,
        split: prog.schema,
        days: Math.min(days, prog.daysPerWeek),
        weeks,
        sessions: prog.sessions.slice(0, days),
        hybrid: false,
      }
    }
  }

  // Multi-style: distribute days
  const perStyle = distributeDays(picked.length, days)
  const sessions = []

  picked.forEach((style, idx) => {
    const styleDays = perStyle[idx]
    const styleSessions = sessionsForStyle(style, styleDays)
    styleSessions.forEach(s => sessions.push({ ...s, _style: style.id, _styleIcon: style.icon }))
  })

  return {
    id: 'plan_' + Date.now(),
    name: `${picked.map(s => s.label).join(' + ')} · Hybrid`,
    programId: 'hybrid',
    style: picked.map(s => s.id).join('+'),
    styles: picked.map(s => s.id),
    split: 'Hybrid',
    days,
    weeks,
    sessions,
    hybrid: true,
  }
}

// Distribute N days between K styles - primary gets extra
function distributeDays(styleCount, totalDays) {
  const base = Math.floor(totalDays / styleCount)
  const extra = totalDays % styleCount
  const arr = Array.from({ length: styleCount }, (_, i) => base + (i < extra ? 1 : 0))
  return arr
}

// Get N sessions of a specific style
function sessionsForStyle(style, count) {
  if (!count) return []

  // Use real program if it has sessions
  if (style.programId && programs[style.programId]?.sessions?.length) {
    const prog = programs[style.programId]
    return Array.from({ length: count }, (_, i) => {
      const src = prog.sessions[i % prog.sessions.length]
      return {
        name: src.name,
        wodType: src.wodType,
        prescription: src.prescription,
        exercises: (src.blocks || []).map(b => ({
          id: b.lift || b.name,
          name: b.lift ? capitalizeLift(b.lift) : b.name,
          sets: b.sets || 3,
          reps: b.reps || 8,
          intensity: b.intensity,
          format: b.format,
          prescription: b.prescription,
        })),
      }
    })
  }

  // Fallback to sessionTemplate for yoga/endurance/etc.
  if (style.sessionTemplate) {
    return Array.from({ length: count }, () => ({
      name: style.sessionTemplate.name,
      exercises: style.sessionTemplate.exercises.map(e => ({ ...e })),
    }))
  }

  return []
}

function capitalizeLift(key) {
  const map = { squat: 'Back Squat', bench: 'Bench Press', deadlift: 'Deadlift', ohp: 'Overhead Press', pullup: 'Pull-Up' }
  return map[key] || key
}

// Assign each hybrid session to a specific weekday, spreading styles smartly
// so the same style doesn't fall on consecutive days.
export function scheduleHybridWeek(sessions, days) {
  const pattern = (DAY_PATTERNS_HYBRID[days] || DAY_PATTERNS_HYBRID[3])[0]
  return sessions.slice(0, days).map((s, i) => ({ ...s, _weekday: pattern[i] }))
}
