// Scaling logic — chooses rx / scaled / foundation for a movement
// based on athlete's demographic + declared level.

// Level buckets used by scaleFor():
//   'elite'       → Rx+ (advanced Rx) or Rx
//   'rx'          → Rx (standard)
//   'intermediate'→ Scaled
//   'beginner'    → Foundation
//   'senior'      → Foundation (or Scaled if fit)

export function levelFrom({ experience, sex, age }) {
  // Map profile.experience (Hebrew) to a level bucket.
  const exp = (experience || '').toLowerCase()
  if (exp.includes('מתקדם') || exp.includes('advanced') || exp.includes('אליט')) return 'rx'
  if (exp.includes('בינוני') || exp.includes('intermediate')) return 'intermediate'
  if (exp.includes('מתחיל') || exp.includes('beginner') || exp.includes('חדש')) return 'beginner'
  // Age override: 60+ defaults to foundation regardless
  if (age && age >= 60) return 'senior'
  if (age && age >= 45) return 'intermediate'
  return 'intermediate'
}

export function scaleFor(movement, { level, sex } = {}) {
  const s = sex === 'female' ? 'female' : 'male'
  const rx = movement.rx?.[s]
  const scaled = movement.scaled?.[s]
  const foundation = movement.foundation?.[s]

  if (level === 'elite' || level === 'rx') return { tier: 'Rx', load: rx, unit: movement.loadUnit }
  if (level === 'intermediate') return { tier: 'Scaled', load: scaled || rx, unit: movement.loadUnit }
  // beginner + senior
  return { tier: 'Foundation', load: foundation || scaled || rx, unit: movement.loadUnit }
}

// Demographic-based rep adjustment. Applies on top of the movement's base rep range.
// Aligned with utils/demographicAdjustment.js physiology model.
export function repFactor({ sex, age }) {
  let factor = 1
  // Females tolerate ~30% more reps at metcon intensities (Hunter 2014)
  if (sex === 'female') factor *= 1.20
  // Age-based volume adjustment
  if (age) {
    if (age >= 60) factor *= 0.75
    else if (age >= 45) factor *= 0.90
    else if (age >= 30) factor *= 1.0
    else factor *= 1.05
  }
  return factor
}

export function adjustReps(baseRange, factor) {
  const [lo, hi] = baseRange
  return [Math.max(1, Math.round(lo * factor)), Math.max(1, Math.round(hi * factor))]
}

export function formatLoad(scale) {
  if (!scale?.load) return ''
  return `${scale.load}${scale.unit || 'kg'}`
}

export function loadPair(movement, sex) {
  // Format "60/40kg" pair like classic CrossFit prescriptions.
  const s = sex === 'female' ? 'female' : 'male'
  const rx = movement.rx
  if (!rx) return ''
  const unit = movement.loadUnit || 'kg'
  return s === 'female' ? `${rx.female}${unit}` : `${rx.male}/${rx.female}${unit}`
}
