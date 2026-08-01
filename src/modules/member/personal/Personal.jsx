import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { useAuth } from '../../../auth/AuthContext'
import { Card, Button, Input, Select, Badge, SectionHeader } from '../../../components/ui/UI'
import { submitTrainingRequest } from '../../../services/supabaseSync'
import { useI18n } from '../../../i18n/i18n'

const COACH_EMAIL = 'israelgrip@gmail.com'

const LEVELS_HE = ['מתחיל (עד שנה ניסיון)','בינוני (1-3 שנים)','מתקדם (3+ שנים)','אתלט תחרותי']
const LEVELS_EN = ['Beginner (up to 1 year)','Intermediate (1-3 years)','Advanced (3+ years)','Competitive athlete']
const GOAL_OPTIONS_HE = [
 'ירידה במשקל','בניית מסת שריר','חיטוב וחטיבה',
 'שיפור כוח מירבי','שיפור סבולת','שיקום מפציעה',
 'הכנה לתחרות','בריאות כללית','תזונה נכונה',
]
const GOAL_OPTIONS_EN = [
 'Weight loss','Muscle building','Toning & definition',
 'Max strength','Endurance','Injury rehab',
 'Competition prep','General health','Better nutrition',
]
const TIME_OPTIONS_HE = [
 'בוקר (6:00-10:00)','צהריים (10:00-14:00)',
 'אחה"צ (14:00-18:00)','ערב (18:00-22:00)','גמיש',
]
const TIME_OPTIONS_EN = [
 'Morning (6:00-10:00)','Midday (10:00-14:00)',
 'Afternoon (14:00-18:00)','Evening (18:00-22:00)','Flexible',
]
const FREQUENCY_HE = ['פעם בשבוע','פעמיים בשבוע','3 פעמים בשבוע','4+ פעמים בשבוע']
const FREQUENCY_EN = ['Once a week','Twice a week','3 times a week','4+ times a week']
const FORMATS_BASE = [
 { v:'in_person', icon:'', he:'אימון פרונטלי', en:'In-person training'},
 { v:'online', icon:'', he:'ליווי אונליין', en:'Online coaching'},
 { v:'hybrid', icon:'', he:'משולב', en:'Hybrid'},
]

