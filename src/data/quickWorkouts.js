// Quick Workout Generator - movement pools tagged by equipment and style,
// plus template shapes per (style, duration) so the generator picks the right
// number of moves and the right block structure.

export const LOCATIONS = [
  { id:'home',    label:'בית',           icon:'', defaultEquipment:['bodyweight'] },
  { id:'hotel',   label:'מלון / חופשה',  icon:'', defaultEquipment:['bodyweight','bands'] },
  { id:'outdoor', label:'חוץ / פארק',    icon:'', defaultEquipment:['bodyweight'] },
  { id:'gym',     label:'חדר כושר מלא',  icon:'', defaultEquipment:['bodyweight','dumbbells','barbell','kettlebell','machines','bands'] },
]

export const EQUIPMENT = [
  { id:'bodyweight', label:'משקל גוף' },
  { id:'dumbbells',  label:'משקולות יד' },
  { id:'kettlebell', label:'קטלבל' },
  { id:'bands',      label:'גומיות' },
  { id:'barbell',    label:'מוט + פלטות' },
  { id:'machines',   label:'מכונות' },
  { id:'trx',        label:'TRX' },
  { id:'jump_rope',  label:'חבל קפיצה' },
  { id:'mat',        label:'מזרן' },
]

export const STYLES = [
  { id:'bodybuilding', label:'בודיבילדינג',  icon:'', desc:'היפרטרופיה - 3-4 סטים × 8-12 חזרות, פוקוס על שריר' },
  { id:'crossfit',     label:'CrossFit',      icon:'', desc:'MetCon - AMRAP/EMOM/For Time עם תרגילים מתחלפים' },
  { id:'running',      label:'ריצה',           icon:'', desc:'אירובי - אינטרוולים/טמפו/ריצה קלה' },
  { id:'yoga',         label:'יוגה',           icon:'', desc:'זרימה - שמש A/B, לוחמים, מתיחות' },
  { id:'functional',   label:'פונקציונלי',    icon:'', desc:'תנועות מורכבות רב-מפרקיות, מעברי גוף' },
  { id:'mobility',     label:'מוביליטי',      icon:'', desc:'טווח תנועה + שחרור - התאוששות אקטיבית' },
]

export const GOALS = [
  { id:'strength',    label:'כוח' },
  { id:'hypertrophy', label:'מסת שריר' },
  { id:'conditioning',label:'סבולת ושריפת שומן' },
  { id:'endurance',   label:'סבולת אירובית' },
  { id:'mobility',    label:'גמישות והתאוששות' },
  { id:'skill',       label:'טכניקה' },
]

