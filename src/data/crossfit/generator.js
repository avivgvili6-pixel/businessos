// Central WOD generator.
// Composes movements + format + demographic + injuries + intent into a WOD.

import { MOVEMENTS, MOVEMENT_BY_ID, filterByInjuries } from './movements'
import { BUILDERS, FORMATS } from './formats'

const INTENT_TAGS = {
  general:    ['metcon'],
  hybrid:     ['strength', 'metcon', 'olympic'], // mixes big lifts with metcon movement
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
//   avoidMovementIds: string[],        // last-generated ids — regenerate picks fresh ones
//   avoidFormat: string,               // last-generated format — random picks a different one
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
    avoidMovementIds = [],
    avoidFormat = null,
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
    // Pick 3-5 diverse movements — prefer ones NOT in the previous WOD
    const targetCount = 3 + Math.floor(Math.random() * 3)
    selected = pickDiverse(source, targetCount, avoidMovementIds)
  }

  if (!selected.length) {
    return {
      error: 'לא נמצאו תנועות מתאימות. הסר מגבלות פציעות או נסה בחירה אחרת.',
      lines: [], movements: [], format: null, timeCap: 0,
    }
  }

  // If custom+SOME → reduce to 3-4 (avoid last round's picks when possible)
  if (selectionMode === 'custom' && !useAllSelected && selected.length > 4) {
    selected = pickDiverse(selected, 4, avoidMovementIds)
  }

  // Pick actual format if random — avoid repeating the previous format
  const actualFormat = format === 'random'
    ? randomFormat(intent, lengthKey, avoidFormat)
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
// avoidIds: ids used in the previous WOD, deprioritized so regenerate produces
// visibly different output. When the pool is small enough that we can't avoid
// them entirely, at least reorder-shuffle them last so the mix changes.
function pickDiverse(source, count, avoidIds = []) {
  if (source.length <= count) return shuffle([...source])
  const avoidSet = new Set(avoidIds || [])
  const shuffled = shuffle([...source])
  // Split into "fresh" and "recently used" — pick from fresh first
  const fresh = shuffled.filter(m => !avoidSet.has(m.id))
  const recentUsed = shuffled.filter(m => avoidSet.has(m.id))
  const orderedPool = [...fresh, ...recentUsed]

  const picked = []
  const usedCategories = new Set()
  // First pass: one per category if possible, preferring fresh
  for (const m of orderedPool) {
    if (picked.length >= count) break
    if (!usedCategories.has(m.category)) {
      picked.push(m)
      usedCategories.add(m.category)
    }
  }
  // Second pass: fill remaining slots
  for (const m of orderedPool) {
    if (picked.length >= count) break
    if (!picked.includes(m)) picked.push(m)
  }
  return picked
}

function shuffle(arr) {
  // Fisher-Yates — more uniform than sort(() => Math.random() - .5)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Choose a format that matches the intent + length. Avoids the previous
// format when there's more than one option in the bag.
function randomFormat(intent, lengthKey, avoidFormat) {
  const bags = {
    strength:    ['strength_metcon', 'strength_metcon', 'for_time'],
    hybrid:      ['strength_metcon', 'strength_metcon', 'chipper', 'for_time'],
    endurance:   ['amrap', 'intervals', 'amrap'],
    fat_loss:    ['emom', 'amrap', 'intervals'],
    skill:       ['emom', 'for_time'],
    recovery:    ['intervals'],
    competition: ['strength_metcon', 'amrap', 'for_time', 'chipper'],
    general:     ['amrap', 'amrap', 'for_time', 'for_time', 'emom', 'chipper', 'intervals'],
  }
  const bag = bags[intent] || bags.general
  const filtered = bag.filter(f => f !== avoidFormat)
  const source = filtered.length ? filtered : bag
  return source[Math.floor(Math.random() * source.length)]
}
