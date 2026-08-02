// Universal form-cues + video resolver for any exercise in the app.
//
// Any exercise — whether it comes from the BB catalog, the general
// catalog, or a Legend program (which has plain-text exercise names) —
// gets cues and a video link through this module. Never returns null:
// the fallbacks always produce something useful.
//
// Priority order in the resolver:
//   1. Explicit cues/video on the exercise object (BB catalog)
//   2. Movement-pattern match against Hebrew name (regex table)
//   3. Generic cues + YouTube search URL

// ─── Curated video IDs — top ~40 movements ─────────────────────
// Every ID here is a well-known trainer/coach on YouTube.
// Attribution shown to the user via `ytBy`.
export const VIDEO_MAP = {
  squat:            { id: 'ultWZbUMPL8', by: 'Jeff Nippard' },
  front_squat:      { id: 'iZTd8UkO_MQ', by: 'Squat University' },
  bulgarian_split:  { id: '2C-uNgKwPLE', by: 'Athlean-X' },
  hack_squat:       { id: 'EdtaJRBqwis', by: 'Renaissance Periodization' },
  leg_press:        { id: 'IZxyjW7MPJQ', by: 'Renaissance Periodization' },
  leg_extension:    { id: 'YyvSfVjQeL0', by: 'Athlean-X' },
  leg_curl:         { id: 'ELOCsoDSmrg', by: 'Renaissance Periodization' },
  romanian_dl:      { id: 'FQ6of-P90ao', by: 'Squat University' },
  hip_thrust:       { id: 'xDmFkJxPzeM', by: 'Bret Contreras' },
  calf_raise:       { id: 'YMmgqO8Jo-k', by: 'Athlean-X' },

  deadlift:         { id: 'op9kVnSso6Q', by: 'Alan Thrall' },
  sumo_deadlift:    { id: 'wYREQkVtvEc', by: 'Alan Thrall' },
  pullup:           { id: 'eGo4IYlbE5g', by: 'Athlean-X' },
  chinup:           { id: 'brhRXlOhkAM', by: 'Athlean-X' },
  lat_pulldown:     { id: 'CAwf7n6Luuc', by: 'Renaissance Periodization' },
  row_barbell:      { id: 'FWJR5Ve8bnQ', by: 'Squat University' },
  row_dumbbell:     { id: 'roCP6wCXPqo', by: 'Athlean-X' },
  row_cable:        { id: 'GZbfZ033f74', by: 'Renaissance Periodization' },
  tbar_row:         { id: 'j3Igk5nyZE4', by: 'Renaissance Periodization' },
  face_pull:        { id: 'V8dZ3pyiCBo', by: 'Athlean-X' },
  shrug:            { id: 'g6qbq4Lf1FI', by: 'Athlean-X' },

  bench:            { id: 'vcBig73ojpE', by: 'Jeff Nippard' },
  bench_incline:    { id: 'jPLdzuHckI8', by: 'Renaissance Periodization' },
  bench_decline:    { id: 'LfyQBUKR8SE', by: 'Renaissance Periodization' },
  db_bench:         { id: 'VmB1G1K7v94', by: 'Athlean-X' },
  db_bench_incline: { id: '8iPEnn-ltC8', by: 'Renaissance Periodization' },
  fly_db:           { id: 'eozdVDA78K0', by: 'Athlean-X' },
  fly_cable:        { id: 'Iwe6AmxVf7o', by: 'Jeff Nippard' },
  fly_machine:      { id: 'FrxjOOToUL4', by: 'Renaissance Periodization' },
  dip:              { id: 'wjUmnZH528Y', by: 'Athlean-X' },
  pushup:           { id: 'IODxDxX7oi4', by: 'Athlean-X' },

  ohp:              { id: '2yjwXTZQDDI', by: 'Alan Thrall' },
  db_ohp:           { id: 'B-aVuyhvLHU', by: 'Athlean-X' },
  arnold_press:     { id: '6Z15_WdXmVw', by: 'Renaissance Periodization' },
  lateral_raise:    { id: '3VcKaXpzqRo', by: 'Jeff Nippard' },
  front_raise:      { id: 'sxeY3aHhWck', by: 'Athlean-X' },
  rear_delt:        { id: 'ttvfGg9d76c', by: 'Renaissance Periodization' },

  curl_barbell:     { id: 'kwG2ipFRgfo', by: 'Renaissance Periodization' },
  curl_ez:          { id: 'sTOoVXfaKlI', by: 'Athlean-X' },
  curl_dumbbell:    { id: 'ykJmrZ5v0Oo', by: 'Athlean-X' },
  hammer_curl:      { id: 'zC3nLlEvin4', by: 'Athlean-X' },
  preacher_curl:    { id: 'fIWP-FRFNU0', by: 'Renaissance Periodization' },
  concentration:    { id: 'Jvj2wV0vOYU', by: 'Athlean-X' },

  triceps_pushdown: { id: '2-LAMcpzODU', by: 'Athlean-X' },
  skull_crusher:    { id: 'l3rHYPtMUo8', by: 'Renaissance Periodization' },
  overhead_ext:     { id: '_gsUck-7M74', by: 'Athlean-X' },

  plank:            { id: 'ASdvN_XEl_c', by: 'Athlean-X' },
  crunch:           { id: 'Xyd_fa5zoEU', by: 'Renaissance Periodization' },
  ab_wheel:         { id: 'nHVSVXKUXn0', by: 'Athlean-X' },
  hanging_leg:     { id: 'Pr1ieGZ5atk', by: 'Athlean-X' },

  kb_swing:         { id: 'YSxHifyI6s8', by: 'Onnit' },
  clean:            { id: 'EKRiW9Yt3Ps', by: 'Squat University' },
  thruster:         { id: 'GLl6qJ26H98', by: 'Rogue Fitness' },
  burpee:           { id: 'auBLPXO8Fww', by: 'Athlean-X' },
}

