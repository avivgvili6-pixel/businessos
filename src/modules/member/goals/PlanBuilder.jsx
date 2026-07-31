import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge } from '../../../components/ui/UI'
import { programs, KEY_LIFTS, computeWeight } from '../../../data/programs'
import { dietTemplates as DIET_TEMPLATES } from '../../../utils/calc'

// The Bridge: after user has a goal, build them a full holistic plan in
// 3 clean steps. Keep it SIMPLE - big cards, few questions per step.
// Order: Workouts → Nutrition → Mental (short) → Adopt everything

const WORKOUT_STYLES = [
  {
    id: 'bodybuilding', icon: '💪', label: 'בודיבילדינג',
    subtitle: 'מסת שריר, מראה חטוב, נפח גבוה',
    programId: 'ppl_hypertrophy', color: '#c8a84b',
  },
  {
    id: 'powerlifting', icon: '🏋️', label: 'כוח מירבי',
    subtitle: 'סקוואט, בנץ, דדליפט - שיאים חדשים',
    programId: 'wendler_531', color: '#e05a5a',
  },
  {
    id: 'crossfit', icon: '🔥', label: 'CrossFit',
    subtitle: 'MetCon, אינטנסיבי, מגוון',
    programId: 'crossfit_wods', color: '#e0a05a',
  },
  {
    id: 'bodyweight', icon: '🤸', label: 'משקל גוף',
    subtitle: 'בבית, ללא ציוד, מתחילים',
    programId: 'stronglifts_5x5', color: '#5ac889',
  },
]

const DAYS_OPTIONS = [
  { v: 2, label: '2 ימים', hint: 'התחלה קלה' },
  { v: 3, label: '3 ימים', hint: 'מומלץ למתחילים', rec: true },
  { v: 4, label: '4 ימים', hint: 'ביניים' },
  { v: 5, label: '5 ימים', hint: 'רציני' },
]

const LOCATIONS = [
  { v: 'gym', icon: '🏋️', label: 'חדר כושר', hint: 'ציוד מלא' },
  { v: 'home', icon: '🏠', label: 'בבית', hint: 'מוגבל בציוד' },
  { v: 'outdoor', icon: '🌳', label: 'בחוץ', hint: 'פארק/רחוב' },
]

const DIET_STYLES = [
  { v: 'balanced', icon: '🍽', label: 'מגוון', hint: 'הכל בסדר, מאוזן' },
  { v: 'high_protein', icon: '🥩', label: 'עתיר חלבון', hint: 'לבניית שריר / חיטוב', rec: true },
  { v: 'mediterranean', icon: '🥗', label: 'ים-תיכוני', hint: 'הכי בריא מדעית' },
  { v: 'low_carb', icon: '🥑', label: 'דל פחמימות', hint: 'לירידה במשקל' },
  { v: 'vegetarian', icon: '🌱', label: 'צמחוני', hint: 'ללא בשר ודגים' },
  { v: 'vegan', icon: '🌿', label: 'טבעוני', hint: 'ללא מוצרים מן החי' },
]

const MEALS_OPTIONS = [
  { v: 3, label: '3 ארוחות', hint: 'קלאסי' },
  { v: 4, label: '4 ארוחות', hint: 'עם נשנוש', rec: true },
  { v: 5, label: '5 ארוחות', hint: 'ארוחות קטנות' },
]

const COOKING_OPTIONS = [
  { v: 'cook', icon: '👨‍🍳', label: 'מבשל בבית', hint: 'שליטה מלאה' },
  { v: 'ready', icon: '📦', label: 'מוכן/משלוחים', hint: 'מהיר' },
  { v: 'mix', icon: '🔄', label: 'משולב', hint: 'גמיש', rec: true },
]

const BLOCKERS = [
  '⏰ אין זמן',
  '🔥 מוטיבציה נעלמת',
  '👥 חברים מפילים',
  '😴 עייף מהעבודה',
  '🌀 דחיינות',
  '❓ לא יודע מאיפה להתחיל',
]

const STRENGTHS = [
  '🎯 ממוקד במטרה',
  '📅 עקבי כשמתחיל',
  '💪 חזק פיזית',
  '📝 אוהב תכנון',
  '🤝 יש לי תמיכה בבית',
  '⚡ אנרגטי מטבעי',
]

