// BMR - Mifflin-St Jeor
export function bmr({ sex, weightKg, heightCm, age }) {
  const s = sex === 'female' ? -161 : 5
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s)
}

export const activityFactors = {
  sedentary: { label: 'יושבני', factor: 1.2 },
  light: { label: 'קל', factor: 1.375 },
  moderate: { label: 'בינוני', factor: 1.55 },
  active: { label: 'פעיל', factor: 1.725 },
  athlete: { label: 'ספורטאי', factor: 1.9 },
}

export function tdee(bmrValue, activityKey = 'moderate') {
  return Math.round(bmrValue * (activityFactors[activityKey]?.factor || 1.55))
}

// goal → calorie adjustment
export const goalAdjustments = {
  cut:      { label: 'חיטוב / ירידה במשקל', kcalDelta: -400 },
  recomp:   { label: 'רה-קומפוזיציה',       kcalDelta:   0 },
  maintain: { label: 'שמירה',                kcalDelta:   0 },
  lean_bulk:{ label: 'עלייה נקייה',           kcalDelta: +250 },
  bulk:     { label: 'עלייה במסה',            kcalDelta: +500 },
}

// macros % by diet template
export const dietTemplates = {
  balanced:      { label: 'מאוזן',              p: 30, c: 40, f: 30 },
  high_protein:  { label: 'עתיר חלבון',         p: 40, c: 35, f: 25 },
  keto:          { label: 'קטו',                p: 25, c: 5,  f: 70 },
  carnivore:     { label: 'קרניבור',            p: 35, c: 0,  f: 65 },
  paleo:         { label: 'פליאו',              p: 30, c: 30, f: 40 },
  mediterranean: { label: 'ים-תיכוני',          p: 25, c: 45, f: 30 },
  dash:          { label: 'DASH (לחץ דם)',      p: 22, c: 55, f: 23 },
  whole30:       { label: 'Whole30',            p: 30, c: 35, f: 35 },
  low_carb:      { label: 'דל פחמימות',         p: 35, c: 20, f: 45 },
  low_fodmap:    { label: 'Low-FODMAP',         p: 25, c: 45, f: 30 },
  zone:          { label: 'Zone (40/30/30)',    p: 30, c: 40, f: 30 },
  vegetarian:    { label: 'צמחוני',             p: 25, c: 50, f: 25 },
  vegan:         { label: 'טבעוני',             p: 22, c: 53, f: 25 },
  pescatarian:   { label: 'פסקטריאני',          p: 28, c: 42, f: 30 },
  if_16_8:       { label: 'צום לסירוגין 16:8',  p: 30, c: 40, f: 30 },
  if_omad:       { label: 'ארוחה אחת ביום',     p: 35, c: 30, f: 35 },
}

export function macros(kcal, pPct = 30, cPct = 40, fPct = 30) {
  return {
    protein: Math.round((kcal * pPct/100) / 4),
    carbs:   Math.round((kcal * cPct/100) / 4),
    fat:     Math.round((kcal * fPct/100) / 9),
  }
}

// BMI
export function bmi(weightKg, heightCm) {
  const m = heightCm / 100
  return +(weightKg / (m * m)).toFixed(1)
}

// water recommendation (liters)
export function waterLiters(weightKg, activityKey = 'moderate') {
  const base = weightKg * 0.033
  const bonus = { sedentary: 0, light: .3, moderate: .5, active: .8, athlete: 1.2 }[activityKey] || .5
  return +(base + bonus).toFixed(1)
}
