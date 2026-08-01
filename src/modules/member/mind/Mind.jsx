import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Badge, SectionHeader, Tabs, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { MentalChat } from './MentalChat'
import { useI18n } from '../../../i18n/i18n'

const MOOD_EMOJI = ['','','','','','','']
const CBT_PROMPTS_HE = [
 'מה המחשבה המטרידה ביותר שלך היום?',
 'איזה עדות יש שהמחשבה הזו לא לגמרי מדויקת?',
 'איך היית מייעץ לחבר טוב במצב הזה?',
 'מה הצעד הקטן ביותר שיזיז אותך קדימה השבוע?',
 'למה אתה אסיר תודה היום?',
]
const CBT_PROMPTS_EN = [
 'What\'s the most bothersome thought you have today?',
 'What evidence suggests this thought isn\'t entirely accurate?',
 'How would you advise a good friend in this situation?',
 'What\'s the smallest step that moves you forward this week?',
 'What are you grateful for today?',
]

export function Mind() {
 const { isRTL } = useI18n()
 const [tab, setTab] = useState('chat')
 return (
 <>
 <Tabs tabs={[
 { key:'chat', label: isRTL ? 'שיחה' : 'Chat'},
 { key:'checkin', label: isRTL ? 'Check-in יומי' : 'Daily check-in'},
 { key:'journal', label: isRTL ? 'יומן' : 'Journal'},
 { key:'patterns', label: isRTL ? 'דפוסים' : 'Patterns'},
 { key:'tools', label: isRTL ? 'כלים' : 'Tools'},
 ]} active={tab} onChange={setTab} />
 {tab === 'chat'&& <MentalChat />}
 {tab === 'checkin'&& <CheckIn />}
 {tab === 'journal'&& <Journal />}
 {tab === 'patterns'&& <Patterns />}
 {tab === 'tools'&& <Tools />}
 </>
 )
}

function CheckIn() {
 const { state, addCheckin } = useApp()
 const { isRTL } = useI18n()
 const [mood, setMood] = useState(7)
 const [energy, setEnergy] = useState(7)
 const [stress, setStress] = useState(4)
 const [sleep, setSleep] = useState(7)
 const [note, setNote] = useState('')

 const submit = () => {
 addCheckin({ date: new Date().toISOString(), mood, energy, stress, sleepHours: sleep, note })
 setNote('')
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title={isRTL ? 'איך אתה מרגיש היום?' : 'How are you feeling today?'} subtitle={isRTL ? 'Check-in של 30 שניות שעוזר למנוע לזהות דפוסים' : '30-second check-in that helps the engine spot patterns'} />
 <div style={{ display:'grid', gap: 20 }}>
 <SliderMood label={isRTL ? 'מצב רוח' : 'Mood'} value={mood} onChange={setMood} emojiScale />
 <Slider label={isRTL ? 'רמת אנרגיה' : 'Energy level'} value={energy} onChange={setEnergy} />
 <Slider label={isRTL ? 'רמת סטרס' : 'Stress level'} value={stress} onChange={setStress} inverse />
 <Slider label={isRTL ? 'שעות שינה אמש' : 'Sleep hours last night'} value={sleep} onChange={setSleep} min={3} max={12} unit={isRTL ? 'ש׳' : 'h'} />
 <Input label={isRTL ? 'מה על הלב? (אופציונלי)' : 'What\'s on your mind? (optional)'} placeholder={isRTL ? 'שיתוף חופשי...' : 'Share freely...'} value={note} onChange={e => setNote(e.target.value)} />
 <Button onClick={submit} icon=" ">{isRTL ? 'שמור Check-in' : 'Save check-in'}</Button>
 </div>
 </Card>

 {state.moodCheckins.length > 0 && (
 <Card>
 <SectionHeader title={isRTL ? 'מגמות אחרונות' : 'Recent trends'} subtitle={`${state.moodCheckins.length} check-ins`} />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
 <MiniTrend label={isRTL ? 'מצב רוח' : 'Mood'} data={state.moodCheckins.slice(0, 14).map(c => c.mood).reverse()} color={t.color.gold} />
 <MiniTrend label={isRTL ? 'אנרגיה' : 'Energy'} data={state.moodCheckins.slice(0, 14).map(c => c.energy).reverse()} color={t.color.success} />
 <MiniTrend label={isRTL ? 'סטרס' : 'Stress'} data={state.moodCheckins.slice(0, 14).map(c => c.stress).reverse()} color={t.color.warning} />
 <MiniTrend label={isRTL ? 'שינה' : 'Sleep'} data={state.moodCheckins.slice(0, 14).map(c => c.sleepHours).reverse()} color={t.color.info} />
 </div>
 </Card>
 )}
 </div>
 )
}