// Movement library: each move tags equipment[] and style[]
export const moves = [
  // ─── Bodyweight ────────────────────────────────────────
  { id:'pushup',        name:'שכיבות סמיכה',           eq:['bodyweight'], st:['bodybuilding','crossfit','functional'], muscle:'חזה', level:1 },
  { id:'diamond_pushup',name:'שכיבות סמיכה יהלום',      eq:['bodyweight'], st:['bodybuilding','functional'], muscle:'ידיים', level:2 },
  { id:'pike_pushup',   name:'שכיבות פייק',             eq:['bodyweight'], st:['bodybuilding','functional'], muscle:'כתפיים', level:2 },
  { id:'air_squat',     name:'סקוואט משקל גוף',         eq:['bodyweight'], st:['crossfit','functional','bodybuilding'], muscle:'רגליים', level:1 },
  { id:'jump_squat',    name:'סקוואט קפיצה',           eq:['bodyweight'], st:['crossfit','functional'], muscle:'רגליים', level:2 },
  { id:'bulgarian_bw',  name:'לאנג׳ בולגרי',            eq:['bodyweight'], st:['bodybuilding','functional'], muscle:'רגליים', level:2 },
  { id:'walking_lunge_bw', name:'לאנג׳ הליכה',         eq:['bodyweight'], st:['functional','bodybuilding'], muscle:'רגליים', level:1 },
  { id:'glute_bridge',  name:'גשר ישבן',               eq:['bodyweight'], st:['bodybuilding','functional','mobility'], muscle:'ישבן', level:1 },
  { id:'single_glute',  name:'גשר ישבן על רגל אחת',    eq:['bodyweight'], st:['functional','bodybuilding'], muscle:'ישבן', level:2 },
  { id:'plank',         name:'פלאנק',                  eq:['bodyweight'], st:['functional','bodybuilding','mobility'], muscle:'ליבה', level:1 },
  { id:'side_plank',    name:'פלאנק צד',              eq:['bodyweight'], st:['functional','mobility'], muscle:'ליבה', level:2 },
  { id:'mountain_climber',name:'מטפסי הרים',           eq:['bodyweight'], st:['crossfit','functional'], muscle:'ליבה', level:1 },
  { id:'burpee',        name:'ברפי',                   eq:['bodyweight'], st:['crossfit','functional'], muscle:'כל הגוף', level:2 },
  { id:'jumping_jack',  name:'ג׳אמפינג ג׳ק',           eq:['bodyweight'], st:['crossfit','functional'], muscle:'אירובי', level:1 },
  { id:'high_knees',    name:'ברכיים גבוהות',          eq:['bodyweight'], st:['crossfit','running'], muscle:'אירובי', level:1 },
  { id:'bear_crawl',    name:'הליכת דוב',              eq:['bodyweight'], st:['functional'], muscle:'כל הגוף', level:2 },
  { id:'crab_walk',     name:'הליכת סרטן',             eq:['bodyweight'], st:['functional'], muscle:'כל הגוף', level:2 },
  { id:'wall_sit',      name:'ישיבה נגד קיר',          eq:['bodyweight'], st:['functional'], muscle:'רגליים', level:1 },
  { id:'superman',      name:'סופרמן',                 eq:['bodyweight'], st:['functional','mobility'], muscle:'גב', level:1 },
  { id:'hollow_hold',   name:'החזקת חלול',            eq:['bodyweight'], st:['functional'], muscle:'ליבה', level:2 },
  { id:'inchworm',      name:'תולעת',                  eq:['bodyweight'], st:['functional','mobility'], muscle:'כל הגוף', level:1 },
  { id:'pull_up_bw',    name:'מתח',                   eq:['bodyweight'], st:['bodybuilding','crossfit','functional'], muscle:'גב', level:3 },

  // ─── Dumbbells ─────────────────────────────────────────
  { id:'db_press',      name:'לחיצת חזה משקולות',      eq:['dumbbells'], st:['bodybuilding','functional'], muscle:'חזה', level:2 },
  { id:'db_incline',    name:'לחיצה בשיפוע',           eq:['dumbbells'], st:['bodybuilding'], muscle:'חזה', level:2 },
  { id:'db_row',        name:'חתירה עם משקולת',         eq:['dumbbells'], st:['bodybuilding','functional'], muscle:'גב', level:1 },
  { id:'db_curl',       name:'כפיפות מרפקים',          eq:['dumbbells'], st:['bodybuilding'], muscle:'ידיים', level:1 },
  { id:'db_hammer',     name:'קרל פטיש',               eq:['dumbbells'], st:['bodybuilding'], muscle:'ידיים', level:1 },
  { id:'db_lat_raise',  name:'הרמות צד',               eq:['dumbbells'], st:['bodybuilding'], muscle:'כתפיים', level:1 },
  { id:'db_shoulder',   name:'לחיצת כתפיים משקולות',    eq:['dumbbells'], st:['bodybuilding','functional'], muscle:'כתפיים', level:2 },
  { id:'db_goblet_sq',  name:'סקוואט גובלט',           eq:['dumbbells'], st:['bodybuilding','functional','crossfit'], muscle:'רגליים', level:1 },
  { id:'db_rdl',        name:'דדליפט רומני עם משקולות', eq:['dumbbells'], st:['bodybuilding','functional'], muscle:'ישבן', level:2 },
  { id:'db_thruster',   name:'ת׳ראסטר עם משקולות',      eq:['dumbbells'], st:['crossfit','functional'], muscle:'כל הגוף', level:2 },
  { id:'db_lunge',      name:'לאנג׳ עם משקולות',        eq:['dumbbells'], st:['bodybuilding','functional'], muscle:'רגליים', level:2 },
  { id:'db_farmer_walk',name:'הליכת פארמר',            eq:['dumbbells'], st:['functional','crossfit'], muscle:'כל הגוף', level:1 },
  { id:'db_snatch',     name:'סנאץ׳ עם משקולת',        eq:['dumbbells'], st:['crossfit','functional'], muscle:'כל הגוף', level:3 },
  { id:'db_tricep_ext', name:'פשיטת מרפקים מאחורי הראש',eq:['dumbbells'], st:['bodybuilding'], muscle:'ידיים', level:1 },

  // ─── Kettlebell ────────────────────────────────────────
  { id:'kb_swing',      name:'קטלבל סווינג',           eq:['kettlebell'], st:['crossfit','functional'], muscle:'ישבן', level:2 },
  { id:'kb_tgu',        name:'Turkish Get-Up',         eq:['kettlebell'], st:['functional'], muscle:'כל הגוף', level:3 },
  { id:'kb_goblet',     name:'סקוואט גובלט קטלבל',      eq:['kettlebell'], st:['functional','crossfit'], muscle:'רגליים', level:1 },
  { id:'kb_clean',      name:'קטלבל קלין',              eq:['kettlebell'], st:['crossfit','functional'], muscle:'כל הגוף', level:3 },
  { id:'kb_snatch',     name:'קטלבל סנאץ׳',             eq:['kettlebell'], st:['crossfit','functional'], muscle:'כל הגוף', level:3 },
  { id:'kb_press',      name:'לחיצת קטלבל',            eq:['kettlebell'], st:['functional','crossfit'], muscle:'כתפיים', level:2 },
  { id:'kb_row',        name:'חתירת קטלבל',            eq:['kettlebell'], st:['functional','bodybuilding'], muscle:'גב', level:1 },
  { id:'kb_halo',       name:'הילה עם קטלבל',           eq:['kettlebell'], st:['functional','mobility'], muscle:'כתפיים', level:1 },

  // ─── Bands ─────────────────────────────────────────────
  { id:'band_pullapart',name:'פתיחת גומייה',           eq:['bands'], st:['bodybuilding','mobility'], muscle:'גב', level:1 },
  { id:'band_row',      name:'חתירת גומייה',           eq:['bands'], st:['bodybuilding','functional'], muscle:'גב', level:1 },
  { id:'band_squat',    name:'סקוואט עם גומייה',        eq:['bands'], st:['functional'], muscle:'רגליים', level:1 },
  { id:'band_press',    name:'לחיצת גומייה',           eq:['bands'], st:['bodybuilding'], muscle:'חזה', level:1 },
  { id:'band_curl',     name:'קרל עם גומייה',          eq:['bands'], st:['bodybuilding'], muscle:'ידיים', level:1 },
  { id:'band_pushdown', name:'פשיטת גומייה',           eq:['bands'], st:['bodybuilding'], muscle:'ידיים', level:1 },
  { id:'band_clamshell',name:'קלאם שיל',              eq:['bands'], st:['functional','mobility'], muscle:'ישבן', level:1 },
  { id:'band_facepull', name:'פייס פול',              eq:['bands'], st:['bodybuilding','mobility'], muscle:'כתפיים', level:1 },
  { id:'band_monster',  name:'מונסטר ווק',             eq:['bands'], st:['functional'], muscle:'ישבן', level:1 },

  // ─── Barbell ───────────────────────────────────────────
  { id:'bb_squat',      name:'סקוואט מוט',              eq:['barbell'], st:['bodybuilding','crossfit','functional'], muscle:'רגליים', level:2 },
  { id:'bb_bench',      name:'לחיצת חזה מוט',           eq:['barbell'], st:['bodybuilding','functional'], muscle:'חזה', level:2 },
  { id:'bb_deadlift',   name:'דדליפט',                  eq:['barbell'], st:['bodybuilding','crossfit','functional'], muscle:'גב', level:3 },
  { id:'bb_row',        name:'חתירה במוט',              eq:['barbell'], st:['bodybuilding','functional'], muscle:'גב', level:2 },
  { id:'bb_thruster',   name:'ת׳ראסטר מוט',             eq:['barbell'], st:['crossfit'], muscle:'כל הגוף', level:3 },
  { id:'bb_clean',      name:'קלין מוט',                eq:['barbell'], st:['crossfit'], muscle:'כל הגוף', level:3 },

  // ─── TRX ───────────────────────────────────────────────
  { id:'trx_row',       name:'חתירת TRX',              eq:['trx'], st:['bodybuilding','functional'], muscle:'גב', level:1 },
  { id:'trx_squat',     name:'סקוואט TRX',             eq:['trx'], st:['functional'], muscle:'רגליים', level:1 },
  { id:'trx_pushup',    name:'שכיבות TRX',             eq:['trx'], st:['bodybuilding','functional'], muscle:'חזה', level:2 },
  { id:'trx_pike',      name:'פייק TRX',               eq:['trx'], st:['functional'], muscle:'ליבה', level:3 },

  // ─── Jump Rope ─────────────────────────────────────────
  { id:'jr_single',     name:'קפיצות חבל בסיסיות',      eq:['jump_rope'], st:['crossfit','running'], muscle:'אירובי', level:1 },
  { id:'jr_double',     name:'דאבל אנדרס',              eq:['jump_rope'], st:['crossfit'], muscle:'אירובי', level:3 },

  // ─── Yoga poses ───────────────────────────────────────
  { id:'yoga_sunA',     name:'שמש A (Surya A)',        eq:['bodyweight','mat'], st:['yoga'], muscle:'כל הגוף', level:1 },
  { id:'yoga_sunB',     name:'שמש B (Surya B)',        eq:['bodyweight','mat'], st:['yoga'], muscle:'כל הגוף', level:2 },
  { id:'yoga_warrior1', name:'לוחם 1',                 eq:['bodyweight','mat'], st:['yoga'], muscle:'רגליים', level:1 },
  { id:'yoga_warrior2', name:'לוחם 2',                 eq:['bodyweight','mat'], st:['yoga'], muscle:'רגליים', level:1 },
  { id:'yoga_warrior3', name:'לוחם 3',                 eq:['bodyweight','mat'], st:['yoga'], muscle:'רגליים', level:2 },
  { id:'yoga_triangle', name:'משולש',                  eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'ליבה', level:1 },
  { id:'yoga_tree',     name:'עץ',                     eq:['bodyweight','mat'], st:['yoga'], muscle:'רגליים', level:1 },
  { id:'yoga_cobra',    name:'קוברה',                  eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'גב', level:1 },
  { id:'yoga_down_dog', name:'כלב מביט מטה',          eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'כל הגוף', level:1 },
  { id:'yoga_child',    name:'ילד',                    eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'התאוששות', level:1 },
  { id:'yoga_pigeon',   name:'יונה',                   eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'ירך', level:2 },
  { id:'yoga_bridge',   name:'גשר',                    eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'גב', level:1 },
  { id:'yoga_savasana', name:'שווסנה',                 eq:['bodyweight','mat'], st:['yoga','mobility'], muscle:'התאוששות', level:1 },
  { id:'yoga_boat',     name:'סירה',                   eq:['bodyweight','mat'], st:['yoga'], muscle:'ליבה', level:2 },

  // ─── Mobility ─────────────────────────────────────────
  { id:'mob_cat_cow',   name:'חתול-פרה',              eq:['bodyweight','mat'], st:['mobility'], muscle:'גב', level:1 },
  { id:'mob_worlds',    name:'World\'s Greatest Stretch',eq:['bodyweight','mat'], st:['mobility','functional'], muscle:'כל הגוף', level:1 },
  { id:'mob_thoracic',  name:'סיבובי גב עליון',        eq:['bodyweight','mat'], st:['mobility'], muscle:'גב', level:1 },
  { id:'mob_90_90',     name:'ישיבת 90/90',           eq:['bodyweight','mat'], st:['mobility'], muscle:'ירך', level:1 },
  { id:'mob_hip_flow',  name:'זרימת ירך',              eq:['bodyweight','mat'], st:['mobility'], muscle:'ירך', level:1 },
  { id:'mob_calf',      name:'מתיחת שוקיים',           eq:['bodyweight','mat'], st:['mobility'], muscle:'רגליים', level:1 },
  { id:'mob_shoulder',  name:'סיבובי כתפיים',          eq:['bodyweight'], st:['mobility'], muscle:'כתפיים', level:1 },
  { id:'mob_hamstring', name:'מתיחת שרירי בטן-הרגל',    eq:['bodyweight','mat'], st:['mobility'], muscle:'רגליים', level:1 },
]

