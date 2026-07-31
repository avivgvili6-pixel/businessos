// mock members + team for admin console
export const mockMembers = [
  { id:'m1', name:'דנה כהן',      age:32, sex:'female', joinedDays:145, plan:'פרימיום',  coach:'עידן',   status:'active',   adherence:87, mood:8, sessionsThisWeek:4, weightKg:63, goal:'חיטוב',    lastCheckin:'לפני יום',    risk:'low' },
  { id:'m2', name:'יונתן לוי',    age:41, sex:'male',   joinedDays:22,  plan:'סטנדרט',   coach:'שירן',  status:'active',   adherence:64, mood:6, sessionsThisWeek:2, weightKg:88, goal:'עלייה במסה', lastCheckin:'לפני 3 ימים', risk:'medium' },
  { id:'m3', name:'רומי בן דוד',  age:28, sex:'female', joinedDays:380, plan:'פרימיום',  coach:'עידן',   status:'active',   adherence:92, mood:9, sessionsThisWeek:5, weightKg:58, goal:'כוח',        lastCheckin:'היום',       risk:'low' },
  { id:'m4', name:'אמיר שרון',    age:52, sex:'male',   joinedDays:210, plan:'בייסיק',   coach:'שירן',  status:'active',   adherence:41, mood:5, sessionsThisWeek:1, weightKg:102,goal:'ירידה במשקל', lastCheckin:'לפני 8 ימים', risk:'high' },
  { id:'m5', name:'הילה אברהם',   age:37, sex:'female', joinedDays:60,  plan:'פרימיום',  coach:'תמר',   status:'active',   adherence:78, mood:7, sessionsThisWeek:3, weightKg:70, goal:'בריאות כללית', lastCheckin:'לפני יומיים',risk:'low' },
  { id:'m6', name:'נועם רז',      age:24, sex:'male',   joinedDays:5,   plan:'סטנדרט',   coach:'עידן',   status:'active',   adherence:95, mood:8, sessionsThisWeek:3, weightKg:75, goal:'עלייה במסה', lastCheckin:'היום',       risk:'low' },
  { id:'m7', name:'קרן שביט',     age:45, sex:'female', joinedDays:520, plan:'פרימיום',  coach:'תמר',   status:'active',   adherence:71, mood:7, sessionsThisWeek:3, weightKg:65, goal:'חיטוב',      lastCheckin:'לפני יומיים',risk:'low' },
  { id:'m8', name:'איתי גולן',    age:33, sex:'male',   joinedDays:190, plan:'סטנדרט',   coach:'שירן',  status:'paused',   adherence:12, mood:4, sessionsThisWeek:0, weightKg:91, goal:'בריאות כללית', lastCheckin:'לפני 21 ימים',risk:'high' },
  { id:'m9', name:'שירה מלכה',    age:29, sex:'female', joinedDays:95,  plan:'פרימיום',  coach:'עידן',   status:'active',   adherence:83, mood:8, sessionsThisWeek:4, weightKg:60, goal:'כוח',        lastCheckin:'היום',       risk:'low' },
  { id:'m10',name:'טל אפרתי',     age:38, sex:'male',   joinedDays:305, plan:'פרימיום',  coach:'תמר',   status:'active',   adherence:69, mood:6, sessionsThisWeek:2, weightKg:83, goal:'חיטוב',      lastCheckin:'לפני 4 ימים', risk:'medium' },
]