function Slider({ label, value, onChange, min = 0, max = 10, inverse, unit }) {
 return (
 <div>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
 <span style={{ color: t.color.textDim, fontSize: t.font.sm }}>{label}</span>
 <span style={{ fontWeight: 700, color: inverse ? (value > 6 ? t.color.warning : t.color.gold) : t.color.gold }}>
 {value}{unit || `/${max}`}
 </span>
 </div>
 <input type="range"min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ width:'100%'}} />
 </div>
 )
}

function SliderMood({ label, value, onChange }) {
 return (
 <div>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
 <span style={{ color: t.color.textDim, fontSize: t.font.sm }}>{label}</span>
 <span style={{ fontSize: 24 }}>{MOOD_EMOJI[Math.floor((value/10)*6)] || ''}</span>
 </div>
 <input type="range"min={0} max={10} value={value} onChange={e => onChange(+e.target.value)} style={{ width:'100%'}} />
 </div>
 )
}

function MiniTrend({ label, data, color }) {
 return (
 <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
 <span style={{ fontSize: t.font.sm, color: t.color.textDim }}>{label}</span>
 <span style={{ fontWeight: 700, color }}>{data[data.length-1] ?? '—'}</span>
 </div>
 <Sparkline data={data} height={40} color={color} />
 </div>
 )
}

