import React, { useState, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader, EmptyState, Tabs, Input } from '../../../components/ui/UI'
import {
 buildWeeklySchedule, downloadICS, googleCalendarUrl,
 workoutEvent, mealEvent, nextSunday,
} from '../../../utils/calendar'
import { DAYS_HE } from '../../../utils/date'
import { ai } from '../../../ai/aiProvider'
import { bmr, tdee, macros, goalAdjustments, dietTemplates } from '../../../utils/calc'

export function Calendar() {
 const [tab, setTab] = useState('week')
 return (
 <>
 <Tabs tabs={[
 { key:'week', label:'שבוע קדימה' },
 { key:'settings', label:'הגדרות סנכרון' },
 { key:'help', label:'איך זה עובד' },
 ]} active={tab} onChange={setTab} />
 {tab === 'week'&& <WeekView />}
 {tab === 'settings'&& <Settings />}
 {tab === 'help'&& <Help />}
 </>
 )
}

function WeekView() {
 const { state } = useApp()
 const [weekStart, setWeekStart] = useState(() => {
 const now = new Date()
 now.setHours(0, 0, 0, 0)
 now.setDate(now.getDate() - now.getDay()) // this Sunday
 return now
 })
 const [mealPlan, setMealPlan] = useState(null)
 const [genMeals, setGenMeals] = useState(false)

 const workoutTime = state.profile.calendarPrefs?.workoutHour ?? 18
 const mealTimes = state.profile.calendarPrefs?.mealTimes || {'בוקר': 8,'צהריים': 13,'ערב': 20,'נשנוש': 16 }
 const reminders = state.profile.calendarPrefs?.reminders ?? true

 const generateMeals = async () => {
 setGenMeals(true)
 const _bmr = bmr(state.profile)
 const _tdee = tdee(_bmr, state.profile.activity)
 const kcal = _tdee + (goalAdjustments[state.profile.goalKey]?.kcalDelta || 0)
 const diet = dietTemplates[state.profile.dietKey] || dietTemplates.balanced
 const targets = { kcal, ...macros(kcal, diet.p, diet.c, diet.f) }
 const p = await ai.suggestMealPlan({ profile: state.profile, targets, days: 7 })
 setMealPlan(p); setGenMeals(false)
 }

 const events = useMemo(() => buildWeeklySchedule({
 plan: state.plan,
 mealPlan,
 weekStart,
 mealTimes,
 }).map(e => ({ ...e, reminderMinutes: reminders ? e.reminderMinutes : undefined })),
 [state.plan, mealPlan, weekStart, mealTimes, reminders])

 const eventsByDay = useMemo(() => {
 const map = {}
 for (const ev of events) {
 const key = ev.start.toDateString()
 if (!map[key]) map[key] = []
 map[key].push(ev)
 }
 return map
 }, [events])

 const downloadWeek = () => {
 downloadICS(events, `holistic-fit-${weekStart.toISOString().slice(0,10)}.ics`)
 }

 const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
 const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
 <Badge> סנכרון יומן</Badge>
 <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>הלו״ז השבועי שלך</h2>
 <div style={{ color: t.color.textDim, marginTop: 6 }}>
 {events.length} אירועים לשבוע · {Object.keys(eventsByDay).length} ימים · הורד כ-ICS או הוסף כל אירוע ל-Google Calendar בקליק
 </div>
 <div style={{ marginTop: 16, display:'flex', gap: 10, flexWrap:'wrap'}}>
 <Button icon="" onClick={downloadWeek} disabled={!events.length}>הורד קובץ ICS לשבוע</Button>
 {!mealPlan && <Button variant="outline"onClick={generateMeals} disabled={genMeals}>{genMeals ? 'בונה...':' הוסף גם ארוחות'}</Button>}
 {!state.plan && (
 <div style={{ padding:'8px 12px', background:`${t.color.warning}15`, borderRadius: t.radius.sm, fontSize: t.font.xs, color: t.color.warning }}>
 אין תכנית אימון פעילה - עבור ל"אימונים"כדי לאמץ אחת
 </div>
 )}
 </div>
 </Card>

 <Card style={{ padding: 16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
 <Button variant="ghost"onClick={prevWeek}>→ שבוע קודם</Button>
 <div style={{ fontWeight: 700 }}>{formatWeekRange(weekStart)}</div>
 <Button variant="ghost"onClick={nextWeek}>שבוע הבא ←</Button>
 </Card>

 {events.length === 0 ? (
 <EmptyState icon=" "title="אין אירועים לשבוע זה"subtitle="אמץ תכנית אימון או צור תכנית ארוחות שבועית כדי לראות לו״ז"/>
 ) : (
 <div style={{ display:'grid', gap: 10 }}>
 {[0,1,2,3,4,5,6].map(dayIdx => {
 const day = new Date(weekStart); day.setDate(weekStart.getDate() + dayIdx)
 const dayEvents = eventsByDay[day.toDateString()] || []
 if (!dayEvents.length) return null
 return (
 <Card key={dayIdx} style={{ padding: 18 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12, paddingBottom: 10, borderBottom:`1px solid ${t.color.border}` }}>
 <div style={{ fontWeight: 700, color: t.color.gold, fontSize: t.font.lg }}>
 {DAYS_HE[dayIdx]} · {day.getDate()}/{day.getMonth() + 1}
 </div>
 <Badge>{dayEvents.length} אירועים</Badge>
 </div>
 <div style={{ display:'grid', gap: 8 }}>
 {dayEvents.sort((a, b) => a.start - b.start).map((ev, i) => (
 <EventCard key={i} event={ev} />
 ))}
 </div>
 </Card>
 )
 })}
 </div>
 )}
 </div>
 )
}

function EventCard({ event }) {
 const time = `${String(event.start.getHours()).padStart(2,'0')}:${String(event.start.getMinutes()).padStart(2,'0')}`
 const isWorkout = event.category === 'Fitness'
 const isMeal = event.category === 'Nutrition'
 const color = isWorkout ? t.color.gold : isMeal ? t.color.info : t.color.success
 return (
 <div style={{ display:'flex', gap: 12, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md, alignItems:'center'}}>
 <div style={{ width: 4, height: 40, background: color, borderRadius: 2 }} />
 <div style={{ minWidth: 50, textAlign:'center'}}>
 <div style={{ fontWeight: 700, fontFamily:'Space Mono, monospace', color }}>{time}</div>
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{event.title}</div>
 {event.description && <div style={{ fontSize: t.font.xs, color: t.color.textDim, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{event.description.split('\n')[0]}</div>}
 </div>
 <a href={googleCalendarUrl(event)} target="_blank"rel="noopener noreferrer"style={{
 padding:'6px 12px', background: t.color.bgCard, border:`1px solid ${t.color.border}`,
 borderRadius: t.radius.pill, color: t.color.gold, textDecoration:'none',
 fontSize: t.font.xs, fontWeight: 600, whiteSpace:'nowrap',
 }}>+ Google Calendar</a>
 </div>
 )
}

function formatWeekRange(start) {
 const end = new Date(start); end.setDate(end.getDate() + 6)
 return `${start.getDate()}/${start.getMonth()+1} - ${end.getDate()}/${end.getMonth()+1}/${end.getFullYear()}`
}

function Settings() {
 const { state, updateProfile } = useApp()
 const prefs = state.profile.calendarPrefs || { workoutHour: 18, mealTimes: {'בוקר': 8,'צהריים': 13,'ערב': 20,'נשנוש': 16 }, reminders: true }
 const set = (patch) => updateProfile({ calendarPrefs: { ...prefs, ...patch } })

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title="שעות ברירת מחדל"subtitle="השעות בהן ננקבע אירועים בלו״ז"/>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
 <TimePicker label="אימון"value={prefs.workoutHour} onChange={v => set({ workoutHour: v })} />
 {Object.entries(prefs.mealTimes).map(([name, hour]) => (
 <TimePicker key={name} label={name} value={hour} onChange={v => set({ mealTimes: { ...prefs.mealTimes, [name]: v } })} />
 ))}
 </div>
 </Card>

 <Card>
 <SectionHeader title="תזכורות"/>
 <label style={{ display:'flex', alignItems:'center', gap: 10, cursor:'pointer', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md }}>
 <input type="checkbox"checked={prefs.reminders !== false} onChange={e => set({ reminders: e.target.checked })} style={{ width: 20, height: 20, accentColor: t.color.gold }} />
 <div>
 <div style={{ fontWeight: 600 }}>הוסף תזכורות VALARM לאירועים</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>אימונים: 30 דק׳ לפני · ארוחות: 15 דק׳ לפני</div>
 </div>
 </label>
 </Card>

 <Card>
 <SectionHeader title="שילוב עתידי"/>
 <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.7 }}>
 <b style={{ color: t.color.gold }}>סנכרון דו-כיווני מלא</b> (OAuth 2.0 עם Google Calendar API) יגיע בגרסה הבאה עם ה-Backend. בינתיים - ייצוא ICS + Deep Links זה כמעט אותו הדבר, וללא הרשאות מיוחדות.
 </div>
 </Card>
 </div>
 )
}

