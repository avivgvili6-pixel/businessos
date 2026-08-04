// Olympic Weightlifting — Snatch, Clean & Jerk, and variations.
// Single-workout templates + program library.
// Uses %1RM from the profile when available (state.profile.oneRMs.snatch / clean).

const SESSIONS = {
  snatch: {
    name: 'Snatch Day · Technique + Heavy',
    a: { title:'A · טכניקה (10 דק׳)', lines:[
      'Snatch Pull → Hang Snatch × 3 @ 50%',
      '× 5 סבבים',
    ]},
    b: { title:'B · Snatch (עולה)', lines:[
      '2 × 3 @ 70%',
      '2 × 2 @ 80%',
      '3 × 1 @ 85–90%',
    ]},
    c: { title:'C · Accessory', lines:[
      'Overhead Squat 4×5 @ 65%',
      'Snatch Grip Deadlift 3×5 @ 80%',
    ]},
  },
  clean_jerk: {
    name: 'Clean & Jerk Day',
    a: { title:'A · טכניקה (10 דק׳)', lines:[
      'Clean Pull → Hang Clean × 2 @ 60%',
      '× 5 סבבים',
    ]},
    b: { title:'B · Clean & Jerk (עולה)', lines:[
      '3 × 2+1 @ 70%',
      '3 × 1+1 @ 80%',
      '2 × 1+1 @ 85–90%',
    ]},
    c: { title:'C · Accessory', lines:[
      'Front Squat 4×5 @ 75%',
      'Push Press 4×5 @ 70%',
    ]},
  },
  squat: {
    name: 'Squat Focus',
    a: { title:'A · Front Squat', lines:[
      '5 × 3 @ 80%',
      'מנוחה 3 דק׳ בין סטים',
    ]},
    b: { title:'B · Back Squat', lines:[
      '4 × 5 @ 75%',
    ]},
    c: { title:'C · Accessory', lines:[
      'Snatch Balance 4×3',
      'Good Morning 3×8',
    ]},
  },
  jerk: {
    name: 'Jerk Focus',
    a: { title:'A · Jerk Balance', lines:[
      '5 × 3 Jerk Balance',
    ]},
    b: { title:'B · Split Jerk (עולה)', lines:[
      '3 × 2 @ 70%',
      '3 × 1 @ 85%',
      '2 × 1 @ 90%',
    ]},
    c: { title:'C · Overhead Work', lines:[
      'Push Jerk 4×3',
      'Sots Press 3×5',
    ]},
  },
  power: {
    name: 'Power Variants',
    a: { title:'A · Power Snatch', lines:[
      '5 × 3 @ 65%',
    ]},
    b: { title:'B · Power Clean + Push Press', lines:[
      '5 × (2+2) @ 70%',
    ]},
    c: { title:'C · Explosive Accessory', lines:[
      'Box Jump 4×5',
      'Broad Jump 3×5',
    ]},
  },
}

export const OLY_FOCUSES = [
  { key:'random',      he:'הפתעה',       icon:'🎲' },
  { key:'snatch',      he:'Snatch',      icon:'🥋' },
  { key:'clean_jerk',  he:'C&J',         icon:'🏋🏻‍♂️' },
  { key:'squat',       he:'Squat',       icon:'🦵' },
  { key:'jerk',        he:'Jerk',        icon:'⬆️' },
  { key:'power',       he:'Power',       icon:'💥' },
]

export function generateWeightliftingWod({ focus = 'random', oneRMs = {} } = {}) {
  const keys = Object.keys(SESSIONS)
  const key = focus === 'random' ? keys[Math.floor(Math.random() * keys.length)] : focus
  const tpl = SESSIONS[key] || SESSIONS.snatch
  const notes = []
  if (oneRMs.snatch && (key === 'snatch' || key === 'power'))
    notes.push(`Snatch 1RM: ${oneRMs.snatch}kg`)
  if (oneRMs.clean && (key === 'clean_jerk' || key === 'jerk' || key === 'power'))
    notes.push(`Clean 1RM: ${oneRMs.clean}kg`)

  const lines = [
    tpl.name.toUpperCase(),
    '',
    tpl.a.title,
    ...tpl.a.lines,
    '',
    tpl.b.title,
    ...tpl.b.lines,
    '',
    tpl.c.title,
    ...tpl.c.lines,
  ]
  if (notes.length) {
    lines.push('')
    lines.push('─── ה־1RM שלך ───')
    notes.forEach(n => lines.push(n))
  } else {
    lines.push('')
    lines.push('─── טיפ ───')
    lines.push('הזן את ה־1RM שלך בפרופיל כדי לראות משקלים ק״ג מחושבים')
  }
  return {
    title: tpl.name,
    format: 'strength',
    lines,
    movements: [],
    discipline: 'weightlifting',
    focus: key,
  }
}

export const OLY_PROGRAMS = [
  {
    id: 'oly_snatch_pr',
    label: 'Snatch PR Cycle · 12 שבועות',
    weeks: 12,
    daysPerWeek: 3,
    goal: 'להעלות את ה־Snatch 1RM ב-5-10 ק״ג',
    schema: 'Volume → Intensity → Peak',
    author: 'Selano',
    origin: 'Bulgarian-inspired',
    level: 'מתקדם',
    sessionNames: ['Snatch Volume','Snatch Intensity','Accessory'],
  },
  {
    id: 'oly_cj_prog',
    label: 'Clean & Jerk Progression · 10 שבועות',
    weeks: 10,
    daysPerWeek: 3,
    goal: 'לשפר את ה־C&J עם דגש על Split Jerk',
    schema: 'Technique → Strength → Peak',
    author: 'Selano',
    origin: 'Classic OL cycle',
    level: 'בינוני',
    sessionNames: ['Clean Focus','Jerk Focus','Squat Work'],
  },
  {
    id: 'oly_total',
    label: 'Olympic Total · 8 שבועות',
    weeks: 8,
    daysPerWeek: 4,
    goal: 'להעלות את הסה״כ (Snatch + C&J + Squat) ב-10-15 ק״ג',
    schema: 'Snatch + CJ + Squat',
    author: 'Selano',
    origin: 'Total-focused cycle',
    level: 'מתקדם',
    sessionNames: ['Snatch Day','Clean & Jerk Day','Squat Focus','Power Variants'],
  },
]

export function weightliftingProgramToPlan(programId, oneRMs = {}) {
  const prog = OLY_PROGRAMS.find(p => p.id === programId)
  if (!prog) return null
  const sessions = prog.sessionNames.map(name => {
    const focus = name.includes('Snatch Volume') || name.includes('Snatch Intensity') || name === 'Snatch Day' ? 'snatch'
      : name.includes('Clean Focus') || name === 'Clean & Jerk Day' ? 'clean_jerk'
      : name.includes('Jerk Focus') ? 'jerk'
      : name.includes('Squat') ? 'squat'
      : name.includes('Power') ? 'power'
      : name.includes('Accessory') ? 'power'
      : 'snatch'
    const wod = generateWeightliftingWod({ focus, oneRMs })
    return {
      name: `${name} · ${wod.title}`,
      wodType: 'Weightlifting',
      prescription: wod.lines.join('\n'),
      exercises: [],
    }
  })
  return {
    name: prog.label,
    programId: prog.id,
    discipline: 'weightlifting',
    split: prog.schema,
    days: prog.daysPerWeek,
    weeks: prog.weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}
