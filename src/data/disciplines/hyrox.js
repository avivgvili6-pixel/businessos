// HYROX — hybrid fitness race training.
// Race format: 8 × 1km run + 8 workout stations
// (SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad Jump 80m,
//  Row 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls 100/75).
// Templates cover single sessions + a full race simulation + program cycles.

const SESSIONS = {
  race_sim_mini: {
    name: 'Race Sim · Mini (4 stations)',
    a: { title:'A · חימום (10 דק׳)', lines:[
      '5 דק׳ ריצה קלה',
      '3× (10 Wall Balls + 10 Air Squats + 5 Burpees)',
    ]},
    b: { title:'B · Mini Sim', lines:[
      '4 × [ 500m Run + 250m Row + 10 Burpee Broad Jumps ]',
      'ללא מנוחה בין תחנות · מנוחה 2:00 בין סבבים',
    ]},
    c: { title:'C · Cool Down', lines:[
      '5 דק׳ הליכה + מתיחות',
    ]},
  },
  race_sim_full: {
    name: 'Race Sim · Full HYROX',
    a: { title:'A · חימום (15 דק׳)', lines:[
      '10 דק׳ ריצה קלה · Zone 2',
      'Drills + Strides · 2 × (Sled Push 20m קל)',
    ]},
    b: { title:'B · Race Simulation', lines:[
      '1km Run → 1km SkiErg',
      '1km Run → 50m Sled Push',
      '1km Run → 50m Sled Pull',
      '1km Run → 80m Burpee Broad Jump',
      '1km Run → 1km Row',
      '1km Run → 200m Farmers Carry',
      '1km Run → 100m Sandbag Lunges',
      '1km Run → 100 Wall Balls',
      'מטרה: מתחת ל־90 דק׳ (RX Male) / 100 דק׳ (RX Female)',
    ]},
    c: { title:'C · Cool Down', lines:[
      '10 דק׳ הליכה · מתיחות · פוקוס על שוקיים ורגליים',
    ]},
  },
  sled: {
    name: 'Sled Volume Day',
    a: { title:'A · חימום (10 דק׳)', lines:[
      'Easy jog + hip/glute activation',
    ]},
    b: { title:'B · Sled Push', lines:[
      '8 × 25m Sled Push · משקל HYROX RX',
      'מנוחה 60 שנ׳ בין חזרות',
    ]},
    c: { title:'C · Sled Pull', lines:[
      '8 × 25m Sled Pull · rope over shoulder',
      'מנוחה 60 שנ׳ בין חזרות',
    ]},
  },
  ski_row: {
    name: 'SkiErg + Row Intervals',
    a: { title:'A · חימום (8 דק׳)', lines:[
      '500m Row easy → 500m SkiErg easy',
      'Drills',
    ]},
    b: { title:'B · Intervals', lines:[
      '5 × [ 500m SkiErg + 500m Row ]',
      'מנוחה 90 שנ׳ בין סבבים',
      'קצב יעד: מתחת לקצב 1k race pace',
    ]},
    c: { title:'C · Finisher', lines:[
      '2 × 250m Row · All-out',
    ]},
  },
  sandbag_wallball: {
    name: 'Sandbag + Wall Ball',
    a: { title:'A · חימום (10 דק׳)', lines:[
      'Squat mobility + core prep',
    ]},
    b: { title:'B · Circuit (5 סבבים)', lines:[
      '20m Sandbag Lunges',
      '25 Wall Balls',
      '200m Run',
      'מנוחה 90 שנ׳ בין סבבים',
    ]},
    c: { title:'C · Core Finisher', lines:[
      '3 × 45s Hollow Hold',
    ]},
  },
  running_conditioning: {
    name: 'HYROX Running',
    a: { title:'A · חימום (10 דק׳)', lines:[
      'Easy jog + Strides ×4',
    ]},
    b: { title:'B · Intervals', lines:[
      '8 × 400m @ HYROX race pace',
      'מנוחה 60 שנ׳ (מדמה תחנה)',
    ]},
    c: { title:'C · Cool Down', lines:[
      '10 דק׳ Easy',
    ]},
  },
}

export const HYROX_FOCUSES = [
  { key:'random',              he:'הפתעה'    },
  { key:'race_sim_mini',       he:'Sim מיני' },
  { key:'race_sim_full',       he:'Sim מלא'  },
  { key:'sled',                he:'Sled'     },
  { key:'ski_row',             he:'Ski+Row'  },
  { key:'sandbag_wallball',    he:'Sandbag'  },
  { key:'running_conditioning',he:'ריצה'     },
]

export function generateHyroxWod({ focus = 'random' } = {}) {
  const keys = Object.keys(SESSIONS)
  const key = focus === 'random' ? keys[Math.floor(Math.random() * keys.length)] : focus
  const tpl = SESSIONS[key] || SESSIONS.race_sim_mini
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
  return {
    title: tpl.name,
    format: 'metcon',
    lines,
    movements: [],
    discipline: 'hyrox',
    focus: key,
  }
}

export const HYROX_PROGRAMS = [
  {
    id: 'hyrox_first_race',
    label: 'HYROX First Race Prep · 8 שבועות',
    weeks: 8,
    daysPerWeek: 4,
    goal: 'להשלים את המרוץ הראשון (כל 8 התחנות)',
    schema: 'Base → Station work → Race Sim',
    author: 'Selano',
    origin: 'Progression for first-timers',
    level: 'בינוני',
    sessionNames: ['Running','Sled','SkiErg+Row','Sandbag+WallBall'],
  },
  {
    id: 'hyrox_sub90',
    label: 'HYROX Sub-90 · 10 שבועות',
    weeks: 10,
    daysPerWeek: 5,
    goal: 'לסיים מרוץ מתחת ל-90 דקות',
    schema: 'Pace + Volume + Race Sim',
    author: 'Selano',
    origin: 'Advanced racing block',
    level: 'מתקדם',
    sessionNames: ['Running','Sled','SkiErg+Row','Sandbag+WallBall','Race Sim'],
  },
  {
    id: 'hyrox_offseason',
    label: 'HYROX Off-Season Base · 6 שבועות',
    weeks: 6,
    daysPerWeek: 3,
    goal: 'לבנות בסיס אירובי + חוזק כללי',
    schema: 'Aerobic base + Strength',
    author: 'Selano',
    origin: 'Between-races base',
    level: 'מתחיל',
    sessionNames: ['Running','Sled','SkiErg+Row'],
  },
]

export function hyroxProgramToPlan(programId) {
  const prog = HYROX_PROGRAMS.find(p => p.id === programId)
  if (!prog) return null
  const sessions = prog.sessionNames.map(name => {
    const focus = name === 'Running' ? 'running_conditioning'
      : name === 'Sled' ? 'sled'
      : name === 'SkiErg+Row' ? 'ski_row'
      : name === 'Sandbag+WallBall' ? 'sandbag_wallball'
      : name === 'Race Sim' ? 'race_sim_mini'
      : 'race_sim_mini'
    const wod = generateHyroxWod({ focus })
    return {
      name: `${name} · ${wod.title}`,
      wodType: 'HYROX',
      prescription: wod.lines.join('\n'),
      exercises: [],
    }
  })
  return {
    name: prog.label,
    programId: prog.id,
    discipline: 'hyrox',
    split: prog.schema,
    days: prog.daysPerWeek,
    weeks: prog.weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}
