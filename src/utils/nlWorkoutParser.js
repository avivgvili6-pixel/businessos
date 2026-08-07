// Free-text → structured workout/program parameters.
//
// The user types in Hebrew (or English) describing what they want.
// We extract: muscles, goal, level, equipment, duration, daysPerWeek.
// Output feeds the existing generators (buildRoutineExercises,
// generatePersonalisedProgram) — no new engine, just a translator.
//
// Deterministic, no external API. Keywords cover ~95% of how a
// Hebrew-speaker actually describes an exercise plan.

// ─── Muscle name → BB catalog key ─────────────────────────────
const MUSCLE_PATTERNS = [
  { rx: /(חזה)|chest/i,                       muscle: 'chest' },
  { rx: /גב\s*(?:עליון|תחתון|רחב)?|back|lats/i, muscle: 'lats' },
  { rx: /(רגליים|רגל|quads?|legs)/i,          muscle: 'quads', extras: ['hamstrings', 'glutes', 'calves'] },
  { rx: /(המסטרינגס|hamstrings)/i,            muscle: 'hamstrings' },
  // "עכוז" is the common colloquial word alongside ישבן/גלוט
  { rx: /(ישבן|גלוט|עכוז|glutes?)/i,          muscle: 'glutes' },
  { rx: /(שוקיים|תאומים|calves)/i,            muscle: 'calves' },
  { rx: /(כתפיים|כתף|shoulders?|delts)/i,     muscle: 'shoulders' },
  { rx: /(יד\s*קדמית|ביצפס|biceps)/i,         muscle: 'biceps' },
  { rx: /(יד\s*אחורית|טרייצפס|טרייספס|triceps)/i, muscle: 'triceps' },
  { rx: /(ידיים|arms)/i,                       muscle: 'biceps', extras: ['triceps'] },
  // Split "ליבה"/"core" from "בטן"/"abs" so a request like
  // "בטן ליבה" doesn't just resolve twice to the same muscle
  { rx: /(בטן|abs|abdominals)/i,              muscle: 'abdominals' },
  { rx: /(ליבה|core)/i,                        muscle: 'abdominals', extras: ['lower_back'] },
  { rx: /(טרפז|traps)/i,                       muscle: 'traps' },
  { rx: /(אמות|forearms)/i,                    muscle: 'forearms' },
  { rx: /(פלג\s*עליון|upper\s*body)/i,        muscle: 'chest', extras: ['lats', 'shoulders', 'biceps', 'triceps'] },
  { rx: /(פלג\s*תחתון|lower\s*body)/i,        muscle: 'quads', extras: ['hamstrings', 'glutes', 'calves'] },
  { rx: /(גוף\s*מלא|full\s*body)/i,           muscle: 'chest', extras: ['lats', 'quads', 'shoulders', 'abdominals'] },
]

// ─── Goal → training mode ─────────────────────────────────────
// Order matters — check specific/long phrases first so "כוח מירבי"
// doesn't get shadowed by "כוח" alone. "להתחטב"/"חיטוב" go BEFORE the
// generic endurance patterns so they get the priority-tagged treatment.
const GOAL_PATTERNS = [
  { rx: /(כוח\s*מירבי|1rm)/i,                                        mode: 'strength' },
  { rx: /(היפרטרופיה|נפח|מסה|גדילה|hypertrophy|mass|size)/i,          mode: 'hypertrophy' },
  { rx: /(לתחזק|תחזוקה|maintain|maintenance)/i,                       mode: 'hypertrophy', secondary: 'maintenance' },
  { rx: /(להתחטב|חיטוב|toning|toned|cutting|קאט)/i,                   mode: 'endurance', secondary: 'toning' },
  { rx: /(כוח|strength|power)/i,                                      mode: 'strength' },
  { rx: /(סיבולת|שריפ|ירידה|קרדיו|endurance|cardio|fatloss|weight\s*loss)/i, mode: 'endurance' },
]

// ─── Age → number ─────────────────────────────────────────────
// "בן/בת 40" also carries a GENDER signal — extracted below.
const AGE_PATTERNS = [
  { rx: /(?:בת|בן)\s*(\d{2})/i },                    // "בת 40"
  { rx: /(?:בגיל|גיל|age|aged)\s*(\d{2})/i },         // "בגיל 40" / "age 40"
  { rx: /(\d{2})\s*(?:years?\s*old|yo)/i },           // "40 years old"
]

