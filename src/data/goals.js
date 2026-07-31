// Goal-setting content: directions, SMART templates, coaching prompts.

// 6 broad directions - the "north star" the user picks first
export const DIRECTIONS = [
  { id:'aesthetics',  label:'להיראות טוב יותר',    icon:'💪', desc:'חיטוב, מסת שריר, שינוי הרכב גוף' },
  { id:'health',      label:'בריאות ואריכות ימים',  icon:'❤️', desc:'לחץ דם, סוכר, לב, מניעת מחלות' },
  { id:'performance', label:'ביצועים ספורטיביים',   icon:'🏆', desc:'להיות חזק/מהיר/בעל סבולת יותר' },
  { id:'energy',      label:'אנרגיה יומיומית',      icon:'⚡', desc:'להתעורר מלא כוח, לא להיות עייף' },
  { id:'mental',      label:'שקט נפשי וחוסן',       icon:'🧠', desc:'סטרס, חרדה, מצב-רוח, שינה' },
  { id:'lifestyle',   label:'הרגלים ואיזון',        icon:'🌊', desc:'שגרה בריאה, אכילה מודעת, פחות מסכים' },
]

// SMART goal templates - each attached to a direction + measurable KPI
// kind: 'weight_change'|'body_fat'|'lift_pr'|'endurance'|'sessions'|'habit_streak'|'measurement'|'sleep'|'mood'|'blood_marker'
export const GOAL_TEMPLATES = {
  aesthetics: [
    { id:'lose_5kg',    label:'לרדת 5 ק״ג',                     kind:'weight_change', delta:-5,   unit:'ק״ג', weeks:12 },
    { id:'lose_10kg',   label:'לרדת 10 ק״ג',                    kind:'weight_change', delta:-10,  unit:'ק״ג', weeks:24 },
    { id:'gain_3kg',    label:'לעלות 3 ק״ג במסת שריר',           kind:'weight_change', delta:+3,   unit:'ק״ג', weeks:16 },
    { id:'cut_bodyfat', label:'להוריד 5% שומן גוף',              kind:'body_fat',      delta:-5,   unit:'%',   weeks:16 },
    { id:'waist',       label:'להוריד 5 ס״מ בהיקף מותניים',       kind:'measurement',   metric:'waist', delta:-5, unit:'ס״מ', weeks:12 },
  ],
  performance: [
    { id:'squat_100',   label:'להגיע לסקוואט 100 ק״ג',           kind:'lift_pr', lift:'squat',    target:100, unit:'ק״ג', weeks:20 },
    { id:'bench_bw',    label:'לחיצת חזה במשקל גוף',              kind:'lift_pr', lift:'bench',    target:null, unit:'משקל גוף', weeks:24 },
    { id:'deadlift_2x', label:'דדליפט של פי 2 ממשקל הגוף',        kind:'lift_pr', lift:'deadlift', target:null, unit:'2× משקל גוף', weeks:32 },
    { id:'first_pullup',label:'המתח הראשון',                     kind:'lift_pr', lift:'pullup',   target:1,    unit:'חזרה', weeks:12 },
    { id:'run_10k',     label:'לרוץ 10 ק״מ ברצף',                kind:'endurance', distance:10, unit:'ק״מ', weeks:12 },
    { id:'run_5k_25',   label:'לרוץ 5 ק״מ מתחת ל-25 דק׳',        kind:'endurance', distance:5,  time:25, unit:'דק׳', weeks:16 },
    { id:'half_mara',   label:'לרוץ חצי מרתון (21 ק״מ)',          kind:'endurance', distance:21, unit:'ק״מ', weeks:20 },
  ],
  health: [
    { id:'blood_press', label:'להוריד לחץ דם לתחום התקין',        kind:'health_marker', metric:'לחץ דם', weeks:16 },
    { id:'a1c',         label:'להוריד HbA1c מתחת ל-5.7',           kind:'blood_marker', marker:'hba1c', target:5.7, unit:'%', weeks:24 },
    { id:'ldl',         label:'להוריד LDL מתחת ל-130',             kind:'blood_marker', marker:'ldl', target:130, unit:'mg/dL', weeks:16 },
    { id:'vitd_normal', label:'להעלות ויטמין D לטווח תקין',        kind:'blood_marker', marker:'vitD', target:40, unit:'ng/mL', weeks:12 },
    { id:'quit_sugar',  label:'לצמצם סוכר מוסף',                   kind:'habit_streak', habit:'ללא סוכר מוסף', weeks:8 },
  ],
  energy: [
    { id:'sleep_8h',    label:'לישון 7-8 שעות רצוף',              kind:'sleep', target:7.5, unit:'שעות', weeks:8 },
    { id:'morning_ex',  label:'להתעורר לפעילות בוקר 5 ימים בשבוע', kind:'habit_streak', habit:'התעוררות לתנועה', weeks:8 },
    { id:'water',       label:'לשתות 3 ליטר מים ביום',             kind:'habit_streak', habit:'3 ליטר מים', weeks:6 },
    { id:'consistent',  label:'שגרת שינה עקבית',                   kind:'habit_streak', habit:'שעת שינה קבועה', weeks:8 },
  ],
  mental: [
    { id:'mood_7',      label:'מצב רוח ממוצע 7+/10',              kind:'mood', target:7,  weeks:8 },
    { id:'meditation',  label:'מדיטציה 10 דק׳ ביום',              kind:'habit_streak', habit:'מדיטציה יומית', weeks:8 },
    { id:'stress_down', label:'להוריד רמת סטרס מ-8 ל-5',           kind:'mood', metric:'stress', from:8, target:5, weeks:12 },
    { id:'journal',     label:'לכתוב יומן 5 פעמים בשבוע',          kind:'habit_streak', habit:'כתיבת יומן', weeks:6 },
    { id:'no_phone_am', label:'ללא טלפון בשעה הראשונה של הבוקר',   kind:'habit_streak', habit:'ללא טלפון בבוקר', weeks:6 },
  ],
  lifestyle: [
    { id:'meal_prep',   label:'להכין ארוחות מבעוד מועד 4 ימים בשבוע', kind:'habit_streak', habit:'הכנת ארוחות', weeks:8 },
    { id:'walks',       label:'הליכה יומית של 30 דק׳',              kind:'habit_streak', habit:'הליכה 30 דק׳', weeks:6 },
    { id:'no_alcohol',  label:'חודש ללא אלכוהול',                   kind:'habit_streak', habit:'ללא אלכוהול', weeks:4 },
    { id:'family',      label:'ארוחה משפחתית 5 ערבים בשבוע',        kind:'habit_streak', habit:'ארוחה משפחתית', weeks:8 },
  ],
}

