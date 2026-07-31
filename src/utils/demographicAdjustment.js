// Sex + age based training adjustments, grounded in physiology research.
// Applied ON TOP of the difficulty modifiers in weekProgression.js.
//
// References (research summaries in RESEARCH_NOTES for the UI):
// - Hunter (2014, 2016): Women fatigue less at submaximal loads
// - Nuzzo (2022): Women perform ~20% more reps at same relative intensity
// - Peterson et al. (2004, 2011): Volume-response curve flattens after ~45
// - Fragala et al. (ACSM 2019): Resistance training positions for older adults
// - Beaudart et al. (2017): Sarcopenia risk after 60 - RT crucial for retention
// - Wright et al. (2016): Estrogen loss → bone density loss (women 45+)

const SEX_PROFILES = {
  male: {
    label: 'גבר',
    repMultiplier: 1.0,       // baseline reps
    restMultiplier: 1.0,      // baseline rest
    volumeMultiplier: 1.0,    // baseline sets per muscle group
    deloadEveryWeeks: 5,      // baseline deload frequency
    frequencyPerMuscle: 2,    // times per week per muscle group
  },
  female: {
    label: 'אישה',
    repMultiplier: 1.3,       // +30% reps at same %1RM (Nuzzo 2022)
    restMultiplier: 0.75,     // shorter rest tolerable (higher endurance)
    volumeMultiplier: 1.2,    // higher weekly volume tolerable
    deloadEveryWeeks: 7,      // less frequent deload needed
    frequencyPerMuscle: 2.5,  // can train each muscle 2-3x
  },
}

const AGE_PROFILES = [
  {
    range: [0, 30], label: 'שיא (18-30)',
    volumeMultiplier: 1.0,
    restMultiplier: 1.0,
    deloadEveryWeeks: 5,
    maxSessionsPerWeek: 6,
    focusHint: 'נפח מקסימלי · פרוגרסיה אגרסיבית · יכולת התאוששות שיא',
    caution: null,
  },
  {
    range: [30, 45], label: 'בשל (30-45)',
    volumeMultiplier: 0.9,
    restMultiplier: 1.1,
    deloadEveryWeeks: 4,
    maxSessionsPerWeek: 5,
    focusHint: 'פרוגרסיה יציבה · איזון עומס והתאוששות · מנוחה מעט ארוכה',
    caution: null,
  },
  {
    range: [45, 60], label: 'הקפדה (45-60)',
    volumeMultiplier: 0.8,
    restMultiplier: 1.2,
    deloadEveryWeeks: 3,
    maxSessionsPerWeek: 4,
    focusHint: 'איכות > כמות · חימום מוארך · דלוד תכוף · +יום מנוחה נוסף',
    caution: 'הימנעות מ־1RM וסטים לכשל בכל אימון',
  },
  {
    range: [60, 200], label: 'בריאות ואריכות (60+)',
    volumeMultiplier: 0.65,
    restMultiplier: 1.4,
    deloadEveryWeeks: 3,
    maxSessionsPerWeek: 3,
    focusHint: 'טווח חזרות 8-15 · מכונות עדיפות על משקל חופשי בבסיסיים · תרגילי איזון · בריאות מפרקים',
    caution: 'הימנעות מוחלטת מ־1RM · לא לרדת מתחת ל־8 חזרות · חשוב אימון כוח לשמירה על מסת שריר וצפיפות עצם',
  },
]

// Special caution overlays
const SPECIAL_NOTES = {
  female_45_plus: {
    trigger: (sex, age) => sex === 'female' && age >= 45,
    note: '💪 חשוב מיוחד: אימון כוח קריטי לשמירת צפיפות עצם (איבוד אסטרוגן). מומלץ גם אימון אימפקט קל (קפיצות/מדרגות).',
    ref: 'Wright et al. 2016 · ACSM Position on Menopause',
  },
  male_60_plus: {
    trigger: (sex, age) => sex === 'male' && age >= 60,
    note: '💪 חשוב מיוחד: אימון כוח קריטי למניעת סרקופניה (איבוד מסת שריר גילי). התרגיל החשוב בגילך.',
    ref: 'Beaudart et al. 2017 · Fragala ACSM 2019',
  },
}

