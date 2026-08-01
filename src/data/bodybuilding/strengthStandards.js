// Strength Level Index — Standard classification of user's strength per lift.
// Based on Strength Standards (strengthlevel.com) research: aggregated data
// from ~1M lifters, adjusted for sex+age+bodyweight.
//
// Levels: beginner / novice / intermediate / advanced / elite
// Rating: user's 1RM (or heaviest weight × 1) divided by their bodyweight,
//         compared to gender-adjusted percentiles.

export const STRENGTH_LEVELS = {
  beginner:     { he: 'מתחיל',    en: 'Beginner',     color: '#a09b8c', percentile: 0 },
  novice:       { he: 'טירון',    en: 'Novice',       color: '#5a9be0', percentile: 5 },
  intermediate: { he: 'בינוני',   en: 'Intermediate', color: '#5ac889', percentile: 25 },
  advanced:     { he: 'מתקדם',    en: 'Advanced',     color: '#c8a84b', percentile: 65 },
  elite:        { he: 'עילית',    en: 'Elite',        color: '#e05a5a', percentile: 90 },
}

// Ratios of (1RM / bodyweight) for each level.
// Male standards - female = ~0.65-0.75 of male
const MALE_RATIOS = {
  bench_press_bb:  { novice: 0.75, intermediate: 1.00, advanced: 1.50, elite: 2.00 },
  squat_bb:        { novice: 1.00, intermediate: 1.50, advanced: 2.25, elite: 2.75 },
  deadlift_bb:     { novice: 1.25, intermediate: 1.75, advanced: 2.50, elite: 3.00 },
  overhead_press_bb:{ novice: 0.55, intermediate: 0.75, advanced: 1.10, elite: 1.50 },
  bent_over_row_bb:{ novice: 0.65, intermediate: 0.85, advanced: 1.35, elite: 1.75 },
  front_squat:     { novice: 0.75, intermediate: 1.10, advanced: 1.70, elite: 2.15 },
  rdl_bb:          { novice: 1.00, intermediate: 1.50, advanced: 2.10, elite: 2.60 },
  incline_bench_bb:{ novice: 0.55, intermediate: 0.85, advanced: 1.35, elite: 1.75 },
  pull_up:         { novice: 0.20, intermediate: 0.40, advanced: 0.65, elite: 1.00 }, // bw added
  hip_thrust_bb:   { novice: 1.25, intermediate: 1.75, advanced: 2.50, elite: 3.25 },
}

const FEMALE_MULTIPLIER = 0.70   // apply to male ratios for female standards
const AGE_ADJUSTMENTS = [
  { minAge: 14, maxAge: 17, factor: 0.85 },
  { minAge: 18, maxAge: 29, factor: 1.00 },
  { minAge: 30, maxAge: 39, factor: 0.95 },
  { minAge: 40, maxAge: 49, factor: 0.88 },
  { minAge: 50, maxAge: 59, factor: 0.78 },
  { minAge: 60, maxAge: 69, factor: 0.68 },
  { minAge: 70, maxAge: 120, factor: 0.55 },
]

function ageFactor(age) {
  const range = AGE_ADJUSTMENTS.find(r => age >= r.minAge && age <= r.maxAge)
  return range?.factor ?? 1.0
}

// Returns { level, ratio, targetForNextLevel } for a given exerciseId
export function strengthLevelFor({ exerciseId, oneRM, bodyweight, sex, age }) {
  if (!oneRM || !bodyweight) return null
  const baseRatios = MALE_RATIOS[exerciseId]
  if (!baseRatios) return null

  const sexMul = sex === 'female' ? FEMALE_MULTIPLIER : 1.0
  const ageMul = age ? ageFactor(age) : 1.0
  const adjust = (base) => base * sexMul * ageMul

  const ratios = {
    novice:       adjust(baseRatios.novice),
    intermediate: adjust(baseRatios.intermediate),
    advanced:     adjust(baseRatios.advanced),
    elite:        adjust(baseRatios.elite),
  }

  const userRatio = oneRM / bodyweight
  let level = 'beginner'
  let nextLevel = 'novice'
  let target = ratios.novice * bodyweight

  if (userRatio >= ratios.elite)             { level = 'elite';        nextLevel = null;    target = null }
  else if (userRatio >= ratios.advanced)     { level = 'advanced';     nextLevel = 'elite';  target = ratios.elite * bodyweight }
  else if (userRatio >= ratios.intermediate) { level = 'intermediate'; nextLevel = 'advanced'; target = ratios.advanced * bodyweight }
  else if (userRatio >= ratios.novice)       { level = 'novice';       nextLevel = 'intermediate'; target = ratios.intermediate * bodyweight }

  return {
    level,
    levelInfo: STRENGTH_LEVELS[level],
    ratio: userRatio,
    ratios,
    nextLevel,
    nextLevelInfo: nextLevel ? STRENGTH_LEVELS[nextLevel] : null,
    targetForNextLevel: target,
    kgToNextLevel: target ? target - oneRM : 0,
  }
}

// Overall strength score across all major lifts (avg percentile)
export function overallStrengthScore({ oneRMs, bodyweight, sex, age }) {
  const results = []
  for (const exerciseId of Object.keys(MALE_RATIOS)) {
    const oneRM = oneRMs?.[exerciseId]
    if (!oneRM) continue
    const r = strengthLevelFor({ exerciseId, oneRM, bodyweight, sex, age })
    if (r) results.push({ exerciseId, ...r })
  }
  if (!results.length) return null

  // Convert level to numeric score (beginner=0, novice=25, intermediate=50, advanced=75, elite=100)
  const scoreMap = { beginner: 0, novice: 25, intermediate: 50, advanced: 75, elite: 100 }
  const avgScore = results.reduce((sum, r) => sum + scoreMap[r.level], 0) / results.length

  let overallLevel = 'beginner'
  if (avgScore >= 90) overallLevel = 'elite'
  else if (avgScore >= 70) overallLevel = 'advanced'
  else if (avgScore >= 45) overallLevel = 'intermediate'
  else if (avgScore >= 20) overallLevel = 'novice'

  return {
    overallLevel,
    overallLevelInfo: STRENGTH_LEVELS[overallLevel],
    avgScore: Math.round(avgScore),
    liftBreakdown: results,
  }
}