export function Personal() {
 const { user } = useAuth()
 const { state, addTrainingRequest } = useApp()
 const { isRTL } = useI18n()
 const LEVELS = isRTL ? LEVELS_HE : LEVELS_EN
 const GOAL_OPTIONS = isRTL ? GOAL_OPTIONS_HE : GOAL_OPTIONS_EN
 const TIME_OPTIONS = isRTL ? TIME_OPTIONS_HE : TIME_OPTIONS_EN
 const FREQUENCY = isRTL ? FREQUENCY_HE : FREQUENCY_EN
 const FORMATS = FORMATS_BASE.map(x => ({ v: x.v, icon: x.icon, label: isRTL ? x.he : x.en }))
 const [submitted, setSubmitted] = useState(false)
 const [error, setError] = useState(null)
 const [f, setF] = useState({
 name: user?.name || '', phone:'', email: user?.email || '',
 age: state.profile?.age || '', level:'',
 goals: [], injuries:'', currentActivity:'',
 format:'', frequency:'', timePref: [],
 whyNow:'', notes:'',
 })

 const set = (patch) => { setF(x => ({ ...x, ...patch })); setError(null) }
 const toggleArr = (key, val) => set({ [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] })

 const missing = () => {
 const m = []
 if (!f.name.trim()) m.push(isRTL ? 'שם' : 'Name')
 if (!f.phone.trim()) m.push(isRTL ? 'טלפון' : 'Phone')
 if (!f.email.trim()) m.push(isRTL ? 'אימייל' : 'Email')
 if (!f.level) m.push(isRTL ? 'רמת ניסיון' : 'Experience level')
 if (f.goals.length === 0) m.push(isRTL ? 'לפחות מטרה אחת' : 'At least one goal')
 if (!f.format) m.push(isRTL ? 'פורמט אימון' : 'Training format')
 if (!f.frequency) m.push(isRTL ? 'תדירות' : 'Frequency')
 if (f.timePref.length === 0) m.push(isRTL ? 'לפחות זמן אחד' : 'At least one time')
 if (!f.whyNow.trim()) m.push(isRTL ? 'למה עכשיו' : 'Why now')
 return m
 }

 const submit = async () => {
 const m = missing()
 if (m.length) {
 setError(`${isRTL ? 'חסר' : 'Missing'}: ${m.join(' · ')}`)
 window.scrollTo({ top: 0, behavior:'smooth'})
 return
 }
 const request = {
 id:'req_'+ Date.now(),
 submittedAt: new Date().toISOString(),
 status:'new',
 userId: user?.id || null,
 ...f,
 }
 addTrainingRequest(request) // keeps local copy for offline
 // Fire-and-forget cloud sync so admin sees the request from their own device
 try { await submitTrainingRequest(request) } catch (e) { /* silent - local copy still saved */ }
 openMail(request)
 setSubmitted(true)
 window.scrollTo({ top: 0, behavior:'smooth'})
 }

 const openMail = (req) => {
 const body = isRTL ? [
 `בקשה חדשה לאימון אישי מאפליקציית סלנו`,
 ``, ` פרטים:`,
 `שם: ${req.name}`,
 `טלפון: ${req.phone}`,
 `אימייל: ${req.email}`,
 `גיל: ${req.age || '—'}`,
 `רמת ניסיון: ${req.level}`,
 ``, ` מטרות: ${req.goals.join(',')}`,
 req.injuries ? ` פציעות/מגבלות: ${req.injuries}` :'',
 req.currentActivity ? ` פעילות נוכחית: ${req.currentActivity}` :'',
 ``, ` פורמט: ${FORMATS.find(x => x.v === req.format)?.label || req.format}`,
 `תדירות: ${req.frequency}`,
 `זמנים מועדפים: ${req.timePref.join(',')}`,
 ``, ` למה עכשיו: ${req.whyNow}`,
 req.notes ? ` הערות: ${req.notes}` :'',
 ``, `נשלח: ${new Date(req.submittedAt).toLocaleString('he-IL')}`,
 ].filter(Boolean).join('\n') : [
 `New personal training request from Selano app`,
 ``, ` Details:`,
 `Name: ${req.name}`,
 `Phone: ${req.phone}`,
 `Email: ${req.email}`,
 `Age: ${req.age || '—'}`,
 `Experience: ${req.level}`,
 ``, ` Goals: ${req.goals.join(', ')}`,
 req.injuries ? ` Injuries/limitations: ${req.injuries}` :'',
 req.currentActivity ? ` Current activity: ${req.currentActivity}` :'',
 ``, ` Format: ${FORMATS.find(x => x.v === req.format)?.label || req.format}`,
 `Frequency: ${req.frequency}`,
 `Preferred times: ${req.timePref.join(', ')}`,
 ``, ` Why now: ${req.whyNow}`,
 req.notes ? ` Notes: ${req.notes}` :'',
 ``, `Sent: ${new Date(req.submittedAt).toLocaleString('en-US')}`,
 ].filter(Boolean).join('\n')
 const subject = isRTL ? `בקשת אימון אישי: ${req.name}` : `Personal training request: ${req.name}`
 window.location.href = `mailto:${COACH_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
 }

 if (submitted) {
 return (
 <Card style={{ padding: 40, textAlign:'center'}}>
 <div style={{ fontSize: 72, marginBottom: 16 }}> </div>
 <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 10 }}>{isRTL ? 'הבקשה נשלחה בהצלחה!' : 'Your request was sent successfully!'}</h2>
 <p style={{ color: t.color.textDim, fontSize: t.font.md, lineHeight: 1.6, maxWidth: 460, margin:'0 auto 20px'}}>
 {isRTL ? 'אם המייל שלך לא נפתח אוטומטית — הבקשה נשמרה במערכת ואנחנו נחזור אליך תוך 24 שעות.' : 'If your email did not open automatically — the request is saved in our system and we\'ll get back to you within 24 hours.'}
 </p>
 <Button onClick={() => { setSubmitted(false); setF({ ...f, name:'', phone:'', goals: [], timePref: [] }) }}>{isRTL ? 'שליחת בקשה נוספת' : 'Send another request'}</Button>
 </Card>
 )
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 {/* Hero */}
 <Card style={{ padding: 24, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, position:'relative', overflow:'hidden'}}>
 <div style={{ position:'absolute', top: -30, left: -30, width: 180, height: 180, background: t.color.goldGlow, borderRadius:'50%', filter:'blur(40px)'}} />
 <div style={{ position:'relative', zIndex: 1 }}>
 <Badge color={t.color.gold}> {isRTL ? 'קביעת אימון אישי' : 'Book personal training'}</Badge>
 <h1 style={{ fontSize: t.font.hero, fontWeight: 900, marginTop: 10, marginBottom: 6 }}>{isRTL ? 'מוכן לצעד הבא?' : 'Ready for the next step?'}</h1>
 <p style={{ color: t.color.textDim, fontSize: t.font.md, maxWidth: 500, lineHeight: 1.5 }}>
 {isRTL ? 'מלא את השאלון הקצר ונחזור אליך תוך 24 שעות עם הצעה מותאמת אישית - פורמט, מחיר, ולוח זמנים.' : 'Fill out the short form and we\'ll get back to you within 24 hours with a personalized proposal — format, price, and schedule.'}
 </p>
 </div>
 </Card>

 {error && (
 <Card style={{ padding: 14, background: `${t.color.warning}15`, border: `1px solid ${t.color.warning}` }}>
 <div style={{ display:'flex', gap: 10, alignItems:'center', color: t.color.warning, fontWeight: 700 }}>
 <span style={{ fontSize: 20 }}> </span>
 <span>{error}</span>
 </div>
 </Card>
 )}

 {/* Personal details */}
 <Card>
 <SectionHeader title={isRTL ? 'פרטים אישיים' : 'Personal details'} />
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }} className="hfos-form-grid">
 <Input label={isRTL ? 'שם מלא *' : 'Full name *'} value={f.name} onChange={e => set({ name: e.target.value })} />
 <Input label={isRTL ? 'טלפון *' : 'Phone *'} value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="050-1234567" />
 <Input label={isRTL ? 'אימייל *' : 'Email *'} value={f.email} onChange={e => set({ email: e.target.value })} placeholder="you@example.com" />
 <Input label={isRTL ? 'גיל' : 'Age'} type="number" value={f.age} onChange={e => set({ age: e.target.value })} />
 </div>
 <div style={{ marginTop: 12 }}>
 <Select label={isRTL ? 'רמת ניסיון *' : 'Experience level *'} value={f.level} onChange={e => set({ level: e.target.value })}>
 <option value="">{isRTL ? 'בחר רמה' : 'Choose level'}</option>
 {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
 </Select>
 </div>
 </Card>

 {/* Goals */}
 <Card>
 <SectionHeader title={isRTL ? 'מטרות *' : 'Goals *'} subtitle={isRTL ? 'בחר את המטרות העיקריות שלך' : 'Pick your main goals'} />
 <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 12 }}>
 {GOAL_OPTIONS.map(g => {
 const active = f.goals.includes(g)
 return (
 <button key={g} onClick={() => toggleArr('goals', g)} style={{
 padding:'8px 14px', borderRadius: 999,
 background: active ? t.color.gold : t.color.bgSoft,
 color: active ? '#0d0d14': t.color.text,
 border: `1px solid ${active ? t.color.gold : t.color.border}`,
 cursor:'pointer', fontFamily:'inherit', fontWeight: 600, fontSize: t.font.sm,
 }}>{g}</button>
 )
 })}
 </div>
 </Card>

 {/* Injuries + activity */}
 <Card>
 <SectionHeader title={isRTL ? 'מצב גופני נוכחי' : 'Current physical status'} />
 <div style={{ display:'grid', gap: 12, marginTop: 12 }}>
 <Input label={isRTL ? 'פעילות גופנית נוכחית' : 'Current physical activity'} value={f.currentActivity} onChange={e => set({ currentActivity: e.target.value })} placeholder={isRTL ? 'למשל: 2 אימונים בשבוע בחדר כושר, ריצה בסופ״ש' : 'e.g., 2 gym sessions a week, weekend runs'} />
 <Input label={isRTL ? 'פציעות / מגבלות רפואיות' : 'Injuries / medical limitations'} value={f.injuries} onChange={e => set({ injuries: e.target.value })} placeholder={isRTL ? 'ריק אם אין' : 'Leave empty if none'} />
 </div>
 </Card>

 {/* Format */}
 <Card>
 <SectionHeader title={isRTL ? 'פורמט אימון *' : 'Training format *'} />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 8, marginTop: 12 }} className="hfos-format-grid">
 {FORMATS.map(fmt => {
 const active = f.format === fmt.v
 return (
 <button key={fmt.v} onClick={() => set({ format: fmt.v })} style={{
 padding: 16, borderRadius: t.radius.md,
 background: active ? t.color.goldGlow : t.color.bgSoft,
 border: `1px solid ${active ? t.color.gold : t.color.border}`,
 color: active ? t.color.gold : t.color.text,
 cursor:'pointer', fontFamily:'inherit', textAlign:'center',
 display:'flex', flexDirection:'column', gap: 6, alignItems:'center',
 }}>
 <span style={{ fontSize: 28 }}>{fmt.icon}</span>
 <span style={{ fontWeight: 700, fontSize: t.font.sm }}>{fmt.label}</span>
 </button>
 )
 })}
 </div>
 </Card>

 {/* Frequency */}
 <Card>
 <SectionHeader title={isRTL ? 'תדירות *' : 'Frequency *'} />
 <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 12 }}>
 {FREQUENCY.map(fr => {
 const active = f.frequency === fr
 return (
 <button key={fr} onClick={() => set({ frequency: fr })} style={{
 padding:'10px 16px', borderRadius: 999,
 background: active ? t.color.gold : t.color.bgSoft,
 color: active ? '#0d0d14': t.color.text,
 border: `1px solid ${active ? t.color.gold : t.color.border}`,
 cursor:'pointer', fontFamily:'inherit', fontWeight: 700, fontSize: t.font.sm,
 }}>{fr}</button>
 )
 })}
 </div>
 </Card>

 {/* Time preference */}
 <Card>
 <SectionHeader title={isRTL ? 'זמנים מועדפים *' : 'Preferred times *'} subtitle={isRTL ? 'ניתן לבחור יותר מאחד' : 'You can pick more than one'} />
 <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 12 }}>
 {TIME_OPTIONS.map(tm => {
 const active = f.timePref.includes(tm)
 return (
 <button key={tm} onClick={() => toggleArr('timePref', tm)} style={{
 padding:'10px 14px', borderRadius: 999,
 background: active ? t.color.gold : t.color.bgSoft,
 color: active ? '#0d0d14': t.color.text,
 border: `1px solid ${active ? t.color.gold : t.color.border}`,
 cursor:'pointer', fontFamily:'inherit', fontWeight: 600, fontSize: t.font.sm,
 }}>{tm}</button>
 )
 })}
 </div>
 </Card>

 {/* Why now + notes */}
 <Card>
 <SectionHeader title={isRTL ? 'למה עכשיו? *' : 'Why now? *'} subtitle={isRTL ? 'ספר קצת על עצמך והמוטיבציה' : 'Tell us a bit about you and your motivation'} />
 <textarea
 value={f.whyNow}
 onChange={e => set({ whyNow: e.target.value })}
 placeholder={isRTL ? "למשל:'רוצה להיות בכושר לחתונה שלי בעוד 4 חודשים'או 'אחרי לידה, רוצה לחזור לכושר בצורה מודרכת'" : "e.g., 'I want to be in shape for my wedding in 4 months' or 'After childbirth, I want to return to fitness with guidance'"}
 rows={4}
 style={{
 width:'100%', padding: 12, background: t.color.bgSoft,
 border: `1px solid ${t.color.border}`, borderRadius: t.radius.md,
 color: t.color.text, fontFamily:'inherit', fontSize: t.font.sm,
 marginTop: 12, resize:'vertical', direction: isRTL ? 'rtl' : 'ltr',
 }}
 />
 <div style={{ marginTop: 12 }}>
 <Input label={isRTL ? 'הערות נוספות' : 'Additional notes'} value={f.notes} onChange={e => set({ notes: e.target.value })} placeholder={isRTL ? 'משהו שחשוב לנו לדעת?' : 'Anything we should know?'} />
 </div>
 </Card>

 {/* Submit */}
 <div style={{ display:'flex', justifyContent:'flex-end'}}>
 <Button size="lg"icon=" " onClick={submit}>{isRTL ? 'שלח בקשה' : 'Send request'}</Button>
 </div>

 <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.xs, color: t.color.textDim, textAlign:'center', lineHeight: 1.6 }}>
 {isRTL ? `הפרטים נשמרים אצלנו בלבד. הבקשה תישלח למייל של המאמן (${COACH_EMAIL}).` : `Your details are stored only with us. The request will be sent to the coach's email (${COACH_EMAIL}).`}
 </div>

 <style>{`
 @media (max-width: 500px) {
 .hfos-form-grid { grid-template-columns: 1fr !important; }
 .hfos-format-grid { grid-template-columns: 1fr !important; }
 }
 `}</style>
 </div>
 )
}
