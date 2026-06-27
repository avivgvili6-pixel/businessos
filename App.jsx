import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════
// PALETTE
// ═══════════════════════════════════════════════════
const C = {
  ink:"#0d0d14", paper:"#f7f4ee", gold:"#c8a84b",
  goldBg:"rgba(200,168,75,0.11)", goldBorder:"rgba(200,168,75,0.28)",
  accent:"#1a3a5c", accentBg:"rgba(26,58,92,0.09)",
  green:"#267a50", greenBg:"rgba(38,122,80,0.1)",
  red:"#b93535",   redBg:"rgba(185,53,53,0.1)",
  purple:"#6b4fa0",purpleBg:"rgba(107,79,160,0.1)",
  orange:"#c0622b",orangeBg:"rgba(192,98,43,0.1)",
  muted:"#8a8880", border:"rgba(13,13,20,0.1)",
  card:"rgba(255,255,255,0.92)", sidebar:"#0d0d14",
};

// ═══════════════════════════════════════════════════
// AUTH DATA — users per business
// ═══════════════════════════════════════════════════
const USERS = [
  { id:"owner",  name:"ישראל ישראלי", email:"israel@boss.com",   password:"1234", role:"owner",   avatar:"👑", title:"בעלים" },
  { id:"sarah",  name:"שרה לוי",       email:"sarah@co.com",      password:"1234", role:"vp_sales",avatar:"👩‍💼", title:"VP Sales" },
  { id:"danny",  name:"דני כהן",       email:"danny@co.com",      password:"1234", role:"cs_mgr",  avatar:"👨‍💻", title:"CS Manager" },
  { id:"mia",    name:"מיה רוזן",      email:"mia@co.com",        password:"1234", role:"sdr",     avatar:"👩‍🔬", title:"SDR" },
  { id:"yossi",  name:"יוסי אברהם",   email:"yossi@co.com",      password:"1234", role:"ae",      avatar:"👨‍💼", title:"Account Executive" },
];

// Role → which modules are visible
const ROLE_MODULES = {
  owner:    ["dashboard","businesses","strategy","planner","projects","meetings","sales","cs","finance","people","org","experts","guide"],
  vp_sales: ["dashboard","planner","projects","meetings","sales","people","experts","guide"],
  cs_mgr:   ["dashboard","planner","meetings","cs","people","experts","guide"],
  sdr:      ["dashboard","planner","meetings","sales","experts","guide"],
  ae:       ["dashboard","planner","meetings","sales","experts","guide"],
};

// ═══════════════════════════════════════════════════
// BUSINESSES
// ═══════════════════════════════════════════════════
const INITIAL_BUSINESSES = [
  {
    id:"biz1", name:"TechSell Ltd", industry:"SaaS / טכנולוגיה", stage:"חברה",
    founded:"2021", employees:24, mrr:385000, arr:4620000,
    logo:"💻", color:C.accent,
    description:"פלטפורמת מכירות B2B לשוק ה-Enterprise",
    goals:["הכפלת MRR עד Q4","בניית מחלקת CS","גיוס Series A"],
    status:"active",
  },
  {
    id:"biz2", name:"GreenGrow", industry:"אגריטק", stage:"עסק",
    founded:"2023", employees:6, mrr:42000, arr:504000,
    logo:"🌱", color:C.green,
    description:"פתרונות חקלאות חכמה לחקלאים בישראל",
    goals:["הגעה ל-50 לקוחות","שותפות עם משרד החקלאות"],
    status:"active",
  },
];

// ═══════════════════════════════════════════════════
// MODULES LIST
// ═══════════════════════════════════════════════════
const ALL_MODULES = [
  { id:"dashboard",   icon:"🏠", label:"Dashboard",        group:"כללי" },
  { id:"businesses",  icon:"🏢", label:"העסקים שלי",       group:"כללי" },
  { id:"strategy",    icon:"🧠", label:"אסטרטגיה",         group:"כללי" },
  { id:"planner",     icon:"📅", label:"לו״ז ומשימות",     group:"כללי" },
  { id:"projects",    icon:"📊", label:"פרויקטים ויעדים",  group:"כללי" },
  { id:"meetings",    icon:"🎙️", label:"פגישות",           group:"כללי" },
  { id:"sales",       icon:"💰", label:"מכירות",           group:"הכנסות" },
  { id:"cs",          icon:"❤️", label:"Customer Success", group:"הכנסות" },
  { id:"finance",     icon:"📈", label:"כספים & P&L",      group:"הכנסות" },
  { id:"people",      icon:"👥", label:"People OS",        group:"אנשים" },
  { id:"org",         icon:"🌳", label:"עץ ארגוני",        group:"אנשים" },
  { id:"experts",     icon:"🏛️", label:"מומחים AI",        group:"כלים" },
  { id:"guide",       icon:"📖", label:"מדריך השימוש",     group:"כלים" },
];

// ═══════════════════════════════════════════════════
// PER-BUSINESS DATA
// ═══════════════════════════════════════════════════
const BIZ_DATA = {
  biz1: {
    // ── KPIs ──
    kpis: { mrr:385000, arr:4620000, winRate:"31%", acv:"₪148K", nps:72, churn:"4.2%", csat:"4.6/5", ttv:"18 יום", upsell:"12%", clients:187, employees:24, openGoals:"12/18" },
    mrrTrend:"+34%", npsTraend:"+8", employeesTrend:"+3",
    // ── Strategy ──
    stratKpis:[{l:"ARR יעד",v:"₪8.4M",p:61},{l:"MRR נוכחי",v:"₪385K",p:55},{l:"CAC payback",v:"7 חודש",p:75},{l:"LTV:CAC",v:"4.2:1",p:84}],
    stratItems:[
      {phase:"Q3 2025",title:"הכפלת MRR",desc:"מ-₪385K ל-₪700K — הגדלת צוות, כניסה לשווקים חדשים",active:true},
      {phase:"Q4 2025",title:"מנוע CS",desc:"הפחתת Churn ל-2.5%, בניית CS אוטומציה",active:false},
      {phase:"Q1 2026",title:"Series A",desc:"גיוס ₪15M, הרחבה אירופה",active:false},
    ],
    stratAI:"הצמיחה בריאה אך מרוכזת ב-20% מהלקוחות. סיכון ריכוזיות — פזר ל-2 ורטיקלים. LTV:CAC 4.2 — ניתן לשפר ל-6+ עם onboarding משופר.",
    // ── Pipeline ──
    pipeline:[
      { stage:"Lead",     count:142, value:1420, color:C.muted   },
      { stage:"Discovery",count:68,  value:2040, color:C.accent  },
      { stage:"Demo",     count:31,  value:1550, color:C.purple  },
      { stage:"Proposal", count:18,  value:1620, color:C.gold    },
      { stage:"Closing",  count:7,   value:980,  color:C.green   },
    ],
    pipelineTotal:"₪7.6M", pipelineTrend:"+22%",
    salesAI:"Focus: 7 עסקאות ב-Closing — סשן סגירות קבוצתי. 12 לידים ב-Discovery ללא תגובה — follow-up. מיה: +30% LinkedIn outreach.",
    // ── CS ──
    csMetrics:[
      { label:"NPS",    val:"72",    trend:"+8",    up:true },
      { label:"Churn",  val:"4.2%",  trend:"-0.8%", up:true },
      { label:"CSAT",   val:"4.6/5", trend:"+0.3",  up:true },
      { label:"TTV",    val:"18 יום",trend:"-3 יום",up:true },
      { label:"Upsell", val:"12%",   trend:"+2%",   up:true },
      { label:"לקוחות",val:"187",   trend:"+14",   up:true },
    ],
    csClients:[
      { n:"TechCorp Ltd", h:85, arr:480, risk:false },
      { n:"StartupXYZ",   h:42, arr:120, risk:true  },
      { n:"MegaBank",     h:91, arr:920, risk:false  },
      { n:"RetailChain",  h:58, arr:240, risk:true   },
    ],
    csAI:"🔴 StartupXYZ — Health 42, לא נכנסו 18 יום. EBR דחוף.\n🟡 RetailChain — CSAT ירד. סגור בקשה פתוחה עד מחר.\n🟢 MegaBank — חידוש בעוד 60 יום. הגש הצעת Enterprise+.",
    // ── Finance ──
    finRows:[
      {l:"הכנסות",       v:385000, pos:true},
      {l:"עלות עובדים",  v:-91500, pos:false},
      {l:"תשתיות",       v:-12000, pos:false},
      {l:"שיווק",        v:-22000, pos:false},
      {l:"משרד",         v:-8000,  pos:false},
      {l:"רווח גולמי",   v:251500, pos:true, bold:true},
    ],
    finKpis:[
      {icon:"💰",label:"MRR",       value:"₪385K",sub:"↑ +34%",    color:C.gold},
      {icon:"📉",label:"הוצאות",    value:"₪133K",sub:"תקציב ✓",   color:C.green},
      {icon:"📈",label:"רווח גולמי",value:"₪252K",sub:"65.5% מרג׳",color:C.green},
      {icon:"🏦",label:"ARR Proj",  value:"₪4.6M",sub:"",           color:C.accent},
    ],
    finAI:"מרג׳ 65.5% — מעל ממוצע ענף. הזדמנות: חסכון ₪8K/חודש על כלים כפולים. הגדל תקציב שיווק ב-20% — תשואה ×3.2.",
    // ── Employees ──
    employees:[
      { id:1, name:"שרה לוי",    role:"VP Sales",         dept:"מכירות", avatar:"👩‍💼", level:"Senior",
        score:94, potential:"גבוה", mental:82, mentalLabel:"טוב",
        salary:22000, cost:31000, revenue:180000, saving:0, retention:0, profit:149000,
        bonus:8000, nextReview:"15 יול׳", vacation:{used:10,total:20}, sickDays:2, workDays:218,
        strengths:["סגירת עסקאות","ניהול לקוחות","משא ומתן","B2B"],
        growth:["אנליטיקה","ניהול זמן"], focus:["ARR +25%","בניית צוות","Enterprise"],
        training:["מכירות B2B מתקדמות","ניהול צוות","Salesforce"],
        aiInsight:"מועמדת מצוינת לקידום ל-CRO תוך 6 חודשים.",
        talks:[{date:"01/06",text:"דיון יעדי Q3"},{date:"01/05",text:"בקשה להגדלת צוות"}] },
      { id:2, name:"דני כהן",    role:"CS Manager",       dept:"CS",     avatar:"👨‍💻", level:"Mid",
        score:78, potential:"בינוני-גבוה", mental:55, mentalLabel:"בלחץ",
        salary:16000, cost:22000, revenue:0, saving:45000, retention:320000, profit:343000,
        bonus:3000, nextReview:"20 יול׳", vacation:{used:14,total:20}, sickDays:5, workDays:201,
        strengths:["שימור לקוחות","אמפתיה","פתרון בעיות"],
        growth:["ניהול זמן","upsell"], focus:["churn ל-3%","NPS +10","Upsell ×2"],
        training:["CS Strategy","Upsell","Emotional Intelligence"],
        aiInsight:"מצב מנטלי דורש תשומת לב. עומס גבוה — חלק תיק לקוחות.",
        talks:[{date:"03/06",text:"דיווח עומס 60 לקוחות"},{date:"01/05",text:"מתקשה עם upsell"}] },
      { id:3, name:"מיה רוזן",   role:"SDR",              dept:"מכירות", avatar:"👩‍🔬", level:"Junior",
        score:71, potential:"גבוה", mental:91, mentalLabel:"מצוין",
        salary:10000, cost:13500, revenue:65000, saving:0, retention:0, profit:51500,
        bonus:2500, nextReview:"01 אוג׳", vacation:{used:3,total:20}, sickDays:0, workDays:147,
        strengths:["ייזום שיחות","התמדה","למידה מהירה"],
        growth:["הבנת מוצר","סגירות","LinkedIn"], focus:["50 demos/חודש","30% conversion"],
        training:["Cold Calling","LinkedIn Sales Nav","סגירות"],
        aiInsight:"כוכבת עתידית — מוכנה לAE תוך 12 חודש.",
        talks:[{date:"05/06",text:"מבקשת מנטורינג"}] },
      { id:4, name:"יוסי אברהם", role:"Account Executive", dept:"מכירות", avatar:"👨‍💼", level:"Mid",
        score:85, potential:"גבוה", mental:76, mentalLabel:"טוב",
        salary:18000, cost:25000, revenue:140000, saving:0, retention:0, profit:115000,
        bonus:12000, nextReview:"10 יול׳", vacation:{used:8,total:20}, sickDays:1, workDays:211,
        strengths:["דמו מוצר","Enterprise","follow-up"],
        growth:["pipeline mgmt","negotiation"], focus:["4 enterprise/Q","ACV ₪200K+"],
        training:["Enterprise Sales","Contract Negotiation"],
        aiInsight:"עסקאות Enterprise מתעכבות בשלב חוזה.",
        talks:[{date:"02/06",text:"3 עסקאות בשלב סגירה"}] },
    ],
    // ── Org ──
    orgCEO:{ name:"ישראל ישראלי", title:"מנכ״ל & Founder" },
    orgDepts:[
      {icon:"👩‍💼",name:"שרה לוי",  role:"VP Sales",    color:C.green,  reports:["👨‍💼 יוסי AE","👩‍🔬 מיה SDR"]},
      {icon:"👨‍💻",name:"דני כהן",  role:"CS Manager",  color:C.accent, reports:["👩 CSM 1","👨 CSM 2"]},
      {icon:"👩‍🏫",name:"רחל לוי", role:"VP Marketing",color:C.purple, reports:["🎨 Designer","✍️ Content"]},
      {icon:"🔧",name:"תום",       role:"CTO",          color:C.orange, reports:["👩‍💻 Dev 1","👨‍💻 Dev 2"]},
    ],
    // ── Projects / Tasks ──
    projects:[
      { id:"p1", name:"כניסה לשוק Enterprise", owner:"שרה לוי",  color:C.accent,  pct:62, status:"On Track", due:"30/09", secret:false },
      { id:"p2", name:"בניית מחלקת CS",        owner:"דני כהן",  color:C.green,   pct:35, status:"At Risk",  due:"31/08", secret:false },
      { id:"p3", name:"Portal לקוחות",         owner:"מיה רוזן", color:C.purple,  pct:78, status:"On Track", due:"15/07", secret:false },
      { id:"p4", name:"Series A Deck",          owner:"ישראל",    color:C.gold,    pct:40, status:"Behind",   due:"01/08", secret:false },
    ],
    tasks:[
      { id:"t1",  pid:"p1", title:"מיפוי 20 לקוחות Enterprise",    owner:"שרה לוי",  assignee:"יוסי אברהם", status:"Done",        priority:"High",   due:"10/07", secret:false, notes:"הושלם" },
      { id:"t2",  pid:"p1", title:"בניית Deck מכירות Enterprise",  owner:"שרה לוי",  assignee:"שרה לוי",   status:"In Progress", priority:"High",   due:"20/07", secret:false, notes:"" },
      { id:"t3",  pid:"p1", title:"5 פגישות Discovery עם לקוחות", owner:"שרה לוי",  assignee:"יוסי אברהם", status:"In Progress", priority:"High",   due:"25/07", secret:false, notes:"3 קבועות" },
      { id:"t4",  pid:"p1", title:"הגדרת מחיר Enterprise",         owner:"ישראל",    assignee:"ישראל",     status:"Todo",        priority:"Medium", due:"01/08", secret:true,  notes:"רגיש" },
      { id:"t5",  pid:"p2", title:"גיוס CSM נוסף",                 owner:"דני כהן",  assignee:"דני כהן",   status:"In Progress", priority:"High",   due:"31/07", secret:false, notes:"3 קורות חיים" },
      { id:"t6",  pid:"p2", title:"בניית Playbook Onboarding",     owner:"דני כהן",  assignee:"דני כהן",   status:"Todo",        priority:"High",   due:"15/08", secret:false, notes:"" },
      { id:"t7",  pid:"p3", title:"עיצוב ממשק Portal",             owner:"מיה רוזן", assignee:"מיה רוזן",  status:"Done",        priority:"High",   due:"01/07", secret:false, notes:"אושר" },
      { id:"t8",  pid:"p3", title:"פיתוח מודול Ticketing",         owner:"מיה רוזן", assignee:"מיה רוזן",  status:"In Progress", priority:"High",   due:"10/07", secret:false, notes:"" },
      { id:"t9",  pid:"p4", title:"איסוף נתוני KPIs לדק",          owner:"ישראל",    assignee:"ישראל",     status:"Done",        priority:"High",   due:"05/07", secret:false, notes:"" },
      { id:"t10", pid:"p4", title:"הכנת Financial Model",           owner:"ישראל",    assignee:"ישראל",     status:"In Progress", priority:"High",   due:"15/07", secret:true,  notes:"חסוי" },
    ],
    // ── Dashboard AI insight ──
    dashAI:"ניתוח Q2: צמיחה +34% אך churn עלה ל-4.2%. המלצה: הוסף 2 נציגי CS לפני Q3. דני כהן בעומס. מיה מוכנה לקידום.",
  },

  biz2: {
    kpis:{ mrr:42000, arr:504000, winRate:"44%", acv:"₪18K", nps:61, churn:"6.1%", csat:"4.2/5", ttv:"12 יום", upsell:"5%", clients:38, employees:6, openGoals:"5/7" },
    mrrTrend:"+18%", npsTraend:"+3", employeesTrend:"+1",
    stratKpis:[{l:"ARR יעד",v:"₪1M",p:50},{l:"MRR נוכחי",v:"₪42K",p:42},{l:"לקוחות יעד",v:"50",p:76},{l:"Churn יעד",v:"<5%",p:60}],
    stratItems:[
      {phase:"Q3 2025",title:"הגעה ל-50 לקוחות",desc:"הרחבה לאזורים חדשים — הגליל והנגב",active:true},
      {phase:"Q4 2025",title:"שותפות ממשלתית",desc:"הסכם עם משרד החקלאות לסבסוד חקלאים",active:false},
      {phase:"Q1 2026",title:"מוצר דיגיטלי",desc:"אפליקציית IoT לניטור שדות בזמן אמת",active:false},
    ],
    stratAI:"Churn 6.1% — גבוה מדי לשלב זה. הסיבה: onboarding קצר מדי. הוסף 30 ימי ליווי לכל לקוח חדש. Win Rate 44% — מעולה, הגדל outreach.",
    pipeline:[
      { stage:"Lead",     count:28,  value:280,  color:C.muted  },
      { stage:"Discovery",count:14,  value:252,  color:C.green  },
      { stage:"Demo",     count:8,   value:144,  color:C.gold   },
      { stage:"Proposal", count:4,   value:72,   color:C.orange },
      { stage:"Closing",  count:2,   value:36,   color:C.green  },
    ],
    pipelineTotal:"₪784K", pipelineTrend:"+18%",
    salesAI:"Pipeline בריא ביחס לגודל. עדיפות: סגור 2 עסקאות Closing עד סוף החודש. הרחב outreach לקיבוצים ומושבים.",
    csMetrics:[
      { label:"NPS",    val:"61",    trend:"+3",    up:true  },
      { label:"Churn",  val:"6.1%",  trend:"+1.2%", up:false },
      { label:"CSAT",   val:"4.2/5", trend:"+0.1",  up:true  },
      { label:"TTV",    val:"12 יום",trend:"-2 יום",up:true  },
      { label:"Upsell", val:"5%",    trend:"0%",    up:false },
      { label:"לקוחות",val:"38",    trend:"+4",    up:true  },
    ],
    csClients:[
      { n:"קיבוץ מגל",    h:88, arr:48, risk:false },
      { n:"חווה בן-דוד",  h:45, arr:22, risk:true  },
      { n:"מושב שדה אילן",h:72, arr:36, risk:false },
      { n:"קיבוץ גן-שמואל",h:51,arr:18, risk:true  },
    ],
    csAI:"🔴 חווה בן-דוד — Health 45, לא השתמשו 12 יום. התקשר ישירות.\n🟡 קיבוץ גן-שמואל — חידוש בעוד 45 יום. שלח הצעה.\n🟢 קיבוץ מגל — לקוח VIP, בדוק upsell חיישנים.",
    finRows:[
      {l:"הכנסות",       v:42000,  pos:true},
      {l:"עלות עובדים",  v:-28000, pos:false},
      {l:"תשתיות",       v:-3000,  pos:false},
      {l:"שיווק",        v:-4000,  pos:false},
      {l:"משרד",         v:-1500,  pos:false},
      {l:"רווח גולמי",   v:5500,   pos:true, bold:true},
    ],
    finKpis:[
      {icon:"💰",label:"MRR",       value:"₪42K", sub:"↑ +18%",     color:C.gold},
      {icon:"📉",label:"הוצאות",    value:"₪36K", sub:"מעל תקציב",  color:C.red},
      {icon:"📈",label:"רווח גולמי",value:"₪5.5K",sub:"13% מרג׳",   color:C.orange},
      {icon:"🏦",label:"ARR Proj",  value:"₪504K",sub:"יעד ₪1M",    color:C.accent},
    ],
    finAI:"מרג׳ 13% — נמוך. הסיבה: עלות עובדים גבוהה ביחס להכנסות. לכל הכנסה של ₪1 — עלות ₪0.87. יש להגיע ל-₪80K MRR לפני גיוס נוסף.",
    employees:[
      { id:10, name:"אבי כהן",    role:"מנהל שטח",     dept:"מכירות", avatar:"👨‍🌾", level:"Senior",
        score:88, potential:"גבוה", mental:80, mentalLabel:"טוב",
        salary:14000, cost:18000, revenue:38000, saving:0, retention:0, profit:20000,
        bonus:3000, nextReview:"01 אוג׳", vacation:{used:6,total:20}, sickDays:1, workDays:130,
        strengths:["קשרים בשטח","הדגמות","אמינות"],
        growth:["CRM","דיגיטל"], focus:["50 לקוחות","שותפות ממשלתית"],
        training:["מכירות חקלאות","CRM בסיסי"],
        aiInsight:"אבי הוא הנכס המרכזי — שמור עליו. בונה קשרים אמיתיים בשטח.",
        talks:[{date:"02/06",text:"שמח מהצמיחה, מבקש רכב חברה"}] },
      { id:11, name:"טל מזרחי",   role:"CS & תמיכה",   dept:"CS",     avatar:"👩‍💻", level:"Junior",
        score:74, potential:"בינוני", mental:78, mentalLabel:"טוב",
        salary:9000, cost:11500, revenue:0, saving:12000, retention:85000, profit:85500,
        bonus:1000, nextReview:"15 אוג׳", vacation:{used:4,total:20}, sickDays:2, workDays:128,
        strengths:["סבלנות","הסברה טכנית"],
        growth:["אנגלית","upsell"], focus:["churn <5%","שביעות רצון 4.5+"],
        training:["Customer Success Basics","HubSpot"],
        aiInsight:"טל מתקשה עם לקוחות קשים — שקול הכשרה בניהול קונפליקטים.",
        talks:[{date:"28/05",text:"מרגישה מוצפת מלקוחות קשים"}] },
    ],
    orgCEO:{ name:"ישראל ישראלי", title:"מייסד & מנכ״ל" },
    orgDepts:[
      {icon:"👨‍🌾",name:"אבי כהן",  role:"מנהל שטח",  color:C.green,  reports:["👩 נציגה 1","👨 נציג 2"]},
      {icon:"👩‍💻",name:"טל מזרחי", role:"CS & תמיכה", color:C.accent, reports:["📞 Support"]},
    ],
    projects:[
      { id:"g1", name:"הגעה ל-50 לקוחות",     owner:"אבי כהן",  color:C.green,  pct:76, status:"On Track", due:"30/09", secret:false },
      { id:"g2", name:"שותפות משרד חקלאות",   owner:"ישראל",    color:C.gold,   pct:25, status:"At Risk",  due:"31/10", secret:true  },
      { id:"g3", name:"פיתוח אפליקציית IoT",  owner:"ישראל",    color:C.accent, pct:10, status:"Todo",     due:"01/01", secret:false },
    ],
    tasks:[
      { id:"g_t1", pid:"g1", title:"סבב הדגמות — 10 חוות חדשות", owner:"אבי כהן",  assignee:"אבי כהן",  status:"In Progress", priority:"High",   due:"20/07", secret:false, notes:"קבועות 7" },
      { id:"g_t2", pid:"g1", title:"חינוך שוק — סרטון YouTube",    owner:"ישראל",   assignee:"ישראל",    status:"Todo",        priority:"Medium", due:"01/08", secret:false, notes:"" },
      { id:"g_t3", pid:"g2", title:"פגישה עם משרד החקלאות",        owner:"ישראל",   assignee:"ישראל",    status:"Todo",        priority:"High",   due:"15/07", secret:true,  notes:"חסוי" },
      { id:"g_t4", pid:"g3", title:"בחירת ספק חיישנים",            owner:"ישראל",   assignee:"ישראל",    status:"Todo",        priority:"Medium", due:"01/09", secret:false, notes:"" },
    ],
    dashAI:"GreenGrow צומחת אך Churn 6.1% מדאיג. המלצה: הוסף 30 יום ליווי לכל לקוח חדש. Win Rate 44% — מצוין לשלב זה. עדיפות: הפחתת Churn לפני הגדלת MRR.",
  },
};