// ─── Movement pattern → video key + cues ────────────────────────
// Ordered — most specific patterns first.
const PATTERNS = [
  // Legs
  { rx: /סקוואט\s*חזית|front\s*squat/i,       video: 'front_squat',      key: 'squat' },
  { rx: /סקוואט|squat/i,                        video: 'squat',            key: 'squat' },
  { rx: /לאנג׳\s*בולגר|bulgarian/i,             video: 'bulgarian_split',  key: 'lunge' },
  { rx: /הק\s*סקוואט|hack\s*squat/i,           video: 'hack_squat',       key: 'squat' },
  { rx: /לג\s*פרס|leg\s*press/i,                video: 'leg_press',        key: 'squat' },
  { rx: /הארכת\s*ברכ|leg\s*extension/i,        video: 'leg_extension',    key: 'isolation' },
  { rx: /כפיפת\s*ברכ|leg\s*curl|כפיפת\s*רגל/i, video: 'leg_curl',         key: 'isolation' },
  { rx: /רומני|romanian|RDL/i,                  video: 'romanian_dl',      key: 'deadlift' },
  { rx: /היפ\s*ת|hip\s*thrust/i,               video: 'hip_thrust',       key: 'hip_hinge' },
  { rx: /עליות?\s*עקבים|calf\s*raise/i,         video: 'calf_raise',       key: 'isolation' },
  { rx: /לאנג׳|lunge/i,                         video: 'bulgarian_split',  key: 'lunge' },

  // Back / Pulls
  { rx: /דדליפט\s*סומ|sumo/i,                  video: 'sumo_deadlift',    key: 'deadlift' },
  { rx: /דדליפט|deadlift/i,                     video: 'deadlift',         key: 'deadlift' },
  { rx: /מתח\s*רחב|pull[\s-]?up/i,             video: 'pullup',           key: 'pullup' },
  { rx: /מתח\s*צר|chin[\s-]?up/i,               video: 'chinup',           key: 'pullup' },
  { rx: /מתח/i,                                 video: 'pullup',           key: 'pullup' },
  { rx: /הורדת\s*פולי|pulldown|לט/i,           video: 'lat_pulldown',     key: 'pullup' },
  { rx: /T[- ]?bar|טי[- ]?בר/i,                video: 'tbar_row',         key: 'row' },
  { rx: /חתירה.*כבל|cable\s*row/i,             video: 'row_cable',        key: 'row' },
  { rx: /חתירה.*משקולת|dumbbell\s*row/i,       video: 'row_dumbbell',     key: 'row' },
  { rx: /חתירה|row/i,                           video: 'row_barbell',      key: 'row' },
  { rx: /פייס\s*פול|face\s*pull/i,             video: 'face_pull',        key: 'isolation' },
  { rx: /שראג|shrug/i,                          video: 'shrug',            key: 'isolation' },

  // Chest
  { rx: /לחיצת?\s*חזה.*שיפוע|incline\s*bench/i,video: 'bench_incline',    key: 'bench' },
  { rx: /לחיצת?\s*חזה.*יורד|decline\s*bench/i, video: 'bench_decline',    key: 'bench' },
  { rx: /לחיצת?\s*חזה.*משקול|dumbbell\s*bench/i, video: 'db_bench',       key: 'bench' },
  { rx: /לחיצת?\s*חזה|bench\s*press/i,         video: 'bench',            key: 'bench' },
  { rx: /פליי|fly/i,                            video: 'fly_db',           key: 'isolation' },
  { rx: /מקבילים|dip/i,                         video: 'dip',              key: 'bench' },
  { rx: /שכיבות?\s*(שמיכה|סמיכה)|push[\s-]?up/i, video: 'pushup',         key: 'bench' },

  // Shoulders
  { rx: /לחיצת?\s*כתפיים.*משקולת|dumbbell\s*press/i, video: 'db_ohp',    key: 'ohp' },
  { rx: /ארנולד|arnold\s*press/i,               video: 'arnold_press',     key: 'ohp' },
  { rx: /לחיצת?\s*כתפיים|overhead\s*press|OHP/i,video: 'ohp',              key: 'ohp' },
  { rx: /הרמות?\s*צד|lateral\s*raise/i,        video: 'lateral_raise',    key: 'isolation' },
  { rx: /הרמות?\s*קדמ|front\s*raise/i,         video: 'front_raise',      key: 'isolation' },
  { rx: /(פלאיס|אחוריים|rear\s*delt)/i,        video: 'rear_delt',        key: 'isolation' },

  // Arms
  { rx: /כפיפת?\s*מרפק.*מוט/i,                 video: 'curl_barbell',     key: 'curl' },
  { rx: /כפיפת?\s*מרפק.*EZ|EZ\s*curl/i,        video: 'curl_ez',          key: 'curl' },
  { rx: /כפיפת?\s*מרפק.*משקולת/i,              video: 'curl_dumbbell',    key: 'curl' },
  { rx: /(פטיש|hammer)/i,                       video: 'hammer_curl',      key: 'curl' },
  { rx: /(preacher|סקוט)/i,                     video: 'preacher_curl',    key: 'curl' },
  { rx: /(ריכוז|concentration)/i,               video: 'concentration',    key: 'curl' },
  { rx: /כפיפת?\s*מרפק|curl/i,                  video: 'curl_barbell',     key: 'curl' },
  { rx: /פשיטת?\s*מרפק.*כבל|pushdown/i,        video: 'triceps_pushdown', key: 'extension' },
  { rx: /סקאל\s*קראש|skull\s*crush/i,          video: 'skull_crusher',    key: 'extension' },
  { rx: /פשיטת?\s*מרפק|extension|טרייספס/i,    video: 'overhead_ext',     key: 'extension' },

  // Core
  { rx: /פלאנק|plank/i,                         video: 'plank',            key: 'core' },
  { rx: /גלגל\s*בטן|ab\s*wheel/i,               video: 'ab_wheel',         key: 'core' },
  { rx: /(רגל.*תלייה|hanging\s*leg)/i,          video: 'hanging_leg',      key: 'core' },
  { rx: /(קרנצ|crunch|סיטאפ|sit[\s-]?up)/i,     video: 'crunch',           key: 'core' },

  // Full body / cardio
  { rx: /קטלבל|swing|kettlebell/i,             video: 'kb_swing',         key: 'hip_hinge' },
  { rx: /קלין|clean/i,                          video: 'clean',            key: 'olympic' },
  { rx: /תראסטר|thruster/i,                     video: 'thruster',         key: 'olympic' },
  { rx: /ברפי|burpee/i,                         video: 'burpee',           key: 'cardio' },
]