export const mockTeam = [
  { id:'t1', name:'עידן דהן',    role:'Coach',        specialty:'כוח והיפרטרופיה',    activeMembers:4, retention:91, rating:4.9, hoursThisWeek:32, status:'available' },
  { id:'t2', name:'שירן בן חיים', role:'Coach',        specialty:'HIIT ואירובי',       activeMembers:3, retention:78, rating:4.6, hoursThisWeek:28, status:'available' },
  { id:'t3', name:'תמר וקנין',   role:'Coach',        specialty:'פונקציונלי ומוביליטי',activeMembers:3, retention:88, rating:4.8, hoursThisWeek:30, status:'in_session' },
  { id:'t4', name:'ד״ר רון ליבוביץ׳',role:'Nutritionist', specialty:'ספורט וירידה במשקל',activeMembers:8, retention:85, rating:4.9, hoursThisWeek:20, status:'available' },
  { id:'t5', name:'ד״ר יעל שלו', role:'Mental Coach', specialty:'CBT ומיינדפולנס',    activeMembers:6, retention:90, rating:5.0, hoursThisWeek:18, status:'available' },
]

export const mockSchedule = [
  { day:0, time:'07:00', title:'HIIT בוקר',    coach:'שירן',  capacity:15, booked:12, room:'אולם 1' },
  { day:0, time:'08:00', title:'יוגה זרימה',    coach:'תמר',   capacity:12, booked:9,  room:'סטודיו' },
  { day:0, time:'18:00', title:'CrossFit',      coach:'עידן',   capacity:10, booked:10, room:'אולם 1' },
  { day:0, time:'19:00', title:'כוח מתקדמים',   coach:'עידן',   capacity:8,  booked:5,  room:'משקולות' },
  { day:1, time:'07:00', title:'פילאטיס',       coach:'תמר',   capacity:10, booked:7,  room:'סטודיו' },
  { day:1, time:'18:00', title:'ספין',          coach:'שירן',  capacity:20, booked:18, room:'ספין' },
  { day:2, time:'07:00', title:'HIIT בוקר',    coach:'שירן',  capacity:15, booked:11, room:'אולם 1' },
  { day:2, time:'19:00', title:'קטלבל',         coach:'עידן',   capacity:10, booked:6,  room:'משקולות' },
  { day:3, time:'08:00', title:'יוגה זרימה',    coach:'תמר',   capacity:12, booked:12, room:'סטודיו' },
  { day:3, time:'19:00', title:'בוקסינג פיטנס', coach:'שירן',  capacity:12, booked:9,  room:'אולם 2' },
  { day:4, time:'07:00', title:'CrossFit',      coach:'עידן',   capacity:10, booked:8,  room:'אולם 1' },
  { day:5, time:'09:00', title:'שבת אירובית',   coach:'שירן',  capacity:20, booked:15, room:'אולם 1' },
]

export const mockAlerts = [
  { id:'a1', severity:'high',   type:'churn_risk',      memberId:'m4', title:'אמיר שרון בסיכון נטישה', desc:'8 ימים ללא התחברות, דבקות ירדה ל-41%', suggestion:'שלח הודעה אישית והצע פגישת ריענון' },
  { id:'a2', severity:'high',   type:'churn_risk',      memberId:'m8', title:'איתי גולן - מנוי בסיכון ביטול', desc:'לא הגיע 3 שבועות, מנוי בסטטוס paused', suggestion:'שיחת טלפון מהמאמן שירן' },
  { id:'a3', severity:'medium', type:'blood_marker',    memberId:'m5', title:'הילה - ויטמין D נמוך', desc:'22 ng/mL (מתחת ל-30)', suggestion:'הפניה לתזונאי + תוסף 2000 יב״ל' },
  { id:'a4', severity:'medium', type:'performance_drop',memberId:'m2', title:'יונתן - ירידה בביצועי סקוואט', desc:'ירידה של 15% ב-3 השבועות האחרונים', suggestion:'שקול deload או בדוק סטרס/שינה' },
  { id:'a5', severity:'low',    type:'mood_low',        memberId:'m4', title:'אמיר - מצב רוח נמוך', desc:'ממוצע 5/10 השבוע', suggestion:'הפניה למאמן מנטלי' },
  { id:'a6', severity:'low',    type:'plateau',         memberId:'m10',title:'טל - פלטו של 6 שבועות', desc:'משקל יציב, ביצועים יציבים', suggestion:'החלף גירוי - שינוי ספליט/נפח' },
]