// ─── Main component ────────────────────────────────────
export function PlanBuilder({ onDone, onCancel }) {
  const { setPlan, updateProfile, addHabit } = useApp()
  const [step, setStep] = useState(0) // 0..3 (3 steps + review)
  const [error, setError] = useState(null)
  const [choices, setChoices] = useState({
    workoutStyle: null, workoutDays: null, location: null,
    dietStyle: null, meals: null, cooking: null,
    blockers: [], strengths: [],
  })

  const set = (patch) => { setChoices(c => ({ ...c, ...patch })); setError(null) }
  const goNext = () => {
    const missing = missingFields(step, choices)
    if (missing.length) {
      setError(`כדי להמשיך צריך להשלים: ${missing.join(' · ')}`)
      return
    }
    setError(null)
    setStep(s => Math.min(3, s + 1))
  }
  const goBack = () => { setError(null); setStep(s => Math.max(0, s - 1)) }

  const adopt = () => {
    // Adopt workout plan
    const chosenStyle = WORKOUT_STYLES.find(s => s.id === choices.workoutStyle)
    if (chosenStyle) {
      const prog = programs[chosenStyle.programId]
      if (prog) {
        setPlan({
          name: prog.label,
          programId: prog.id,
          split: prog.schema,
          days: prog.daysPerWeek,
          weeks: prog.duration,
          currentWeek: 1,
          sessions: prog.sessions.map(s => ({
            name: s.name,
            wodType: s.wodType,
            prescription: s.prescription,
            exercises: (s.blocks || []).map(b => ({
              id: b.lift || b.name,
              name: b.lift ? KEY_LIFTS[b.lift]?.label : b.name,
              sets: b.sets || 1,
              reps: b.reps || 8,
              intensity: b.intensity,
              format: b.format,
              prescription: b.prescription,
            })),
          })),
          createdAt: new Date().toISOString(),
        })
      }
    }
    // Adopt diet
    if (choices.dietStyle) updateProfile({ dietKey: choices.dietStyle })

    // Add mental habits based on blockers/strengths
    const habitId = 'daily-checkin-' + Date.now()
    addHabit({
      id: habitId,
      name: 'Check-in יומי של 30 שניות',
      icon: '📝',
      streak: 0,
      doneToday: false,
    })

    onDone?.()
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Header */}
      <Card style={{ background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 22 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {['אימונים', 'תזונה', 'מנטלי', 'סיכום'].map((label, i) => (
            <div key={i} style={{
              flex: 1, padding: 8, textAlign: 'center',
              background: i === step ? t.color.gold : i < step ? t.color.goldGlow : t.color.bgSoft,
              color: i === step ? '#0d0d14' : i < step ? t.color.gold : t.color.textDim,
              borderRadius: t.radius.sm, fontSize: t.font.xs, fontWeight: 700,
            }}>
              {i + 1}. {label}
            </div>
          ))}
        </div>
        <div style={{ fontSize: t.font.md, color: t.color.textDim, textAlign: 'center' }}>
          {['בואי נבחר לך את סגנון האימון המתאים', 'עכשיו נסדר את התזונה שתשרת את המטרה', 'רק 2 שאלות קצרות - כדי להתאים את המעטפת', 'הכל מוכן - סקירה אחרונה ואישור'][step]}
        </div>
      </Card>

      {/* Step content */}
      {step === 0 && <StepWorkout choices={choices} set={set} />}
      {step === 1 && <StepNutrition choices={choices} set={set} />}
      {step === 2 && <StepMental choices={choices} set={set} />}
      {step === 3 && <StepReview choices={choices} />}

      {/* Inline error - what's missing */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: `${t.color.warning}15`,
          border: `1px solid ${t.color.warning}`,
          borderRadius: t.radius.md,
          color: t.color.warning,
          fontSize: t.font.sm,
          fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <Button variant="ghost" onClick={step === 0 ? onCancel : goBack}>
          {step === 0 ? 'בטל' : '→ חזור'}
        </Button>
        {step < 3 ? (
          <Button onClick={goNext}>המשך ←</Button>
        ) : (
          <Button onClick={adopt} size="lg" icon="🚀">אמץ הכל וצא לדרך!</Button>
        )}
      </div>
    </div>
  )
}

// Returns list of missing-field labels for the current step
function missingFields(step, c) {
  if (step === 0) {
    const miss = []
    if (!c.workoutStyle) miss.push('סגנון אימון')
    if (!c.workoutDays) miss.push('כמה ימים בשבוע')
    if (!c.location) miss.push('איפה מתאמנים')
    return miss
  }
  if (step === 1) {
    const miss = []
    if (!c.dietStyle) miss.push('סוג תזונה')
    if (!c.meals) miss.push('כמה ארוחות')
    if (!c.cooking) miss.push('בישול')
    return miss
  }
  if (step === 2) {
    const miss = []
    if (!c.blockers.length) miss.push('לפחות חסם אחד')
    if (!c.strengths.length) miss.push('לפחות חוזקה אחת')
    return miss
  }
  return []
}

// ─── Step 1: Workout ────────────────────────
function StepWorkout({ choices, set }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <QuestionBlock title="איזה סגנון אימון מתאים לך?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {WORKOUT_STYLES.map(s => (
            <BigCard key={s.id} active={choices.workoutStyle === s.id} onClick={() => set({ workoutStyle: s.id })}
              icon={s.icon} label={s.label} sub={s.subtitle} accent={s.color} />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock title="כמה ימים בשבוע ריאלי לך?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {DAYS_OPTIONS.map(o => (
            <PillCard key={o.v} active={choices.workoutDays === o.v} onClick={() => set({ workoutDays: o.v })} label={o.label} hint={o.hint} rec={o.rec} />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock title="איפה תתאמן ברוב הזמן?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {LOCATIONS.map(o => (
            <PillCard key={o.v} active={choices.location === o.v} onClick={() => set({ location: o.v })} icon={o.icon} label={o.label} hint={o.hint} />
          ))}
        </div>
      </QuestionBlock>
    </div>
  )
}

