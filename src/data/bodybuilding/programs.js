// 26 pre-built programs — mirrors the reference app's Explore Programs catalog.
// Programs organize routines into weekly training plans.
// Filters: Level × Goal × Equipment (approved by user).

// Levels
export const LEVELS = {
  beginner:     { he: 'מתחיל', en: 'Beginner',     order: 1 },
  intermediate: { he: 'בינוני', en: 'Intermediate', order: 2 },
  advanced:     { he: 'מתקדם', en: 'Advanced',     order: 3 },
}

// Goals
export const GOALS = {
  gain_muscle: { he: 'בניית שריר', en: 'Gain Muscle', icon: '' },
  strength:    { he: 'כוח',         en: 'Strength',    icon: '' },
  lose_weight: { he: 'ירידה במשקל', en: 'Lose Weight', icon: '' },
}

// Equipment
export const EQUIPMENT_TYPES = {
  gym:        { he: 'חדר כושר', en: 'Gym',        icon: '' },
  dumbbells:  { he: 'משקולות יד', en: 'Dumbbells', icon: '' },
  none:       { he: 'ללא ציוד',   en: 'None',      icon: '' },
}

const pg = (id, name, opts) => ({
  id, name,
  emoji: opts.emoji || '',
  category: opts.category || 'strength',
  level: opts.level,
  goal: opts.goal,
  equipment: opts.equipment,
  description: opts.description,
  routines: opts.routines,        // array of routine ids
  weeksRecommended: opts.weeks || 8,
  daysPerWeek: opts.days || opts.routines.length,
  createdBy: 'selano',
  inspiration: opts.inspiration,  // credit source (Menno Henselmans, Eric Helms, etc.)
})