// ─── Cue templates by movement key ─────────────────────────────
const CUES_BY_KEY = {
  squat: [
    'רגליים ברוחב כתפיים, אצבעות מעט החוצה',
    'שאיפה עמוקה, ליבה מהודקת לפני הירידה',
    'ברכיים בכיוון האצבעות — אל תיפלנה פנימה',
    'ירידה עד שהירכיים מקבילות לרצפה או מתחת',
    'דחיפה דרך העקבים והחצי-הקדמי של כף הרגל',
    'גב ניטרלי — לא מקומר ולא עגול',
    'נשיפה בעלייה, נעילת ברכיים בסוף בעדינות',
  ],
  deadlift: [
    'המוט מעל אמצע כף הרגל, קרוב לשוקיים',
    'תפיסה ברוחב כתפיים, ידיים מחוץ לרגליים',
    'ישבן אחורה, חזה למעלה, גב ישר וארוך',
    'הידוק שכמות ולאטיסימוס לפני העלייה',
    'לחץ את הרצפה עם הרגליים — המוט עולה כשהירכיים והכתפיים עולים ביחד',
    'נעילה בעמידה מלאה בסוף — אל תהפוך מעבר לניטרלי',
    'ירידה בשליטה — ישבן אחורה קודם, ברכיים אחר-כך',
  ],
  bench: [
    'שכיבה עם עיניים תחת המוט, שכמות סגורות אל הספסל',
    'קשת קלה בגב תחתון, רגליים שטוחות ברצפה',
    'תפיסה מעט רחבה מרוחב כתפיים, אצבע הבוהן עוטפת מסביב',
    'שאיפה, שחרר את המוט והביא לגובה החזה',
    'הורד את המוט לגובה הפטמות במסלול מבוקר',
    'מרפקים ב־45-60° מהגוף, לא 90°',
    'דחיפה חזרה עד נעילת מרפקים — נשיפה בסוף',
  ],
  ohp: [
    'עמידה זקופה, מוט/משקולות על הכתפיים הקדמיות',
    'ידיים ברוחב כתפיים, מרפקים מעט קדימה',
    'הידוק ליבה וישבן — אין קימור גב',
    'שאיפה, דחיפה של המוט מעל הראש במסלול ישר',
    'ראש "בורח קדימה" כשהמוט עובר את המצח',
    'נעילת מרפקים בסוף — האוזניים בין הזרועות',
    'הורדה בשליטה לגובה הכתפיים — נשיפה',
  ],
  pullup: [
    'תפיסה יציבה, שכמות סגורות למטה ואחורה לפני התחלת המשיכה',
    'הידוק ליבה — הגוף לא מתנדנד',
    'משוך את המרפקים לכיוון הרצפה, לא רק את הידיים למעלה',
    'סנטר מעל המוט — לא רק הראש',
    'עצירה קצרה בשיא ההתכווצות של הגב',
    'ירידה מבוקרת של 2-3 שניות',
    'נעילה מלאה של המרפקים בתחתית בין החזרות',
  ],
  row: [
    'התכופפות עם ישבן אחורה, גב ישר, זווית ~45°',
    'ידיים ישרות באחיזה, שכמות מרוחקות',
    'הידוק ליבה ונעילת שכמות לפני המשיכה',
    'משוך את המוט/הכבל לכיוון הבטן התחתונה',
    'מרפקים נעים אחורה ולמעלה — לא החוצה',
    'עצירה קצרה בשיא ההתכווצות',
    'החזרה בשליטה למצב התחלה — נשיפה',
  ],
  curl: [
    'עמידה זקופה, זרועות לצדי הגוף',
    'אחיזת המשקל בסופיניציה (כפות ידיים למעלה)',
    'מרפקים צמודים לצלעות — לא זזים!',
    'כיפוף המרפק בלבד, ללא נדנוד גוף',
    'עצירה קצרה בשיא — כווץ את הביצפס',
    'הורדה איטית ומבוקרת חזרה',
    'ריכוז מלא בביצפס לכל אורך התנועה',
  ],
  extension: [
    'מרפקים צמודים לגוף — אל תיפרשו החוצה',
    'תנועה סביב מפרק המרפק בלבד — הזרוע העליונה קבועה',
    'שאיפה לפני הירידה',
    'הורדה איטית ומבוקרת עד שהאמה נוגעת בזרוע',
    'עצירה קצרה בתחתית',
    'דחיפה חזרה בעזרת הטריצפס בלבד',
    'נעילה קלה של המרפק בסוף — לא היפר-אקסטנשן',
  ],
  isolation: [
    'תנועה סביב מפרק אחד בלבד — לא לגייס שרירים אחרים',
    'טווח תנועה מלא — לא לחתוך',
    'עצירה קצרה בשיא ההתכווצות',
    'ירידה איטית של 2-3 שניות',
    'משקל מבוקר — לא נדנוד',
    'נשימה סדירה לאורך כל החזרה',
    'ריכוז מנטלי מלא בשריר המטרה',
  ],
  hip_hinge: [
    'רגליים ברוחב אגן, ברכיים מעט כפופות',
    'ישבן אחורה — ציר מהאגן, לא מהברכיים',
    'גב ישר וארוך לכל אורך התנועה',
    'הורדה עד שאתה מרגיש מתיחה בהמסטרינגס',
    'סגירת ישבן בקצה — לא קימור גב תחתון',
    'שמור על שכמות סגורות והמוט צמוד לגוף',
    'החזרה למצב התחלה בשליטה מלאה',
  ],
  core: [
    'הידוק בטן לפני התחלת התנועה',
    'שאיפה — בטן פנימה, לא לחוץ החוצה',
    'תנועה שקטה, בלי מומנטום',
    'נשיפה בסוף כל חזרה',
    'שמור על ניטרל בעמוד השדרה',
    'תנוחת הצוואר — מבט כלפי מעלה, סנטר לא לחזה',
    'איכות לפני כמות — 10 טובות > 30 רשלניות',
  ],
  lunge: [
    'עמידה זקופה, ליבה מהודקת',
    'צעד קדימה גדול, לא קטן מדי',
    'ירידה עד שהברך האחורית כמעט נוגעת ברצפה',
    'ברך הקדמית מעל הקרסול, לא מעבר לאצבעות',
    'משקל על העקב של הרגל הקדמית',
    'דחיפה חזרה למצב עמידה דרך הרגל הקדמית',
    'שמור על גב ישר לאורך כל התנועה',
  ],
  olympic: [
    'תרגיל מורכב — קח מאמן מוסמך לעבודה על טכניקה',
    'מתחילים עם מוט ריק / משקל קל בלבד',
    'עמידה יציבה, ליבה מהודקת',
    'תנועה דינמית — כוח מהרגליים',
    'קבלה מהירה של המשקל במיקום הסופי',
    'שליטה מלאה בירידה',
    'עדיף מעט חזרות באיכות גבוהה מהרבה ברשלנות',
  ],
  cardio: [
    'קצב יציב — לא לפרוץ קדימה ולבזבז בהתחלה',
    'נשימה עמוקה ומסודרת',
    'ליבה מהודקת לאורך כל הסט',
    'תנועות נקיות — אל תוותר על טכניקה בגלל עייפות',
    'שמור על טכניקה נכונה גם כשקשה',
    'המנוחה בין סטים — אל תשב, זוז בקצב איטי',
    'הידרציה חשובה — שתה מים בין סטים',
  ],
  generic: [
    'תנוחת מוצא יציבה, ליבה מהודקת',
    'אחיזה נכונה של הציוד',
    'שאיפה עמוקה לפני התנועה',
    'ביצוע התנועה בשליטה מלאה — לא מומנטום',
    'עצירה קצרה בשיא ההתכווצות',
    'החזרה למצב התחלה בהאטה מבוקרת',
    'נשיפה בסוף כל חזרה',
  ],
}

