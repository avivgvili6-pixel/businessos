// generic exercise library - MVP seed
export const MUSCLE_GROUPS = ['חזה','גב','רגליים','כתפיים','ידיים','ליבה','ישבן','כל הגוף','אירובי']
export const EQUIPMENT = ['משקל גוף','משקולות','מוט','כבלים','מכונה','קטלבל','גומיות','TRX','אופניים','חבל']
export const CATEGORIES = ['כוח','היפרטרופיה','HIIT','אירובי','פונקציונלי','מוביליטי','יוגה','פילאטיס']
export const LEVELS = ['מתחיל','בינוני','מתקדם']

export const exercises = [
  { id:'squat', name:'סקוואט', muscle:'רגליים', secondary:['ישבן','ליבה'], equipment:'מוט', category:'כוח', level:'בינוני', tips:'שמור על גב ישר, ברכיים בקו האצבעות' },
  { id:'deadlift', name:'דדליפט', muscle:'גב', secondary:['רגליים','ישבן','ליבה'], equipment:'מוט', category:'כוח', level:'מתקדם', tips:'התחל מהמותניים, מוט קרוב לגוף' },
  { id:'bench', name:'לחיצת חזה במוט', muscle:'חזה', secondary:['ידיים','כתפיים'], equipment:'מוט', category:'כוח', level:'בינוני', tips:'לחיצה מבוקרת, מרפקים ~45°' },
  { id:'ohp', name:'לחיצת כתפיים בעמידה', muscle:'כתפיים', secondary:['ידיים','ליבה'], equipment:'מוט', category:'כוח', level:'בינוני', tips:'ליבה נעולה, לא לקשת את הגב' },
  { id:'pullup', name:'מתח', muscle:'גב', secondary:['ידיים'], equipment:'משקל גוף', category:'כוח', level:'מתקדם', tips:'שכמות אחורה, סנטר מעל המוט' },
  { id:'row', name:'חתירה במוט', muscle:'גב', secondary:['ידיים'], equipment:'מוט', category:'היפרטרופיה', level:'בינוני', tips:'משוך אל הבטן, שכמות פנימה' },
  { id:'dip', name:'מקבילים', muscle:'חזה', secondary:['ידיים','כתפיים'], equipment:'משקל גוף', category:'כוח', level:'מתקדם', tips:'הטה קדימה לחזה, ישר לטרייספס' },
  { id:'pushup', name:'שכיבות שמיכה', muscle:'חזה', secondary:['ידיים','ליבה'], equipment:'משקל גוף', category:'היפרטרופיה', level:'מתחיל', tips:'גוף ישר כמו קרש' },
  { id:'lunge', name:'לאנג׳ הליכה', muscle:'רגליים', secondary:['ישבן'], equipment:'משקולות', category:'היפרטרופיה', level:'מתחיל', tips:'ברך אחורית נוגעת כמעט ברצפה' },
  { id:'rdl', name:'רומני דדליפט', muscle:'ישבן', secondary:['גב','רגליים'], equipment:'מוט', category:'היפרטרופיה', level:'בינוני', tips:'ציר מהמותניים, ברכיים רכות' },
  { id:'hip_thrust', name:'היפ ת׳ראסט', muscle:'ישבן', secondary:['רגליים'], equipment:'מוט', category:'היפרטרופיה', level:'בינוני', tips:'סגור ישבן בקצה, לא לקשת גב' },
  { id:'leg_press', name:'לג פרס', muscle:'רגליים', secondary:['ישבן'], equipment:'מכונה', category:'היפרטרופיה', level:'מתחיל', tips:'ברכיים לא נועלות למעלה' },
  { id:'plank', name:'פלאנק', muscle:'ליבה', secondary:['כתפיים'], equipment:'משקל גוף', category:'פונקציונלי', level:'מתחיל', tips:'ישבן בגובה כתפיים' },
  { id:'ab_wheel', name:'גלגל בטן', muscle:'ליבה', secondary:['כתפיים'], equipment:'משקל גוף', category:'פונקציונלי', level:'מתקדם', tips:'לגלגל עד לפני שהגב מתקמר' },
  { id:'hanging_leg', name:'הרמת רגליים בתלייה', muscle:'ליבה', secondary:['גב'], equipment:'משקל גוף', category:'פונקציונלי', level:'בינוני', tips:'ללא נדנוד, שליטה מלאה' },
  { id:'kb_swing', name:'קטלבל סווינג', muscle:'כל הגוף', secondary:['ישבן','ליבה'], equipment:'קטלבל', category:'HIIT', level:'בינוני', tips:'דחיפת ירכיים - לא כתפיים' },
  { id:'burpee', name:'ברפי', muscle:'כל הגוף', secondary:[], equipment:'משקל גוף', category:'HIIT', level:'בינוני', tips:'קצב יציב, לנשום' },
  { id:'row_erg', name:'חתירת מכונה', muscle:'אירובי', secondary:['גב','רגליים'], equipment:'מכונה', category:'אירובי', level:'מתחיל', tips:'רגליים→ירכיים→ידיים' },
  { id:'run', name:'ריצה', muscle:'אירובי', secondary:['רגליים'], equipment:'משקל גוף', category:'אירובי', level:'מתחיל', tips:'נחיתה על כרית כף הרגל' },
  { id:'bike', name:'אופניים', muscle:'אירובי', secondary:['רגליים'], equipment:'אופניים', category:'אירובי', level:'מתחיל', tips:'קדנס 80-100 סל״ד' },
  { id:'curl', name:'כפיפת מרפקים', muscle:'ידיים', secondary:[], equipment:'משקולות', category:'היפרטרופיה', level:'מתחיל', tips:'ללא נדנוד גוף' },
  { id:'triceps_pd', name:'פשיטת מרפקים בכבל', muscle:'ידיים', secondary:[], equipment:'כבלים', category:'היפרטרופיה', level:'מתחיל', tips:'מרפקים צמודים לגוף' },
  { id:'lateral', name:'הרמות צד', muscle:'כתפיים', secondary:[], equipment:'משקולות', category:'היפרטרופיה', level:'מתחיל', tips:'להוביל עם המרפק' },
  { id:'face_pull', name:'פייס פול', muscle:'כתפיים', secondary:['גב'], equipment:'כבלים', category:'היפרטרופיה', level:'מתחיל', tips:'משיכה לעבר הפנים, שכמות סוגרות' },
  { id:'yoga_flow', name:'זרימת יוגה', muscle:'כל הגוף', secondary:['ליבה'], equipment:'משקל גוף', category:'יוגה', level:'מתחיל', tips:'נשימה מסונכרנת עם התנועה' },
  { id:'mobility', name:'שגרת מוביליטי', muscle:'כל הגוף', secondary:[], equipment:'משקל גוף', category:'מוביליטי', level:'מתחיל', tips:'10-15 דקות, ללא כאב' },
]

export const workoutSplits = {
  full_body:   { label:'גוף מלא', days: 3, sessions: ['גוף מלא A','גוף מלא B','גוף מלא C'] },
  upper_lower: { label:'עליון/תחתון', days: 4, sessions: ['עליון כוח','תחתון כוח','עליון היפרטרופיה','תחתון היפרטרופיה'] },
  ppl:         { label:'דחיפה/משיכה/רגליים', days: 6, sessions: ['דחיפה','משיכה','רגליים','דחיפה','משיכה','רגליים'] },
  bro:         { label:'ברו-ספליט', days: 5, sessions: ['חזה','גב','רגליים','כתפיים','ידיים'] },
  hybrid:      { label:'היברידי (כוח+אירובי)', days: 5, sessions: ['כוח עליון','אינטרוול','כוח תחתון','LISS','גוף מלא'] },
}