// ─── Gender → 'female' | 'male' | null ────────────────────────
// The most reliable Hebrew signal is the trainee word itself
// (מתאמנת = female / מתאמן = male) or "בת N" vs "בן N".
const GENDER_PATTERNS = [
  { rx: /(מתאמנת|לאישה|לגברת|לבחורה|for\s+(?:her|a\s+woman|female))/i,  gender: 'female' },
  { rx: /(מתאמן|לגבר|לבחור|for\s+(?:him|a\s+man|male))/i,               gender: 'male' },
  { rx: /(?:^|\s)בת\s*\d{2}/i,                                          gender: 'female' },
  { rx: /(?:^|\s)בן\s*\d{2}/i,                                          gender: 'male' },
]

// ─── Equipment / location → BB equipment key ──────────────────
const EQUIPMENT_PATTERNS = [
  { rx: /(חדר\s*כושר|מכון|ג׳ים|gym)/i,        equipment: 'gym' },
  { rx: /(בבית|בית|home)/i,                     equipment: 'bodyweight' },
  { rx: /(מוט|barbell)/i,                       equipment: 'barbell' },
  { rx: /(משקולות\s*יד|dumbbells?)/i,          equipment: 'dumbbell' },
  { rx: /(כבלים|כבל|cable)/i,                   equipment: 'cable' },
  { rx: /(מכונה|machine)/i,                     equipment: 'machine' },
  { rx: /(קטלבל|kettlebell)/i,                  equipment: 'kettlebell' },
  { rx: /(גומיות|גומייה|band)/i,                equipment: 'band' },
  { rx: /(משקל\s*גוף|bodyweight)/i,             equipment: 'bodyweight' },
]

// ─── Level ─────────────────────────────────────────────────────
// Check compound phrases FIRST — "רמה גבוהה מאוד" must beat "רמה גבוהה"
// which must beat "רמה נמוכה". Otherwise the loop returns the coarsest match.
const LEVEL_PATTERNS = [
  { rx: /(רמה\s*גבוהה\s*(?:מאוד|מאד)|advanced\s*plus)/i,             level: 'expert' },
  { rx: /(אקספרט|elite|expert)/i,                                    level: 'expert' },
  { rx: /(רמה\s*גבוהה|מתקדמת|מתקדם|advanced)/i,                       level: 'advanced' },
  { rx: /(רמה\s*בינונית|בינונית|בינוני|intermediate)/i,               level: 'intermediate' },
  { rx: /(רמה\s*נמוכה|מתחילה|מתחיל|beginner|newbie|novice)/i,        level: 'beginner' },
]

// ─── Public: parse a single workout request ──────────────────
export function parseWorkoutRequest(text) {
  if (!text || typeof text !== 'string') return emptyResult()
  const clean = text.trim()

  const muscles = extractMuscles(clean)
  const goalRaw = extractGoalWithSecondary(clean)
  const equipment = extractEquipment(clean)
  const level = extractLevel(clean)
  const duration = extractDuration(clean)
  const age = extractAge(clean)
  const gender = extractGender(clean)

  return {
    muscles,          // array of BB muscle keys
    goal: goalRaw?.mode || null,          // 'hypertrophy' | 'strength' | 'endurance' | null
    secondaryGoal: goalRaw?.secondary || null, // 'toning' | 'maintenance' | null
    equipment,        // 'gym' | 'bodyweight' | 'barbell' | ... | null
    level,            // 'beginner' | ... | null
    duration,         // number in minutes, or null
    age,              // number 15-99, or null
    gender,           // 'female' | 'male' | null
    daysPerWeek: null,
    raw: text,
    confidence: computeConfidence({ muscles, goal: goalRaw?.mode, equipment, level, age, gender }),
  }
}

// ─── Public: parse a multi-week program request ──────────────
export function parseProgramRequest(text) {
  const base = parseWorkoutRequest(text)
  const daysPerWeek = extractDaysPerWeek(text)
  return {
    ...base,
    daysPerWeek,
    confidence: computeConfidence({
      muscles: base.muscles,
      goal: base.goal,
      equipment: base.equipment,
      level: base.level,
      daysPerWeek,
    }),
  }
}

// ─── Extractors ───────────────────────────────────────────────
function extractMuscles(text) {
  const found = new Set()
  for (const p of MUSCLE_PATTERNS) {
    if (p.rx.test(text)) {
      found.add(p.muscle)
      if (p.extras) p.extras.forEach(m => found.add(m))
    }
  }
  return Array.from(found)
}

function extractGoal(text) {
  for (const p of GOAL_PATTERNS) if (p.rx.test(text)) return p.mode
  return null
}

