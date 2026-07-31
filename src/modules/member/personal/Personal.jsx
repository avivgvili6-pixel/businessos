import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { useAuth } from '../../../auth/AuthContext'
import { Card, Button, Input, Select, Badge, SectionHeader } from '../../../components/ui/UI'

const COACH_EMAIL = 'israelgrip@gmail.com'

const LEVELS = ['מתחיל (עד שנה ניסיון)', 'בינוני (1-3 שנים)', 'מתקדם (3+ שנים)', 'אתלט תחרותי']
const GOAL_OPTIONS = [
  'ירידה במשקל', 'בניית מסת שריר', 'חיטוב וחטיבה',
  'שיפור כוח מירבי', 'שיפור סבולת', 'שיקום מפציעה',
  'הכנה לתחרות', 'בריאות כללית', 'תזונה נכונה',
]
const TIME_OPTIONS = [
  'בוקר (6:00-10:00)', 'צהריים (10:00-14:00)',
  'אחה"צ (14:00-18:00)', 'ערב (18:00-22:00)', 'גמיש',
]
const FREQUENCY = ['פעם בשבוע', 'פעמיים בשבוע', '3 פעמים בשבוע', '4+ פעמים בשבוע']
const FORMATS = [
  { v: 'in_person', icon: '🏋️', label: 'אימון פרונטלי' },
  { v: 'online',    icon: '💻', label: 'ליווי אונליין' },
  { v: 'hybrid',    icon: '🔀', label: 'משולב' },
]