// ─── Resolvers ─────────────────────────────────────────────────
export function resolveGuide(exerciseOrName) {
  // Accept either an exercise object or a plain-text name
  const name = typeof exerciseOrName === 'string'
    ? exerciseOrName
    : (exerciseOrName?.he || exerciseOrName?.name || exerciseOrName?.exerciseName || '')
  const obj = typeof exerciseOrName === 'object' ? exerciseOrName : null

  // 1. Explicit on the object
  const objCues = obj?.cues || obj?.formCues
  const objVideoId = obj?.ytId || obj?.yt
  const objVideoBy = obj?.ytBy

  // 2. Pattern match
  let patternHit = null
  for (const p of PATTERNS) {
    if (p.rx.test(name)) { patternHit = p; break }
  }

  const cues = objCues && objCues.length
    ? objCues
    : (patternHit ? CUES_BY_KEY[patternHit.key] : CUES_BY_KEY.generic)

  const video = objVideoId
    ? { id: objVideoId, by: objVideoBy || null, source: 'catalog' }
    : (patternHit && VIDEO_MAP[patternHit.video]
        ? { ...VIDEO_MAP[patternHit.video], source: 'match' }
        : { id: null, by: null, source: 'search', searchQuery: name })

  return { cues, video, name }
}

export function youtubeSearchUrl(query) {
  const q = encodeURIComponent(`${query} form tutorial`)
  return `https://www.youtube.com/results?search_query=${q}`
}

export function youtubeEmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
}