// Fallback for dynamically-added businesses
function getBizData(bizId) {
  return BIZ_DATA[bizId] || BIZ_DATA.biz1;
}

// ═══════════════════════════════════════════════════
// SMALL HELPERS
// ═══════════════════════════════════════════════════
const fmt = n => n>=1000?`₪${(n/1000).toFixed(0)}K`:`₪${n}`;

function MiniBar({val,max=100,color=C.gold,h=6}){
  return(
    <div style={{height:h,background:"#e8e3d8",borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(100,(val/max)*100)}%`,background:color,borderRadius:99,transition:"width .5s"}}/>
    </div>
  );
}
function Tag({children,type="n"}){
  const t={s:{bg:C.greenBg,c:C.green},g:{bg:C.goldBg,c:"#7a5e1a"},f:{bg:C.accentBg,c:C.accent},d:{bg:C.redBg,c:C.red},n:{bg:"rgba(0,0,0,.05)",c:"#555"}};
  const s=t[type]||t.n;
  return <span style={{background:s.bg,color:s.c,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-block",margin:2}}>{children}</span>;
}
function Card({children,style={}}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.1rem 1.25rem",...style}}>{children}</div>;
}
function StatCard({icon,label,value,sub,color=C.gold}){
  return(
    <Card>
      <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{icon&&<span style={{marginLeft:4}}>{icon}</span>}{label}</div>
      <div style={{fontSize:"1.45rem",fontWeight:900,color,letterSpacing:"-0.03em",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,marginTop:4,color:sub[0]==="+"||sub.includes("↑")?C.green:sub[0]==="-"?C.red:C.muted}}>{sub}</div>}
    </Card>
  );
}
function AIBox({title="◆ AI INSIGHT",children}){
  return(
    <div style={{background:`linear-gradient(135deg,${C.ink},#1c2e44)`,borderRadius:14,padding:"1.25rem",border:`1px solid ${C.goldBorder}`}}>
      <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:8,letterSpacing:"0.1em"}}>{title}</div>
      <div style={{color:"rgba(255,255,255,.78)",fontSize:13,lineHeight:1.8}}>{children}</div>
    </div>
  );
}
function SectionHead({tag,title}){
  return(
    <div style={{marginBottom:"1.5rem"}}>
      <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,letterSpacing:"0.14em",marginBottom:6}}>◆ {tag}</div>
      <h2 style={{fontSize:"1.5rem",fontWeight:900,letterSpacing:"-0.03em",margin:0}}>{title}</h2>
    </div>
  );
}
function G4({children}){return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"0.75rem",marginBottom:"1rem"}}>{children}</div>;}
function G2({children}){return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>{children}</div>;}

