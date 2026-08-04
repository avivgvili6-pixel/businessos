// Gymnastics — skill-focused catalogue + workout generator + program library.
// The generator builds a session as: Skill block → Strength/EMOM → Core finisher.
// Programs are progression cycles (e.g. "First Muscle-Up · 6 weeks").

export const GYMN_SKILLS = [
  // pulling
  { id:'strict_pu',    he:'Strict Pull-up',        cat:'pull', level:'basic' },
  { id:'kipping_pu',   he:'Kipping Pull-up',       cat:'pull', level:'basic' },
  { id:'c2b',          he:'Chest-to-Bar',          cat:'pull', level:'inter' },
  { id:'bmu',          he:'Bar Muscle-up',         cat:'pull', level:'adv'  },
  { id:'rmu',          he:'Ring Muscle-up',        cat:'pull', level:'adv'  },
  { id:'false_grip',   he:'False Grip Row',        cat:'pull', level:'inter' },
  { id:'rope_climb',   he:'Rope Climb',            cat:'pull', level:'inter' },
  // pushing
  { id:'strict_hspu',  he:'Strict HSPU',           cat:'push', level:'adv'  },
  { id:'kipping_hspu', he:'Kipping HSPU',          cat:'push', level:'inter' },
  { id:'hs_hold',      he:'Handstand Hold',        cat:'push', level:'basic' },
  { id:'wall_walk',    he:'Wall Walk',             cat:'push', level:'basic' },
  { id:'freestand_hs', he:'Freestanding HS',       cat:'push', level:'adv'  },
  { id:'ring_dip',     he:'Ring Dip',              cat:'push', level:'inter' },
  { id:'strict_dip',   he:'Strict Dip',            cat:'push', level:'basic' },
  // core / static
  { id:'l_sit',        he:'L-sit Hold',            cat:'core', level:'inter' },
  { id:'hollow_rock',  he:'Hollow Rock',           cat:'core', level:'basic' },
  { id:'toes_to_bar',  he:'Toes-to-Bar',           cat:'core', level:'inter' },
  { id:'ghd_situp',    he:'GHD Sit-up',            cat:'core', level:'inter' },
  { id:'v_up',         he:'V-up',                  cat:'core', level:'basic' },
  { id:'plank_60',     he:'Plank 60s',             cat:'core', level:'basic' },
  // legs / balance
  { id:'pistol',       he:'Pistol Squat',          cat:'legs', level:'inter' },
  { id:'shrimp',       he:'Shrimp Squat',          cat:'legs', level:'adv'  },
  { id:'jumping_lunge',he:'Jumping Lunge',         cat:'legs', level:'basic' },
]

const SKILL_BY_ID = Object.fromEntries(GYMN_SKILLS.map(s => [s.id, s]))

// Session templates — Skill / EMOM / Finisher
const SESSION_TEMPLATES = {
  muscle_up: {
    name: 'Muscle-Up Skill Day',
    a: { title:'A · כישור (15 דק׳)', lines: [
      'False Grip Row × 5 → Kipping Pull-up × 3',
      '× 5 סבבים · מנוחה כשצריך',
    ]},
    b: { title:'B · EMOM (10 דק׳)', lines: [
      'Min 1: 3× Chest-to-Bar',
      'Min 2: 5× Ring Dips',
    ]},
    c: { title:'C · Core Finisher', lines: [
      '3× Hollow Rocks 20s + L-sit 15s',
    ]},
  },
  handstand: {
    name: 'Handstand Day',
    a: { title:'A · כישור (12 דק׳)', lines: [
      'Wall Walk × 3 → Handstand Hold 20s',
      '× 6 סבבים',
    ]},
    b: { title:'B · Strength (15 דק׳)', lines: [
      '5×5 Strict HSPU (scale: box HSPU)',
      'מנוחה 90 שנ׳ בין סטים',
    ]},
    c: { title:'C · Core Finisher', lines: [
      'AMRAP 5:00 — 10× V-ups + 20s Plank',
    ]},
  },
  pulling: {
    name: 'Pulling Volume',
    a: { title:'A · Strict Work (15 דק׳)', lines: [
      '5 × 5 Strict Pull-ups',
      'הוסף משקל אם 5 קל',
    ]},
    b: { title:'B · EMOM (12 דק׳)', lines: [
      'Min 1: 6× Kipping Pull-ups',
      'Min 2: 8× Toes-to-Bar',
      'Min 3: 20s L-sit',
    ]},
    c: { title:'C · Grip Finisher', lines: [
      '3× Max Hang from bar',
    ]},
  },
  pistol: {
    name: 'Pistol + Core',
    a: { title:'A · טכניקה (10 דק׳)', lines: [
      'Shrimp Squat 3×5 (each leg)',
      'עם TRX/עמוד תמיכה אם צריך',
    ]},
    b: { title:'B · Volume (15 דק׳)', lines: [
      'EMOM 15: 6× Pistol Squats (alt legs)',
    ]},
    c: { title:'C · Core Finisher', lines: [
      '4× GHD Sit-ups 10 + V-up 10',
    ]},
  },
  ring_work: {
    name: 'Ring Foundations',
    a: { title:'A · Support (10 דק׳)', lines: [
      '5 × Ring Support 30s + Ring Row 10',
    ]},
    b: { title:'B · Dips + Pull (15 דק׳)', lines: [
      '5×5 Ring Dips',
      '5×5 False Grip Rows',
    ]},
    c: { title:'C · Static', lines: [
      '4× L-sit 15s',
    ]},
  },
}