// Coaching questions - shown when user is unclear or picks "לא בטוח"
// Each round narrows the space, ending with a concrete suggestion
export const COACHING_ROUNDS = [
  {
    id:'r1',
    prompt:'בואי נבין קודם - מה הכי מציק לך בגוף/בחיים כרגע?',
    options: [
      { text:'אני לא מרוצה מאיך שאני נראה במראה',       nudge:'aesthetics' },
      { text:'אני עייף/ה ואין לי אנרגיה',                nudge:'energy' },
      { text:'הרופא/ה אמרו שיש בעיה בריאותית',           nudge:'health' },
      { text:'אני לחוץ/ה ולא רגוע/ה',                     nudge:'mental' },
      { text:'אני רוצה להיות חזק/ה או לרוץ יותר',        nudge:'performance' },
      { text:'אין לי שגרה בריאה, אני מתנהג/ת רע',        nudge:'lifestyle' },
    ],
  },
  {
    id:'r2',
    prompt:'אם היית מתעורר/ת בעוד 12 שבועות עם התוצאה המושלמת - איך זה נראה?',
    options: [
      { text:'משקל נמוך יותר, בגדים שיושבים טוב',            keyword:'lose_weight' },
      { text:'שריר גלוי, גוף חטוב',                          keyword:'muscle' },
      { text:'ריצה של 5-10 ק״מ מבלי לעצור',                   keyword:'endurance' },
      { text:'להרים משקל שהיום מרגיש בלתי אפשרי',              keyword:'strength' },
      { text:'להתעורר עם אנרגיה ולישון בשלווה',                keyword:'energy' },
      { text:'להרגיש רגוע/ה גם ברגעים לחוצים',                 keyword:'calm' },
    ],
  },
  {
    id:'r3',
    prompt:'כמה זמן ריאלי להשקיע בזה בשבוע?',
    options: [
      { text:'עד 3 שעות בשבוע (המינימום שעובד)',   commitment:'low' },
      { text:'4-5 שעות בשבוע (בינוני)',            commitment:'medium' },
      { text:'6+ שעות בשבוע (רציני)',              commitment:'high' },
    ],
  },
]