// ═══════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════
function LoginScreen({onLogin}){
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  function handleLogin(){
    setErr(""); setLoading(true);
    setTimeout(()=>{
      const user=USERS.find(u=>u.email===email.trim()&&u.password===pass);
      if(user){ onLogin(user); }
      else{ setErr("אימייל או סיסמה שגויים"); setLoading(false); }
    },600);
  }

  return(
    <div style={{minHeight:"100vh",background:C.ink,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:"'Heebo','Segoe UI',sans-serif",direction:"rtl"}}>
      {/* BG glow */}
      <div style={{position:"fixed",top:"-20%",right:"-10%",width:"50%",height:"50%",background:`radial-gradient(circle,rgba(200,168,75,0.08),transparent 70%)`,pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
          <div style={{width:56,height:56,background:C.gold,borderRadius:14,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",fontWeight:900,color:C.ink,marginBottom:"0.75rem"}}>B</div>
          <div style={{color:"#fff",fontSize:"1.5rem",fontWeight:900,letterSpacing:"-0.03em"}}>Business<span style={{color:C.gold}}>OS</span></div>
          <div style={{color:"rgba(255,255,255,.35)",fontSize:12,marginTop:4,fontFamily:"monospace",letterSpacing:"0.08em"}}>FULL SUITE v2.0</div>
        </div>

        {/* Form */}
        <div style={{background:"rgba(255,255,255,.04)",border:`1px solid rgba(255,255,255,.08)`,borderRadius:20,padding:"2rem"}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:"1.1rem",marginBottom:"1.5rem",textAlign:"center"}}>כניסה למערכת</div>

          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:6,fontFamily:"monospace",letterSpacing:"0.06em"}}>אימייל</label>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="your@email.com" type="email"
              style={{width:"100%",background:"rgba(255,255,255,.07)",border:`1px solid rgba(255,255,255,.12)`,borderRadius:10,padding:"0.75rem 1rem",color:"#fff",fontSize:14,fontFamily:"inherit",outline:"none",direction:"ltr"}}/>
          </div>

          <div style={{marginBottom:"1.5rem"}}>
            <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:6,fontFamily:"monospace",letterSpacing:"0.06em"}}>סיסמה</label>
            <input value={pass} onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="••••••••" type="password"
              style={{width:"100%",background:"rgba(255,255,255,.07)",border:`1px solid rgba(255,255,255,.12)`,borderRadius:10,padding:"0.75rem 1rem",color:"#fff",fontSize:14,fontFamily:"inherit",outline:"none"}}/>
          </div>

          {err&&<div style={{color:"#ff6b6b",fontSize:13,marginBottom:"1rem",textAlign:"center",background:"rgba(185,53,53,.12)",borderRadius:8,padding:"0.5rem"}}>{err}</div>}

          <button onClick={handleLogin} disabled={loading} style={{width:"100%",background:C.gold,color:C.ink,border:"none",borderRadius:10,padding:"0.85rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:loading?.7:1,transition:"all .2s"}}>
            {loading?"מתחבר...":"כניסה ←"}
          </button>

          {/* Quick login hints */}
          <div style={{marginTop:"1.5rem",padding:"0.75rem",background:"rgba(255,255,255,.03)",borderRadius:10}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:8,fontFamily:"monospace"}}>DEMO — לחץ לכניסה מהירה:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {USERS.map(u=>(
                <button key={u.id} onClick={()=>{setEmail(u.email);setPass(u.password);}}
                  style={{fontSize:11,padding:"4px 10px",borderRadius:20,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.55)",cursor:"pointer",fontFamily:"inherit"}}>
                  {u.avatar} {u.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// BUSINESSES VIEW (owner only)
// ═══════════════════════════════════════════════════
function BusinessesView({businesses,setBusinesses,activeBiz,setActiveBiz}){
  const [adding,setAdding]=useState(false);
  const [step,setStep]=useState(1);
  const [draft,setDraft]=useState({name:"",industry:"",stage:"עסק",description:"",goals:["","",""],logo:"🏢",color:C.accent});

  const STAGES=["עסק","חברה","ארגון"];
  const LOGOS=["💻","🌱","🏪","🏗️","🎓","🏥","🍕","📱","🚀","🎯"];
  const COLORS=[C.accent,C.green,C.purple,C.orange,C.gold,"#8b2252"];

  function saveBiz(){
    const nb={...draft,id:`biz${Date.now()}`,founded:new Date().getFullYear().toString(),employees:1,mrr:0,arr:0,status:"active"};
    setBusinesses(prev=>[...prev,nb]);
    setAdding(false);
    setStep(1);
    setDraft({name:"",industry:"",stage:"עסק",description:"",goals:["","",""],logo:"🏢",color:C.accent});
    setActiveBiz(nb.id);
  }

  if(adding){
    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.5rem"}}>
          <button onClick={()=>{setAdding(false);setStep(1);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>← ביטול</button>
          <div>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,letterSpacing:"0.12em"}}>◆ הוספת עסק חדש</div>
            <h2 style={{fontSize:"1.3rem",fontWeight:900,margin:0}}>שלב {step} מתוך 3</h2>
          </div>
        </div>

        {/* Step bar */}
        <div style={{display:"flex",gap:4,marginBottom:"1.5rem"}}>
          {[1,2,3].map(s=>(
            <div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?C.gold:"#e8e3d8",transition:"background .3s"}}/>
          ))}
        </div>

        {step===1&&(
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:"1.25rem"}}>📋 פרטי העסק</div>
            {[
              {l:"שם העסק",  k:"name",        ph:"TechSell Ltd"},
              {l:"תעשייה",   k:"industry",    ph:"SaaS / טכנולוגיה"},
              {l:"תיאור קצר",k:"description", ph:"מה העסק עושה?"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:"1rem"}}>
                <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:5}}>{f.l}</label>
                <input value={draft[f.k]} onChange={e=>setDraft(p=>({...p,[f.k]:e.target.value}))}
                  placeholder={f.ph}
                  style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"0.65rem 0.9rem",fontSize:13,fontFamily:"inherit",outline:"none",background:"#fafaf8"}}/>
              </div>
            ))}
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:5}}>שלב העסק</label>
              <div style={{display:"flex",gap:8}}>
                {STAGES.map(s=>(
                  <button key={s} onClick={()=>setDraft(p=>({...p,stage:s}))}
                    style={{flex:1,padding:"0.5rem",borderRadius:8,border:`1.5px solid ${draft.stage===s?C.gold:C.border}`,background:draft.stage===s?C.goldBg:"#fafaf8",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:draft.stage===s?700:400,color:draft.stage===s?"#7a5e1a":C.ink}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:C.ink,color:"#fff",border:"none",borderRadius:10,padding:"0.75rem",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>הבא ←</button>
          </Card>
        )}

        {step===2&&(
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:"1.25rem"}}>🎯 יעדים עיקריים</div>
            {[0,1,2].map(i=>(
              <div key={i} style={{marginBottom:"0.75rem"}}>
                <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:5}}>יעד {i+1}</label>
                <input value={draft.goals[i]} onChange={e=>setDraft(p=>{const g=[...p.goals];g[i]=e.target.value;return{...p,goals:g};})}
                  placeholder={["הגעה ל-₪1M ARR","בניית צוות של 10","גיוס השקעה"][i]}
                  style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:9,padding:"0.65rem 0.9rem",fontSize:13,fontFamily:"inherit",outline:"none",background:"#fafaf8"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:"1rem"}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:"0.7rem",border:`1px solid ${C.border}`,borderRadius:10,background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>← חזור</button>
              <button onClick={()=>setStep(3)} style={{flex:2,background:C.ink,color:"#fff",border:"none",borderRadius:10,padding:"0.7rem",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>הבא ←</button>
            </div>
          </Card>
        )}

        {step===3&&(
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:"1.25rem"}}>🎨 מראה ואייקון</div>
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:8}}>בחר אייקון</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {LOGOS.map(l=>(
                  <button key={l} onClick={()=>setDraft(p=>({...p,logo:l}))}
                    style={{width:44,height:44,borderRadius:10,border:`2px solid ${draft.logo===l?C.gold:C.border}`,background:draft.logo===l?C.goldBg:"#fafaf8",fontSize:"1.3rem",cursor:"pointer"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:"1.5rem"}}>
              <label style={{display:"block",fontSize:12,color:C.muted,marginBottom:8}}>צבע ייצוגי</label>
              <div style={{display:"flex",gap:8}}>
                {COLORS.map(col=>(
                  <button key={col} onClick={()=>setDraft(p=>({...p,color:col}))}
                    style={{width:36,height:36,borderRadius:"50%",background:col,border:`3px solid ${draft.color===col?"#fff":col}`,boxShadow:draft.color===col?`0 0 0 2px ${col}`:"none",cursor:"pointer"}}/>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{padding:"1rem",background:"#f8f5ee",borderRadius:12,marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:"0.75rem",border:`2px solid ${draft.color}`}}>
              <div style={{width:44,height:44,borderRadius:10,background:draft.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>{draft.logo}</div>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{draft.name||"שם העסק"}</div>
                <div style={{fontSize:12,color:C.muted}}>{draft.industry||"תעשייה"} · {draft.stage}</div>
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep(2)} style={{flex:1,padding:"0.7rem",border:`1px solid ${C.border}`,borderRadius:10,background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>← חזור</button>
              <button onClick={saveBiz} style={{flex:2,background:C.gold,color:C.ink,border:"none",borderRadius:10,padding:"0.7rem",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓ צור עסק</button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return(
    <div>
      <SectionHead tag="MY BUSINESSES" title="העסקים שלי"/>
      <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem"}}>
        {businesses.map(biz=>(
          <div key={biz.id} onClick={()=>setActiveBiz(biz.id)}
            style={{background:C.card,border:`2px solid ${activeBiz===biz.id?biz.color:C.border}`,borderRadius:14,padding:"1.1rem 1.25rem",cursor:"pointer",transition:"all .2s",
              boxShadow:activeBiz===biz.id?`0 4px 20px ${biz.color}22`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <div style={{width:48,height:48,borderRadius:12,background:biz.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>{biz.logo}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontWeight:700,fontSize:14}}>{biz.name}</div>
                  {activeBiz===biz.id&&<Tag type="s">פעיל</Tag>}
                </div>
                <div style={{fontSize:12,color:C.muted}}>{biz.industry} · {biz.stage} · {biz.employees} עובדים</div>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight:900,fontSize:"1.1rem",color:biz.color}}>{fmt(biz.mrr)}</div>
                <div style={{fontSize:10,color:C.muted}}>MRR</div>
              </div>
            </div>
            {biz.description&&<div style={{fontSize:12,color:C.muted,marginTop:8,lineHeight:1.5}}>{biz.description}</div>}
            <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>
              {biz.goals.filter(Boolean).slice(0,2).map(g=><Tag key={g} type="f">{g}</Tag>)}
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>setAdding(true)}
        style={{width:"100%",padding:"0.85rem",border:`2px dashed ${C.border}`,borderRadius:14,background:"none",cursor:"pointer",fontSize:14,color:C.muted,fontFamily:"inherit",transition:"all .2s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold;}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
        + הוסף עסק חדש
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// EMPLOYEE DETAIL
// ═══════════════════════════════════════════════════
function EmpDetail({emp,onBack}){
  const [tab,setTab]=useState("overview");
  const TABS=[{id:"overview",l:"סקירה"},{id:"fin",l:"כספים"},{id:"train",l:"הכשרה"},{id:"personal",l:"אישי"},{id:"talks",l:"שיחות"}];
  const mc=emp.mental>=75?C.green:emp.mental>=50?C.gold:C.red;

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem",flexWrap:"wrap"}}>
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"0.4rem 0.8rem",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>← חזור</button>
        <span style={{fontSize:"2rem"}}>{emp.avatar}</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:900,fontSize:"1.15rem"}}>{emp.name}</div>
          <div style={{fontSize:12,color:C.muted}}>{emp.role} · {emp.dept} · {emp.level}</div>
        </div>
        <Tag type={emp.mental>=75?"s":"d"}>{emp.mentalLabel}</Tag>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:"1.1rem",background:"#ece8df",borderRadius:10,padding:4,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"0.4rem 0.8rem",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",background:tab===t.id?"#fff":"transparent",color:tab===t.id?C.ink:C.muted,boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{t.l}</button>
        ))}
      </div>

      {tab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
              <div style={{fontWeight:700,fontSize:13}}>📊 ביצועים</div>
              <div style={{fontSize:"2rem",fontWeight:900,color:emp.score>=85?C.green:emp.score>=70?C.gold:C.red}}>{emp.score}<span style={{fontSize:12,color:C.muted}}>/100</span></div>
            </div>
            <MiniBar val={emp.score} color={emp.score>=85?C.green:emp.score>=70?C.gold:C.red} h={8}/>
            <div style={{fontSize:12,color:C.muted,marginTop:6}}>פוטנציאל: {emp.potential} · סקירה: {emp.nextReview}</div>
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>💪 חוזקות</div>
            <div>{emp.strengths.map(s=><Tag key={s} type="s">{s}</Tag>)}</div>
            <div style={{fontWeight:700,fontSize:13,margin:"0.75rem 0 6px"}}>📈 פיתוח</div>
            <div>{emp.growth.map(s=><Tag key={s} type="g">{s}</Tag>)}</div>
            <div style={{fontWeight:700,fontSize:13,margin:"0.75rem 0 6px"}}>🎯 פוקוסים</div>
            <div>{emp.focus.map(s=><Tag key={s} type="f">{s}</Tag>)}</div>
          </Card>
          <AIBox>{emp.aiInsight}</AIBox>
        </div>
      )}

      {tab==="fin"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <G4>
            <StatCard icon="💳" label="משכורת" value={fmt(emp.salary)} sub="לחודש" color={C.accent}/>
            <StatCard icon="📉" label="עלות מעסיק" value={fmt(emp.cost)} color={C.red}/>
            <StatCard icon="🎁" label="בונוס YTD" value={fmt(emp.bonus)} color={C.gold}/>
            <StatCard icon="📈" label="ריווחיות" value={fmt(emp.profit)} sub="נטו/חודש" color={C.green}/>
          </G4>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>💰 ערך לחברה</div>
            {[{l:"הכנסות ישירות",v:emp.revenue,pos:true},{l:"חסכון/ייעול",v:emp.saving,pos:true},{l:"שימור ARR",v:emp.retention,pos:true},{l:"עלות חודשית",v:-emp.cost,pos:false},{l:"ריווחיות נטו",v:emp.profit,pos:true,bold:true}].map(r=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:`1px solid ${C.border}`,fontSize:r.bold?14:13,fontWeight:r.bold?900:400}}>
                <span style={{color:r.bold?C.ink:C.muted}}>{r.l}</span>
                <span style={{color:r.pos?C.green:C.red,fontWeight:700}}>{r.pos&&r.v>0?"+":""}{fmt(Math.abs(r.v))}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>📅 נוכחות</div>
            {[["ימי עבודה",`${emp.workDays} יום`],["חופשה",`${emp.vacation.used}/${emp.vacation.total}`],["מחלה",`${emp.sickDays} יום`],["חופשה נותרת",`${emp.vacation.total-emp.vacation.used} יום`]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"0.45rem 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="train"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>🎓 הכשרות פעילות</div>
            {emp.training.map((t,i)=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.6rem 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.gold,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,fontSize:13}}>{t}</div>
                <MiniBar val={[65,30,80][i]||50} h={4}/>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>📋 הגדרת תפקיד</div>
            <div style={{fontSize:13,lineHeight:1.8,color:"#444"}}>
              <strong>תואר:</strong> {emp.role}<br/><br/>
              <strong>תחומי אחריות:</strong>
              <ul style={{paddingRight:"1.2rem",marginTop:4}}>{emp.focus.map(f=><li key={f} style={{marginBottom:3}}>{f}</li>)}</ul>
            </div>
          </Card>
          <AIBox title="◆ AI TRAINER — תרגול">
            מאמן AI לתרגול roleplay זמין: שיחות מכירה, התנגדויות, דמו מוצר.
            <br/><button style={{marginTop:"0.6rem",background:C.gold,color:C.ink,border:"none",borderRadius:8,padding:"0.5rem 1rem",fontSize:13,fontWeight:700,cursor:"pointer"}}>🎙️ פתח סשן אימון</button>
          </AIBox>
        </div>
      )}

      {tab==="personal"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>🧠 מצב מנטלי</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
              <span style={{color:C.muted}}>מצב</span><span style={{fontWeight:700,color:mc}}>{emp.mentalLabel} ({emp.mental}%)</span>
            </div>
            <MiniBar val={emp.mental} color={mc} h={8}/>
            <div style={{marginTop:"0.75rem",padding:"0.75rem",background:emp.mental>=75?C.greenBg:emp.mental>=50?C.goldBg:C.redBg,borderRadius:8,fontSize:12,lineHeight:1.7}}>
              {emp.mental>=75?"✅ מצב טוב. מעקב שגרתי.":emp.mental>=50?"⚠️ בלחץ — 1:1 השבוע, בדוק עומס.":"🔴 דורש התערבות מיידית — שוחח היום."}
            </div>
          </Card>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>💳 שכר ובונוסים</div>
            {[["משכורת",`${fmt(emp.salary)}/חודש`],["עלות שנתית",fmt(emp.cost*12)],["בונוס YTD",fmt(emp.bonus)],["סקירה הבאה",emp.nextReview]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <span style={{color:C.muted}}>{l}</span><span style={{fontWeight:700}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="talks"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>💬 שיחות אישיות</div>
            {emp.talks.map((t,i)=>(
              <div key={i} style={{background:"#f8f5ee",borderRadius:10,padding:"0.8rem",marginBottom:"0.6rem"}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:C.muted,marginBottom:3}}>{t.date}</div>
                <div style={{fontSize:13,lineHeight:1.6}}>{t.text}</div>
              </div>
            ))}
            <button style={{width:"100%",marginTop:4,padding:"0.55rem",border:`1px dashed ${C.border}`,borderRadius:10,background:"none",cursor:"pointer",fontSize:13,color:C.muted,fontFamily:"inherit"}}>+ תיעוד שיחה חדשה</button>
          </Card>
          <AIBox title="◆ AI — הכנה ל-1:1">
            1. מה הצלחת הגדולה שלך?<br/>2. מה המכשול הגדול עכשיו?<br/>3. מה אני יכול לעשות אחרת?<br/>4. איך מרגיש לך האיזון עבודה/חיים?
          </AIBox>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// CONTENT VIEWS
// ═══════════════════════════════════════════════════
function Dashboard({user, biz}){
  const d = getBizData(biz?.id);
  const k = d.kpis;
  return(
    <div>
      <SectionHead tag="LIVE DASHBOARD" title={`שלום ${user.name.split(" ")[0]} 👋`}/>
      {/* Business badge */}
      <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"1rem",padding:"0.6rem 0.9rem",background:C.card,border:`1px solid ${biz?.color||C.border}`,borderRadius:12,borderRight:`4px solid ${biz?.color||C.gold}`}}>
        <span style={{fontSize:"1.4rem"}}>{biz?.logo||"💼"}</span>
        <div>
          <div style={{fontWeight:700,fontSize:13}}>{biz?.name||"העסק שלי"}</div>
          <div style={{fontSize:11,color:C.muted}}>{biz?.industry} · {biz?.stage} · {biz?.employees} עובדים</div>
        </div>
        <div style={{marginRight:"auto",textAlign:"left"}}>
          <div style={{fontWeight:900,fontSize:"1.1rem",color:biz?.color||C.gold}}>{fmt(k.mrr)}</div>
          <div style={{fontSize:10,color:C.muted}}>MRR</div>
        </div>
      </div>
      <G4>
        <StatCard icon="💰" label="MRR"      value={fmt(k.mrr)}      sub={`↑ ${d.mrrTrend}`}/>
        <StatCard icon="⭐" label="NPS"      value={k.nps}           sub={`${d.npsTraend} מחודש שעבר`} color={C.green}/>
        <StatCard icon="👥" label="עובדים"   value={k.employees}     sub={`${d.employeesTrend} החודש`} color={C.accent}/>
        <StatCard icon="🎯" label="יעדים"    value={k.openGoals}     sub="בתהליך" color={C.purple}/>
      </G4>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>🔽 Sales Pipeline</div>
        {d.pipeline.map(s=>(
          <div key={s.stage} style={{marginBottom:"0.55rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{fontWeight:600}}>{s.stage}</span>
              <span style={{color:C.muted}}>{s.count} · ₪{s.value}K</span>
            </div>
            <MiniBar val={s.count} max={d.pipeline[0].count} color={s.color} h={7}/>
          </div>
        ))}
      </Card>
      <G2>
        <div style={{background:C.ink,borderRadius:14,padding:"1.1rem"}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:"0.75rem",letterSpacing:"0.1em"}}>CS METRICS</div>
          {d.csMetrics.slice(0,4).map(m=>(
            <div key={m.label} style={{display:"flex",justifyContent:"space-between",padding:"0.4rem 0",borderBottom:"1px solid rgba(255,255,255,.06)",fontSize:12}}>
              <span style={{color:"rgba(255,255,255,.5)"}}>{m.label}</span>
              <div><span style={{color:"#fff",fontWeight:700}}>{m.val}</span><span style={{color:m.up?C.green:C.red,marginRight:6,fontSize:11}}> {m.trend}</span></div>
            </div>
          ))}
        </div>
        <AIBox>{d.dashAI}</AIBox>
      </G2>
    </div>
  );
}

function Strategy({biz}){
  const d = getBizData(biz?.id);
  return(
    <div>
      <SectionHead tag="AI STRATEGIC ADVISOR" title="אסטרטגיית צמיחה"/>
      <G4>{d.stratKpis.map(k=>(
        <Card key={k.l}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{k.l}</div>
          <div style={{fontSize:"1.3rem",fontWeight:900,color:C.gold,marginBottom:6}}>{k.v}</div>
          <MiniBar val={k.p} color={C.green}/>
        </Card>
      ))}</G4>
      <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",marginBottom:"1rem"}}>
        {d.stratItems.map(i=>(
          <Card key={i.phase} style={{border:`1px solid ${i.active?C.gold:C.border}`}}>
            <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
              <div style={{minWidth:4,alignSelf:"stretch",background:i.active?C.gold:C.border,borderRadius:3}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:2}}>{i.phase}</div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{i.title}</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{i.desc}</div>
              </div>
              <Tag type={i.active?"s":"n"}>{i.active?"פעיל":"מתוכנן"}</Tag>
            </div>
          </Card>
        ))}
      </div>
      <AIBox title="◆ AI — ניתוח מצב">{d.stratAI}</AIBox>
    </div>
  );
}

function Planner(){
  const tasks=[
    {time:"09:00",title:"קפה + סקירת יומן",type:"personal",done:true},
    {time:"10:00",title:"פגישת הנהלה שבועית",type:"meeting",done:true},
    {time:"12:00",title:"1:1 עם שרה לוי",type:"meeting",done:false},
    {time:"14:00",title:"סקירת Pipeline",type:"sales",done:false},
    {time:"15:30",title:"הכנת deck Series A",type:"strategy",done:false},
    {time:"17:00",title:"סיכום יומי",type:"personal",done:false},
  ];
  const tc={meeting:C.accent,sales:C.green,strategy:C.gold,personal:C.muted};
  return(
    <div>
      <SectionHead tag="PERSONAL ASSISTANT" title="לו״ז ומשימות"/>
      <G4>
        <StatCard icon="📅" label="פגישות היום" value="4" sub="2 הושלמו" color={C.accent}/>
        <StatCard icon="✅" label="משימות" value="9" sub="3 דחופות" color={C.red}/>
        <StatCard icon="⏰" label="זמן פנוי" value="2.5h" color={C.green}/>
        <StatCard icon="🎯" label="יעד שבועי" value="73%" color={C.gold}/>
      </G4>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>📆 היום</div>
        {tasks.map(t=>(
          <div key={t.time} style={{display:"flex",gap:"0.65rem",alignItems:"center",padding:"0.55rem 0",borderBottom:`1px solid ${C.border}`,opacity:t.done?.55:1}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:C.muted,minWidth:40}}>{t.time}</div>
            <div style={{width:3,height:34,borderRadius:2,background:tc[t.type]||C.muted,flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,fontWeight:t.done?400:600,textDecoration:t.done?"line-through":"none",color:t.done?C.muted:C.ink}}>{t.title}</div>
            <div>{t.done?"✅":"○"}</div>
          </div>
        ))}
      </Card>
      <AIBox title="◆ AI — עצות ליום">2 slots פנויים מ-16:00 — מומלץ לסגור review עם יוסי על 3 עסקאות ה-closing.</AIBox>
    </div>
  );
}

// ─── TASKS DATA ────────────────────────────────────────────────────────────────
const INIT_PROJECTS = [
  { id:"p1", name:"כניסה לשוק Enterprise", owner:"שרה לוי",  color:C.accent,  pct:62, status:"On Track", due:"30/09", secret:false },
  { id:"p2", name:"בניית מחלקת CS",        owner:"דני כהן",  color:C.green,   pct:35, status:"At Risk",  due:"31/08", secret:false },
  { id:"p3", name:"Portal לקוחות",         owner:"מיה רוזן", color:C.purple,  pct:78, status:"On Track", due:"15/07", secret:false },
  { id:"p4", name:"Series A Deck",          owner:"ישראל",    color:C.gold,    pct:40, status:"Behind",   due:"01/08", secret:false },
];

const INIT_TASKS = [
  // p1
  { id:"t1",  pid:"p1", title:"מיפוי 20 לקוחות Enterprise פוטנציאליים", owner:"שרה לוי",  assignee:"יוסי אברהם", status:"Done",       priority:"High",   due:"10/07", secret:false, notes:"הושלם, יש רשימה מסודרת" },
  { id:"t2",  pid:"p1", title:"בניית Deck מכירות Enterprise",            owner:"שרה לוי",  assignee:"שרה לוי",   status:"In Progress",priority:"High",   due:"20/07", secret:false, notes:"" },
  { id:"t3",  pid:"p1", title:"5 פגישות Discovery עם לקוחות יעד",       owner:"שרה לוי",  assignee:"יוסי אברהם", status:"In Progress",priority:"High",   due:"25/07", secret:false, notes:"3 קבועות, 2 בתיאום" },
  { id:"t4",  pid:"p1", title:"הגדרת מחיר Enterprise",                  owner:"ישראל",    assignee:"ישראל",     status:"Todo",       priority:"Medium", due:"01/08", secret:true,  notes:"רגיש — לא לפרסם" },
  // p2
  { id:"t5",  pid:"p2", title:"גיוס CSM נוסף",                          owner:"דני כהן",  assignee:"דני כהן",   status:"In Progress",priority:"High",   due:"31/07", secret:false, notes:"3 קורות חיים בסינון" },
  { id:"t6",  pid:"p2", title:"בניית Playbook Onboarding",              owner:"דני כהן",  assignee:"דני כהן",   status:"Todo",       priority:"High",   due:"15/08", secret:false, notes:"" },
  { id:"t7",  pid:"p2", title:"הטמעת כלי Health Score",                 owner:"דני כהן",  assignee:"דני כהן",   status:"Todo",       priority:"Medium", due:"20/08", secret:false, notes:"" },
  // p3
  { id:"t8",  pid:"p3", title:"עיצוב ממשק Portal",                      owner:"מיה רוזן", assignee:"מיה רוזן",  status:"Done",       priority:"High",   due:"01/07", secret:false, notes:"אושר ע״י הנהלה" },
  { id:"t9",  pid:"p3", title:"פיתוח מודול Ticketing",                  owner:"מיה רוזן", assignee:"מיה רוזן",  status:"In Progress",priority:"High",   due:"10/07", secret:false, notes:"" },
  { id:"t10", pid:"p3", title:"בדיקות QA ו-UAT",                        owner:"מיה רוזן", assignee:"מיה רוזן",  status:"Todo",       priority:"Medium", due:"12/07", secret:false, notes:"" },
  // p4
  { id:"t11", pid:"p4", title:"איסוף נתוני KPIs לדק",                   owner:"ישראל",    assignee:"ישראל",     status:"Done",       priority:"High",   due:"05/07", secret:false, notes:"" },
  { id:"t12", pid:"p4", title:"הכנת Financial Model",                    owner:"ישראל",    assignee:"ישראל",     status:"In Progress",priority:"High",   due:"15/07", secret:true,  notes:"חסוי — רק בעלים" },
  { id:"t13", pid:"p4", title:"פגישות עם 3 VCs",                        owner:"ישראל",    assignee:"ישראל",     status:"Todo",       priority:"High",   due:"01/08", secret:true,  notes:"חסוי" },
];

const STATUS_COLS = ["Todo","In Progress","Done","Blocked"];
const PRIORITY_COLORS = { High:C.red, Medium:C.gold, Low:C.green };
const STATUS_COLORS   = { "Todo":C.muted, "In Progress":C.accent, "Done":C.green, "Blocked":C.red };

function Projects({ user, biz }){
  const d = getBizData(biz?.id);
  const bizId = biz?.id || "biz1";
  const [overrides, setOverrides] = useState({}); // {bizId: {projects, tasks}}

  // Per-biz state
  const bizState = overrides[bizId] || {};
  const projects = bizState.projects || d.projects;
  const tasks    = bizState.tasks    || d.tasks;

  function setProjects(fn){ setOverrides(prev=>{ const cur=prev[bizId]||{}; return {...prev,[bizId]:{...cur,projects:typeof fn==="function"?fn(cur.projects||d.projects):fn}}; }); }
  function setTasks(fn){    setOverrides(prev=>{ const cur=prev[bizId]||{}; return {...prev,[bizId]:{...cur,tasks:typeof fn==="function"?fn(cur.tasks||d.tasks):fn}}; }); }

  const [tab, setTab]             = useState("board");
  const [selProj, setSelProj]     = useState("all");
  const [showForm, setShowForm]   = useState(false);
  const [expandTask, setExpandTask] = useState(null);
  const firstPid = (d.projects[0]?.id) || "p1";
  const firstEmp = (d.employees[0]?.name) || "ישראל";
  const [newTask, setNewTask]     = useState({ title:"", assignee:firstEmp, pid:firstPid, priority:"Medium", due:"", secret:false, notes:"" });

  const isOwner = user?.role === "owner";

  function visible(t){
    if(t.secret && !isOwner) return false;
    if(selProj !== "all" && t.pid !== selProj) return false;
    return true;
  }

  const shownTasks = tasks.filter(visible);

  function updateTaskStatus(id, status){
    setTasks(prev => prev.map(t => t.id===id ? {...t, status} : t));
  }

  function addTask(){
    if(!newTask.title.trim()) return;
    const t = { ...newTask, id:`t${Date.now()}`, owner: user?.name || "ישראל" };
    setTasks(prev => [...prev, t]);
    setNewTask({ title:"", assignee:"שרה לוי", pid:"p1", priority:"Medium", due:"", secret:false, notes:"" });
    setShowForm(false);
  }

  // ── BOARD VIEW ──────────────────────────────────
  function BoardView(){
    return(
      <div style={{ display:"flex", gap:"0.65rem", overflowX:"auto", paddingBottom:8 }}>
        {STATUS_COLS.map(col => (
          <div key={col} style={{ minWidth:220, flex:1 }}>
            {/* Column header */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:"0.6rem", padding:"0.4rem 0.6rem", background:"#ece8df", borderRadius:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLORS[col] }}/>
              <span style={{ fontSize:12, fontWeight:700 }}>{col}</span>
              <span style={{ fontSize:11, color:C.muted, marginRight:"auto" }}>{shownTasks.filter(t=>t.status===col).length}</span>
            </div>
            {/* Cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {shownTasks.filter(t=>t.status===col).map(t=>(
                <div key={t.id}
                  onClick={()=>setExpandTask(expandTask===t.id ? null : t.id)}
                  style={{ background:"#fff", border:`1px solid ${t.secret?"rgba(185,53,53,.3)":C.border}`, borderRadius:10, padding:"0.7rem", cursor:"pointer", transition:"all .15s",
                    boxShadow: expandTask===t.id ? "0 4px 16px rgba(0,0,0,.1)" : "none" }}>
                  {/* Secret badge */}
                  {t.secret && <div style={{ fontSize:10, color:C.red, marginBottom:4, display:"flex", alignItems:"center", gap:3 }}><span>🔒</span><span>חסוי</span></div>}
                  <div style={{ fontSize:12, fontWeight:600, lineHeight:1.4, marginBottom:6 }}>{t.title}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:C.goldBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>
                        {d.employees.find(e=>e.name===t.assignee)?.avatar||"👤"}
                      </div>
                      <span style={{ fontSize:10, color:C.muted }}>{t.assignee.split(" ")[0]}</span>
                    </div>
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:20, background:`${PRIORITY_COLORS[t.priority]}18`, color:PRIORITY_COLORS[t.priority], fontWeight:700 }}>{t.priority}</span>
                      {t.due && <span style={{ fontSize:10, color:C.muted }}>📅{t.due}</span>}
                    </div>
                  </div>
                  {/* Expanded */}
                  {expandTask===t.id && (
                    <div style={{ marginTop:"0.6rem", paddingTop:"0.6rem", borderTop:`1px solid ${C.border}` }}>
                      {t.notes && <div style={{ fontSize:11, color:"#555", marginBottom:8, lineHeight:1.5 }}>{t.notes}</div>}
                      <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>פרויקט: {projects.find(p=>p.id===t.pid)?.name}</div>
                      {/* Status changer */}
                      <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                        {STATUS_COLS.map(s=>(
                          <button key={s} onClick={e=>{e.stopPropagation();updateTaskStatus(t.id,s);}}
                            style={{ fontSize:10, padding:"2px 7px", borderRadius:20, border:`1px solid ${s===t.status?STATUS_COLORS[s]:C.border}`,
                              background:s===t.status?`${STATUS_COLORS[s]}18`:"#f8f5ee", cursor:"pointer", fontFamily:"inherit",
                              color:s===t.status?STATUS_COLORS[s]:C.muted, fontWeight:s===t.status?700:400 }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────
  function ListView(){
    return(
      <div>
        {/* Header row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 70px 70px", gap:"0.5rem", padding:"0.4rem 0.75rem", fontSize:10, color:C.muted, fontFamily:"monospace", letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`, marginBottom:4 }}>
          <span>משימה</span><span>אחראי</span><span>סטטוס</span><span>עדיפות</span><span>יעד</span>
        </div>
        {shownTasks.map(t=>(
          <div key={t.id}
            onClick={()=>setExpandTask(expandTask===t.id?null:t.id)}
            style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 70px 70px", gap:"0.5rem", padding:"0.55rem 0.75rem",
              borderBottom:`1px solid ${C.border}`, cursor:"pointer", background:expandTask===t.id?"#f8f5ee":"transparent",
              borderRight:t.secret?`3px solid ${C.red}`:"3px solid transparent", transition:"background .15s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {t.secret && <span style={{ fontSize:11 }}>🔒</span>}
              <span style={{ fontSize:13, fontWeight:expandTask===t.id?700:400 }}>{t.title}</span>
            </div>
            <span style={{ fontSize:11, color:C.muted }}>{t.assignee.split(" ")[0]}</span>
            <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:`${STATUS_COLORS[t.status]}15`, color:STATUS_COLORS[t.status], fontWeight:700, textAlign:"center", alignSelf:"center" }}>{t.status}</span>
            <span style={{ fontSize:10, color:PRIORITY_COLORS[t.priority], fontWeight:700, alignSelf:"center" }}>{t.priority}</span>
            <span style={{ fontSize:11, color:C.muted, alignSelf:"center" }}>{t.due}</span>
          </div>
        ))}
        {expandTask && (()=>{
          const t = tasks.find(x=>x.id===expandTask);
          if(!t) return null;
          return(
            <div style={{ background:"#f8f5ee", borderRadius:10, padding:"0.75rem 1rem", margin:"0.5rem 0", border:`1px solid ${C.border}` }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>{t.title}</div>
              {t.notes && <div style={{ fontSize:12, color:"#555", marginBottom:8 }}>{t.notes}</div>}
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {STATUS_COLS.map(s=>(
                  <button key={s} onClick={()=>updateTaskStatus(t.id,s)}
                    style={{ fontSize:11, padding:"3px 9px", borderRadius:20, border:`1px solid ${s===t.status?STATUS_COLORS[s]:C.border}`,
                      background:s===t.status?`${STATUS_COLORS[s]}18`:"#fff", cursor:"pointer", fontFamily:"inherit",
                      color:s===t.status?STATUS_COLORS[s]:C.muted, fontWeight:s===t.status?700:400 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── PROJECTS VIEW ──────────────────────────────
  function ProjectsView(){
    const sc={"On Track":C.green,"At Risk":C.orange,"Behind":C.red};
    const st={"On Track":"s","At Risk":"g","Behind":"d"};
    return(
      <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
        {projects.map(p=>{
          const ptasks = tasks.filter(t=>t.pid===p.id && (isOwner||!t.secret));
          const done   = ptasks.filter(t=>t.status==="Done").length;
          return(
            <Card key={p.id} style={{cursor:"pointer",borderRight:`3px solid ${p.color}`}}
              onClick={()=>{setSelProj(p.id);setTab("board");}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
                <Tag type={st[p.status]}>{p.status}</Tag>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:8}}>
                <span>👤 {p.owner}</span>
                <span>📅 {p.due}</span>
                <span>✅ {done}/{ptasks.length} משימות</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                <div style={{flex:1}}><MiniBar val={p.pct} color={sc[p.status]} h={6}/></div>
                <span style={{fontFamily:"monospace",fontSize:11,minWidth:28}}>{p.pct}%</span>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // ── CONTROL (owner only) ────────────────────────
  function ControlView(){
    const members = [...new Set([...d.employees.map(e=>e.name),"ישראל ישראלי"])];
    return(
      <div>
        <G4>
          <StatCard icon="📋" label="סה״כ משימות" value={tasks.length} color={C.accent}/>
          <StatCard icon="⏳" label="In Progress"  value={tasks.filter(t=>t.status==="In Progress").length} color={C.gold}/>
          <StatCard icon="🔒" label="חסויות"       value={tasks.filter(t=>t.secret).length} color={C.red}/>
          <StatCard icon="⚠️" label="Blocked"       value={tasks.filter(t=>t.status==="Blocked").length} color={C.orange}/>
        </G4>
        {/* Per person */}
        <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",marginBottom:"1rem"}}>
          {members.map(m=>{
            const mt = tasks.filter(t=>t.assignee===m);
            const done = mt.filter(t=>t.status==="Done").length;
            const inprog = mt.filter(t=>t.status==="In Progress").length;
            const late = mt.filter(t=>t.status!=="Done" && t.due && t.due < "15/07").length;
            const emp = d.employees.find(e=>e.name===m);
            return(
              <Card key={m}>
                <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.6rem"}}>
                  <span style={{fontSize:"1.3rem"}}>{emp?.avatar||"👤"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{m}</div>
                    <div style={{fontSize:11,color:C.muted}}>{emp?.role||"בעלים"}</div>
                  </div>
                  {late>0 && <Tag type="d">⚠ {late} מאחר{late>1?"ות":""}</Tag>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem",marginBottom:"0.6rem"}}>
                  {[{l:"סה״כ",v:mt.length,c:C.accent},{l:"בביצוע",v:inprog,c:C.gold},{l:"הושלמו",v:done,c:C.green}].map(s=>(
                    <div key={s.l} style={{textAlign:"center",background:"#f8f5ee",borderRadius:8,padding:"0.35rem"}}>
                      <div style={{fontWeight:700,fontSize:14,color:s.c}}>{s.v}</div>
                      <div style={{fontSize:10,color:C.muted}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {mt.length>0 && <MiniBar val={done} max={mt.length} color={C.green} h={5}/>}
              </Card>
            );
          })}
        </div>
        <AIBox title="◆ AI — בקרת מנהל">
          דני כהן עם 0 משימות מושלמות מתוך 3 — פגישה 1:1 דחופה. שרה עם עומס גבוה — 3 משימות High priority במקביל. מיה מתקדמת מצוין — 1 מתוך 3 הושלמה בזמן.
        </AIBox>
      </div>
    );
  }

  // ── MAIN RENDER ────────────────────────────────
  const tabDef = [
    { id:"projects", label:"📁 פרויקטים" },
    { id:"board",    label:"🟦 Board" },
    { id:"list",     label:"📋 רשימה" },
    ...(isOwner ? [{ id:"control", label:"👁️ בקרה" }] : []),
  ];

  return(
    <div>
      <SectionHead tag="PROJECTS & TASKS" title="פרויקטים ומשימות"/>

      {/* Stats */}
      <G4>
        <StatCard icon="🚀" label="פרויקטים פעילים" value={projects.length} color={C.accent}/>
        <StatCard icon="✅" label="משימות פתוחות"   value={tasks.filter(t=>t.status!=="Done"&&(isOwner||!t.secret)).length} color={C.gold}/>
        <StatCard icon="🏁" label="הושלמו"           value={tasks.filter(t=>t.status==="Done").length} color={C.green}/>
        {isOwner && <StatCard icon="🔒" label="חסויות" value={tasks.filter(t=>t.secret).length} color={C.red}/>}
      </G4>

      {/* Tab bar */}
      <div style={{display:"flex",gap:4,marginBottom:"1rem",background:"#ece8df",borderRadius:10,padding:4}}>
        {tabDef.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"0.45rem 0.4rem",borderRadius:7,border:"none",cursor:"pointer",
            fontSize:12,fontWeight:tab===t.id?700:400,fontFamily:"inherit",
            background:tab===t.id?"#fff":"transparent",
            color:tab===t.id?C.ink:C.muted,
            boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Project filter (board + list) */}
      {(tab==="board"||tab==="list") && (
        <div style={{display:"flex",gap:4,marginBottom:"0.75rem",overflowX:"auto",paddingBottom:2}}>
          <button onClick={()=>setSelProj("all")} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${selProj==="all"?C.gold:C.border}`,background:selProj==="all"?C.goldBg:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:selProj==="all"?"#7a5e1a":C.muted,fontWeight:selProj==="all"?700:400,whiteSpace:"nowrap"}}>כל הפרויקטים</button>
          {projects.map(p=>(
            <button key={p.id} onClick={()=>setSelProj(p.id)} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${selProj===p.id?p.color:C.border}`,background:selProj===p.id?`${p.color}15`:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",color:selProj===p.id?p.color:C.muted,fontWeight:selProj===p.id?700:400,whiteSpace:"nowrap"}}>{p.name.split(" ").slice(0,2).join(" ")}</button>
          ))}
        </div>
      )}

      {/* Views */}
      {tab==="projects" && <ProjectsView/>}
      {tab==="board"    && <BoardView/>}
      {tab==="list"     && <ListView/>}
      {tab==="control"  && isOwner && <ControlView/>}

      {/* Add task button */}
      {(tab==="board"||tab==="list") && (
        <div style={{marginTop:"0.75rem"}}>
          {!showForm ? (
            <button onClick={()=>setShowForm(true)} style={{width:"100%",padding:"0.65rem",border:`2px dashed ${C.border}`,borderRadius:12,background:"none",cursor:"pointer",fontSize:13,color:C.muted,fontFamily:"inherit",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.color=C.gold;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              + הוסף משימה חדשה
            </button>
          ) : (
            <Card style={{border:`1px solid ${C.gold}`}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem",color:C.gold}}>+ משימה חדשה</div>
              <input value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="שם המשימה..." style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"0.55rem 0.75rem",fontSize:13,fontFamily:"inherit",outline:"none",marginBottom:"0.5rem",background:"#fafaf8"}}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"0.5rem"}}>
                <select value={newTask.pid} onChange={e=>setNewTask(p=>({...p,pid:e.target.value}))} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"0.5rem",fontSize:12,fontFamily:"inherit",background:"#fafaf8"}}>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name.slice(0,20)}</option>)}
                </select>
                <select value={newTask.assignee} onChange={e=>setNewTask(p=>({...p,assignee:e.target.value}))} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"0.5rem",fontSize:12,fontFamily:"inherit",background:"#fafaf8"}}>
                  {["שרה לוי","דני כהן","מיה רוזן","יוסי אברהם","ישראל ישראלי"].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"0.5rem",fontSize:12,fontFamily:"inherit",background:"#fafaf8"}}>
                  {["High","Medium","Low"].map(v=><option key={v} value={v}>{v}</option>)}
                </select>
                <input type="text" value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))} placeholder="יעד: 31/07" style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"0.5rem",fontSize:12,fontFamily:"inherit",background:"#fafaf8"}}/>
              </div>
              <input value={newTask.notes} onChange={e=>setNewTask(p=>({...p,notes:e.target.value}))} placeholder="הערות (אופציונלי)" style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"0.5rem 0.75rem",fontSize:12,fontFamily:"inherit",outline:"none",marginBottom:"0.6rem",background:"#fafaf8"}}/>
              {isOwner && (
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.6rem",padding:"0.4rem 0.75rem",background:newTask.secret?C.redBg:"#f8f5ee",borderRadius:8,cursor:"pointer"}} onClick={()=>setNewTask(p=>({...p,secret:!p.secret}))}>
                  <span style={{fontSize:"1rem"}}>{newTask.secret?"🔒":"🔓"}</span>
                  <span style={{fontSize:12,color:newTask.secret?C.red:C.muted,fontWeight:newTask.secret?700:400}}>{newTask.secret?"חסוי — רק אני רואה":"ציבורי לצוות"}</span>
                </div>
              )}
              <div style={{display:"flex",gap:"0.5rem"}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"0.55rem",border:`1px solid ${C.border}`,borderRadius:8,background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:C.muted}}>ביטול</button>
                <button onClick={addTask} style={{flex:2,padding:"0.55rem",border:"none",borderRadius:8,background:C.ink,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,color:C.gold}}>+ הוסף משימה</button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Meetings(){
  const meets=[
    {t:"הנהלה שבועית",d:"08 יון",s:"הוחלט על עיכוב גיוס עד Q4. שרה תגדיל צוות ב-2.",actions:["שרה: גיוס 2 AEs תוך 3 שבועות","דני: דוח churn עד יום ד'"]},
    {t:"1:1 מנכ״ל — שרה",d:"05 יון",s:"שרה מרגישה עצורה בחוסר תמיכה טכנית.",actions:["לרכוש Salesforce Enterprise","להוסיף RevOps חלקי"]},
  ];
  return(
    <div>
      <SectionHead tag="MEETING INTELLIGENCE" title="פגישות וסיכומים"/>
      <G4>
        <StatCard icon="🎙️" label="פגישות השבוע" value="7" sub="3 סוכמו" color={C.accent}/>
        <StatCard icon="✅" label="Action Items" value="14" sub="6 הושלמו" color={C.green}/>
        <StatCard icon="📝" label="ממתינים" value="2" color={C.red}/>
        <StatCard icon="⏱️" label="זמן חסוך" value="4h" color={C.gold}/>
      </G4>
      {meets.map(m=>(
        <Card key={m.t} style={{marginBottom:"0.75rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13}}>{m.t}</div>
            <span style={{fontFamily:"monospace",fontSize:11,color:C.muted}}>{m.d}</span>
          </div>
          <div style={{fontSize:12,color:"#444",lineHeight:1.7,marginBottom:"0.65rem",background:"#f8f5ee",borderRadius:8,padding:"0.55rem 0.75rem"}}>{m.s}</div>
          <div style={{fontWeight:700,fontSize:11,marginBottom:4}}>⚡ Action Items:</div>
          {m.actions.map(a=><div key={a} style={{fontSize:12,color:C.muted,display:"flex",gap:5,marginBottom:3}}><span style={{color:C.gold}}>→</span>{a}</div>)}
        </Card>
      ))}
      <div style={{background:"#f0ece3",border:`2px dashed ${C.border}`,borderRadius:14,padding:"1.25rem",textAlign:"center"}}>
        <div style={{fontSize:"1.3rem",marginBottom:4}}>🎙️</div>
        <div style={{fontWeight:700,marginBottom:3}}>הקלט פגישה חדשה</div>
        <div style={{fontSize:12,color:C.muted}}>AI יתמלל, יסכם ויחלץ action items</div>
      </div>
    </div>
  );
}

function Sales({userRole, biz}){
  const d=getBizData(biz?.id); const k=d.kpis;
  return(
    <div>
      <SectionHead tag="SALES & REVENUE" title="עולם המכירות"/>
      <G4>
        <StatCard icon="📊" label="Pipeline"  value={d.pipelineTotal} sub={`↑ ${d.pipelineTrend}`}/>
        <StatCard icon="💰" label="MRR"       value={fmt(k.mrr)}     sub="יעד ✓" color={C.green}/>
        <StatCard icon="🏆" label="Win Rate"  value={k.winRate}      color={C.accent}/>
        <StatCard icon="📈" label="ACV"       value={k.acv}          color={C.purple}/>
      </G4>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>🔽 Funnel מכירות</div>
        {d.pipeline.map((s,i)=>(
          <div key={s.stage} style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.55rem"}}>
            <div style={{width:72,fontSize:12,fontWeight:600,textAlign:"right"}}>{s.stage}</div>
            <div style={{flex:1,height:24,background:"#f0ece3",borderRadius:6,overflow:"hidden",position:"relative"}}>
              <div style={{position:"absolute",inset:0,width:`${100-i*18}%`,background:s.color,borderRadius:6,display:"flex",alignItems:"center",paddingRight:8}}>
                <span style={{color:"#fff",fontSize:11,fontWeight:700}}>{s.count}</span>
              </div>
            </div>
            <div style={{width:50,fontSize:11,color:C.muted,textAlign:"left"}}>₪{s.value}K</div>
          </div>
        ))}
      </Card>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>👥 ביצועי נציגים</div>
        {d.employees.filter(e=>e.dept==="מכירות").map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.55rem 0",borderBottom:`1px solid ${C.border}`}}>
            <span style={{fontSize:"1.2rem"}}>{e.avatar}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{e.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.role}</div>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,color:C.green,fontSize:13}}>₪{(e.revenue/1000).toFixed(0)}K</div>
              <div style={{fontSize:10,color:C.muted}}>חודשי</div>
            </div>
            <div style={{width:32,height:32,borderRadius:"50%",background:e.score>=85?C.greenBg:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:e.score>=85?C.green:"#7a5e1a"}}>{e.score}</div>
          </div>
        ))}
      </Card>
      <AIBox title="◆ AI SALES COACH">{d.salesAI}</AIBox>
    </div>
  );
}

function CustomerSuccess({biz}){
  const d=getBizData(biz?.id);
  return(
    <div>
      <SectionHead tag="CUSTOMER SUCCESS" title="שימור וצמיחת לקוחות"/>
      <G4>{d.csMetrics.map(m=><StatCard key={m.label} label={m.label} value={m.val} sub={m.trend} color={m.up?C.green:C.red}/>)}</G4>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>❤️ Health Score לקוחות</div>
        {d.csClients.map(cl=>(
          <div key={cl.n} style={{marginBottom:"0.7rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <div style={{fontWeight:600}}>{cl.n} {cl.risk&&<Tag type="d">⚠ churn</Tag>}</div>
              <span style={{color:C.muted}}>₪{cl.arr}K ARR</span>
            </div>
            <MiniBar val={cl.h} color={cl.h>=75?C.green:cl.h>=50?C.gold:C.red} h={7}/>
          </div>
        ))}
      </Card>
      <AIBox title="◆ CS PLAYBOOK">{d.csAI}</AIBox>
    </div>
  );
}

// ─── PROFITABILITY CALCULATOR DATA PER BIZ ────────────────────────────────
const CALC_DEFAULTS = {
  biz1: {
    months: [
      { label:"מאי",
        revenue:211635, mktBudget:45493, mktAgent:13756,
        managers:31271, office:52389, sellBase:19576, sellComm:13177 },
      { label:"יוני (חלקי)",
        revenue:128355, mktBudget:50000, mktAgent:8278,
        managers:14370, office:26194, sellBase:9788,  sellComm:6588  },
    ],
    funnel:{ cpl:280, conv:22, deal:18000 },
  },
  biz2: {
    months: [
      { label:"מאי",
        revenue:42000, mktBudget:8000, mktAgent:3000,
        managers:6000, office:4500, sellBase:4000, sellComm:2000 },
      { label:"יוני (חלקי)",
        revenue:24000, mktBudget:5000, mktAgent:1800,
        managers:3500, office:2500, sellBase:2000, sellComm:1000 },
    ],
    funnel:{ cpl:180, conv:18, deal:8000 },
  },
};
function getCalcData(bizId){ return CALC_DEFAULTS[bizId] || CALC_DEFAULTS.biz1; }

function calcTotals(m){
  const expenses = m.mktBudget+m.mktAgent+m.managers+m.office+m.sellBase+m.sellComm;
  const profit   = m.revenue - expenses;
  const roas     = m.mktBudget>0 ? (m.revenue/m.mktBudget) : 0;
  const margin   = m.revenue>0   ? (profit/m.revenue*100)   : 0;
  return { expenses, profit, roas, margin };
}

function ProfitabilityCalculator({ bizId }){
  const defaults = getCalcData(bizId);

  // state per biz — reset when bizId changes
  const [months,  setMonths]  = useState(()=>defaults.months.map(m=>({...m})));
  const [funnel,  setFunnel]  = useState(()=>({...defaults.funnel}));
  const [tab,     setTab]     = useState("actuals"); // actuals | forecast | scenario
  const [selMonth,setSelMonth]= useState(0);
  const [targetROAS,setTargetROAS]=useState(3);
  const [scenEdit, setScenEdit]= useState(null); // null = show actuals, else edited copy

  // Reset when biz changes
  const prevBiz = useState(bizId);
  useEffect(()=>{
    const d = getCalcData(bizId);
    setMonths(d.months.map(m=>({...m})));
    setFunnel({...d.funnel});
    setScenEdit(null);
    setSelMonth(0);
  },[bizId]);

  const TABS=[{id:"actuals",l:"📊 אקטואלס"},{id:"forecast",l:"📈 תחזית ROAS"},{id:"scenario",l:"🔬 תרחיש"}];

  // ── helpers ──
  const fmtN  = n => n>=1000?`₪${(n/1000).toFixed(1)}K`:`₪${n.toFixed(0)}`;
  const pct   = n => `${n.toFixed(1)}%`;
  const COLOR_ROWS = [
    {key:"mktBudget", label:"תקציב שיווק",        color:"#1a3a5c"},
    {key:"mktAgent",  label:"משווק (יחסי)",        color:"#6b4fa0"},
    {key:"managers",  label:"מנהלים",               color:"#c0622b"},
    {key:"sellBase",  label:"מוכרנים — בסיס",      color:"#267a50"},
    {key:"sellComm",  label:"מוכרנים — עמלות",     color:"#c8a84b"},
    {key:"office",    label:"משרד ונלוות",           color:"#8a8880"},
  ];

  function Slider({label,value,min,max,step=1,onChange,format}){
    return(
      <div style={{marginBottom:"0.65rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
          <span style={{color:C.muted}}>{label}</span>
          <span style={{fontWeight:700,color:C.gold}}>{format?format(value):value}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e=>onChange(Number(e.target.value))}
          style={{width:"100%",accentColor:C.gold,cursor:"pointer"}}/>
      </div>
    );
  }

  // ── ACTUALS TAB ──
  function ActualsTab(){
    const tots = months.map(calcTotals);
    // comparison row (month 0 vs 1)
    const diff = months.length>=2 ? {
      revenue: months[1].revenue - months[0].revenue,
      profit:  tots[1].profit    - tots[0].profit,
      roas:    tots[1].roas      - tots[0].roas,
      margin:  tots[1].margin    - tots[0].margin,
    } : null;

    return(
      <div>
        {/* Month tabs */}
        <div style={{display:"flex",gap:4,marginBottom:"0.75rem"}}>
          {months.map((m,i)=>(
            <button key={i} onClick={()=>setSelMonth(i)} style={{
              flex:1,padding:"0.4rem",borderRadius:8,border:`1px solid ${selMonth===i?C.gold:C.border}`,
              background:selMonth===i?C.goldBg:"#fafaf8",cursor:"pointer",fontFamily:"inherit",
              fontSize:12,fontWeight:selMonth===i?700:400,color:selMonth===i?"#7a5e1a":C.muted
            }}>{m.label}</button>
          ))}
          {diff&&<button onClick={()=>setSelMonth(-1)} style={{
            flex:1,padding:"0.4rem",borderRadius:8,border:`1px solid ${selMonth===-1?C.purple:C.border}`,
            background:selMonth===-1?"rgba(107,79,160,0.1)":"#fafaf8",cursor:"pointer",fontFamily:"inherit",
            fontSize:12,fontWeight:selMonth===-1?700:400,color:selMonth===-1?C.purple:C.muted
          }}>⚖️ השוואה</button>}
        </div>

        {selMonth>=0 && (()=>{
          const m = months[selMonth];
          const t = tots[selMonth];
          return(
            <div>
              {/* KPI row */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"0.5rem",marginBottom:"0.75rem"}}>
                {[
                  {l:"הכנסות",    v:fmtN(m.revenue),      c:C.green},
                  {l:"הוצאות",    v:fmtN(t.expenses),     c:C.red},
                  {l:"רווח נקי",  v:fmtN(t.profit),       c:t.profit>=0?C.green:C.red},
                  {l:"מרג'ין",    v:pct(t.margin),         c:t.margin>=20?C.green:t.margin>=10?C.gold:C.red},
                  {l:"ROAS",      v:`×${t.roas.toFixed(2)}`,c:t.roas>=3?C.green:t.roas>=1.5?C.gold:C.red},
                ].map(k=>(
                  <div key={k.l} style={{background:"#f8f5ee",borderRadius:10,padding:"0.6rem 0.75rem"}}>
                    <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{k.l}</div>
                    <div style={{fontSize:"1.1rem",fontWeight:900,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>

              {/* Cost composition bar */}
              <div style={{marginBottom:"0.75rem"}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>הרכב הוצאות</div>
                <div style={{display:"flex",height:10,borderRadius:5,overflow:"hidden",marginBottom:6}}>
                  {COLOR_ROWS.map(r=>{
                    const w = m.revenue>0?((m[r.key]/m.revenue)*100):0;
                    return <div key={r.key} style={{width:`${w}%`,background:r.color}} title={`${r.label}: ${pct(w)}`}/>;
                  })}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {COLOR_ROWS.map(r=>(
                    <div key={r.key} style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:C.muted}}>
                      <div style={{width:8,height:8,borderRadius:2,background:r.color,flexShrink:0}}/>
                      <span>{r.label}: {fmtN(m[r.key])} ({m.revenue>0?pct(m[r.key]/m.revenue*100):"0%"})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable rows */}
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>✏️ ניתן לערוך — הנתונים משפיעים בזמן אמת</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0.6rem",background:C.greenBg,borderRadius:8,fontSize:13,fontWeight:700}}>
                  <span style={{color:C.green}}>הכנסות פרטים</span>
                  <input type="number" value={m.revenue}
                    onChange={e=>setMonths(prev=>{const n=[...prev];n[selMonth]={...n[selMonth],revenue:+e.target.value};return n;})}
                    style={{width:90,textAlign:"left",border:"none",background:"transparent",fontWeight:700,fontSize:13,color:C.green,outline:"none"}}/>
                </div>
                {COLOR_ROWS.map(r=>(
                  <div key={r.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.6rem",borderRadius:8,background:"#f8f5ee",fontSize:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:6,height:6,borderRadius:2,background:r.color,flexShrink:0}}/>
                      <span style={{color:C.muted}}>{r.label}</span>
                    </div>
                    <input type="number" value={m[r.key]}
                      onChange={e=>setMonths(prev=>{const n=[...prev];n[selMonth]={...n[selMonth],[r.key]:+e.target.value};return n;})}
                      style={{width:80,textAlign:"left",border:"none",background:"transparent",fontWeight:600,fontSize:12,outline:"none",color:C.ink}}/>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0.6rem",background:t.profit>=0?C.greenBg:C.redBg,borderRadius:8,fontSize:13,fontWeight:900,marginTop:4}}>
                  <span style={{color:t.profit>=0?C.green:C.red}}>רווח נקי</span>
                  <span style={{color:t.profit>=0?C.green:C.red}}>{fmtN(t.profit)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {selMonth===-1&&diff&&(()=>{
          const [m0,m1]=[months[0],months[1]];
          const [t0,t1]=[tots[0],tots[1]];
          const arrow=(v)=>v>0?"↑ ":"↓ ";
          const col=(v)=>v>0?C.green:C.red;
          return(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>
                {["",m0.label,m1.label].map((h,i)=>(
                  <div key={i} style={{fontSize:11,fontWeight:700,color:C.muted,textAlign:i===0?"right":"center",padding:"0.3rem"}}>{h}</div>
                ))}
                {[
                  {l:"הכנסות",  v0:m0.revenue,  v1:m1.revenue},
                  {l:"הוצאות",  v0:t0.expenses, v1:t1.expenses},
                  {l:"רווח",    v0:t0.profit,   v1:t1.profit},
                  {l:"ROAS",    v0:t0.roas,     v1:t1.roas, isRoas:true},
                  {l:"מרג'ין",  v0:t0.margin,   v1:t1.margin, isPct:true},
                ].map(r=>(
                  [<div key={r.l+"l"} style={{fontSize:12,color:C.muted,padding:"0.35rem 0.3rem",borderBottom:`1px solid ${C.border}`}}>{r.l}</div>,
                   <div key={r.l+"0"} style={{fontSize:12,fontWeight:700,textAlign:"center",padding:"0.35rem",borderBottom:`1px solid ${C.border}`,color:C.ink}}>
                     {r.isRoas?`×${r.v0.toFixed(2)}`:r.isPct?pct(r.v0):fmtN(r.v0)}
                   </div>,
                   <div key={r.l+"1"} style={{fontSize:12,fontWeight:700,textAlign:"center",padding:"0.35rem",borderBottom:`1px solid ${C.border}`,color:col(r.v1-r.v0)}}>
                     {r.isRoas?`×${r.v1.toFixed(2)}`:r.isPct?pct(r.v1):fmtN(r.v1)}
                     <span style={{fontSize:10,marginRight:3}}>{arrow(r.v1-r.v0)}{r.isRoas?Math.abs(r.v1-r.v0).toFixed(2):r.isPct?pct(Math.abs(r.v1-r.v0)):fmtN(Math.abs(r.v1-r.v0))}</span>
                   </div>]
                ))}
              </div>
              <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>* יוני — נתוני חצי חודש</div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── FORECAST TAB ──
  function ForecastTab(){
    const leads      = funnel.cpl>0 ? Math.round(
      (months[0]?.mktBudget||50000)/funnel.cpl) : 0;
    const customers  = Math.round(leads*(funnel.conv/100));
    const revenue    = customers*funnel.deal;
    const roas       = (months[0]?.mktBudget||50000)>0
      ? revenue/(months[0]?.mktBudget||50000) : 0;

    // back-solve: what conv rate needed for target ROAS?
    const mkt        = months[0]?.mktBudget||50000;
    const targetRev  = targetROAS*mkt;
    const neededConv = leads>0&&funnel.deal>0
      ? (targetRev/leads/funnel.deal*100) : 0;

    return(
      <div>
        <div style={{marginBottom:"1rem"}}>
          <Slider label="עלות לליד (CPL) ₪" value={funnel.cpl} min={50} max={2000} step={10}
            onChange={v=>setFunnel(p=>({...p,cpl:v}))} format={v=>`₪${v}`}/>
          <Slider label="אחוז המרה (%)" value={funnel.conv} min={1} max={60} step={0.5}
            onChange={v=>setFunnel(p=>({...p,conv:v}))} format={v=>`${v}%`}/>
          <Slider label="עסקה ממוצעת ₪" value={funnel.deal} min={1000} max={100000} step={500}
            onChange={v=>setFunnel(p=>({...p,deal:v}))} format={v=>`₪${(v/1000).toFixed(0)}K`}/>
        </div>

        {/* Funnel */}
        <div style={{background:"#f8f5ee",borderRadius:12,padding:"0.9rem",marginBottom:"0.75rem"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8}}>📣 Funnel מכירות</div>
          {[
            {label:"תקציב שיווק",  value:fmtN(mkt),          color:C.accent,  w:"100%"},
            {label:"לידים",        value:`${leads} ×`,        color:C.purple,  w:"75%"},
            {label:"לקוחות",       value:`${customers} ×`,    color:C.gold,    w:"45%"},
            {label:"הכנסות",       value:fmtN(revenue),       color:C.green,   w:"30%"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:6}}>
              <div style={{width:80,fontSize:11,color:C.muted,textAlign:"right"}}>{r.label}</div>
              <div style={{flex:1,height:22,background:"#e8e3d8",borderRadius:5,overflow:"hidden"}}>
                <div style={{width:r.w,height:"100%",background:r.color,borderRadius:5,display:"flex",alignItems:"center",paddingRight:8}}>
                  <span style={{color:"#fff",fontSize:11,fontWeight:700}}>{r.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ROAS result */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"0.75rem"}}>
          <div style={{background:roas>=3?C.greenBg:roas>=1.5?C.goldBg:C.redBg,borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:3}}>ROAS צפוי</div>
            <div style={{fontSize:"1.5rem",fontWeight:900,color:roas>=3?C.green:roas>=1.5?C.gold:C.red}}>×{roas.toFixed(2)}</div>
          </div>
          <div style={{background:"#f8f5ee",borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:3}}>הכנסות צפויות</div>
            <div style={{fontSize:"1.5rem",fontWeight:900,color:C.green}}>{fmtN(revenue)}</div>
          </div>
        </div>

        {/* Back-solver */}
        <div style={{background:C.ink,borderRadius:12,padding:"0.9rem"}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:8,letterSpacing:"0.1em"}}>◆ BACK-SOLVER — יעד ROAS</div>
          <Slider label="יעד ROAS" value={targetROAS} min={1} max={10} step={0.5}
            onChange={setTargetROAS} format={v=>`×${v}`}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginTop:4}}>
            <div style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:"0.6rem",textAlign:"center"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.45)",marginBottom:2}}>הכנסה נדרשת</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:"#fff"}}>{fmtN(targetRev)}</div>
            </div>
            <div style={{background:neededConv<=100?"rgba(38,122,80,.2)":"rgba(185,53,53,.2)",borderRadius:8,padding:"0.6rem",textAlign:"center"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.45)",marginBottom:2}}>המרה נדרשת</div>
              <div style={{fontSize:"1rem",fontWeight:700,color:neededConv<=100?C.green:C.red}}>
                {neededConv>0?`${neededConv.toFixed(1)}%`:"—"}
              </div>
            </div>
          </div>
          {neededConv>funnel.conv&&neededConv<=100&&(
            <div style={{marginTop:6,fontSize:11,color:C.gold,lineHeight:1.5}}>
              💡 לשיפור המרה מ-{funnel.conv}% ל-{neededConv.toFixed(1)}% — שקול: הכשרת מוכרנים, שיפור qualifying, סגירות.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCENARIO TAB ──
  function ScenarioTab(){
    const base  = months[0];
    const scen  = scenEdit || {...base};
    const tBase = calcTotals(base);
    const tScen = calcTotals(scen);

    return(
      <div>
        <div style={{fontSize:12,color:C.muted,marginBottom:"0.75rem",lineHeight:1.6}}>
          ✏️ שחק עם מספרים — ראה איך שינוי בתקציב/הכנסות משפיע על הרווח.
          הנתונים האמיתיים לא ישתנו.
        </div>
        {[
          {key:"revenue", label:"הכנסות",         positive:true},
          {key:"mktBudget",label:"תקציב שיווק",   positive:false},
          {key:"mktAgent", label:"משווק",          positive:false},
          {key:"managers", label:"מנהלים",         positive:false},
          {key:"sellBase", label:"מוכרנים בסיס",  positive:false},
          {key:"sellComm", label:"עמלות מוכרנים", positive:false},
          {key:"office",   label:"משרד",           positive:false},
        ].map(r=>(
          <div key={r.key} style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:5}}>
            <div style={{width:110,fontSize:11,color:C.muted}}>{r.label}</div>
            <input type="number" value={scen[r.key]}
              onChange={e=>setScenEdit(p=>({...(p||base),[r.key]:+e.target.value}))}
              style={{flex:1,border:`1px solid ${C.border}`,borderRadius:7,padding:"0.35rem 0.5rem",fontSize:12,fontFamily:"inherit",outline:"none",background:"#fafaf8"}}/>
            <div style={{width:60,fontSize:11,textAlign:"left",
              color:(scen[r.key]-base[r.key])*(r.positive?1:-1)>=0?C.green:C.red}}>
              {scen[r.key]!==base[r.key]?`${scen[r.key]>base[r.key]?"+":""}${fmtN(scen[r.key]-base[r.key])}`:"—"}
            </div>
          </div>
        ))}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginTop:"0.75rem"}}>
          {[
            {l:"רווח בסיס",    v:tBase.profit, c:tBase.profit>=0?C.green:C.red},
            {l:"רווח תרחיש",   v:tScen.profit, c:tScen.profit>=0?C.green:C.red},
            {l:"הפרש רווח",    v:tScen.profit-tBase.profit, c:(tScen.profit-tBase.profit)>=0?C.green:C.red, showSign:true},
            {l:"ROAS תרחיש",   v:null, roas:tScen.roas, c:tScen.roas>=3?C.green:tScen.roas>=1.5?C.gold:C.red},
          ].map(k=>(
            <div key={k.l} style={{background:"#f8f5ee",borderRadius:10,padding:"0.65rem",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:2}}>{k.l}</div>
              <div style={{fontSize:"1rem",fontWeight:900,color:k.c}}>
                {k.roas!=null?`×${k.roas.toFixed(2)}`:k.showSign?(tScen.profit-tBase.profit>=0?"+":"")+fmtN(Math.abs(tScen.profit-tBase.profit)):fmtN(k.v)}
              </div>
            </div>
          ))}
        </div>

        {scenEdit&&(
          <button onClick={()=>setScenEdit(null)} style={{marginTop:"0.65rem",width:"100%",padding:"0.5rem",border:`1px solid ${C.border}`,borderRadius:8,background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,color:C.muted}}>
            ↺ אפס לנתוני בסיס
          </button>
        )}
      </div>
    );
  }

  return(
    <Card style={{marginTop:"0.75rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem",paddingBottom:"0.65rem",borderBottom:`1px solid ${C.border}`}}>
        <div style={{width:36,height:36,borderRadius:9,background:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem"}}>📊</div>
        <div>
          <div style={{fontWeight:700,fontSize:14}}>מחשבון ריווחיות</div>
          <div style={{fontSize:11,color:C.muted}}>אקטואלס · תחזית ROAS · תרחישים</div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:3,marginBottom:"1rem",background:"#ece8df",borderRadius:10,padding:3}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"0.4rem",borderRadius:7,border:"none",cursor:"pointer",
            fontSize:11,fontWeight:tab===t.id?700:400,fontFamily:"inherit",
            background:tab===t.id?"#fff":"transparent",
            color:tab===t.id?C.ink:C.muted,
            boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.08)":"none",
          }}>{t.l}</button>
        ))}
      </div>

      {tab==="actuals"  && <ActualsTab/>}
      {tab==="forecast" && <ForecastTab/>}
      {tab==="scenario" && <ScenarioTab/>}
    </Card>
  );
}

// ─── FINANCE VIEW ─────────────────────────────────────────────────────────────
function Finance({biz}){
  const d=getBizData(biz?.id);
  return(
    <div>
      <SectionHead tag="FINANCE & P&L" title="כספים ורווחיות"/>
      <G4>{d.finKpis.map(k=><StatCard key={k.label} icon={k.icon} label={k.label} value={k.value} sub={k.sub} color={k.color}/>)}</G4>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>📊 P&L חודש נוכחי</div>
        {d.finRows.map(r=>(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:`1px solid ${C.border}`,fontSize:r.bold?14:13,fontWeight:r.bold?900:400}}>
            <span style={{color:r.bold?C.ink:C.muted}}>{r.l}</span>
            <span style={{color:r.pos?C.green:C.red,fontWeight:700}}>{r.pos?"+":""}{fmt(Math.abs(r.v))}</span>
          </div>
        ))}
      </Card>
      <Card style={{marginBottom:"0.75rem"}}>
        <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>💳 ריווחיות עובדים</div>
        {d.employees.map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.5rem 0",borderBottom:`1px solid ${C.border}`}}>
            <span>{e.avatar}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600}}>{e.name}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.role}</div>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:11,color:C.red}}>עלות: {fmt(e.cost)}</div>
              <div style={{fontSize:11,color:C.green}}>ריווח: {fmt(e.profit)}</div>
            </div>
          </div>
        ))}
      </Card>
      <AIBox title="◆ AI — ניתוח פיננסי">{d.finAI}</AIBox>

      {/* ── מחשבון ריווחיות ── */}
      <ProfitabilityCalculator bizId={biz?.id||"biz1"}/>
    </div>
  );
}

function People({biz}){
  const [sel,setSel]=useState(null);
  if(sel) return <EmpDetail emp={sel} onBack={()=>setSel(null)}/>;
  const d=getBizData(biz?.id);
  const emps=d.employees;
  const tc=emps.reduce((s,e)=>s+e.cost,0);
  const tp=emps.reduce((s,e)=>s+e.profit,0);
  const avgMental=Math.round(emps.reduce((s,e)=>s+e.mental,0)/emps.length);
  const atRisk=emps.filter(e=>e.mental<60).length;
  return(
    <div>
      <SectionHead tag="PEOPLE OS" title="ניהול עובדים"/>
      <G4>
        <StatCard icon="👥" label="עובדים" value={emps.length} color={C.accent}/>
        <StatCard icon="💸" label="עלות חודשית" value={fmt(tc)} color={C.red}/>
        <StatCard icon="📈" label="ריווחיות" value={fmt(tp)} color={C.green}/>
        <StatCard icon="🧠" label="מנטל ממוצע" value={`${avgMental}%`} sub={atRisk>0?`${atRisk} דורש תשומת לב`:""} color={C.gold}/>
      </G4>
      <div style={{display:"flex",flexDirection:"column",gap:"0.65rem"}}>
        {emps.map(emp=>(
          <div key={emp.id} onClick={()=>setSel(emp)}
            style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1rem 1.1rem",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform="";}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.65rem"}}>
              <span style={{fontSize:"1.5rem"}}>{emp.avatar}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{emp.name}</div>
                <div style={{fontSize:11,color:C.muted}}>{emp.role} · {emp.dept}</div>
              </div>
              <div style={{fontWeight:900,fontSize:"1.25rem",color:emp.score>=85?C.green:emp.score>=70?C.gold:C.red}}>{emp.score}</div>
            </div>
            <div style={{marginBottom:"0.5rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.muted,marginBottom:3}}>
                <span>מנטל: {emp.mentalLabel}</span><span>{emp.mental}%</span>
              </div>
              <MiniBar val={emp.mental} color={emp.mental>=75?C.green:emp.mental>=50?C.gold:C.red} h={5}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.4rem"}}>
              {[{l:"ריווחיות",v:fmt(emp.profit),c:C.green},{l:"משכורת",v:fmt(emp.salary),c:C.accent},{l:"חופשה",v:`${emp.vacation.total-emp.vacation.used}d`,c:C.muted}].map(s=>(
                <div key={s.l} style={{background:"#f8f5ee",borderRadius:8,padding:"0.3rem 0.5rem",textAlign:"center"}}>
                  <div style={{fontSize:11,fontWeight:700,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:10,color:C.muted}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrgChart({biz}){
  const d=getBizData(biz?.id);
  return(
    <div>
      <SectionHead tag="ORGANIZATION" title="עץ ארגוני"/>
      <Card style={{textAlign:"center"}}>
        <div style={{display:"inline-flex",background:C.ink,color:"#fff",padding:"0.75rem 1.5rem",borderRadius:12,marginBottom:"1.5rem",alignItems:"center",gap:"0.6rem"}}>
          <span style={{fontSize:"1.4rem"}}>👨‍💼</span>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:700,fontSize:14}}>{d.orgCEO.name}</div>
            <div style={{fontSize:11,color:C.gold}}>{d.orgCEO.title}</div>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.65rem",justifyContent:"center"}}>
          {d.orgDepts.map(dept=>(
            <div key={dept.name} style={{minWidth:130}}>
              <div style={{background:"#fff",border:`2px solid ${dept.color}`,borderRadius:12,padding:"0.65rem",marginBottom:"0.4rem"}}>
                <div style={{fontSize:"1.2rem"}}>{dept.icon}</div>
                <div style={{fontWeight:700,fontSize:13}}>{dept.name}</div>
                <div style={{fontSize:11,color:dept.color}}>{dept.role}</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center"}}>
                {dept.reports.map(r=><span key={r} style={{fontSize:10,padding:"2px 7px",background:"#f0ece3",borderRadius:20,color:C.muted}}>{r}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Experts(){
  const [active,setActive]=useState(null);
  const EXP=[
    {icon:"📣",title:"שיווק ומיתוג",  desc:"אסטרטגיית תוכן, מיצוב, קמפיינים, brand voice"},
    {icon:"💵",title:"כספים & CFO",   desc:"P&L, תזרים, תקציב, תחזיות, מינוף פיננסי"},
    {icon:"⚖️",title:"משפטי",         desc:"חוזים, רגולציה, IP, תקנות פרטיות"},
    {icon:"🧑‍🤝‍🧑",title:"HR & גיוס",   desc:"גיוס, שימור, תרבות ארגונית, מדיניות"},
    {icon:"🔧",title:"טכנולוגיה",     desc:"ארכיטקטורה, כלים, אוטומציה, AI"},
    {icon:"🏪",title:"מוצר & UX",     desc:"PMF, roadmap, user research"},
  ];
  return(
    <div>
      <SectionHead tag="AI EXPERTS" title="מומחים בכל תחום"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"0.65rem",marginBottom:"1rem"}}>
        {EXP.map(ex=>(
          <div key={ex.title} onClick={()=>setActive(active===ex.title?null:ex.title)}
            style={{background:active===ex.title?C.ink:C.card,border:`1px solid ${active===ex.title?C.gold:C.border}`,borderRadius:14,padding:"1rem",cursor:"pointer",transition:"all .2s"}}>
            <div style={{fontSize:"1.4rem",marginBottom:5}}>{ex.icon}</div>
            <div style={{fontWeight:700,fontSize:13,color:active===ex.title?"#fff":C.ink,marginBottom:3}}>{ex.title}</div>
            <div style={{fontSize:11,color:active===ex.title?"rgba(255,255,255,.55)":C.muted,lineHeight:1.5}}>{ex.desc}</div>
          </div>
        ))}
      </div>
      {active&&(
        <AIBox title={`◆ ${active} — AI EXPERT`}>
          שלום! אני המומחה שלך ב{active}. אני יכול לעזור עם ניתוח מצב, אסטרטגיה, שאלות ספציפיות, או כל נושא בתחומי.
          <br/><button style={{marginTop:"0.6rem",background:C.gold,color:C.ink,border:"none",borderRadius:8,padding:"0.5rem 1rem",fontSize:13,fontWeight:700,cursor:"pointer"}}>💬 פתח שיחה</button>
        </AIBox>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GUIDE VIEW
// ═══════════════════════════════════════════════════
const GUIDE_SECTIONS = [
  {
    id:"intro", icon:"🚀", title:"מה זה BusinessOS?",
    color: C.gold,
    content: [
      { type:"text", text:"BusinessOS היא לא עוד תוכנת ניהול. היא המוח של העסק שלך — שמחבר בין אסטרטגיה לביצוע, בין אנשים לתוצאות, בין יום-יום לחזון הגדול." },
      { type:"text", text:"המערכת מבוססת על Claude AI ומשמשת כ-6 דברים במקביל:" },
      { type:"list", items:["🧠 אסטרטג שמנתח ומייעץ","📅 מנהל אישי שמארגן ומתעדף","👥 מנהל HR שמכיר כל עובד","💰 CFO שמנהל את הכסף","🎙️ עוזר פגישות שמתמלל ומסכם","🏛️ מומחה בכל תחום עסקי"] },
    ]
  },
  {
    id:"onboarding", icon:"📋", title:"שלבי התחלה — Onboarding",
    color: C.accent,
    content: [
      { type:"step", num:"01", title:"שבוע 1 — הגדרת העסק", items:["מלא פרופיל עסק: שם, ענף, מצב נוכחי, יעד שנתי","הכנס את כל העובדים — שם, תפקיד, משכורת, תחומי אחריות","הגדר OKRs רבעוניים (3-5 יעדים קריטיים)","חבר כלים קיימים: CRM, לוח שנה, Slack"] },
      { type:"tip", text:"אל תנסה להכניס הכל ביום הראשון. התחל עם העובדים הבכירים ו-3 יעדים קריטיים בלבד." },
      { type:"step", num:"02", title:"שגרה יומית — 15 דקות", items:["בוקר: פתח Dashboard — ראה מה דחוף, מה הסטטוס","ערב: עדכן 3 משימות שסיימת, הוסף הערות","בדוק אם יש התראות AI שדורשות תשומת לב"] },
      { type:"step", num:"03", title:"שגרה שבועית — 45 דקות (יום ב׳)", items:["סקירת Pipeline מכירות","בדיקת Health Score לקוחות CS","עדכון סטטוס פרויקטים","קביעת 3 פוקוסים לשבוע"] },
      { type:"step", num:"04", title:"שגרה חודשית — 2 שעות (יום ראשון)", items:["ניתוח P&L","סקירת ביצועי עובדים","עדכון אסטרטגיה בהתאם לנתונים","תכנון החודש הבא"] },
    ]
  },
  {
    id:"growth", icon:"📈", title:"5 עקרונות לצמיחה",
    color: C.green,
    content: [
      { type:"principle", num:"1", title:"מדוד מה שחשוב, עשה מה שנמדד", text:"אם משהו לא נמדד — הוא לא קורה. המערכת עוקבת אחרי הכנסות, לקוחות, עובדים ואסטרטגיה." },
      { type:"principle", num:"2", title:"AI כיועץ, לא כמזכירה", text:"שאל שאלות גדולות: למה ה-churn עלה? מי מוכן לקידום? מה הסיכון הגדול ל-Q3? אל תשתמש בו רק למשימות." },
      { type:"principle", num:"3", title:"Pipeline × 3 תמיד", text:"אם יעד ההכנסה הוא ₪300K — Pipeline חייב להיות ₪900K+. פחות מזה = יעד לא ריאלי." },
      { type:"principle", num:"4", title:"שימור לקוחות = צמיחה חינם", text:"Health Score מתחת 60 → התערב מיד. Churn מעל 5% → בעיה מבנית. NPS מתחת 50 → עצור הכל." },
      { type:"principle", num:"5", title:"ניהול עובדים = ניהול תוצאות", text:"כל עובד חייב לייצר ×3 מעלותו. עובד שלא מייצר ×1.5 — שוחח עליו מיד." },
    ]
  },
  {
    id:"systems", icon:"⚙️", title:"4 סיסטמים לבנות",
    color: C.purple,
    content: [
      { type:"system", icon:"💰", title:"סיסטם מכירות", flow:"Lead → Discovery (48h) → Demo (שבוע) → Proposal → Close", items:["תסריט discovery קבוע — שמור במאגר ידע","דמו מוצר סטנדרטי — 20 דקות","Proposal template מותאם לסגמנט","Follow-up sequence אוטומטי"] },
      { type:"system", icon:"❤️", title:"סיסטם CS", flow:"Onboarding (0-30 יום) → Adoption (30-90) → Expansion → Renewal", items:["Onboarding Playbook — 5 שלבים קבועים","Check-in חודשי — template קבוע","EBR (Executive Business Review) — רבעוני","Churn Prediction — Health Score מתחת 60"] },
      { type:"system", icon:"👥", title:"סיסטם עובדים", flow:"גיוס → Onboarding (30-60-90) → שגרת 1:1 → סקירה רבעונית → קידום", items:["פרופיל עובד מלא ביום הראשון","30-60-90 day plan לכל גיוס","1:1 שבועי — מתועד במערכת","סקירה רבעונית עם OKRs אישיים"] },
      { type:"system", icon:"🎙️", title:"סיסטם פגישות", flow:"הכנה (AI) → פגישה (תיעוד) → סיכום AI → Action Items → מעקב", items:["אין פגישה ללא agenda","אין סיכום — אין ביצוע","כל action item עם שם ותאריך","מעקב בפגישה הבאה"] },
    ]
  },
  {
    id:"roadmap", icon:"🗺️", title:"מפת דרכים לצמיחה",
    color: C.orange,
    content: [
      { type:"roadmap", phase:"Phase 1", range:"0 — ₪500K ARR", title:"עסק", focus:"מצא Product-Market Fit", kpis:["ARR","NPS","Time to First Value"], items:["הכנס 3-5 לקוחות אידיאליים","הבן מה הם אוהבים ולמה קנו","בנה Playbook מכירות בסיסי"] },
      { type:"roadmap", phase:"Phase 2", range:"₪500K — ₪5M ARR", title:"חברה", focus:"בנה מכונה שמשכפלת עצמה", kpis:["MRR Growth","Churn Rate","Revenue/Employee"], items:["גייס VP Sales ו-CS Manager","הכנס CRM + Sales Process","בנה שכבת ניהול (מנהלי ביניים)"] },
      { type:"roadmap", phase:"Phase 3", range:"₪5M+ ARR", title:"ארגון", focus:"Scale ואוטומציה", kpis:["Net Revenue Retention","LTV:CAC","EBITDA"], items:["הכנס Revenue Operations","בנה מנוע CS אוטומטי","פתח ערוצי הכנסה נוספים"] },
    ]
  },
  {
    id:"tips", icon:"💡", title:"טיפים + שאלות ל-AI",
    color: C.green,
    content: [
      { type:"dos", title:"✅ עשה", items:["פתח Dashboard כל בוקר — 5 דקות","עדכן Pipeline כל יום ב׳","תעד כל פגישה — גם קצרות","בדוק Health Score לקוחות בסיכון — פעם בשבוע","שוחח עם כל עובד 1:1 לפחות פעם בשבועיים","שאל את ה-AI שאלות אסטרטגיות לפני החלטות גדולות"] },
      { type:"donts", title:"❌ אל תעשה", items:["אל תצבור פגישות ללא סיכום — הן נעלמות","אל תתעלם ממצב מנטלי ירוד של עובד","אל תנהל מזיכרון — הכל בפנים","אל תחכה לסקירה רבעונית לזהות בעיות","אל תסמוך על תחושת בטן — הנתונים אומרים אחרת"] },
      { type:"ai_questions", title:"🤖 שאלות מומלצות ל-AI", groups:[
        { label:"מכירות", qs:["למה Win Rate ירד מ-35% ל-28%?","אילו לידים יש הסתברות גבוהה לסגירה?","מה ה-ICP שלנו?"] },
        { label:"CS", qs:["אילו לקוחות צפויים לעזוב בחודש הבא?","איך מגדילים Upsell בלי להיות אגרסיביים?"] },
        { label:"עובדים", qs:["מי מוכן לקידום ומי צריך שיחה?","מה מסביר את הירידה בביצועי X?"] },
        { label:"אסטרטגיה", qs:["מה הסיכון הגדול ביותר לעסק ל-6 חודשים?","מה הצעד הבא הכי משפיע לצמיחה?"] },
      ]},
      { type:"golden", items:["עקביות על פני שלמות — כנס כל יום גם 5 דקות","נתונים מנהיגים, לא מאשרים — כנס כדי לגלות מה אתה לא יודע","האנשים הם המנוע — הכנס אותם, תאמן אותם, שמע אותם"] },
    ]
  },
];

function GuideView() {
  const [activeSection, setActiveSection] = useState("intro");
  const sec = GUIDE_SECTIONS.find(s => s.id === activeSection) || GUIDE_SECTIONS[0];

  function renderContent(item, i) {
    switch(item.type) {
      case "text":
        return <p key={i} style={{fontSize:14,lineHeight:1.85,color:"#333",margin:"0 0 0.75rem"}}>{item.text}</p>;

      case "list":
        return <ul key={i} style={{paddingRight:"1.2rem",margin:"0 0 0.75rem"}}>{item.items.map((it,j)=><li key={j} style={{fontSize:13,lineHeight:1.7,color:"#444",marginBottom:4}}>{it}</li>)}</ul>;

      case "tip":
        return <div key={i} style={{background:C.goldBg,border:`1px solid ${C.goldBorder}`,borderRadius:10,padding:"0.75rem 1rem",marginBottom:"0.75rem",fontSize:13,lineHeight:1.7,color:"#6a4e10"}}>💡 <strong>טיפ:</strong> {item.text}</div>;

      case "step":
        return (
          <div key={i} style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.5rem"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:C.ink,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,fontFamily:"monospace",flexShrink:0}}>{item.num}</div>
              <div style={{fontWeight:700,fontSize:14}}>{item.title}</div>
            </div>
            <div style={{paddingRight:40}}>
              {item.items.map((it,j)=>(
                <div key={j} style={{display:"flex",gap:8,marginBottom:4,fontSize:13,color:"#444",lineHeight:1.6}}>
                  <span style={{color:C.gold,flexShrink:0}}>→</span>{it}
                </div>
              ))}
            </div>
          </div>
        );

      case "principle":
        return (
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem",marginBottom:"0.65rem",display:"flex",gap:"0.75rem"}}>
            <div style={{width:32,height:32,borderRadius:8,background:C.greenBg,color:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,flexShrink:0}}>{item.num}</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.65}}>{item.text}</div>
            </div>
          </div>
        );

      case "system":
        return (
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.1rem",marginBottom:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{item.icon} {item.title}</div>
            <div style={{fontFamily:"monospace",fontSize:11,color:C.purple,marginBottom:"0.75rem",background:C.purpleBg,padding:"0.4rem 0.6rem",borderRadius:6}}>{item.flow}</div>
            {item.items.map((it,j)=>(
              <div key={j} style={{display:"flex",gap:8,marginBottom:3,fontSize:12,color:"#555"}}>
                <span style={{color:C.purple}}>◆</span>{it}
              </div>
            ))}
          </div>
        );

      case "roadmap":
        return (
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"1.1rem",marginBottom:"0.75rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:2}}>{item.phase} · {item.range}</div>
                <div style={{fontWeight:900,fontSize:"1.1rem"}}>{item.title}</div>
                <div style={{fontSize:12,color:C.muted}}>{item.focus}</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"flex-end"}}>
                {item.kpis.map(k=><span key={k} style={{fontSize:10,padding:"2px 8px",background:C.goldBg,color:"#7a5e1a",borderRadius:20,fontWeight:600}}>{k}</span>)}
              </div>
            </div>
            {item.items.map((it,j)=>(
              <div key={j} style={{display:"flex",gap:8,marginBottom:3,fontSize:12,color:"#555"}}>
                <span style={{color:C.orange}}>→</span>{it}
              </div>
            ))}
          </div>
        );

      case "dos":
        return (
          <div key={i} style={{background:C.greenBg,border:`1px solid rgba(38,122,80,.2)`,borderRadius:12,padding:"0.9rem 1rem",marginBottom:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:13,color:C.green,marginBottom:8}}>{item.title}</div>
            {item.items.map((it,j)=><div key={j} style={{fontSize:12,color:"#2a5a3a",marginBottom:3,display:"flex",gap:6}}><span>✓</span>{it}</div>)}
          </div>
        );

      case "donts":
        return (
          <div key={i} style={{background:C.redBg,border:`1px solid rgba(185,53,53,.2)`,borderRadius:12,padding:"0.9rem 1rem",marginBottom:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:13,color:C.red,marginBottom:8}}>{item.title}</div>
            {item.items.map((it,j)=><div key={j} style={{fontSize:12,color:"#7a2020",marginBottom:3,display:"flex",gap:6}}><span>✗</span>{it}</div>)}
          </div>
        );

      case "ai_questions":
        return (
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"0.9rem 1rem",marginBottom:"0.75rem"}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:"0.75rem"}}>{item.title}</div>
            {item.groups.map((g,j)=>(
              <div key={j} style={{marginBottom:"0.6rem"}}>
                <div style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:4,fontFamily:"monospace",letterSpacing:"0.05em"}}>{g.label}</div>
                {g.qs.map((q,k)=>(
                  <div key={k} style={{fontSize:12,color:"#444",marginBottom:3,padding:"4px 8px",background:"#f8f5ee",borderRadius:6,display:"flex",gap:6}}>
                    <span style={{color:C.gold}}>?</span>{q}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case "golden":
        return (
          <div key={i} style={{background:C.ink,borderRadius:14,padding:"1.1rem",border:`1px solid ${C.goldBorder}`}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,marginBottom:10,letterSpacing:"0.1em"}}>◆ 3 דברים שישנו את העסק שלך</div>
            {item.items.map((it,j)=>(
              <div key={j} style={{display:"flex",gap:"0.65rem",marginBottom:"0.65rem",alignItems:"flex-start"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:C.goldBg,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,flexShrink:0}}>{j+1}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.75)",lineHeight:1.65}}>{it}</div>
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  }

  return (
    <div>
      <div style={{marginBottom:"1.25rem"}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:C.gold,letterSpacing:"0.14em",marginBottom:6}}>◆ GUIDE & TIPS</div>
        <h2 style={{fontSize:"1.5rem",fontWeight:900,letterSpacing:"-0.03em",margin:0}}>מדריך השימוש</h2>
        <p style={{fontSize:13,color:C.muted,marginTop:4}}>כל מה שצריך לדעת כדי לצמוח עם BusinessOS</p>
      </div>

      {/* Section tabs — horizontal scroll */}
      <div style={{display:"flex",gap:"0.4rem",marginBottom:"1.25rem",overflowX:"auto",paddingBottom:4}}>
        {GUIDE_SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
            display:"flex",alignItems:"center",gap:"0.4rem",
            padding:"0.5rem 0.85rem",borderRadius:10,border:`1px solid ${activeSection===s.id?s.color:C.border}`,
            background:activeSection===s.id?`${s.color}18`:"#fff",
            cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:activeSection===s.id?700:400,
            color:activeSection===s.id?s.color:C.muted,whiteSpace:"nowrap",flexShrink:0,
            transition:"all .2s",
          }}>
            <span>{s.icon}</span><span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Active section */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"1.25rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${sec.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem"}}>{sec.icon}</div>
          <div style={{fontWeight:900,fontSize:"1.1rem",color:sec.color}}>{sec.title}</div>
        </div>
        {sec.content.map((item,i) => renderContent(item,i))}
      </div>

      {/* Navigation arrows */}
      <div style={{display:"flex",justifyContent:"space-between",gap:"0.65rem"}}>
        {GUIDE_SECTIONS.indexOf(sec) > 0 && (
          <button onClick={()=>setActiveSection(GUIDE_SECTIONS[GUIDE_SECTIONS.indexOf(sec)-1].id)}
            style={{flex:1,padding:"0.65rem",border:`1px solid ${C.border}`,borderRadius:10,background:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:C.muted}}>
            ← הקודם
          </button>
        )}
        {GUIDE_SECTIONS.indexOf(sec) < GUIDE_SECTIONS.length-1 && (
          <button onClick={()=>setActiveSection(GUIDE_SECTIONS[GUIDE_SECTIONS.indexOf(sec)+1].id)}
            style={{flex:1,padding:"0.65rem",border:`none`,borderRadius:10,background:C.ink,cursor:"pointer",fontFamily:"inherit",fontSize:13,color:C.gold,fontWeight:700}}>
            הבא ←
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// JARVIS — AI PERSONAL AGENT
// ═══════════════════════════════════════════════════

// Context per role
const ROLE_CONTEXT = {
  owner:    "אתה עוזר אישי של בעל עסק שמנהל מספר חברות. יש לך גישה לכל המידע: אסטרטגיה, כספים, עובדים, מכירות, CS. עזור בקבלת החלטות גדולות, ניתוח נתונים, ועצות ניהוליות.",
  vp_sales: "אתה עוזר אישי של VP Sales. התמקד ב: Pipeline, Win Rate, ביצועי נציגים, אסטרטגיית מכירות, תיעדוף לידים, וסגירת עסקאות.",
  cs_mgr:   "אתה עוזר אישי של מנהל Customer Success. התמקד ב: Health Score לקוחות, Churn prevention, NPS, upsell, וניהול תיק לקוחות.",
  sdr:      "אתה מאמן מכירות אישי של SDR. עזור עם: cold outreach, תסריטי שיחה, טיפול בהתנגדויות, תיעדוף לידים, ושיפור conversion rate.",
  ae:       "אתה מאמן מכירות אישי של Account Executive. עזור עם: ניהול pipeline, הכנה לפגישות, negotiation, הצעות מחיר, וסגירת עסקאות Enterprise.",
};

const SCREEN_CONTEXT = {
  dashboard:   "המשתמש נמצא בדשבורד הראשי — סקירה כללית של העסק.",
  strategy:    "המשתמש צופה באסטרטגיית הצמיחה — OKRs, roadmap, KPIs.",
  planner:     "המשתמש בלוח הזמנים — יומן, משימות, תכנון יום.",
  projects:    "המשתמש בניהול פרויקטים — סטטוס, מיילסטונים, חריגות.",
  meetings:    "המשתמש בסיכומי פגישות — action items, החלטות.",
  sales:       "המשתמש בעולם המכירות — Pipeline, ביצועי נציגים, Funnel.",
  cs:          "המשתמש ב-Customer Success — Health Score, Churn, NPS.",
  finance:     "המשתמש בכספים ו-P&L — הכנסות, הוצאות, ריווחיות.",
  people:      "המשתמש ב-People OS — פרופילי עובדים, ביצועים, מנטל.",
  org:         "המשתמש בעץ הארגוני — מבנה, כפיפויות, מחלקות.",
  experts:     "המשתמש בסקשן המומחים — יועצי AI לפי תחום.",
  guide:       "המשתמש קורא את המדריך — שאל שאלות על האפליקציה.",
  businesses:  "המשתמש מנהל את העסקים שלו — החלפה, הוספה, סקירה.",
};

const QUICK_PROMPTS = {
  owner:    ["מה הסיכון הגדול ביותר השבוע?","מה אני צריך לעשות היום?","סכם לי את מצב העסק","מי העובד שהכי צריך תשומת לב?","מה הצעד הבא לצמיחה?"],
  vp_sales: ["מה מצב ה-Pipeline שלנו?","אילו עסקאות הכי קרובות לסגירה?","איך לשפר את Win Rate?","מה עושה ביצועי SDR חלשים?","תן לי תסריט לשיחת demo"],
  cs_mgr:   ["אילו לקוחות בסיכון churn?","איך לשפר את ה-NPS?","מה best practice לEBR?","איך לגשת ללקוח עם Health Score נמוך?","תן לי template לcheck-in חודשי"],
  sdr:      ["תעזור לי עם cold email","איך לטפל בהתנגדות 'יקר לי'?","תן לי opener לשיחת טלפון","איך לתעדף בין לידים?","מה לומר אחרי שאני ב-voicemail?"],
  ae:       ["איך להתכונן לdemo?","תעזור לי לבנות proposal","איך לנהל negotiation על מחיר?","מה לומר כשלקוח לא מחזיר?","תן לי תסריט לשיחת closing"],
};

function JarvisAgent({ user, currentView, currentBiz }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useState(null);
  const inputRef = useState(null);

  // Stop pulse after first open
  function handleOpen() {
    setOpen(true);
    setPulse(false);
    if (messages.length === 0) {
      const greeting = {
        role: "assistant",
        text: `שלום ${user.name.split(" ")[0]}! 👋\n\nאני ג'ארוויס — הסוכן האישי שלך ב-BusinessOS.\n\nאני מכיר את התפקיד שלך (${user.title}) ואת המסך שאתה נמצא בו עכשיו.\n\nאיך אוכל לעזור לך?`,
        time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([greeting]);
    }
  }

  async function send(text) {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput("");

    const userMsg = { role: "user", text: msgText, time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build system prompt based on role + current screen
    const systemPrompt = `${ROLE_CONTEXT[user.role] || ROLE_CONTEXT.ae}

מידע נוכחי:
- שם המשתמש: ${user.name}
- תפקיד: ${user.title}
- עסק פעיל: ${currentBiz?.name || "לא ידוע"} (${currentBiz?.stage || ""}, MRR: ${currentBiz?.mrr ? "₪" + (currentBiz.mrr/1000).toFixed(0) + "K" : "לא ידוע"})
- מסך נוכחי: ${SCREEN_CONTEXT[currentView] || ""}

הנחיות:
- ענה תמיד בעברית, בשפה ישירה ועסקית
- תשובות קצרות וממוקדות — מקסימום 3-4 פסקאות קצרות
- השתמש בבולטים כשיש רשימה
- אל תחזור על השאלה
- כשאתה ממליץ — תן המלצה ספציפית, לא כללית
- אתה מכיר את נתוני העסק: MRR ₪385K, 24 עובדים, Win Rate 31%, NPS 72, Churn 4.2%`;

    try {
      const history = messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0)
        .slice(-8)
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: systemPrompt,
          messages: [...history, { role: "user", content: msgText }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "מצטער, לא הצלחתי לעבד את הבקשה.";
      setMessages(prev => [...prev, { role: "assistant", text: reply, time: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "שגיאת חיבור — נסה שוב.", time: "" }]);
    }
    setLoading(false);
  }

  const quickPrompts = QUICK_PROMPTS[user.role] || QUICK_PROMPTS.ae;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 500,
          width: 54, height: 54, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.ink}, #1a2e44)`,
          border: `2px solid ${C.gold}`,
          boxShadow: pulse ? `0 0 0 6px rgba(200,168,75,0.2), 0 8px 24px rgba(0,0,0,0.3)` : `0 8px 24px rgba(0,0,0,0.3)`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
          animation: pulse ? "jarvis-pulse 2s infinite" : "none",
          transition: "all 0.3s",
        }}
        title="ג'ארוויס — עוזר AI אישי"
      >
        🤖
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 84, left: 16, zIndex: 500,
          width: "min(380px, calc(100vw - 32px))",
          height: "min(540px, calc(100vh - 120px))",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          border: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${C.ink}, #1a2e44)`,
            padding: "0.9rem 1.1rem",
            display: "flex", alignItems: "center", gap: "0.65rem",
            flexShrink: 0,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,168,75,0.15)", border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>ג'ארוויס</div>
              <div style={{ color: C.gold, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.08em" }}>
                {currentView ? `◆ ${SCREEN_CONTEXT[currentView]?.slice(0,28)}...` : "AI PERSONAL AGENT"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setMessages([])}
                style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 7, padding: "4px 8px", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 11 }}
                title="נקה שיחה"
              >🗑️</button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 7, padding: "4px 8px", color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 13 }}
              >✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: "0.5rem", alignItems: "flex-end" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.goldBg, border: `1px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0 }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "78%",
                  background: m.role === "user" ? C.ink : "#f8f5ee",
                  color: m.role === "user" ? "#fff" : C.ink,
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  padding: "0.6rem 0.85rem",
                  fontSize: 13,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}>
                  {m.text}
                  <div style={{ fontSize: 10, color: m.role === "user" ? "rgba(255,255,255,.4)" : C.muted, marginTop: 3, textAlign: "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.goldBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
                <div style={{ background: "#f8f5ee", borderRadius: "16px 16px 16px 4px", padding: "0.6rem 0.85rem", display: "flex", gap: 4 }}>
                  {[0,1,2].map(d => (
                    <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, animation: `jarvis-dot 1.2s infinite`, animationDelay: `${d*0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 0.75rem 0.5rem", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {quickPrompts.slice(0, 3).map(q => (
                <button key={q} onClick={() => send(q)}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: "#f8f5ee", cursor: "pointer", fontFamily: "inherit", color: "#444", lineHeight: 1.4, textAlign: "right" }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "0.6rem 0.75rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="שאל את ג'ארוויס..."
              style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.85rem", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8f5ee", direction: "rtl" }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? C.ink : "#e8e3d8", border: "none", cursor: input.trim() ? "pointer" : "default", color: input.trim() ? C.gold : C.muted, fontSize: 16, transition: "all .2s", flexShrink: 0 }}
            >→</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes jarvis-pulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(200,168,75,0.15), 0 8px 24px rgba(0,0,0,0.3); }
          50%      { box-shadow: 0 0 0 10px rgba(200,168,75,0.08), 0 8px 24px rgba(0,0,0,0.3); }
        }
        @keyframes jarvis-dot {
          0%,80%,100% { transform: scale(0.7); opacity: 0.4; }
          40%          { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
export default function BusinessOS(){
  const [user,setUser]=useState(null);
  const [view,setView]=useState("dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [businesses,setBusinesses]=useState(INITIAL_BUSINESSES);
  const [activeBiz,setActiveBiz]=useState("biz1");

  if(!user) return <LoginScreen onLogin={u=>{setUser(u);setView("dashboard");}}/>;

  const allowedModules=(ROLE_MODULES[user.role]||ROLE_MODULES.ae);
  const visibleMods=ALL_MODULES.filter(m=>allowedModules.includes(m.id));
  const groups=[...new Set(visibleMods.map(m=>m.group))];
  const currentBiz=businesses.find(b=>b.id===activeBiz)||businesses[0];
  const isOwner=user.role==="owner";

  const NavContent=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Logo */}
      <div style={{padding:"1.1rem 1rem 0.75rem",borderBottom:"1px solid rgba(255,255,255,.07)",marginBottom:"0.5rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:3}}>
          <div style={{width:30,height:30,background:C.gold,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:C.ink}}>B</div>
          <span style={{color:"#fff",fontWeight:900,fontSize:"1rem"}}>Business<span style={{color:C.gold}}>OS</span></span>
        </div>
        <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.25)",letterSpacing:"0.1em"}}>FULL SUITE v2.0</div>
      </div>

      {/* Business switcher (owner only) */}
      {isOwner&&(
        <div style={{margin:"0 0.6rem 0.5rem",background:"rgba(255,255,255,.05)",borderRadius:10,padding:"0.6rem 0.75rem"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.3)",letterSpacing:"0.1em",marginBottom:6}}>עסק פעיל</div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:6}}>
            <div style={{width:24,height:24,borderRadius:6,background:currentBiz.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem"}}>{currentBiz.logo}</div>
            <span style={{color:"#fff",fontSize:12,fontWeight:700,flex:1}}>{currentBiz.name}</span>
          </div>
          {businesses.length>1&&(
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              {businesses.filter(b=>b.id!==activeBiz).map(b=>(
                <button key={b.id} onClick={()=>setActiveBiz(b.id)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.04)",cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:"0.75rem"}}>{b.logo}</span>
                  <span style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav items */}
      <div style={{flex:1,overflowY:"auto",padding:"0 0.5rem"}}>
        {groups.map(g=>(
          <div key={g} style={{marginBottom:"0.4rem"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.22)",letterSpacing:"0.12em",padding:"0.2rem 0.5rem 0.1rem"}}>{g}</div>
            {visibleMods.filter(m=>m.group===g).map(m=>(
              <button key={m.id} onClick={()=>{setView(m.id);setSidebarOpen(false);}} style={{
                width:"100%",display:"flex",alignItems:"center",gap:"0.5rem",
                padding:"0.5rem 0.65rem",borderRadius:8,border:"none",cursor:"pointer",
                background:view===m.id?"rgba(200,168,75,.14)":"transparent",
                color:view===m.id?C.gold:"rgba(255,255,255,.5)",
                fontFamily:"inherit",fontSize:12,fontWeight:view===m.id?700:400,
                marginBottom:2,textAlign:"right",transition:"all .15s",
                borderRight:view===m.id?`2px solid ${C.gold}`:"2px solid transparent",
              }}>
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* User + logout */}
      <div style={{margin:"0.6rem",padding:"0.75rem",background:"rgba(255,255,255,.04)",borderRadius:10}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:6}}>
          <span style={{fontSize:"1.2rem"}}>{user.avatar}</span>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontSize:12,fontWeight:700}}>{user.name}</div>
            <div style={{color:"rgba(255,255,255,.35)",fontSize:10}}>{user.title}</div>
          </div>
        </div>
        <button onClick={()=>{setUser(null);setView("dashboard");}} style={{width:"100%",padding:"0.35rem",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
          ← התנתק
        </button>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.paper,fontFamily:"'Heebo','Segoe UI',sans-serif",direction:"rtl"}}>
      {/* Desktop sidebar */}
      <div style={{width:200,background:C.sidebar,flexShrink:0,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto"}} className="dsk-sb">
        <NavContent/>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
          <div style={{width:220,background:C.sidebar,height:"100%",overflowY:"auto"}}><NavContent/></div>
          <div style={{flex:1,background:"rgba(0,0,0,.55)"}} onClick={()=>setSidebarOpen(false)}/>
        </div>
      )}

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",gap:"0.65rem",padding:"0.65rem 1rem",background:C.sidebar,borderBottom:"1px solid rgba(255,255,255,.07)",position:"sticky",top:0,zIndex:100}}>
          <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,padding:"0.35rem 0.6rem",cursor:"pointer",color:"#fff",fontSize:"1rem"}}>☰</button>
          <span style={{color:"#fff",fontWeight:700,fontSize:"0.9rem"}}>Business<span style={{color:C.gold}}>OS</span></span>
          {isOwner&&<span style={{fontSize:11,color:C.gold,background:"rgba(200,168,75,.12)",padding:"2px 8px",borderRadius:20,border:`1px solid ${C.goldBorder}`}}>{currentBiz.logo} {currentBiz.name}</span>}
          <span style={{marginRight:"auto",fontSize:11,color:"rgba(255,255,255,.35)"}}>{user.avatar} {user.name.split(" ")[0]}</span>
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"1.1rem",overflowY:"auto",maxWidth:860,width:"100%"}}>
          {view==="dashboard"  &&<Dashboard user={user} biz={currentBiz}/>}
          {view==="businesses" &&<BusinessesView businesses={businesses} setBusinesses={setBusinesses} activeBiz={activeBiz} setActiveBiz={setActiveBiz}/>}
          {view==="strategy"   &&<Strategy biz={currentBiz}/>}
          {view==="planner"    &&<Planner/>}
          {view==="projects"   &&<Projects user={user} biz={currentBiz}/>}
          {view==="meetings"   &&<Meetings/>}
          {view==="sales"      &&<Sales userRole={user.role} biz={currentBiz}/>}
          {view==="cs"         &&<CustomerSuccess biz={currentBiz}/>}
          {view==="finance"    &&<Finance biz={currentBiz}/>}
          {view==="people"     &&<People biz={currentBiz}/>}
          {view==="org"        &&<OrgChart biz={currentBiz}/>}
          {view==="experts"    &&<Experts/>}
          {view==="guide"      &&<GuideView/>}
        </div>
      </div>

      {/* JARVIS — floating AI agent */}
      <JarvisAgent user={user} currentView={view} currentBiz={currentBiz} />

      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:2px;}
        input:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(200,168,75,.15)!important;}
        .dsk-sb{display:flex!important;}
        @media(max-width:640px){.dsk-sb{display:none!important;}}
      `}</style>
    </div>
  );
}