// Sample WOD templates per style + duration - lets the generator produce a
// convincing workout without repeating the same static list every time.
// eqs = pool of equipment available; picks moves whose eq ⊆ eqs
export function generateWorkout({ style, duration, equipment, level = 2, goal }) {
  const eqs = new Set(equipment)
  const pool = moves.filter(m =>
    m.st.includes(style) &&
    m.eq.every(e => eqs.has(e)) &&
    m.level <= level + 1
  )

  const seed = (Date.now() % 1000)
  const rnd = (i) => Math.abs(Math.sin((seed + i) * 12.9898)) % 1
  const shuffle = (arr) => arr.slice().sort((_, __) => rnd(__ * 3) - 0.5)

  const warmup = generateWarmup(style, duration)
  const cooldown = generateCooldown(style, duration)

  let main
  if (style === 'yoga')       main = generateYogaFlow(pool, duration)
  else if (style === 'running')main = generateRunning(duration, goal)
  else if (style === 'mobility')main = generateMobility(pool, duration)
  else if (style === 'crossfit')main = generateMetcon(pool, duration, level)
  else if (style === 'bodybuilding') main = generateBodybuilding(pool, duration, level)
  else                        main = generateFunctional(pool, duration, level)

  return {
    style, duration, equipment,
    warmup, main, cooldown,
    totalDuration: warmup.duration + main.duration + cooldown.duration,
    createdAt: new Date().toISOString(),
  }
}