function Journal() {
 const { state, addCheckin } = useApp()
 const { isRTL } = useI18n()
 const [text, setText] = useState('')
 const prompts = isRTL ? CBT_PROMPTS_HE : CBT_PROMPTS_EN
 const prompt = prompts[Math.floor(Math.random() * prompts.length)]

 const entries = state.moodCheckins.filter(c => c.note && c.note.length > 0)

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <Badge> {isRTL ? 'שאלה מנחה' : 'Guiding prompt'}</Badge>
 <div style={{ marginTop: 12, fontSize: t.font.lg, fontWeight: 600, marginBottom: 14 }}>{prompt}</div>
 <Input placeholder={isRTL ? 'כתוב את המחשבות שלך...' : 'Write your thoughts...'} value={text} onChange={e => setText(e.target.value)} />
 <div style={{ marginTop: 12, textAlign:'left'}}>
 <Button onClick={() => { addCheckin({ date: new Date().toISOString(), mood:7, energy:7, stress:4, sleepHours:7, note: text }); setText('') }}>{isRTL ? 'שמור רשומה' : 'Save entry'}</Button>
 </div>
 </Card>
 <Card>
 <SectionHeader title={isRTL ? 'רשומות קודמות' : 'Past entries'} />
 {!entries.length && <EmptyState icon=" "title={isRTL ? 'עדיין אין רשומות' : 'No entries yet'} subtitle={isRTL ? 'כתיבה של 5 דקות ביום מזיזה הרים' : '5 minutes of writing a day moves mountains'} />}
 <div style={{ display:'grid', gap: 8 }}>
 {entries.slice(0, 20).map((c, i) => (
 <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6 }}>{new Date(c.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</div>
 <div style={{ color: t.color.text, lineHeight: 1.6 }}>{c.note}</div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )
}

function Patterns() {
 const { state } = useApp()
 const { isRTL } = useI18n()
 const insights = useMemo(() => generateInsights(state, isRTL), [state, isRTL])

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title={isRTL ? 'דפוסים שזוהו' : 'Patterns detected'} subtitle={isRTL ? 'המנוע מחפש קורלציות בין שינה, מצב-רוח, תזונה וביצועים' : 'The engine looks for correlations between sleep, mood, nutrition, and performance'} />
 {insights.length === 0
 ? <EmptyState icon=" "title={isRTL ? 'עדיין מוקדם לזהות דפוסים' : 'Too early to detect patterns'} subtitle={isRTL ? 'הוסף לפחות 7 check-ins כדי לקבל תובנות' : 'Add at least 7 check-ins to see insights'} />
 : (
 <div style={{ display:'grid', gap: 12 }}>
 {insights.map((ins, i) => (
 <div key={i} style={{
 padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md,
 borderRight: `4px solid ${ins.color}`,
 }}>
 <Badge color={ins.color}>{ins.tag}</Badge>
 <div style={{ marginTop: 10, fontSize: t.font.md, lineHeight: 1.6 }}>{ins.text}</div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 )
}

function generateInsights(state, isRTL = true) {
 const cs = state.moodCheckins
 const out = []
 if (cs.length >= 3) {
 const avgMood = cs.slice(0, 7).reduce((s, c) => s + c.mood, 0) / Math.min(7, cs.length)
 if (avgMood < 5) out.push({ tag: isRTL ? 'מצב-רוח' : 'Mood', color: t.color.warning, text: isRTL ? `ממוצע מצב-רוח שבועי: ${avgMood.toFixed(1)}/10. שקול לפנות למאמן מנטלי, ולוודא 7-9 שעות שינה איכותיות.` : `Weekly mood average: ${avgMood.toFixed(1)}/10. Consider seeing a mental coach and make sure to get 7–9 quality sleep hours.` })
 else if (avgMood >= 7.5) out.push({ tag: isRTL ? 'מצב-רוח מעולה' : 'Great mood', color: t.color.success, text: isRTL ? `אתה במומנטום נהדר - ${avgMood.toFixed(1)}/10 השבוע. שמור על השגרה!` : `You're on great momentum — ${avgMood.toFixed(1)}/10 this week. Keep the routine going!` })

 const avgSleep = cs.slice(0, 7).reduce((s, c) => s + (c.sleepHours || 7), 0) / Math.min(7, cs.length)
 if (avgSleep < 6.5) out.push({ tag: isRTL ? 'שינה נמוכה' : 'Low sleep', color: t.color.danger, text: isRTL ? `שינה ממוצעת: ${avgSleep.toFixed(1)}ש׳. זה משפיע ישירות על הביצועים שלך באימון ועל מצב הרוח. יעד: 7-9 שעות.` : `Average sleep: ${avgSleep.toFixed(1)}h. This directly impacts your workout performance and mood. Target: 7–9 hours.` })
 }
 const wk = state.workoutLogs.filter(l => new Date(l.date) >= new Date(Date.now() - 7*24*3600*1000)).length
 if (wk >= 4 && cs[0]?.mood >= 7) out.push({ tag: isRTL ? 'קשר אימון-מצב-רוח' : 'Workout-mood link', color: t.color.gold, text: isRTL ? 'זיהינו קורלציה חיובית בין תדירות האימונים למצב הרוח שלך השבוע. תמשיך!' : 'We detected a positive correlation between workout frequency and your mood this week. Keep going!'})

 return out
}

function Tools() {
 const { isRTL } = useI18n()
 const tools = isRTL ? [
 { icon:' ', name:'נשימת 4-7-8', desc:'שאיפה 4 שניות, החזקה 7, נשיפה 8. מרגיע את המערכת האוטונומית תוך דקה.'},
 { icon:' ', name:'תרגיל תודה', desc:'רשום 3 דברים שאתה אסיר תודה עליהם היום - מגדיל אושר מיידית.'},
 { icon:' ', name:'סריקת גוף', desc:'10 דקות סריקה מהראש לרגליים - מוריד סטרס ומחזיר קשר לגוף.'},
 { icon:' ', name:'כלל 5 דקות', desc:'אם משימה לוקחת פחות מ-5 דקות, עשה אותה עכשיו. מפרק דחיינות.'},
 { icon:' ', name:'שאלת CBT', desc:'איזה עדות יש שהמחשבה הזו מדויקת? איזה עדות נגד? מה סביר יותר?'},
 { icon:' ', name:'שגרת בוקר', desc:'15 דק׳ אור שמש + מים + תנועה = יום עם יותר אנרגיה ופחות חרדה.'},
 ] : [
 { icon:' ', name:'4-7-8 Breathing', desc:'Inhale 4 sec, hold 7, exhale 8. Calms the autonomic nervous system within a minute.'},
 { icon:' ', name:'Gratitude exercise', desc:'List 3 things you\'re grateful for today — an instant happiness boost.'},
 { icon:' ', name:'Body scan', desc:'10 minutes scanning from head to toe — reduces stress and reconnects you with your body.'},
 { icon:' ', name:'5-minute rule', desc:'If a task takes less than 5 minutes, do it now. Breaks procrastination.'},
 { icon:' ', name:'CBT question', desc:'What evidence supports this thought? What evidence is against it? What\'s more likely?'},
 { icon:' ', name:'Morning routine', desc:'15 min sunlight + water + movement = a day with more energy and less anxiety.'},
 ]
 return (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
 {tools.map((tool, i) => (
 <Card key={i} hover style={{ padding: 20 }}>
 <div style={{ fontSize: 32, marginBottom: 10 }}>{tool.icon}</div>
 <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 6 }}>{tool.name}</div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.6 }}>{tool.desc}</div>
 </Card>
 ))}
 </div>
 )
}