export const RESEARCH_REFS = [
  { id: 'hunter14', label: 'Hunter, S.K. (2014). Sex differences in human fatigability. Acta Physiol.' },
  { id: 'nuzzo22',  label: 'Nuzzo, J.L. (2022). Sex differences in relative-load rep endurance. Sports Med.' },
  { id: 'peterson04', label: 'Peterson, M.D. et al. (2004). Dose-response relationships for adaptations. Med Sci Sports Exerc.' },
  { id: 'fragala19', label: 'Fragala, M.S. et al. (2019). ACSM Position: Resistance training for older adults.' },
  { id: 'beaudart17', label: 'Beaudart, C. et al. (2017). Sarcopenia in elderly: prevention & treatment.' },
  { id: 'wright16', label: 'Wright, V.J. et al. (2016). Bone mineral density in perimenopause. J Clin Endocrinol.' },
]

// Get the compound adjustment factor for a user profile
export function adjustmentFor({ sex = 'male', age = 30 } = {}) {
  const sexP = SEX_PROFILES[sex] || SEX_PROFILES.male
  const ageP = AGE_PROFILES.find(p => age >= p.range[0] && age < p.range[1]) || AGE_PROFILES[1]

  const notes = []
  Object.values(SPECIAL_NOTES).forEach(n => {
    if (n.trigger(sex, age)) notes.push(n)
  })

  return {
    sex, age,
    sexLabel: sexP.label,
    ageLabel: ageP.label,
    // Compounded multipliers
    repMultiplier: sexP.repMultiplier,
    restMultiplier: sexP.restMultiplier * ageP.restMultiplier,
    volumeMultiplier: sexP.volumeMultiplier * ageP.volumeMultiplier,
    deloadEveryWeeks: Math.min(sexP.deloadEveryWeeks, ageP.deloadEveryWeeks),
    maxSessionsPerWeek: ageP.maxSessionsPerWeek,
    frequencyPerMuscle: sexP.frequencyPerMuscle,
    focusHint: ageP.focusHint,
    caution: ageP.caution,
    specialNotes: notes,
  }
}

// Apply demographic adjustment on top of a difficulty-adjusted exercise
export function applyDemographicToExercise(exercise, demo) {
  if (!exercise || !demo) return exercise
  const out = { ...exercise }

  // Adjust reps: multiply for women, keep for men
  if (typeof exercise.reps === 'number' && demo.repMultiplier !== 1) {
    out.reps = Math.round(exercise.reps * demo.repMultiplier)
  }

  // Adjust rest seconds
  if (exercise.restSec && demo.restMultiplier !== 1) {
    out.restSec = Math.round(exercise.restSec * demo.restMultiplier)
  }

  // Adjust sets by volume multiplier
  if (typeof exercise.sets === 'number' && demo.volumeMultiplier !== 1) {
    out.sets = Math.max(2, Math.round(exercise.sets * demo.volumeMultiplier))
  }

  // Guard rails for 60+ - don't drop below 8 reps
  if (demo.age >= 60 && typeof out.reps === 'number' && out.reps < 8) {
    out.reps = 8
  }

  return out
}

// Short human-readable badge text for the training UI
export function adjustmentBadge(demo) {
  if (!demo) return null
  const parts = []
  if (demo.repMultiplier > 1) parts.push(`+${Math.round((demo.repMultiplier - 1) * 100)}% חזרות`)
  if (demo.restMultiplier < 0.9) parts.push('מנוחה מקוצרת')
  if (demo.restMultiplier > 1.1) parts.push('מנוחה מוארכת')
  if (demo.volumeMultiplier < 0.9) parts.push(`-${Math.round((1 - demo.volumeMultiplier) * 100)}% נפח`)
  return `${demo.sexLabel}, גיל ${demo.age}${parts.length ? ' · ' + parts.join(', ') : ''}`
}
