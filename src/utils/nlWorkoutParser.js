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
  { rx: /(ישבן|גלוט|glutes?)/i,               muscle: 'glutes' },
  { rx: /(שוקיים|תאומים|calves)/i,            muscle: 'calves' },
  { rx: /(כתפיים|כתף|shoulders?|delts)/i,     muscle: 'shoulders' },
  { rx: /(יד\s*קדמית|ביצפס|biceps)/i,         muscle: 'biceps' },
  { rx: /(יד\s*אחורית|טרייצפס|טרייספס|triceps)/i, muscle: 'triceps' },
  { rx: /(ידיים|arms)/i,                       muscle: 'biceps', extras: ['triceps'] },
  { rx: /(ליבה|בטן|core|abs|abdominals)/i,    muscle: 'abdominals' },
  { rx: /(טרפז|traps)/i,                       muscle: 'traps' },
  { rx: /(אמות|forearms)/i,                    muscle: 'forearms' },
  { rx: /(פלג\s*עליון|upper\s*body)/i,        muscle: 'chest', extras: ['lats', 'shoulders', 'biceps', 'triceps'] },
  { rx: /(פלג\s*תחתון|lower\s*body)/i,        muscle: 'quads', extras: ['hamstrings', 'glutes', 'calves'] },
  { rx: /(גוף\s*מלא|full\s*body)/i,           muscle: 'chest', extras: ['lats', 'quads', 'shoulders', 'abdominals'] },
]

// ─── Goal → training mode ─────────────────────────────────────
const GOAL_PATTERNS = [
  { rx: /(היפרטרופיה|נפח|מסה|גדילה|hypertrophy|mass|size)/i, mode: 'hypertrophy' },
  { rx: /(כוח\s*מירבי|כוח|strength|power|1rm)/i,             mode: 'strength' },
  { rx: /(סיבולת|שריפ|ירידה|קרדיו|קבלת\s*חיטוב|endurance|cardio|cutting|fatloss|weight\s*loss)/i, mode: 'endurance' },
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
const LEVEL_PATTERNS = [
  { rx: /(אקספרט|elite|advanced\s*plus|expert)/i,       level: 'expert' },
  { rx: /(מתקדם|advanced)/i,                            level: 'advanced' },
  { rx: /(בינוני|intermediate)/i,                       level: 'intermediate' },
  { rx: /(מתחיל|beginner|newbie|novice)/i,             level: 'beginner' },
]

// ─── Public: parse a single workout request ──────────────────
export function parseWorkoutRequest(text) {
  if (!text || typeof text !== 'string') return emptyResult()
  const clean = text.trim()

  const muscles = extractMuscles(clean)
  const goal = extractGoal(clean)
  const equipment = extractEquipment(clean)
  const level = extractLevel(clean)
  const duration = extractDuration(clean)

  return {
    muscles,          // array of BB muscle keys
    goal,             // 'hypertrophy' | 'strength' | 'endurance' | null
    equipment,        // 'gym' | 'bodyweight' | 'barbell' | ... | null
    level,            // 'beginner' | ... | null
    duration,         // number in minutes, or null
    daysPerWeek: null,
    raw: text,
    confidence: computeConfidence({ muscles, goal, equipment, level }),
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

function computeConfidence({ muscles, goal, equipment, level, daysPerWeek }) {
  let score = 0
  if (muscles && muscles.length) score += 40
  if (goal) score += 30
  if (equipment) score += 15
  if (level) score += 10
  if (daysPerWeek) score += 5
  return Math.min(100, score)
}

function emptyResult() {
  return { muscles: [], goal: null, equipment: null, level: null, duration: null, daysPerWeek: null, raw: '', confidence: 0 }
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