// ─── Step 2: Nutrition ────────────────────────
function StepNutrition({ choices, set }) {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <QuestionBlock title="מה סגנון האכילה שלך?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          {DIET_STYLES.map(o => (
            <BigCard key={o.v} active={choices.dietStyle === o.v} onClick={() => set({ dietStyle: o.v })}
              icon={o.icon} label={o.label} sub={o.hint} rec={o.rec} />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock title="כמה ארוחות ביום נוח לך?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {MEALS_OPTIONS.map(o => (
            <PillCard key={o.v} active={choices.meals === o.v} onClick={() => set({ meals: o.v })} label={o.label} hint={o.hint} rec={o.rec} />
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock title="איך אתה מכין את האוכל?">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {COOKING_OPTIONS.map(o => (
            <PillCard key={o.v} active={choices.cooking === o.v} onClick={() => set({ cooking: o.v })} icon={o.icon} label={o.label} hint={o.hint} rec={o.rec} />
          ))}
        </div>
      </QuestionBlock>
    </div>
  )
}

// ─── Step 3: Mental (SIMPLE - just 2 chip questions) ────────────
function StepMental({ choices, set }) {
  const toggleChip = (list, key, item) => {
    const cur = choices[key] || []
    if (cur.includes(item)) set({ [key]: cur.filter(x => x !== item) })
    else set({ [key]: [...cur, item] })
  }
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <QuestionBlock title="מה הכי מפיל אותך?" subtitle="בחר/י כמה שרלוונטי - נכין הרגלים נגד המכשולים">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BLOCKERS.map(item => (
            <ChipToggle key={item} active={choices.blockers.includes(item)} onClick={() => toggleChip(BLOCKERS, 'blockers', item)}>{item}</ChipToggle>
          ))}
        </div>
      </QuestionBlock>

      <QuestionBlock title="מה החוזקה הכי גדולה שלך?" subtitle="בחר/י מה נכון לך - נעצים את מה שכבר עובד">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STRENGTHS.map(item => (
            <ChipToggle key={item} active={choices.strengths.includes(item)} onClick={() => toggleChip(STRENGTHS, 'strengths', item)}>{item}</ChipToggle>
          ))}
        </div>
      </QuestionBlock>

      <Card style={{ padding: 16, background: t.color.bgSoft, textAlign: 'center' }}>
        <div style={{ fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.6 }}>
          💡 המעטפת המנטלית נשמרת פשוטה - הרגל יומי אחד של Check-in של 30 שניות.<br />
          לשיחות עמוקות יותר תמיד יש את <b style={{ color: t.color.gold }}>המאמן המנטלי</b> בתפריט.
        </div>
      </Card>
    </div>
  )
}

