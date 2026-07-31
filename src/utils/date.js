export const DAYS_HE = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת']
export const DAYS_SHORT_HE = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳']

export function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function dayName(idx) { return DAYS_HE[idx] }

export function greeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'לילה טוב'
  if (h < 12) return 'בוקר טוב'
  if (h < 17) return 'צהריים טובים'
  if (h < 21) return 'ערב טוב'
  return 'לילה טוב'
}
