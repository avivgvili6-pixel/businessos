// Running — intervals, tempo, LSD, sprints, hill repeats.
// Pace targets derived from user's 5K PB when available (via Jack Daniels VDOT model).

// Rough VDOT-style pace calculator (simplified).
// pace_per_km at 5K = fiveKSeconds / 5. Threshold ≈ +6-8 s/km. Interval ≈ 5K pace.
function paces(fiveKSec) {
  if (!fiveKSec) return null
  const p5k = fiveKSec / 5 // sec/km
  return {
    easy: Math.round(p5k * 1.32),      // Zone 2
    marathon: Math.round(p5k * 1.16),
    threshold: Math.round(p5k * 1.06),
    interval: Math.round(p5k * 1.00),  // ~5K race pace
    rep: Math.round(p5k * 0.94),       // faster than 5K
  }
}

function fmt(sec) {
  const m = Math.floor(sec / 60), s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2,'0')}`
}

const SESSIONS = {
  intervals: (p) => ({
    name: 'Intervals · 6 × 800m',
    lines: [
      'חימום (10 דק׳)',
      'Easy jog + drills + strides ×4',
      '',
      'Main Set',
      p ? `6 × 800m @ ${fmt(p.interval)}/km` : '6 × 800m @ 5K race pace',
      'Rest 2:00 בין חזרות',
      '',
      'Cool Down',
      '10 דק׳ Easy · Zone 2',
    ],
  }),
  tempo: (p) => ({
    name: 'Tempo · 20 דק׳',
    lines: [
      'חימום (10 דק׳)',
      'Easy jog',
      '',
      'Main Set',
      p ? `20 דק׳ @ ${fmt(p.threshold)}/km (Threshold)` : '20 דק׳ בקצב סף (comfortably hard)',
      '',
      'Cool Down',
      '10 דק׳ Easy',
    ],
  }),
  lsd: (p) => ({
    name: 'LSD · Long Slow Distance',
    lines: [
      p ? `60-90 דק׳ @ ${fmt(p.easy)}/km (Easy)` : '60-90 דק׳ בקצב שיחה (Easy)',
      '',
      'כלל הזהב: אם אתה לא יכול לדבר במשפט שלם — אתה מהיר מדי.',
      'המטרה: לבנות בסיס אירובי.',
    ],
  }),
  hills: () => ({
    name: 'Hill Repeats · 10 × 60s',
    lines: [
      'חימום (10 דק׳) · Easy + drills',
      '',
      'Main Set',
      '10 × 60s uphill חזק (~90% מאמץ)',
      'Jog חזרה כמנוחה',
      '',
      'Cool Down',
      '10 דק׳ Easy',
    ],
  }),
  sprints: (p) => ({
    name: 'Sprints · 8 × 200m',
    lines: [
      'חימום (12 דק׳) · Easy + strides ×6',
      '',
      'Main Set',
      p ? `8 × 200m @ ${fmt(Math.round(p.rep * 0.2))}` : '8 × 200m מהיר',
      'Full recovery בין חזרות (60-90s)',
      '',
      'Cool Down',
      '8 דק׳ Easy',
    ],
  }),
  fartlek: () => ({
    name: 'Fartlek · 40 דק׳',
    lines: [
      'חימום (10 דק׳) · Easy',
      '',
      'Main (25 דק׳)',
      'חלף בין 2 דק׳ מהיר / 2 דק׳ Easy',
      'הרגש את הגוף — לפי RPE, לא לפי שעון',
      '',
      'Cool Down',
      '5 דק׳ Easy',
    ],
  }),
}

export const RUN_FOCUSES = [
  { key:'random',     he:'הפתעה',    icon:'🎲' },
  { key:'intervals',  he:'אינטרוול',  icon:'⚡' },
  { key:'tempo',      he:'טמפו',      icon:'🎯' },
  { key:'lsd',        he:'LSD',       icon:'🌅' },
  { key:'hills',      he:'עליות',     icon:'⛰️' },
  { key:'sprints',    he:'ספרינטים', icon:'💨' },
  { key:'fartlek',    he:'Fartlek',   icon:'🎲' },
]

export function generateRunningWod({ focus = 'random', fiveKSec = null } = {}) {
  const keys = Object.keys(SESSIONS)
  const key = focus === 'random' ? keys[Math.floor(Math.random() * keys.length)] : focus
  const builder = SESSIONS[key] || SESSIONS.intervals
  const p = paces(fiveKSec)
  const tpl = builder(p)
  const lines = [tpl.name.toUpperCase(), '', ...tpl.lines]
  if (p) {
    lines.push('')
    lines.push('─── קצבים לפי 5K PB שלך ───')
    lines.push(`5K: ${fmt(fiveKSec)} · Easy ${fmt(p.easy)}/km · Threshold ${fmt(p.threshold)}/km`)
  } else {
    lines.push('')
    lines.push('─── טיפ ───')
    lines.push('הזן את ה־5K PB בפרופיל כדי לראות קצבים מדויקים')
  }
  return {
    title: tpl.name,
    format: 'endurance',
    lines,
    movements: [],
    discipline: 'running',
    focus: key,
  }
}

export const RUN_PROGRAMS = [
  {
    id: 'run_5k_sub25',
    label: 'Sub-25 · 5K · 8 שבועות',
    weeks: 8,
    daysPerWeek: 4,
    goal: 'לרוץ 5K מתחת ל-25 דקות',
    schema: 'Base → Threshold → Race',
    author: 'Selano',
    origin: 'Progressive base',
    level: 'מתחיל',
    sessionNames: ['Easy Base','Intervals','Tempo','Long'],
  },
  {
    id: 'run_10k',
    label: '10K Builder · 10 שבועות',
    weeks: 10,
    daysPerWeek: 4,
    goal: 'לסיים 10K עם קצב יציב',
    schema: 'Long + Tempo + Intervals',
    author: 'Selano',
    origin: 'Balanced volume',
    level: 'בינוני',
    sessionNames: ['Long Run','Intervals','Tempo','Easy'],
  },
  {
    id: 'run_half',
    label: 'Half Marathon · 12 שבועות',
    weeks: 12,
    daysPerWeek: 5,
    goal: 'לסיים חצי מרתון (21.1km)',
    schema: 'Long עד 18K · Threshold work',
    author: 'Selano',
    origin: 'Endurance-first',
    level: 'מתקדם',
    sessionNames: ['Long Run','Tempo','Intervals','Easy','Recovery'],
  },
  {
    id: 'run_cf_endurance',
    label: 'CrossFit Endurance · 6 שבועות',
    weeks: 6,
    daysPerWeek: 3,
    goal: 'לשפר סיבולת ל־Metcons ארוכים',
    schema: 'Intervals + Fartlek',
    author: 'Selano',
    origin: 'For CF athletes',
    level: 'בינוני',
    sessionNames: ['Intervals','Fartlek','Hills'],
  },
]

export function runningProgramToPlan(programId, fiveKSec = null) {
  const prog = RUN_PROGRAMS.find(p => p.id === programId)
  if (!prog) return null
  const sessions = prog.sessionNames.map(name => {
    const focus = name === 'Easy Base' || name === 'Easy' || name === 'Recovery' ? 'lsd'
      : name === 'Long Run' || name === 'Long' ? 'lsd'
      : name === 'Intervals' ? 'intervals'
      : name === 'Tempo' ? 'tempo'
      : name === 'Fartlek' ? 'fartlek'
      : name === 'Hills' ? 'hills'
      : 'intervals'
    const wod = generateRunningWod({ focus, fiveKSec })
    return {
      name: `${name} · ${wod.title}`,
      wodType: 'Running',
      prescription: wod.lines.join('\n'),
      exercises: [],
    }
  })
  return {
    name: prog.label,
    programId: prog.id,
    discipline: 'running',
    split: prog.schema,
    days: prog.daysPerWeek,
    weeks: prog.weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}