export function Personal() {
  const { user } = useAuth()
  const { state, addTrainingRequest } = useApp()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [f, setF] = useState({
    name: user?.name || '', phone: '', email: user?.email || '',
    age: state.profile?.age || '', level: '',
    goals: [], injuries: '', currentActivity: '',
    format: '', frequency: '', timePref: [],
    whyNow: '', notes: '',
  })

  const set = (patch) => { setF(x => ({ ...x, ...patch })); setError(null) }
  const toggleArr = (key, val) => set({ [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] })

  const missing = () => {
    const m = []
    if (!f.name.trim()) m.push('שם')
    if (!f.phone.trim()) m.push('טלפון')
    if (!f.email.trim()) m.push('אימייל')
    if (!f.level) m.push('רמת ניסיון')
    if (f.goals.length === 0) m.push('לפחות מטרה אחת')
    if (!f.format) m.push('פורמט אימון')
    if (!f.frequency) m.push('תדירות')
    if (f.timePref.length === 0) m.push('לפחות זמן אחד')
    if (!f.whyNow.trim()) m.push('למה עכשיו')
    return m
  }

  const submit = () => {
    const m = missing()
    if (m.length) {
      setError(`חסר: ${m.join(' · ')}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const request = {
      id: 'req_' + Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'new',
      ...f,
    }
    addTrainingRequest(request)
    openMail(request)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openMail = (req) => {
    const body = [
      `בקשה חדשה לאימון אישי מאפליקציית סלנו`,
      ``, `📋 פרטים:`,
      `שם: ${req.name}`,
      `טלפון: ${req.phone}`,
      `אימייל: ${req.email}`,
      `גיל: ${req.age || '—'}`,
      `רמת ניסיון: ${req.level}`,
      ``, `🎯 מטרות: ${req.goals.join(', ')}`,
      req.injuries ? `🩹 פציעות/מגבלות: ${req.injuries}` : '',
      req.currentActivity ? `💪 פעילות נוכחית: ${req.currentActivity}` : '',
      ``, `📅 פורמט: ${FORMATS.find(x => x.v === req.format)?.label || req.format}`,
      `תדירות: ${req.frequency}`,
      `זמנים מועדפים: ${req.timePref.join(', ')}`,
      ``, `❤️ למה עכשיו: ${req.whyNow}`,
      req.notes ? `📝 הערות: ${req.notes}` : '',
      ``, `נשלח: ${new Date(req.submittedAt).toLocaleString('he-IL')}`,
    ].filter(Boolean).join('\n')
    const subject = `בקשת אימון אישי: ${req.name}`
    window.location.href = `mailto:${COACH_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (submitted) {
    return (
      <Card style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 10 }}>הבקשה נשלחה בהצלחה!</h2>
        <p style={{ color: t.color.textDim, fontSize: t.font.md, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 20px' }}>
          אם המייל שלך לא נפתח אוטומטית — הבקשה נשמרה במערכת ואנחנו נחזור אליך תוך 24 שעות.
        </p>
        <Button onClick={() => { setSubmitted(false); setF({ ...f, name: '', phone: '', goals: [], timePref: [] }) }}>שליחת בקשה נוספת</Button>
      </Card>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Hero */}
      <Card style={{ padding: 24, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 180, height: 180, background: t.color.goldGlow, borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Badge color={t.color.gold}>💼 קביעת אימון אישי</Badge>
          <h1 style={{ fontSize: t.font.hero, fontWeight: 900, marginTop: 10, marginBottom: 6 }}>מוכן לצעד הבא?</h1>
          <p style={{ color: t.color.textDim, fontSize: t.font.md, maxWidth: 500, lineHeight: 1.5 }}>
            מלא את השאלון הקצר ונחזור אליך תוך 24 שעות עם הצעה מותאמת אישית - פורמט, מחיר, ולוח זמנים.
          </p>
        </div>
      </Card>

      {error && (
        <Card style={{ padding: 14, background: `${t.color.warning}15`, border: `1px solid ${t.color.warning}` }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: t.color.warning, fontWeight: 700 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Personal details */}
      <Card>
        <SectionHeader title="פרטים אישיים" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="hfos-form-grid">
          <Input label="שם מלא *" value={f.name} onChange={e => set({ name: e.target.value })} />
          <Input label="טלפון *" value={f.phone} onChange={e => set({ phone: e.target.value })} placeholder="050-1234567" />
          <Input label="אימייל *" value={f.email} onChange={e => set({ email: e.target.value })} placeholder="you@example.com" />
          <Input label="גיל" type="number" value={f.age} onChange={e => set({ age: e.target.value })} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Select label="רמת ניסיון *" value={f.level} onChange={e => set({ level: e.target.value })}>
            <option value="">בחר רמה</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
        </div>
      </Card>

      {/* Goals */}
      <Card>
        <SectionHeader title="מטרות *" subtitle="בחר את המטרות העיקריות שלך" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {GOAL_OPTIONS.map(g => {
            const active = f.goals.includes(g)
            return (
              <button key={g} onClick={() => toggleArr('goals', g)} style={{
                padding: '8px 14px', borderRadius: 999,
                background: active ? t.color.gold : t.color.bgSoft,
                color: active ? '#0d0d14' : t.color.text,
                border: `1px solid ${active ? t.color.gold : t.color.border}`,
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: t.font.sm,
              }}>{g}</button>
            )
          })}
        </div>
      </Card>

      {/* Injuries + activity */}
      <Card>
        <SectionHeader title="מצב גופני נוכחי" />
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <Input label="פעילות גופנית נוכחית" value={f.currentActivity} onChange={e => set({ currentActivity: e.target.value })} placeholder="למשל: 2 אימונים בשבוע בחדר כושר, ריצה בסופ״ש" />
          <Input label="פציעות / מגבלות רפואיות" value={f.injuries} onChange={e => set({ injuries: e.target.value })} placeholder="ריק אם אין" />
        </div>
      </Card>

      {/* Format */}
      <Card>
        <SectionHeader title="פורמט אימון *" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }} className="hfos-format-grid">
          {FORMATS.map(fmt => {
            const active = f.format === fmt.v
            return (
              <button key={fmt.v} onClick={() => set({ format: fmt.v })} style={{
                padding: 16, borderRadius: t.radius.md,
                background: active ? t.color.goldGlow : t.color.bgSoft,
                border: `1px solid ${active ? t.color.gold : t.color.border}`,
                color: active ? t.color.gold : t.color.text,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
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
        <SectionHeader title="תדירות *" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {FREQUENCY.map(fr => {
            const active = f.frequency === fr
            return (
              <button key={fr} onClick={() => set({ frequency: fr })} style={{
                padding: '10px 16px', borderRadius: 999,
                background: active ? t.color.gold : t.color.bgSoft,
                color: active ? '#0d0d14' : t.color.text,
                border: `1px solid ${active ? t.color.gold : t.color.border}`,
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: t.font.sm,
              }}>{fr}</button>
            )
          })}
        </div>
      </Card>

      {/* Time preference */}
      <Card>
        <SectionHeader title="זמנים מועדפים *" subtitle="ניתן לבחור יותר מאחד" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {TIME_OPTIONS.map(tm => {
            const active = f.timePref.includes(tm)
            return (
              <button key={tm} onClick={() => toggleArr('timePref', tm)} style={{
                padding: '10px 14px', borderRadius: 999,
                background: active ? t.color.gold : t.color.bgSoft,
                color: active ? '#0d0d14' : t.color.text,
                border: `1px solid ${active ? t.color.gold : t.color.border}`,
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: t.font.sm,
              }}>{tm}</button>
            )
          })}
        </div>
      </Card>

      {/* Why now + notes */}
      <Card>
        <SectionHeader title="למה עכשיו? *" subtitle="ספר קצת על עצמך והמוטיבציה" />
        <textarea
          value={f.whyNow}
          onChange={e => set({ whyNow: e.target.value })}
          placeholder="למשל: 'רוצה להיות בכושר לחתונה שלי בעוד 4 חודשים' או 'אחרי לידה, רוצה לחזור לכושר בצורה מודרכת'"
          rows={4}
          style={{
            width: '100%', padding: 12, background: t.color.bgSoft,
            border: `1px solid ${t.color.border}`, borderRadius: t.radius.md,
            color: t.color.text, fontFamily: 'inherit', fontSize: t.font.sm,
            marginTop: 12, resize: 'vertical', direction: 'rtl',
          }}
        />
        <div style={{ marginTop: 12 }}>
          <Input label="הערות נוספות" value={f.notes} onChange={e => set({ notes: e.target.value })} placeholder="משהו שחשוב לנו לדעת?" />
        </div>
      </Card>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="lg" icon="✉️" onClick={submit}>שלח בקשה</Button>
      </div>

      <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.xs, color: t.color.textDim, textAlign: 'center', lineHeight: 1.6 }}>
        🔒 הפרטים נשמרים אצלנו בלבד. הבקשה תישלח למייל של המאמן ({COACH_EMAIL}).
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