// ─── Step 4: Review + Adopt ────────────────────────
function StepReview({ choices }) {
  const workoutStyle = WORKOUT_STYLES.find(s => s.id === choices.workoutStyle)
  const prog = workoutStyle && programs[workoutStyle.programId]
  const diet = DIET_STYLES.find(o => o.v === choices.dietStyle)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card style={{ padding: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>הכל מוכן</h2>
        <div style={{ color: t.color.textDim, fontSize: t.font.md, maxWidth: 460, margin: '0 auto' }}>
          לחץ למטה כדי לאמץ את התכנית ההוליסטית. הכל יתעדכן בפרופיל שלך ותקבל צעד ראשון להתחיל.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="hfos-plan-grid">
        <SummaryCard color={t.color.gold} icon="💪" title="אימונים">
          <div style={{ fontWeight: 700, fontSize: t.font.md }}>{prog?.label || workoutStyle?.label}</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{choices.workoutDays} ימים בשבוע · {locationLabel(choices.location)}</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 6, lineHeight: 1.5 }}>{prog?.description?.slice(0, 100)}...</div>
        </SummaryCard>

        <SummaryCard color={t.color.info} icon="🥗" title="תזונה">
          <div style={{ fontWeight: 700, fontSize: t.font.md }}>{DIET_TEMPLATES[choices.dietStyle]?.label || diet?.label}</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{choices.meals} ארוחות ביום · {cookingLabel(choices.cooking)}</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 6 }}>
            יעדי מקרו יחושבו אוטומטית לפי הפרופיל שלך
          </div>
        </SummaryCard>

        <SummaryCard color={t.color.success} icon="🧠" title="מנטלי">
          <div style={{ fontWeight: 700, fontSize: t.font.md }}>Check-in יומי</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>30 שניות ביום</div>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {choices.blockers.slice(0, 3).map(b => <MiniPill key={b}>{b}</MiniPill>)}
          </div>
        </SummaryCard>
      </div>

      <Card style={{ padding: 16, background: t.color.goldGlow, border: `1px solid ${t.color.gold}` }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 22 }}>🎯</div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4, color: t.color.gold }}>הצעד הראשון שלך</div>
            <div style={{ fontSize: t.font.sm, lineHeight: 1.5 }}>
              אחרי אימוץ, עבור ל<b>אימונים → התכנית שלי</b> ולחץ על האימון הראשון. יש 5 סקוואטים שמחכים לך 💪
            </div>
          </div>
        </div>
      </Card>
      <style>{`@media (max-width: 800px) { .hfos-plan-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

// ─── Small UI helpers ────────────────────────
function QuestionBlock({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: t.font.lg, fontWeight: 800, marginBottom: 2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

function BigCard({ active, onClick, icon, label, sub, accent, rec }) {
  return (
    <button onClick={onClick} style={{
      padding: 18, background: active ? t.color.goldGlow : t.color.bgSoft,
      border: `1px solid ${active ? (accent || t.color.gold) : t.color.border}`,
      borderRadius: t.radius.md, cursor: 'pointer', textAlign: 'right',
      color: t.color.text, fontFamily: 'inherit',
      transition: t.transition, position: 'relative',
    }}>
      {rec && <div style={{
        position: 'absolute', top: 8, left: 8,
        background: t.color.gold, color: '#0d0d14', fontSize: 9, letterSpacing: 0.5,
        padding: '2px 8px', borderRadius: 999, fontWeight: 800,
      }}>מומלץ</div>}
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: t.font.md, marginBottom: 4, color: active ? (accent || t.color.gold) : t.color.text }}>{label}</div>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.4 }}>{sub}</div>
    </button>
  )
}

function PillCard({ active, onClick, icon, label, hint, rec }) {
  return (
    <button onClick={onClick} style={{
      padding: 14, background: active ? t.color.goldGlow : t.color.bgSoft,
      border: `1px solid ${active ? t.color.gold : t.color.border}`,
      borderRadius: t.radius.md, cursor: 'pointer', textAlign: 'right',
      color: active ? t.color.gold : t.color.text,
      fontFamily: 'inherit', transition: t.transition, position: 'relative',
    }}>
      {rec && <div style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, color: t.color.gold, fontWeight: 700 }}>★</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <div>
          <div style={{ fontWeight: 700, fontSize: t.font.md }}>{label}</div>
          <div style={{ fontSize: t.font.xs, color: active ? t.color.gold : t.color.textDim, opacity: 0.8 }}>{hint}</div>
        </div>
      </div>
    </button>
  )
}

function ChipToggle({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 16px', background: active ? t.color.gold : t.color.bgSoft,
      border: `1px solid ${active ? t.color.gold : t.color.border}`,
      color: active ? '#0d0d14' : t.color.text,
      borderRadius: t.radius.pill, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: t.font.sm, fontWeight: 600, transition: t.transition,
    }}>{children}</button>
  )
}

function SummaryCard({ color, icon, title, children }) {
  return (
    <Card style={{ padding: 18, borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ fontWeight: 700, color }}>{title}</div>
      </div>
      {children}
    </Card>
  )
}

function MiniPill({ children }) {
  return <span style={{
    fontSize: 10, padding: '2px 6px', background: t.color.bgSoft,
    border: `1px solid ${t.color.border}`, borderRadius: 999, color: t.color.textDim,
  }}>{children}</span>
}

function locationLabel(v) { return ({ gym: 'חדר כושר', home: 'בבית', outdoor: 'בחוץ' })[v] || v }
function cookingLabel(v) { return ({ cook: 'מבשל', ready: 'מוכן', mix: 'משולב' })[v] || v }
