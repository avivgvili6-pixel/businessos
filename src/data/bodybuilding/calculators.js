// Warm-up Calculator + Plate Calculator + 1RM formulas.
// All three approved by the user (features #8, #9, #11).

// ─── WARM-UP CALCULATOR ────────────────────────────────────────────
// Given the user's working weight, produce a smart warm-up progression.
// Based on standard PPL/PL warm-up patterns:
//   Set 1: bar only or 40% × 8-10
//   Set 2: 50% × 5
//   Set 3: 70% × 3
//   Set 4: 85% × 1
//   Then working sets

const BAR_WEIGHT = 20  // Standard Olympic bar

export function calculateWarmup(workingWeight, opts = {}) {
  const { barbell = true, sets = 4 } = opts
  if (!workingWeight || workingWeight < 30) return []

  const bar = barbell ? BAR_WEIGHT : 0
  const patterns = {
    4: [
      { pct: 0,     reps: 10, note: 'מוט בלבד' },        // bar
      { pct: 0.50,  reps: 5,  note: 'הפעלה' },
      { pct: 0.70,  reps: 3,  note: 'הכנה' },
      { pct: 0.85,  reps: 1,  note: 'מוכנות עצבית' },
    ],
    3: [
      { pct: 0,     reps: 10 },
      { pct: 0.60,  reps: 5 },
      { pct: 0.80,  reps: 2 },
    ],
    5: [
      { pct: 0,     reps: 10 },
      { pct: 0.40,  reps: 8 },
      { pct: 0.60,  reps: 5 },
      { pct: 0.75,  reps: 3 },
      { pct: 0.90,  reps: 1 },
    ],
  }
  const pattern = patterns[sets] || patterns[4]

  return pattern.map((p, i) => {
    const raw = p.pct === 0 ? bar : Math.round((workingWeight * p.pct) / 2.5) * 2.5
    return {
      setNumber: i + 1,
      weight: Math.max(raw, bar),
      reps: p.reps,
      percentage: p.pct * 100,
      note: p.note || '',
    }
  })
}

// ─── PLATE CALCULATOR ──────────────────────────────────────────────
// Given a target weight, figure out which plates go on each side of the bar.
// Standard plate denominations (kg): 25, 20, 15, 10, 5, 2.5, 1.25

const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25]
const PLATE_COLORS = {
  25:   '#e05a5a', // red
  20:   '#5a9be0', // blue
  15:   '#c8a84b', // gold/yellow
  10:   '#5ac889', // green
  5:    '#f5f2e8', // white
  2.5:  '#a09b8c', // grey
  1.25: '#6b6758', // dark grey
}

export function calculatePlates(targetWeight, opts = {}) {
  const { barbell = 20, unit = 'kg' } = opts
  const perSide = (targetWeight - barbell) / 2
  if (perSide <= 0) return { error: 'משקל היעד קטן מכובד המוט', plates: [], perSide: 0 }

  const plates = []
  let remaining = perSide
  for (const p of PLATES_KG) {
    while (remaining >= p - 0.001) {
      plates.push({ weight: p, color: PLATE_COLORS[p] })
      remaining -= p
    }
  }

  const exact = Math.abs(remaining) < 0.01
  return {
    plates,
    perSide,
    barbell,
    total: targetWeight,
    unit,
    error: exact ? null : `לא ניתן להגיע ל-${targetWeight}${unit} בדיוק. יתרה: ${remaining.toFixed(2)}${unit}`,
  }
}

// Compact "notation" for a barbell setup - e.g. "25+10+5 = 80kg"
export function platesNotation(plates, barbell = 20) {
  if (!plates?.length) return `${barbell}kg (מוט בלבד)`
  const grouped = {}
  for (const p of plates) grouped[p.weight] = (grouped[p.weight] || 0) + 1
  const parts = Object.entries(grouped)
    .sort((a, b) => b[0] - a[0])
    .map(([w, c]) => c === 1 ? `${w}` : `${c}×${w}`)
  const total = plates.reduce((s, p) => s + p.weight, 0) * 2 + barbell
  return `${parts.join('+')} כל צד = ${total}kg`
}

// ─── 1RM FORMULAS ──────────────────────────────────────────────────
// Multiple validated formulas — average the top 2 for accuracy.

// Epley: 1RM = weight × (1 + reps/30)
export function estimate1RM_Epley(weight, reps) {
  if (reps < 1) return weight
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

// Brzycki: 1RM = weight × 36 / (37 - reps)
export function estimate1RM_Brzycki(weight, reps) {
  if (reps < 1) return weight
  if (reps === 1) return weight
  if (reps >= 37) return weight * 5
  return weight * 36 / (37 - reps)
}

// Lombardi: 1RM = weight × reps^0.10
export function estimate1RM_Lombardi(weight, reps) {
  if (reps < 1) return weight
  return weight * Math.pow(reps, 0.10)
}

// Best-of-3: average of all three, rounded to 2.5kg
export function estimate1RM(weight, reps) {
  if (!weight || !reps) return 0
  const e = estimate1RM_Epley(weight, reps)
  const b = estimate1RM_Brzycki(weight, reps)
  const l = estimate1RM_Lombardi(weight, reps)
  const avg = (e + b + l) / 3
  return Math.round(avg / 2.5) * 2.5
}

// Given a 1RM, what weight for target reps at target %?
export function weightForReps(oneRM, targetReps) {
  // Inverse Epley
  const factor = 1 + targetReps / 30
  return Math.round((oneRM / factor) / 2.5) * 2.5
}

// Given a 1RM, what weight for a target percentage?
export function weightAtPercent(oneRM, percent) {
  return Math.round((oneRM * percent / 100) / 2.5) * 2.5
}