// Single-workout generator — deterministic pick + subtle randomization.
// Returns { title, format, lines, movements } shape compatible with WodDisplay.
export function generateGymnasticsWod({ focus = 'random' } = {}) {
  const keys = Object.keys(SESSION_TEMPLATES)
  const key = focus === 'random'
    ? keys[Math.floor(Math.random() * keys.length)]
    : focus
  const tpl = SESSION_TEMPLATES[key] || SESSION_TEMPLATES.pulling
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
    format: 'strength', // shows a neutral badge in WodDisplay
    lines,
    movements: [], // no timer, this is skill work
    discipline: 'gymnastics',
    focus: key,
  }
}

export const GYMN_FOCUSES = [
  { key:'random',     he:'הפתעה'    },
  { key:'muscle_up',  he:'Muscle-Up' },
  { key:'handstand',  he:'Handstand' },
  { key:'pulling',    he:'משיכה'     },
  { key:'pistol',     he:'Pistol'    },
  { key:'ring_work',  he:'Rings'     },
]

// ─── Programs (adopt into state.plan) ─────────────────────────
// Each program is a full weekly cycle → converted to the plan shape
// that MyPlan/SessionRunner understands.

export const GYMN_PROGRAMS = [
  {
    id: 'gymn_first_mu',
    label: 'First Muscle-Up · 6 שבועות',
    weeks: 6,
    daysPerWeek: 3,
    goal: 'להשלים Muscle-Up ראשון (בר או טבעות)',
    schema: 'False Grip → Transition → MU',
    author: 'Selano',
    origin: 'Progressive foundation',
    level: 'בינוני',
    sessionNames: ['Foundation','Transition','Explosive'],
  },
  {
    id: 'gymn_hs_foundations',
    label: 'Handstand Foundations · 4 שבועות',
    weeks: 4,
    daysPerWeek: 4,
    goal: 'לעמוד על הידיים 30 שניות ליד קיר',
    schema: 'Wall walks → Kick-up → Freestand → Walk',
    author: 'Selano',
    origin: 'Balance progression',
    level: 'מתחיל',
    sessionNames: ['Wall Time','Kick-up','Freestand','Skill'],
  },
  {
    id: 'gymn_pull_ladder',
    label: '30 Pull-ups Ladder · 8 שבועות',
    weeks: 8,
    daysPerWeek: 3,
    goal: 'להגיע ל-30 Pull-ups רצופים',
    schema: 'Grease-the-Groove protocol',
    author: 'Selano',
    origin: 'Volume ladder',
    level: 'בינוני',
    sessionNames: ['Ladder A','Ladder B','Volume'],
  },
]

// Materialize program → plan structure for setPlan()
export function gymnasticsProgramToPlan(programId) {
  const prog = GYMN_PROGRAMS.find(p => p.id === programId)
  if (!prog) return null
  const sessions = prog.sessionNames.map(name => {
    const wod = generateGymnasticsWod({
      focus: name === 'Wall Time' ? 'handstand'
        : name === 'Kick-up' ? 'handstand'
        : name === 'Freestand' ? 'handstand'
        : name === 'Foundation' ? 'ring_work'
        : name === 'Transition' ? 'muscle_up'
        : name === 'Explosive' ? 'muscle_up'
        : name === 'Ladder A' ? 'pulling'
        : name === 'Ladder B' ? 'pulling'
        : 'pulling',
    })
    return {
      name: `${name} · ${wod.title}`,
      wodType: 'Gymnastics',
      prescription: wod.lines.join('\n'),
      exercises: [], // free-form skill work; runner shows the prescription
    }
  })
  return {
    name: prog.label,
    programId: prog.id,
    discipline: 'gymnastics',
    split: prog.schema,
    days: prog.daysPerWeek,
    weeks: prog.weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}
