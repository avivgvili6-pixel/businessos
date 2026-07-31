// blood test markers with reference ranges and interpretation
export const bloodMarkers = [
  { id:'hgb',       name:'המוגלובין',        unit:'g/dL',   ranges:{ female:[12,16], male:[13.5,17.5] }, low:'עייפות, חיוורון - שקול תוסף ברזל + B12, בשר אדום, קטניות', high:'לרוב לא בעייתי - שתייה מרובה, בדוק המטוקריט' },
  { id:'ferritin',  name:'פריטין',           unit:'ng/mL',  ranges:{ default:[30,300] }, low:'מחסור ברזל - בדוק דימומים, הוסף בשר אדום/עדשים + ויטמין C', high:'דלקת/עומס ברזל - בדוק CRP' },
  { id:'b12',       name:'ויטמין B12',       unit:'pg/mL',  ranges:{ default:[200,900] }, low:'עייפות, נימול - תוסף (במיוחד לצמחונים)', high:'לרוב תוצאה של תוספים' },
  { id:'vitD',      name:'ויטמין D',         unit:'ng/mL',  ranges:{ default:[30,80] },  low:'שכיח בישראל - 2000-4000 יב״ל ליום, חשיפה לשמש', high:'הפחת מינון תוסף' },
  { id:'glucose',   name:'גלוקוז בצום',      unit:'mg/dL',  ranges:{ default:[70,99] }, low:'היפוגליקמיה - ארוחות קטנות תכופות', high:'טרום-סוכרת/סוכרת - הפחת סוכר פשוט, פחמימות מזוקקות' },
  { id:'hba1c',     name:'HbA1c',            unit:'%',      ranges:{ default:[4,5.6] }, low:'', high:'ניהול סוכר לקוי לאורך זמן - דיאטת פחמימות איטיות + פעילות אירובית' },
  { id:'chol',      name:'כולסטרול כולל',    unit:'mg/dL',  ranges:{ default:[0,200] }, low:'', high:'הפחת שומן רווי/טראנס, הרבה סיבים, אומגה 3' },
  { id:'ldl',       name:'LDL (כולסטרול רע)', unit:'mg/dL', ranges:{ default:[0,130] }, low:'', high:'הימנע משומן טראנס, אכול שיבולת שועל/קטניות/דגים' },
  { id:'hdl',       name:'HDL (כולסטרול טוב)',unit:'mg/dL', ranges:{ female:[50,100], male:[40,100] }, low:'הוסף אומגה 3, אבוקדו, שמן זית, פעילות אירובית', high:'מצוין' },
  { id:'tg',        name:'טריגליצרידים',      unit:'mg/dL', ranges:{ default:[0,150] }, low:'', high:'הפחת סוכרים/אלכוהול, הוסף אומגה 3' },
  { id:'alt',       name:'ALT (כבד)',         unit:'U/L',   ranges:{ default:[7,55] },  low:'', high:'חשד לכבד שומני - הפחת אלכוהול/סוכר, פעילות גופנית' },
  { id:'ast',       name:'AST (כבד)',         unit:'U/L',   ranges:{ default:[8,48] },  low:'', high:'בדוק ALT + אורח חיים' },
  { id:'creat',     name:'קריאטינין',         unit:'mg/dL', ranges:{ female:[.5,1], male:[.7,1.3] }, low:'', high:'תפקוד כליות - שתייה, בדיקה עם רופא' },
  { id:'tsh',       name:'TSH (תריס)',        unit:'mIU/L', ranges:{ default:[.4,4] },  low:'תריס פעיל - בדוק T4', high:'תת-פעילות - בדוק T4 חופשי, שקול יוד/סלניום' },
  { id:'crp',       name:'CRP (דלקת)',        unit:'mg/L',  ranges:{ default:[0,5] },   low:'', high:'דלקת כרונית - דיאטה אנטי-דלקתית, אומגה 3, שינה' },
  { id:'testo',     name:'טסטוסטרון (גברים)', unit:'ng/dL', ranges:{ male:[300,1000] }, low:'שינה, אימוני התנגדות, אבץ+D, ניהול סטרס', high:'לרוב תקין בספורטאים' },
]

export function statusForValue(marker, value, sex = 'default') {
  const range = marker.ranges[sex] || marker.ranges.default
  if (!range || value == null || isNaN(value)) return 'unknown'
  const [lo, hi] = range
  if (value < lo) return 'low'
  if (value > hi) return 'high'
  return 'normal'
}
