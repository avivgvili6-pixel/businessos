// Central WOD generator.
// Composes movements + format + demographic + injuries + intent into a WOD.

import { MOVEMENTS, MOVEMENT_BY_ID, filterByInjuries } from './movements'
import { BUILDERS, FORMATS } from './formats'

const INTENT_TAGS = {
  general:    ['metcon'],
  strength:   ['strength'],
  endurance:  ['endurance'],
  fat_loss:   ['metcon', 'high_intensity'],
  skill:      ['skill', 'gymnastics'],
  recovery:   ['mobility'],
  competition:['metcon', 'olympic', 'high_intensity'],
}

const LENGTH_TO_KEY = {
  short:  { key: 'short',  min: 8 },
  medium: { key: 'medium', min: 18 },
  long:   { key: 'long',   min: 35 },
}

// Main entry point.
// input: {
//   selectionMode: 'random'|'custom',
//   customMovementIds: string[],       // when selectionMode='custom'
//   useAllSelected: boolean,           // 'Use ALL' vs 'Use SOME'
//   format: 'emom'|'amrap'|...|'random',
//   intent: 'general'|'strength'|...,
//   length: 'short'|'medium'|'long'|number,   // number = custom minutes
//   sex: 'male'|'female',
//   age: number,
//   injuries: string[],                // matches movement.contraindications
//   equipment: string[]|null,          // null = all equipment available
// }
export function generateWOD(input) {
  const {
    selectionMode = 'random',
    customMovementIds = [],
    useAllSelected = false,
    format = 'random',
    intent = 'general',
    length = 'medium',
    sex = 'male',
    age = 30,
    injuries = [],
    equipment = null,
  } = input

  // Length → key + minutes
  let lengthKey, minutes
  if (typeof length === 'number') {
    minutes = length
    lengthKey = length < 13 ? 'short' : length < 26 ? 'medium' : 'long'
  } else {
    lengthKey = LENGTH_TO_KEY[length]?.key || 'medium'
    minutes = LENGTH_TO_KEY[length]?.min || 18
  }

  // Build candidate pool
  let pool = MOVEMENTS
  if (equipment) pool = pool.filter(m => m.equipment.length === 0 || m.equipment.every(e => equipment.includes(e)))
  pool = filterByInjuries(pool, injuries)

  // Custom selection
  let selected = []
  if (selectionMode === 'custom' && customMovementIds.length) {
    selected = customMovementIds.map(id => MOVEMENT_BY_ID[id]).filter(Boolean)
    selected = filterByInjuries(selected, injuries)
  } else {
    // Random: filter by intent tags
    const intentTags = INTENT_TAGS[intent] || ['metcon']
    const matching = pool.filter(m => intentTags.some(t => m.tags.includes(t)))
    // fall back to full pool if intent filter is too strict
    const source = matching.length >= 3 ? matching : pool
    // Pick 3-5 diverse movements
    const targetCount = 3 + Math.floor(Math.random() * 3)
    selected = pickDiverse(source, targetCount)
  }

  if (!selected.length) {
    return {
      error: 'לא נמצאו תנועות מתאימות. הסר מגבלות פציעות או נסה בחירה אחרת.',
      lines: [], movements: [], format: null, timeCap: 0,
    }
  }

  // If custom+SOME → reduce to 3-4
  if (selectionMode === 'custom' && !useAllSelected && selected.length > 4) {
    selected = pickDiverse(selected, 4)
  }

  // Pick actual format if random
  const actualFormat = format === 'random'
    ? randomFormat(intent, lengthKey)
    : format

  const ctx = {
    movements: selected,
    lengthKey,
    length: minutes,
    sex,
    age,
    intent,
  }

  const builder = BUILDERS[actualFormat] || BUILDERS.amrap
  const wod = builder(ctx)

  return {
    ...wod,
    intent,
    lengthKey,
    generatedAt: new Date().toISOString(),
    demographic: { sex, age },
    formatMeta: FORMATS[actualFormat] || FORMATS.amrap,
  }
}

// Pick diverse movements — avoid stacking 3 upper-body pushes for example.
function pickDiverse(source, count) {
  if (source.length <= count) return [...source]
  const picked = []
  const usedCategories = new Set()
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  // First pass: one per category if possible
  for (const m of shuffled) {
    if (picked.length >= count) break
    if (!usedCategories.has(m.category)) {
      picked.push(m)
      usedCategories.add(m.category)
    }
  }
  // Second pass: fill remaining slots
  for (const m of shuffled) {
    if (picked.length >= count) break
    if (!picked.includes(m)) picked.push(m)
  }
  return picked
}

// Choose a format that matches the intent + length.
function randomFormat(intent, lengthKey) {
  if (intent === 'strength')     return Math.random() < 0.7 ? 'strength_metcon' : 'for_time'
  if (intent === 'endurance')    return Math.random() < 0.5 ? 'amrap' : 'intervals'
  if (intent === 'fat_loss')     return ['emom', 'amrap', 'intervals'][Math.floor(Math.random() * 3)]
  if (intent === 'skill')        return Math.random() < 0.5 ? 'emom' : 'for_time'
  if (intent === 'recovery')     return 'intervals'
  if (intent === 'competition')  return Math.random() < 0.4 ? 'strength_metcon' : ['amrap', 'for_time'][Math.floor(Math.random() * 2)]

  // general → weighted mix
  const bag = ['amrap', 'amrap', 'for_time', 'for_time', 'emom', 'chipper', 'intervals']
  return bag[Math.floor(Math.random() * bag.length)]
}