function TimePicker({ label, value, onChange }) {
 return (
 <div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>{label}</div>
 <Input type="number"min={0} max={23} value={value} onChange={e => onChange(+e.target.value)} placeholder="שעה"/>
 </div>
 )
}

function Help() {
 return (
 <Card style={{ padding: 24 }}>
 <SectionHeader title="איך זה עובד"/>
 <div style={{ display:'grid', gap: 16, fontSize: t.font.md, lineHeight: 1.7 }}>
 <div>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6 }}> אופציה 1 - ייבוא של שבוע שלם</div>
 <div style={{ color: t.color.textDim }}>
 לחץ "הורד קובץ ICS לשבוע"ופתח אותו. Google Calendar / Apple Calendar / Outlook - כולם יזהו את הפורמט ויציעו לך לייבא הכל בבת אחת. אירועים חוזרים אוטומטית עם התזכורות והפרטים המלאים.
 </div>
 </div>
 <div>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6 }}> אופציה 2 - הוספה בקליק</div>
 <div style={{ color: t.color.textDim }}>
 כל אירוע מציג כפתור "+ Google Calendar"שפותח את היומן שלך עם כל השדות מולאים מראש. אתה רק לוחץ "שמור".
 </div>
 </div>
 <div>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6 }}> גישה מהמובייל</div>
 <div style={{ color: t.color.textDim }}>
 אם אתה במובייל, קובץ ICS יורד ל-Files ואפשר לפתוח אותו ישירות מהיומן. Google Calendar App מזהה את הפורמט אוטומטית.
 </div>
 </div>
 <div>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6 }}> פרטיות</div>
 <div style={{ color: t.color.textDim }}>
 הכל קורה במכשיר שלך. לא נשלחות שום נתונים לשרת. אין חיבור ל-Google או OAuth - רק פורמט קובץ סטנדרטי.
 </div>
 </div>
 <div>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6 }}> בעתיד</div>
 <div style={{ color: t.color.textDim }}>
 סנכרון דו-כיווני מלא (שינוי במקום אחד = עדכון בשני) יתאפשר עם חיבור Backend. בינתיים הפורמט הזה סוגר 95% מהצורך.
 </div>
 </div>
 </div>
 </Card>
 )
}