export const PROGRAMS = [
  // ═══════════════════ BEGINNER (8) ═══════════════════
  pg('beginner_ppl_gym', 'Beginner Push/Pull/Legs (Gym)', {
    emoji: '', level: 'beginner', goal: 'gain_muscle', equipment: 'gym',
    description: 'תוכנית מעולה למתחילים. 3 אימונים בשבוע, בסיס לשריר וכוח.',
    routines: ['beg_push', 'beg_pull', 'beg_legs'],
    weeks: 8, days: 3,
    inspiration: 'Jeff Nippard, Renaissance Periodization',
  }),
  pg('beginner_fb_gym', 'Beginner Full-Body (Gym)', {
    emoji: '', level: 'beginner', goal: 'gain_muscle', equipment: 'gym',
    description: 'אימון גוף מלא לכל אימון - אידיאלי למתחילים ולזמן קצר.',
    routines: ['beg_full_a', 'beg_full_b', 'beg_full_a'],
    weeks: 8, days: 3,
    inspiration: 'Starting Strength methodology',
  }),
  pg('beginner_fb_home', 'Beginner Full-Body (Home)', {
    emoji: '', level: 'beginner', goal: 'gain_muscle', equipment: 'none',
    description: 'הכל בבית עם משקל גוף. מושלם להתחלה או תקופות ללא גישה לחדר כושר.',
    routines: ['home_full_bw', 'home_full_bw', 'home_full_bw'],
    weeks: 6, days: 3,
    inspiration: 'Convict Conditioning',
  }),
  pg('beginner_fb_dumbbells', 'Beginner Full-Body (Dumbbells)', {
    emoji: '', level: 'beginner', goal: 'gain_muscle', equipment: 'dumbbells',
    description: 'עם זוג משקולות יד בלבד. גמיש, יעיל, מתאים לבית.',
    routines: ['home_full_db', 'home_full_db', 'home_full_db'],
    weeks: 8, days: 3,
  }),
  pg('beginner_strength_gym', 'Beginner Strength (Gym)', {
    emoji: '', level: 'beginner', goal: 'strength', equipment: 'gym',
    description: 'התמקדות ב-3 התרגילים המרכזיים: סקוואט, בנץ׳, דדליפט.',
    routines: ['beg_full_a', 'beg_full_b', 'beg_full_a'],
    weeks: 12, days: 3,
    inspiration: 'Starting Strength - Mark Rippetoe',
  }),
  pg('beginner_weight_loss_gym', 'Beginner Weight Loss (Gym)', {
    emoji: '', level: 'beginner', goal: 'lose_weight', equipment: 'gym',
    description: 'שילוב כוח + מטבוליזם. 4 אימונים + קרדיו קצר בסוף.',
    routines: ['beg_push', 'beg_pull', 'beg_legs', 'beg_full_a'],
    weeks: 12, days: 4,
  }),
  pg('beginner_weight_loss_home', 'Beginner Weight Loss (Home)', {
    emoji: '', level: 'beginner', goal: 'lose_weight', equipment: 'none',
    description: 'HIIT + משקל גוף לשריפת קלוריות. ללא ציוד.',
    routines: ['home_full_bw', 'travel_20min', 'home_full_bw'],
    weeks: 8, days: 3,
  }),
  pg('travel_no_equipment', 'Travel / Vacation (No Equipment)', {
    emoji: '', level: 'beginner', goal: 'gain_muscle', equipment: 'none',
    description: 'אימונים קצרים לזמן מוגבל. 20 דקות, ללא ציוד.',
    routines: ['travel_20min', 'travel_20min', 'travel_20min'],
    weeks: 4, days: 3,
  }),

  // ═══════════════════ INTERMEDIATE (10) ═══════════════════
  pg('intermediate_ppl_gym', 'Intermediate Push/Pull/Legs (Gym)', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'gym',
    description: 'PPL קלאסי - 6 ימים בשבוע, נפח גבוה, לבניית שריר יעילה.',
    routines: ['int_push', 'int_pull', 'int_legs', 'int_push', 'int_pull', 'int_legs'],
    weeks: 12, days: 6,
    inspiration: 'Eric Helms, Menno Henselmans',
  }),
  pg('intermediate_ul_gym', 'Intermediate Upper/Lower (Gym)', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'gym',
    description: 'Upper/Lower - 4 ימים בשבוע. איזון בין תדירות ונפח.',
    routines: ['upper_a', 'lower_a', 'upper_b', 'lower_b'],
    weeks: 10, days: 4,
    inspiration: 'Jeff Nippard PPL alternative',
  }),
  pg('intermediate_fb_gym', 'Intermediate Full-Body (Gym)', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'gym',
    description: 'גוף מלא 3-4 פעמים בשבוע. יעיל בזמן, תדירות גבוהה לכל שריר.',
    routines: ['adv_full_1', 'adv_full_2', 'adv_full_3'],
    weeks: 10, days: 3,
  }),
  pg('intermediate_bro_split', 'Intermediate Bro Split (5-Day)', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'gym',
    description: 'קלאסיקה - חזה/גב/כתפיים/רגליים/ידיים. נפח גדול לכל שריר.',
    routines: ['bro_chest', 'bro_back', 'bro_shoulders', 'bro_legs', 'bro_arms'],
    weeks: 12, days: 5,
    inspiration: 'Classic bodybuilding split',
  }),
  pg('intermediate_ppl_dumbbells', 'Intermediate PPL (Dumbbells)', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'dumbbells',
    description: 'PPL עם משקולות יד בלבד. מושלם לבית מאובזר.',
    routines: ['home_full_db', 'home_full_db', 'home_full_db'],
    weeks: 8, days: 3,
  }),
  pg('intermediate_strength_gym', 'Intermediate Strength (Gym)', {
    emoji: '', level: 'intermediate', goal: 'strength', equipment: 'gym',
    description: 'התמקדות בהכפלת המקסימום. 5×5 קלאסי + עזרים.',
    routines: ['adv_full_1', 'adv_full_2', 'adv_full_3'],
    weeks: 12, days: 3,
    inspiration: 'StrongLifts 5×5, Wendler 5/3/1',
  }),
  pg('intermediate_powerlifting', 'Powerlifting Intermediate', {
    emoji: '', level: 'intermediate', goal: 'strength', equipment: 'gym',
    description: 'הכנה לתחרות פאוארליפטינג. סקוואט/בנץ׳/דדליפט + עזרים ספציפיים.',
    routines: ['adv_full_1', 'adv_full_3', 'adv_full_2', 'adv_full_3'],
    weeks: 16, days: 4,
    inspiration: 'Sheiko, Westside Barbell',
  }),
  pg('intermediate_weight_loss_gym', 'Intermediate Weight Loss (Gym)', {
    emoji: '', level: 'intermediate', goal: 'lose_weight', equipment: 'gym',
    description: 'נפח גבוה + מנוחות קצרות + סופרסטים. שורף שריר-מוכוון.',
    routines: ['upper_a', 'lower_a', 'upper_b', 'lower_b'],
    weeks: 12, days: 4,
  }),
  pg('intermediate_recomp', 'Body Recomposition', {
    emoji: '', level: 'intermediate', goal: 'lose_weight', equipment: 'gym',
    description: 'לרזות ולהתחזק בו-זמנית. גירעון קלורי מתון + כוח.',
    routines: ['upper_a', 'lower_a', 'upper_b', 'lower_b', 'bro_arms'],
    weeks: 16, days: 5,
    inspiration: 'Lyle McDonald, RP Diet',
  }),
  pg('gymnastic_strength', 'Gymnastic Strength', {
    emoji: '', level: 'intermediate', goal: 'gain_muscle', equipment: 'none',
    description: 'שליטה בגוף - Muscle-ups, Handstand, L-sit, Front Lever.',
    routines: ['home_full_bw', 'home_full_bw', 'home_full_bw'],
    weeks: 12, days: 3,
    inspiration: 'GMB Fitness, Ido Portal',
  }),

  // ═══════════════════ ADVANCED (8) ═══════════════════
  pg('advanced_fb_gym', 'Advanced Full-Body (Gym Equipment)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'gym',
    description: 'תוכנית גוף מלא מתקדמת בהשראת Menno Henselmans, Eric Helms ו-Jeff Nippard. המטרה: לאמן את כל הגוף 5 פעמים בשבוע במגוון תרגילים ומכשירים.',
    routines: ['adv_full_1', 'adv_full_2', 'adv_full_3', 'adv_full_4', 'adv_full_5'],
    weeks: 12, days: 5,
    inspiration: 'Menno Henselmans · Eric Helms · Jeff Nippard',
  }),
  pg('advanced_fb_dumbbells', 'Advanced Full-Body (Dumbbells)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'dumbbells',
    description: 'רק משקולות יד, אבל מתקדם. 4 אימוני גוף מלא עם עומס גבוה.',
    routines: ['home_full_db', 'home_full_db', 'home_full_db', 'home_full_db'],
    weeks: 10, days: 4,
  }),
  pg('advanced_fb_bodyweight', 'Advanced Full-Body (Equipment-Free)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'none',
    description: 'משקל גוף מתקדם - Pistol squats, One-arm push-ups, Handstand pushups, Front Lever.',
    routines: ['home_full_bw', 'home_full_bw', 'home_full_bw'],
    weeks: 12, days: 3,
    inspiration: 'Al Kavadlo, GMB',
  }),
  pg('advanced_ul_dumbbells', 'Advanced Upper/Lower (Dumbbells)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'dumbbells',
    description: 'Upper/Lower 6 ימים עם משקולות יד. גירוי גבוה לצמיחה.',
    routines: ['upper_a', 'lower_a', 'upper_b', 'lower_b', 'upper_a', 'lower_a'],
    weeks: 10, days: 6,
  }),
  pg('advanced_ppl_gym', 'Advanced Push/Pull/Legs (Gym)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'gym',
    description: 'PPL של 6 ימים - נפח מקסימלי לגידול. אימון קשה 6 מתוך 7.',
    routines: ['adv_push', 'adv_pull', 'adv_legs', 'adv_push', 'adv_pull', 'adv_legs'],
    weeks: 12, days: 6,
    inspiration: 'Jeff Nippard High Volume PPL',
  }),
  pg('advanced_bro_split', 'Advanced Bro Split (5-Day)', {
    emoji: '', level: 'advanced', goal: 'gain_muscle', equipment: 'gym',
    description: 'ברו ספליט קלאסי לעילית - 5 ימים, שריר אחד ליום, נפח קיצוני.',
    routines: ['bro_chest', 'bro_back', 'bro_shoulders', 'bro_legs', 'bro_arms'],
    weeks: 12, days: 5,
  }),
  pg('advanced_strength', 'Advanced Strength / Powerlifting', {
    emoji: '', level: 'advanced', goal: 'strength', equipment: 'gym',
    description: 'לפאוארליפטרים - Sheiko-style volume + intensity waves.',
    routines: ['adv_full_1', 'adv_full_3', 'adv_full_2', 'adv_full_3'],
    weeks: 16, days: 4,
    inspiration: 'Boris Sheiko, Ed Coan methodology',
  }),
  pg('advanced_weight_loss', 'Advanced Weight Loss (Gym)', {
    emoji: '', level: 'advanced', goal: 'lose_weight', equipment: 'gym',
    description: 'לפרו-אתלטים - שמירה על שריר בגירעון קלורי אגרסיבי.',
    routines: ['adv_push', 'adv_pull', 'adv_legs', 'adv_push', 'bro_arms'],
    weeks: 12, days: 5,
    inspiration: 'Menno Henselmans cutting protocols',
  }),
]