// ── Warmup / cooldown builders ──
function generateWarmup(style, duration) {
  const time = Math.max(3, Math.min(8, Math.round(duration * 0.15)))
  const blocks = style === 'running'
    ? ['הליכה מהירה 2 דק׳','ברכיים גבוהות 30 שניות','בעיטות ישבן 30 שניות','A-skips 30 שניות','ריצה קלה 1 דק׳']
    : style === 'yoga'
    ? ['נשימה עמוקה 5 מחזורים','זרימת חתול-פרה 30 שניות','זרימת ילד → כלב 3 פעמים']
    : ['ג׳אמפינג ג׳ק 30 שניות','זרימת מרפקים ל-90/90 30 שניות','סקוואטים משקל גוף 10 חזרות','שכיבות סמיכה 5 חזרות','סיבובי גב עליון 5 לכל צד']
  return { title:'חימום', duration: time, blocks }
}

function generateCooldown(style, duration) {
  const time = Math.max(3, Math.min(8, Math.round(duration * 0.12)))
  const blocks = style === 'yoga'
    ? ['שווסנה 3-5 דקות','נשימת סרעפת 5 מחזורים']
    : ['מתיחת ירך 30 שניות לכל צד','זרימת יונה 30 שניות לכל צד','מתיחת חזה בפינה 30 שניות','נשימת סרעפת 5 מחזורים']
  return { title:'שחרור', duration: time, blocks }
}

