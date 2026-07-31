import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Badge, SectionHeader, Tabs, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'

const MOOD_EMOJI = ['😞','😔','😐','🙂','😊','😄','🤩']
const CBT_PROMPTS = [
  'מה המחשבה המטרידה ביותר שלך היום?',
  'איזה עדות יש שהמחשבה הזו לא לגמרי מדויקת?',
  'איך היית מייעץ לחבר טוב במצב הזה?',
  'מה הצעד הקטן ביותר שיזיז אותך קדימה השבוע?',
  'למה אתה אסיר תודה היום?',
]

export function Mind() {
  const [tab, setTab] = useState('checkin')
  return (
    <>
      <Tabs tabs={[
        { key:'checkin', label:'Check-in יומי' },
        { key:'journal', label:'יומן' },
        { key:'patterns',label:'דפוסים' },
        { key:'tools',   label:'כלים' },
      ]} active={tab} onChange={setTab} />
      {tab === 'checkin' && <CheckIn />}
      {tab === 'journal' && <Journal />}
      {tab === 'patterns' && <Patterns />}
      {tab === 'tools' && <Tools />}
    </>
  )
}

function CheckIn() {
  const { state, addCheckin } = useApp()
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
        <SectionHeader title="איך אתה מרגיש היום?" subtitle="Check-in של 30 שניות שעוזר למנוע לזהות דפוסים" />
        <div style={{ display:'grid', gap: 20 }}>
          <SliderMood label="מצב רוח" value={mood} onChange={setMood} emojiScale />
          <Slider label="רמת אנרגיה" value={energy} onChange={setEnergy} />
          <Slider label="רמת סטרס" value={stress} onChange={setStress} inverse />
          <Slider label="שעות שינה אמש" value={sleep} onChange={setSleep} min={3} max={12} unit="ש׳" />
          <Input label="מה על הלב? (אופציונלי)" placeholder="שיתוף חופשי..." value={note} onChange={e => setNote(e.target.value)} />
          <Button onClick={submit} icon="✓">שמור Check-in</Button>
        </div>
      </Card>

      {state.moodCheckins.length > 0 && (
        <Card>
          <SectionHeader title="מגמות אחרונות" subtitle={`${state.moodCheckins.length} check-ins`} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <MiniTrend label="מצב רוח" data={state.moodCheckins.slice(0, 14).map(c => c.mood).reverse()} color={t.color.gold} />
            <MiniTrend label="אנרגיה" data={state.moodCheckins.slice(0, 14).map(c => c.energy).reverse()} color={t.color.success} />
            <MiniTrend label="סטרס" data={state.moodCheckins.slice(0, 14).map(c => c.stress).reverse()} color={t.color.warning} />
            <MiniTrend label="שינה" data={state.moodCheckins.slice(0, 14).map(c => c.sleepHours).reverse()} color={t.color.info} />
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
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={{ width:'100%' }} />
    </div>
  )
}

function SliderMood({ label, value, onChange }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
        <span style={{ color: t.color.textDim, fontSize: t.font.sm }}>{label}</span>
        <span style={{ fontSize: 24 }}>{MOOD_EMOJI[Math.floor((value/10)*6)] || '🙂'}</span>
      </div>
      <input type="range" min={0} max={10} value={value} onChange={e => onChange(+e.target.value)} style={{ width:'100%' }} />
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
  const [text, setText] = useState('')
  const prompt = CBT_PROMPTS[Math.floor(Math.random() * CBT_PROMPTS.length)]

  const entries = state.moodCheckins.filter(c => c.note && c.note.length > 0)

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <Badge>💭 שאלה מנחה</Badge>
        <div style={{ marginTop: 12, fontSize: t.font.lg, fontWeight: 600, marginBottom: 14 }}>{prompt}</div>
        <Input placeholder="כתוב את המחשבות שלך..." value={text} onChange={e => setText(e.target.value)} />
        <div style={{ marginTop: 12, textAlign: 'left' }}>
          <Button onClick={() => { addCheckin({ date: new Date().toISOString(), mood:7, energy:7, stress:4, sleepHours:7, note: text }); setText('') }}>שמור רשומה</Button>
        </div>
      </Card>
      <Card>
        <SectionHeader title="רשומות קודמות" />
        {!entries.length && <EmptyState icon="📓" title="עדיין אין רשומות" subtitle="כתיבה של 5 דקות ביום מזיזה הרים" />}
        <div style={{ display:'grid', gap: 8 }}>
          {entries.slice(0, 20).map((c, i) => (
            <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6 }}>{new Date(c.date).toLocaleDateString('he-IL')}</div>
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
  const insights = useMemo(() => generateInsights(state), [state])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader title="דפוסים שזוהו" subtitle="המנוע מחפש קורלציות בין שינה, מצב-רוח, תזונה וביצועים" />
        {insights.length === 0
          ? <EmptyState icon="🔬" title="עדיין מוקדם לזהות דפוסים" subtitle="הוסף לפחות 7 check-ins כדי לקבל תובנות" />
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

function generateInsights(state) {
  const cs = state.moodCheckins
  const out = []
  if (cs.length >= 3) {
    const avgMood = cs.slice(0, 7).reduce((s, c) => s + c.mood, 0) / Math.min(7, cs.length)
    if (avgMood < 5) out.push({ tag: '⚠ מצב-רוח', color: t.color.warning, text: `ממוצע מצב-רוח שבועי: ${avgMood.toFixed(1)}/10. שקול לפנות למאמן מנטלי, ולוודא 7-9 שעות שינה איכותיות.` })
    else if (avgMood >= 7.5) out.push({ tag: '✓ מצב-רוח מעולה', color: t.color.success, text: `אתה במומנטום נהדר - ${avgMood.toFixed(1)}/10 השבוע. שמור על השגרה!` })

    const avgSleep = cs.slice(0, 7).reduce((s, c) => s + (c.sleepHours || 7), 0) / Math.min(7, cs.length)
    if (avgSleep < 6.5) out.push({ tag: '💤 שינה נמוכה', color: t.color.danger, text: `שינה ממוצעת: ${avgSleep.toFixed(1)}ש׳. זה משפיע ישירות על הביצועים שלך באימון ועל מצב הרוח. יעד: 7-9 שעות.` })
  }
  const wk = state.workoutLogs.filter(l => new Date(l.date) >= new Date(Date.now() - 7*24*3600*1000)).length
  if (wk >= 4 && cs[0]?.mood >= 7) out.push({ tag: '💪 קשר אימון-מצב-רוח', color: t.color.gold, text: 'זיהינו קורלציה חיובית בין תדירות האימונים למצב הרוח שלך השבוע. תמשיך!' })

  return out
}

function Tools() {
  const tools = [
    { icon:'🌬️', name:'נשימת 4-7-8', desc:'שאיפה 4 שניות, החזקה 7, נשיפה 8. מרגיע את המערכת האוטונומית תוך דקה.' },
    { icon:'📝', name:'תרגיל תודה', desc:'רשום 3 דברים שאתה אסיר תודה עליהם היום - מגדיל אושר מיידית.' },
    { icon:'🧘', name:'סריקת גוף', desc:'10 דקות סריקה מהראש לרגליים - מוריד סטרס ומחזיר קשר לגוף.' },
    { icon:'🎯', name:'כלל 5 דקות', desc:'אם משימה לוקחת פחות מ-5 דקות, עשה אותה עכשיו. מפרק דחיינות.' },
    { icon:'💭', name:'שאלת CBT', desc:'איזה עדות יש שהמחשבה הזו מדויקת? איזה עדות נגד? מה סביר יותר?' },
    { icon:'☀️', name:'שגרת בוקר', desc:'15 דק׳ אור שמש + מים + תנועה = יום עם יותר אנרגיה ופחות חרדה.' },
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