// ─── Helpers ────────────────────────────────────────────────────────
export const PROGRAM_BY_ID = Object.fromEntries(PROGRAMS.map(p => [p.id, p]))

export function filterPrograms({ level, goal, equipment } = {}) {
  return PROGRAMS.filter(p => {
    if (level && p.level !== level) return false
    if (goal && p.goal !== goal) return false
    if (equipment && p.equipment !== equipment) return false
    return true
  })
}

export function programsByCategory() {
  const grouped = { beginner: [], intermediate: [], advanced: [] }
  for (const p of PROGRAMS) grouped[p.level]?.push(p)
  return grouped
}

// Featured programs (curated top-6 for the Explore hub)
export const FEATURED_PROGRAM_IDS = [
  'advanced_fb_gym',
  'intermediate_ppl_gym',
  'beginner_ppl_gym',
  'intermediate_ul_gym',
  'advanced_bro_split',
  'beginner_fb_home',
]

// Routine categories for the "Routines" section (like the reference app's category grid)
export const ROUTINE_CATEGORIES = [
  { key: 'at_home',    he: 'בית',           en: 'At home',       icon: '', filter: p => p.equipment === 'none' },
  { key: 'travel',     he: 'נסיעות',        en: 'Travel',        icon: '', filter: p => p.id === 'travel_no_equipment' },
  { key: 'dumbbells',  he: 'משקולות יד',     en: 'Dumbbells Only', icon: '', filter: p => p.equipment === 'dumbbells' },
  { key: 'gym',        he: 'חדר כושר',      en: 'Gym',           icon: '', filter: p => p.equipment === 'gym' },
  { key: 'bodyweight', he: 'משקל גוף',      en: 'Bodyweight',    icon: '', filter: p => p.equipment === 'none' },
  { key: 'strength',   he: 'כוח',           en: 'Strength',      icon: '', filter: p => p.goal === 'strength' },
  { key: 'weight_loss', he: 'ירידה במשקל',   en: 'Weight Loss',   icon: '', filter: p => p.goal === 'lose_weight' },
]