// ── Bodybuilding: 3-6 exercises, 3-4 sets × 8-12 reps ──
function generateBodybuilding(pool, duration, level) {
  const exCount = duration <= 20 ? 3 : duration <= 30 ? 4 : duration <= 45 ? 5 : 6
  // Ensure spread across muscle groups
  const picks = []
  const seen = new Set()
  for (const m of pool) {
    if (picks.length >= exCount) break
    if (!seen.has(m.muscle)) { picks.push(m); seen.add(m.muscle) }
  }
  // Fill if not enough
  for (const m of pool) {
    if (picks.length >= exCount) break
    if (!picks.includes(m)) picks.push(m)
  }
  const sets = level >= 2 ? 4 : 3
  const reps = 10
  return {
    title:'בלוק ראשי · היפרטרופיה',
    format:'straight sets',
    duration: duration - 10,
    blocks: picks.map(m => ({ name: m.name, prescription: `${sets} × ${reps} · מנוחה 60-90ש׳`, muscle: m.muscle })),
    notes:'קצב 2-1-2 (יורדים 2ש׳, החזקה 1ש׳, עולים 2ש׳)',
  }
}

// ── CrossFit: MetCon with format based on duration ──
function generateMetcon(pool, duration, level) {
  const mainDuration = Math.max(6, duration - 12)
  // pick 3-4 movements
  const moveCount = duration <= 20 ? 3 : 4
  const picks = pool.slice(0, moveCount * 2).sort(() => .5 - Math.random()).slice(0, moveCount)

  // Choose format based on duration
  let format, prescription, blocks
  if (mainDuration <= 12) {
    format = 'For Time'
    const repsPer = [21, 15, 9]
    prescription = `${repsPer.join('-')} של:\n${picks.map(m => `• ${m.name}`).join('\n')}`
    blocks = picks.map(m => ({ name: m.name, prescription: `${repsPer.join('-')} חזרות` }))
  } else if (mainDuration <= 20) {
    format = `AMRAP ${mainDuration}`
    const reps = [10, 15, 20, 25]
    prescription = `AMRAP ${mainDuration} דקות:\n${picks.map((m, i) => `• ${reps[i] || 10} ${m.name}`).join('\n')}`
    blocks = picks.map((m, i) => ({ name: m.name, prescription: `${reps[i] || 10} חזרות` }))
  } else {
    format = 'EMOM'
    prescription = `EMOM ${mainDuration} דקות (כל דקה על השעה):\n${picks.map((m, i) => `• דקה ${i+1}: ${8 + i*2} ${m.name}`).join('\n')}`
    blocks = picks.map((m, i) => ({ name: m.name, prescription: `דקה ${i+1}: ${8 + i*2} חזרות` }))
  }

  return {
    title:'MetCon',
    format,
    duration: mainDuration,
    prescription,
    blocks,
    notes:'שמור על טכניקה גם כשמתעייף - עדיף להפחית משקל מלאבד צורה',
  }
}