// "Why" prompt cards - identity-based motivation anchors
export const WHY_PROMPTS = [
  'כדי לשחק עם הילדים שלי בלי להיות עייף',
  'כדי להיראות טוב בבגד ים בקיץ',
  'כדי להוכיח לעצמי שאני מסוגל/ת',
  'כדי לחיות עוד 20 שנה עם בריאות',
  'כדי להרגיש מלא/ה אנרגיה כל יום',
  'כדי להיות דוגמה למי שאני מוביל/ה',
  'כדי להפסיק להיות ״זה שלא עומד במילה שלו״',
  'כדי לחזור לרמה שאני יודע/ת שאני מסוגל/ת',
]

// Common barriers - anticipate and plan around them
export const COMMON_BARRIERS = [
  { id:'time',       label:'אין לי זמן',                counter:'20 דק׳ ביום מספיקים - נבנה תכנית קצרה' },
  { id:'motivation', label:'אני מאבד/ת מוטיבציה',      counter:'הרגלים > מוטיבציה. streaks יעזרו' },
  { id:'travel',     label:'אני נוסע/ת הרבה',           counter:'המחולל המהיר בונה אימון בכל מקום עם כל ציוד' },
  { id:'social',     label:'אכילה חברתית מפילה אותי',    counter:'נלמד גמישות - 80/20 rule' },
  { id:'injury',     label:'יש לי פציעה שמפריעה',        counter:'מודול השיקום ילווה - תכנית מותאמת' },
  { id:'money',      label:'תזונה בריאה יקרה',           counter:'נבנה רשימת קניות ופיתרונות אקונומיים' },
  { id:'family',     label:'המשפחה לא בקטע',             counter:'נבנה שגרה שמתאימה לכולם - לא מלחמה' },
  { id:'past',       label:'ניסיתי בעבר ונכשלתי',        counter:'כל התחלה חדשה מלמדת - נלמד מה עבד' },
]

// Convert template to structured goal object
export function templateToGoal(template, extras = {}) {
  return {
    id: 'goal_' + Date.now(),
    createdAt: new Date().toISOString(),
    direction: extras.direction || null,
    template: template.id,
    title: template.label,
    kind: template.kind,
    metric: {
      kind: template.kind,
      target: template.target ?? null,
      delta: template.delta ?? null,
      unit: template.unit || '',
      lift: template.lift || null,
      marker: template.marker || null,
      metricKey: template.metric || null,
      from: template.from ?? null,
    },
    deadlineWeeks: template.weeks || 12,
    startDate: new Date().toISOString(),
    why: extras.why || '',
    barriers: extras.barriers || [],
    weeklyActions: template.weeklyActions || [],
    checkins: [],
    status: 'active',
    ...extras,
  }
}
