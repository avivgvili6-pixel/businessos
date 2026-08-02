// Unified exercise catalog for the RoutineBuilder.
//
// We have two catalogs in the codebase — the bodybuilding one (~435 rich
// entries with instructions/cues/percentages) and the general Selano
// library (~127 entries with a lighter schema, used by Goals + Train
// generator). Historically the RoutineBuilder only saw the BB catalog,
// so users couldn't build a routine from something they added to the
// general library. This module adapts general entries to the BB shape
// and exports one merged list.

import { EXERCISES as BB_EXERCISES, EQUIPMENT, MUSCLE_GROUPS } from './exercises'
import { exercises as GEN_EXERCISES } from '../exercises'

// Hebrew muscle group → BB muscle key.
// Some general entries map cleanly, others require a best-fit.
const MUSCLE_HE_TO_BB = {
  'חזה':      'chest',
  'גב':       'lats',
  'רגליים':   'quads',
  'כתפיים':   'shoulders',
  'ידיים':    'biceps',        // ambiguous — fallback below when name hints triceps
  'ליבה':     'abdominals',
  'ישבן':     'glutes',
  'כל הגוף':  'chest',          // full-body movements — no perfect bucket; keep visible
  'אירובי':   'shoulders',      // cardio — no muscle bucket in BB; use least-cluttered
}

// Hebrew equipment name → BB equipment key.
const EQUIP_HE_TO_BB = {
  'משקל גוף': 'bodyweight',
  'משקולות':  'dumbbell',
  'מוט':      'barbell',
  'כבלים':    'cable',
  'מכונה':    'machine',
  'קטלבל':    'kettlebell',
  'גומיות':   'band',
  'TRX':      'suspension',
  'אופניים':  'machine',
  'חבל':      'none',
}

// If name says triceps, override the biceps default for ידיים
const isTricepsExercise = (name) => /טרייספס|פשיטת מרפק|טריצפ|dips|מקבילים/i.test(name)

// Return English rough label for exercise (best-effort, only used for search)
const guessEn = (name) => name

// Convert a general-catalog exercise into the BB catalog shape used
// by the picker + routine session runner.
function adapt(genEx) {
  let primary = MUSCLE_HE_TO_BB[genEx.muscle] || 'chest'
  if (genEx.muscle === 'ידיים' && isTricepsExercise(genEx.name)) primary = 'triceps'
  return {
    id: `gen_${genEx.id}`,
    he: genEx.name,
    en: guessEn(genEx.name),
    primaryMuscle: primary,
    secondaryMuscles: (genEx.secondary || []).map(m => MUSCLE_HE_TO_BB[m]).filter(Boolean),
    equipment: EQUIP_HE_TO_BB[genEx.equipment] || 'none',
    category: 'accessory',
    ytId: genEx.yt || null,
    cues: genEx.formCues || null,
    contraindications: [],
    rmPercentages: [65, 70, 75, 80, 85],
    tags: [],
    // Marker so the picker can badge which library it came from
    source: 'general',
  }
}

// De-dupe by lowercased Hebrew name — if a general exercise already
// exists in the BB catalog (bench press, squat, etc.), prefer the BB
// one (it has richer cues + percentages).
const BB_NAMES = new Set(
  BB_EXERCISES.map(e => (e.he || '').trim().toLowerCase())
)

const adapted = GEN_EXERCISES
  .map(adapt)
  .filter(e => !BB_NAMES.has((e.he || '').trim().toLowerCase()))

// Mark BB entries with their source too, for symmetry
const bbTagged = BB_EXERCISES.map(e => ({ ...e, source: e.source || 'bb' }))

export const EXERCISES = [...bbTagged, ...adapted]
export const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map(e => [e.id, e]))
export { EQUIPMENT, MUSCLE_GROUPS }