// ── Running ──
function generateRunning(duration, goal) {
  if (duration <= 20) {
    return {
      title:'ריצת אינטרוולים קצרה',
      format:'Intervals',
      duration,
      blocks: [
        { name:'8 × 400 מטר', prescription:'ריצה מהירה 400מ׳ + הליכה 200מ׳' },
      ],
      notes:`יעד קצב: 85-90% מהמאמץ · מנוחה: הליכה איטית עד הדופק יורד ל-130-140`,
    }
  } else if (duration <= 40) {
    return {
      title:'טמפו רן',
      format:'Tempo',
      duration,
      blocks: [
        { name:'2 ק״מ חימום', prescription:'קצב שיחה, דופק 65-75%' },
        { name:'טמפו 20 דק׳', prescription:'קצב מאמץ 80-85%, ברמת "לא נעים אבל בר-קיימא"' },
        { name:'1 ק״מ שחרור', prescription:'קצב איטי, נשימה מתאזנת' },
      ],
      notes:'טמפו רן בונה את הסף הלקטי - היכולת לרוץ מהר לזמן ארוך',
    }
  } else {
    return {
      title:'ריצה ארוכה קלה',
      format:'Long Slow Distance',
      duration,
      blocks: [
        { name:`${Math.round(duration / 5)} ק״מ`, prescription:'קצב שיחה - לאורך כל הריצה. מטרה: זמן על הרגליים, לא מהירות' },
      ],
      notes:'החוק המוזהב: 80% מהריצות בשבוע צריכות להיות בקצב הזה',
    }
  }
}

// ── Yoga flow ──
function generateYogaFlow(pool, duration) {
  const flows = [
    { name:'סוריה A', prescription:'5 סבבים · תנשום עם התנועה - שאיפה עולים, נשיפה יורדים' },
    { name:'סוריה B', prescription:'5 סבבים · מוסיף לוחם 1 בכל צד' },
    { name:'סדרת לוחמים', prescription:'לוחם 1 → 2 → 3 · 5 נשימות בכל תנוחה' },
    { name:'עמידה על יד אחת', prescription:'עץ + עיט · 30ש׳ לכל צד' },
    { name:'ירידות למטה', prescription:'ילד → כלב → יונה · 1 דקה בכל תנוחה' },
    { name:'עמוד שדרה', prescription:'קוברה → גשר → סירה · 5 נשימות בכל תנוחה' },
    { name:'שווסנה', prescription:'5-10 דקות שכיבה מודעת · נשימת סרעפת' },
  ]
  const count = duration <= 20 ? 3 : duration <= 40 ? 5 : 7
  return {
    title:'זרימת יוגה',
    format:'Vinyasa Flow',
    duration: duration - 8,
    blocks: flows.slice(0, count),
    notes:'סנכרן נשימה עם תנועה · לא לחפש כאב, לחפש טווח',
  }
}

// ── Functional ──
function generateFunctional(pool, duration, level) {
  const moveCount = duration <= 20 ? 4 : duration <= 40 ? 5 : 6
  const picks = pool.slice(0, moveCount)
  return {
    title:'מעגל פונקציונלי',
    format:'Circuit',
    duration: duration - 10,
    blocks: picks.map(m => ({ name: m.name, prescription:'40ש׳ עבודה / 20ש׳ מנוחה', muscle: m.muscle })),
    notes:`${duration <= 30 ? '3' : '4'} סבבים · דקה מנוחה בין סבבים`,
  }
}

// ── Mobility ──
function generateMobility(pool, duration) {
  const count = duration <= 20 ? 5 : duration <= 40 ? 8 : 10
  const picks = pool.slice(0, count)
  return {
    title:'זרימת מוביליטי',
    format:'Held Stretches + Dynamic',
    duration: duration - 5,
    blocks: picks.map(m => ({ name: m.name, prescription:'2 × 30-45 שניות · תנשום עמוק', muscle: m.muscle })),
    notes:'עדיף לעשות אחרי אימון כשהגוף חם · לא לחפש כאב, לחפש טווח נעים',
  }
}