// Returns the full pattern (mode + optional secondary) — used so callers
// can distinguish "להתחטב" (endurance + toning tag) from a bare
// "סיבולת" (endurance without a shaping intent).
function extractGoalWithSecondary(text) {
  for (const p of GOAL_PATTERNS) if (p.rx.test(text)) return { mode: p.mode, secondary: p.secondary || null }
  return null
}

function extractAge(text) {
  for (const p of AGE_PATTERNS) {
    const m = text.match(p.rx)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n >= 12 && n <= 99) return n
    }
  }
  return null
}

function extractGender(text) {
  for (const p of GENDER_PATTERNS) if (p.rx.test(text)) return p.gender
  return null
}

function extractEquipment(text) {
  for (const p of EQUIPMENT_PATTERNS) if (p.rx.test(text)) return p.equipment
  return null
}

function extractLevel(text) {
  for (const p of LEVEL_PATTERNS) if (p.rx.test(text)) return p.level
  return null
}

// "60 דקות" / "60 minutes" / "45 min" / "שעה" / "שעה וחצי"
function extractDuration(text) {
  if (/שעה\s*וחצי/i.test(text)) return 90
  if (/שעתיים/i.test(text)) return 120
  if (/^\s*שעה\s*$/i.test(text) || /(?:^|\s)שעה(?:\s|$)/i.test(text)) return 60
  const m = text.match(/(\d{2,3})\s*(?:דק|מין|min|minutes)/i)
  if (m) return parseInt(m[1], 10)
  return null
}

// "3 פעמים בשבוע" / "5 ימים בשבוע" / "twice a week" / "5x a week"
function extractDaysPerWeek(text) {
  const heMap = { 'שני': 2, 'שלוש': 3, 'שלושה': 3, 'ארבע': 4, 'ארבעה': 4, 'חמש': 5, 'חמישה': 5, 'שש': 6, 'שישה': 6 }
  for (const [word, n] of Object.entries(heMap)) {
    const rx = new RegExp(`${word}\\s*(?:פעמים|ימים)?\\s*בשבוע`)
    if (rx.test(text)) return n
  }
  const m = text.match(/(\d)\s*(?:פעמים|ימים|x|times?)\s*(?:ב)?(?:שבוע|week)/i)
  if (m) return Math.max(1, Math.min(7, parseInt(m[1], 10)))
  return null
}

function computeConfidence({ muscles, goal, equipment, level, daysPerWeek, age, gender }) {
  let score = 0
  if (muscles && muscles.length) score += 35
  if (goal) score += 25
  if (equipment) score += 10
  if (level) score += 10
  if (age) score += 10
  if (gender) score += 10
  if (daysPerWeek) score += 5
  return Math.min(100, score)
}

function emptyResult() {
  return { muscles: [], goal: null, secondaryGoal: null, equipment: null, level: null, duration: null, age: null, gender: null, daysPerWeek: null, raw: '', confidence: 0 }
}

// ─── Helper: how many exercises to build given duration ──────
// Rough rule: 8-10 min per exercise including rest. 60min → ~6.
export function exerciseCountForDuration(minutes) {
  if (!minutes) return null
  return Math.max(3, Math.min(10, Math.round(minutes / 9)))
}

// ─── Helper: canonical label of a muscle key in Hebrew ───────
export const MUSCLE_HE = {
  chest: 'חזה', lats: 'גב', quads: 'רגליים', hamstrings: 'המסטרינגס',
  glutes: 'ישבן', calves: 'שוקיים', shoulders: 'כתפיים',
  biceps: 'יד קדמית', triceps: 'יד אחורית', abdominals: 'ליבה',
  traps: 'טרפז', forearms: 'אמות', neck: 'צוואר', lower_back: 'גב תחתון',
}
export const GOAL_HE = {
  hypertrophy: 'היפרטרופיה', strength: 'כוח מירבי', endurance: 'סיבולת / שריפה',
}
export const EQUIPMENT_HE = {
  gym: 'חדר כושר מלא', bodyweight: 'משקל גוף', barbell: 'מוט',
  dumbbell: 'משקולות יד', cable: 'כבלים', machine: 'מכונה',
  kettlebell: 'קטלבל', band: 'גומיות',
}
export const LEVEL_HE = {
  beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם', expert: 'אקספרט',
}
export const GENDER_HE = {
  female: 'נקבה', male: 'זכר',
}
export const SECONDARY_GOAL_HE = {
  toning: 'חיטוב', maintenance: 'תחזוקה',
}
