// Personalised Program Generator — 4-question wizard that produces a custom program.
// User answers:
//   1. goal: gain_muscle | strength | lose_weight
//   2. equipment: gym | dumbbells | none
//   3. daysPerWeek: 2 | 3 | 4 | 5 | 6
//   4. experience: beginner | intermediate | advanced
//
// Output: a recommended existing program OR a synthesized routine list.

import { PROGRAMS, filterPrograms } from './programs'
import { ROUTINES, ROUTINE_BY_ID } from './routines'

export function generatePersonalisedProgram({ goal, equipment, daysPerWeek, experience }) {
  // Map experience → level
  const level = experience === 'advanced' ? 'advanced'
              : experience === 'intermediate' ? 'intermediate'
              : 'beginner'

  // First: try to find a matching pre-built program
  const candidates = filterPrograms({ level, goal, equipment })

  // Score candidates by days-per-week proximity
  const scored = candidates.map(p => ({
    program: p,
    score: -Math.abs(p.daysPerWeek - daysPerWeek),
  })).sort((a, b) => b.score - a.score)

  if (scored.length && Math.abs(scored[0].program.daysPerWeek - daysPerWeek) <= 1) {
    return {
      type: 'matched',
      program: scored[0].program,
      reason: `נמצאה תוכנית מוכנה שמתאימה בדיוק לרמה, למטרה ולציוד שלך.`,
    }
  }

  // Otherwise: synthesize a routine sequence based on split logic
  const split = pickSplit(daysPerWeek)
  const routineIds = mapSplitToRoutines(split, level, equipment)

  return {
    type: 'synthesized',
    program: {
      id: `custom_${Date.now()}`,
      name: `תוכנית אישית - ${daysPerWeek} ימים`,
      emoji: '⭐',
      level, goal, equipment,
      daysPerWeek,
      weeksRecommended: level === 'beginner' ? 8 : level === 'intermediate' ? 10 : 12,
      description: `נבנתה במיוחד עבורך: ${daysPerWeek} ימים בשבוע, ${describeGoal(goal)}, ${describeEquipment(equipment)}.`,
      routines: routineIds,
      createdBy: 'user_generated',
    },
    reason: `לא נמצאה תוכנית מדויקת - בנינו תוכנית מותאמת אישית מ-routines מהמאגר.`,
  }
}

// Choose split type based on days per week
function pickSplit(days) {
  if (days <= 2) return 'full_body'
  if (days === 3) return 'ppl'
  if (days === 4) return 'upper_lower'
  if (days === 5) return 'bro_split'
  return 'ppl_6day'
}

// Map split + level + equipment to concrete routine ids
function mapSplitToRoutines(split, level, equipment) {
  const isHome = equipment === 'none'
  const isDumbbells = equipment === 'dumbbells'

  if (isHome) {
    if (split === 'full_body') return ['home_full_bw', 'home_full_bw']
    if (split === 'ppl') return ['home_full_bw', 'home_full_bw', 'home_full_bw']
    return Array(5).fill('home_full_bw')
  }

  if (isDumbbells) {
    if (split === 'full_body') return ['home_full_db', 'home_full_db']
    return Array.from({ length: 3 }, () => 'home_full_db')
  }

  // Gym
  const pplByLevel = {
    beginner: ['beg_push', 'beg_pull', 'beg_legs'],
    intermediate: ['int_push', 'int_pull', 'int_legs'],
    advanced: ['adv_push', 'adv_pull', 'adv_legs'],
  }
  const ul = ['upper_a', 'lower_a', 'upper_b', 'lower_b']
  const fb = level === 'advanced'
    ? ['adv_full_1', 'adv_full_2', 'adv_full_3', 'adv_full_4', 'adv_full_5']
    : level === 'intermediate'
      ? ['adv_full_1', 'adv_full_2', 'adv_full_3']
      : ['beg_full_a', 'beg_full_b']
  const bro = ['bro_chest', 'bro_back', 'bro_shoulders', 'bro_legs', 'bro_arms']

  if (split === 'full_body') return fb
  if (split === 'ppl') return pplByLevel[level]
  if (split === 'upper_lower') return ul
  if (split === 'bro_split') return bro
  if (split === 'ppl_6day') return [...pplByLevel[level], ...pplByLevel[level]]

  return pplByLevel[level]
}

function describeGoal(g) {
  return g === 'strength' ? 'להתמקד בכוח מקסימלי'
       : g === 'lose_weight' ? 'לירידה במשקל תוך שמירה על שריר'
       : 'לבניית שריר'
}

function describeEquipment(e) {
  return e === 'gym' ? 'עם ציוד חדר כושר מלא'
       : e === 'dumbbells' ? 'עם משקולות יד בלבד'
       : 'ללא ציוד (משקל גוף)'
}

// The 4 wizard questions - the UI iterates over these
export const WIZARD_STEPS = [
  {
    key: 'goal',
    question: 'מה המטרה שלך?',
    options: [
      { value: 'gain_muscle', label: 'בניית שריר', icon: '💪', description: 'לצמוח, להתמלא, מסה' },
      { value: 'strength',    label: 'כוח',         icon: '🏋️', description: 'להרים כבד, PR שיאים' },
      { value: 'lose_weight', label: 'ירידה במשקל', icon: '🔥', description: 'לחתוך, לשרוף שומן' },
    ],
  },
  {
    key: 'equipment',
    question: 'איזה ציוד יש לך?',
    options: [
      { value: 'gym',       label: 'חדר כושר',    icon: '🏢', description: 'מכונות, מוטות, כבלים' },
      { value: 'dumbbells', label: 'משקולות יד',  icon: '💪', description: 'זוג משקולות בבית' },
      { value: 'none',      label: 'ללא ציוד',    icon: '🧍', description: 'משקל גוף בלבד' },
    ],
  },
  {
    key: 'daysPerWeek',
    question: 'כמה ימים בשבוע תוכל להתאמן?',
    options: [
      { value: 2, label: '2 ימים', icon: '📅', description: 'זמן מוגבל' },
      { value: 3, label: '3 ימים', icon: '📅', description: 'מומלץ להתחלה' },
      { value: 4, label: '4 ימים', icon: '📅', description: 'איזון טוב' },
      { value: 5, label: '5 ימים', icon: '📅', description: 'למתקדמים' },
      { value: 6, label: '6 ימים', icon: '📅', description: 'לרציניים' },
    ],
  },
  {
    key: 'experience',
    question: 'מה רמת הניסיון שלך?',
    options: [
      { value: 'beginner',     label: 'מתחיל',   icon: '🌱', description: 'פחות משנה של אימונים' },
      { value: 'intermediate', label: 'בינוני',  icon: '💪', description: '1-3 שנות אימונים רציניים' },
      { value: 'advanced',     label: 'מתקדם',   icon: '🏆', description: '3+ שנים, מכיר את כל התרגילים' },
    ],
  },
]
