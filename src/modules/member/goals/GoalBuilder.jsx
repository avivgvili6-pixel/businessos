import React, { useState, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Badge, SectionHeader } from '../../../components/ui/UI'
import {
  DIRECTIONS, GOAL_TEMPLATES, COACHING_ROUNDS,
  WHY_PROMPTS, COMMON_BARRIERS, templateToGoal,
} from '../../../data/goals'

// Wizard-style goal builder. Two entry paths:
//   1. Direction-first (user knows what they want)
//   2. "לא בטוח" - coaching flow with clarifying questions
//
// Ends with a fully-populated SMART goal object saved to state.

export function GoalBuilder({ onDone, embedded = false }) {
  const { setGoal } = useApp()
  const [phase, setPhase] = useState('start') // start | direction | template | why | barriers | weekly | review | coaching
  const [direction, setDirection] = useState(null)
  const [template, setTemplate] = useState(null)
  const [customTarget, setCustomTarget] = useState('')
  const [customWeeks, setCustomWeeks] = useState('')
  const [why, setWhy] = useState('')
  const [barriers, setBarriers] = useState([])
  const [weeklyActions, setWeeklyActions] = useState([])
  const [coachingIdx, setCoachingIdx] = useState(0)
  const [coachingAnswers, setCoachingAnswers] = useState([])

  const commit = () => {
    if (!template) return
    const finalTemplate = {
      ...template,
      weeks: +customWeeks || template.weeks,
      target: customTarget && !isNaN(+customTarget) ? +customTarget : template.target,
      delta: customTarget && !isNaN(+customTarget) && template.delta != null ? +customTarget : template.delta,
    }
    const goal = templateToGoal(finalTemplate, {
      direction: direction?.id,
      why,
      barriers,
      weeklyActions,
    })
    setGoal(goal)
    onDone?.(goal)
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      {!embedded && phase !== 'start' && (
        <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 20 }}>
          <Stepper phase={phase} />
        </Card>
      )}

      {phase === 'start'     && <PhaseStart onPickDirect={() => setPhase('direction')} onPickCoaching={() => { setPhase('coaching'); setCoachingIdx(0); setCoachingAnswers([]) }} />}
      {phase === 'coaching'  && <PhaseCoaching idx={coachingIdx} answers={coachingAnswers}
        onAnswer={(ans) => {
          const next = [...coachingAnswers, ans]
          setCoachingAnswers(next)
          if (coachingIdx + 1 < COACHING_ROUNDS.length) setCoachingIdx(coachingIdx + 1)
          else {
            // Determine direction from first-round nudge
            const suggested = next[0]?.nudge
            const dir = DIRECTIONS.find(d => d.id === suggested) || DIRECTIONS[0]
            setDirection(dir)
            setPhase('template')
          }
        }}
        onBack={() => coachingIdx > 0 ? setCoachingIdx(coachingIdx - 1) : setPhase('start')}
      />}
      {phase === 'direction' && <PhaseDirection onPick={(d) => { setDirection(d); setPhase('template') }} onBack={() => setPhase('start')} />}
      {phase === 'template'  && <PhaseTemplate direction={direction} onPick={(tmpl) => { setTemplate(tmpl); setCustomWeeks(String(tmpl.weeks)); setPhase('why') }} onBack={() => setPhase('direction')} />}
      {phase === 'why'       && <PhaseWhy why={why} setWhy={setWhy} onNext={() => setPhase('barriers')} onBack={() => setPhase('template')} />}
      {phase === 'barriers'  && <PhaseBarriers value={barriers} setValue={setBarriers} onNext={() => setPhase('weekly')} onBack={() => setPhase('why')} />}
      {phase === 'weekly'    && <PhaseWeekly template={template} value={weeklyActions} setValue={setWeeklyActions} onNext={() => setPhase('review')} onBack={() => setPhase('barriers')} />}
      {phase === 'review'    && <PhaseReview
        direction={direction} template={template} customTarget={customTarget} setCustomTarget={setCustomTarget}
        customWeeks={customWeeks} setCustomWeeks={setCustomWeeks} why={why} barriers={barriers}
        weeklyActions={weeklyActions} onBack={() => setPhase('weekly')} onCommit={commit}
      />}
    </div>
  )
}

// ─── Phase: Start ────────────────────────────────────────
function PhaseStart({ onPickDirect, onPickCoaching }) {
  return (
    <>
      <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 32, textAlign:'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <h1 style={{ fontSize: t.font.xxxl, fontWeight: 800, marginBottom: 10 }}>בואי נבנה מטרה חכמה</h1>
        <div style={{ color: t.color.textDim, fontSize: t.font.md, lineHeight: 1.6, maxWidth: 500, margin:'0 auto' }}>
          מטרה טובה = ספציפית, מדידה, ובעלת דדליין. בלי מטרה ברורה - קשה לדעת האם התקדמת.
        </div>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }} className="hfos-goal-start">
        <Card hover style={{ padding: 24, cursor:'pointer', textAlign:'center', border:`1px solid ${t.color.gold}` }} onClick={onPickDirect}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
          <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 6, color: t.color.gold }}>אני יודע מה אני רוצה</div>
          <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.6 }}>יש לי כיוון ברור - בואו נבנה מטרה מדידה</div>
        </Card>

        <Card hover style={{ padding: 24, cursor:'pointer', textAlign:'center' }} onClick={onPickCoaching}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
          <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 6 }}>לא בטוח/ה בדיוק</div>
          <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.6 }}>בואו נגלה יחד - 3 שאלות ואני אעזור לך למצוא את המטרה הנכונה</div>
        </Card>
      </div>
      <style>{`@media (max-width: 700px) { .hfos-goal-start { grid-template-columns: 1fr !important; } }`}</style>
    </>
  )
}

// ─── Phase: Coaching (guided) ────────────────────────────
function PhaseCoaching({ idx, answers, onAnswer, onBack }) {
  const round = COACHING_ROUNDS[idx]
  return (
    <Card style={{ padding: 28 }}>
      <div style={{ display:'flex', gap: 4, marginBottom: 20 }}>
        {COACHING_ROUNDS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= idx ? t.color.gold : t.color.bgSoft,
          }} />
        ))}
      </div>
      <Badge>שאלה {idx + 1}/{COACHING_ROUNDS.length}</Badge>
      <h2 style={{ marginTop: 12, fontSize: t.font.xl, fontWeight: 700, lineHeight: 1.4 }}>{round.prompt}</h2>
      <div style={{ display:'grid', gap: 10, marginTop: 20 }}>
        {round.options.map((opt, i) => (
          <button key={i} onClick={() => onAnswer(opt)} style={{
            padding:'16px 18px', background: t.color.bgSoft, border:`1px solid ${t.color.border}`,
            borderRadius: t.radius.md, color: t.color.text, cursor:'pointer',
            fontFamily:'inherit', fontSize: t.font.md, textAlign:'right', transition: t.transition,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.color.gold; e.currentTarget.style.background = t.color.goldGlow }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.color.border; e.currentTarget.style.background = t.color.bgSoft }}>
            {opt.text}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
      </div>
    </Card>
  )
}

// ─── Phase: Direction ───────────────────────────────────
function PhaseDirection({ onPick, onBack }) {
  return (
    <>
      <Card><SectionHeader title="מה הכיוון העיקרי שלך?" subtitle="בחר תחום - אחר כך נעדן למטרה קונקרטית" /></Card>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {DIRECTIONS.map(d => (
          <Card key={d.id} hover style={{ padding: 20, cursor:'pointer' }} onClick={() => onPick(d)}>
            <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 32 }}>{d.icon}</span>
              <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{d.label}</div>
            </div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.5 }}>{d.desc}</div>
          </Card>
        ))}
      </div>
      <div><Button variant="ghost" onClick={onBack}>→ חזור</Button></div>
    </>
  )
}

// ─── Phase: Template ───────────────────────────────────
function PhaseTemplate({ direction, onPick, onBack }) {
  const templates = GOAL_TEMPLATES[direction?.id] || []
  return (
    <>
      <Card>
        <SectionHeader title={`מטרות מוצעות בתחום: ${direction?.label}`} subtitle={direction?.desc} />
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {templates.map(tmpl => (
          <Card key={tmpl.id} hover style={{ padding: 20, cursor:'pointer' }} onClick={() => onPick(tmpl)}>
            <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 8 }}>{tmpl.label}</div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              <Badge color={t.color.gold}>{tmpl.weeks} שבועות</Badge>
              <Badge color={t.color.info}>{translateKind(tmpl.kind)}</Badge>
            </div>
          </Card>
        ))}
      </div>
      <div><Button variant="ghost" onClick={onBack}>→ חזור</Button></div>
    </>
  )
}

// ─── Phase: Why ────────────────────────────────────────
function PhaseWhy({ why, setWhy, onNext, onBack }) {
  return (
    <>
      <Card>
        <SectionHeader
          title="למה זה חשוב לך?"
          subtitle="ה-Why הוא העוגן שיחזיק אותך כשירצה להתייאש. תבחר או תכתוב משלך"
        />
        <div style={{ display:'grid', gap: 8, marginTop: 14 }}>
          {WHY_PROMPTS.map((prompt, i) => (
            <button key={i} onClick={() => setWhy(prompt)} style={{
              padding: 14, background: why === prompt ? t.color.goldGlow : t.color.bgSoft,
              border: `1px solid ${why === prompt ? t.color.gold : t.color.border}`,
              borderRadius: t.radius.md, color: why === prompt ? t.color.gold : t.color.text,
              cursor:'pointer', fontFamily:'inherit', fontSize: t.font.md, textAlign:'right',
            }}>{prompt}</button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>או תכתוב במילים שלך:</div>
          <Input value={why} onChange={e => setWhy(e.target.value)} placeholder="כי..." />
        </div>
      </Card>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
        <Button onClick={onNext} disabled={!why.trim()}>המשך ←</Button>
      </div>
    </>
  )
}

// ─── Phase: Barriers ────────────────────────────────────
function PhaseBarriers({ value, setValue, onNext, onBack }) {
  const toggle = (id) => setValue(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  return (
    <>
      <Card>
        <SectionHeader
          title="מה עלול לעצור אותך?"
          subtitle="עדיף לזהות מכשולים עכשיו כדי לתכנן עוקף - סמן/י את מה שרלוונטי"
        />
        <div style={{ display:'grid', gap: 8, marginTop: 14 }}>
          {COMMON_BARRIERS.map(b => {
            const active = value.includes(b.id)
            return (
              <div key={b.id} onClick={() => toggle(b.id)} style={{
                padding: 14, background: active ? t.color.goldGlow : t.color.bgSoft,
                border:`1px solid ${active ? t.color.gold : t.color.border}`,
                borderRadius: t.radius.md, cursor:'pointer',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: active ? 8 : 0 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: active ? t.color.gold : 'transparent',
                    border:`2px solid ${active ? t.color.gold : t.color.border}`,
                    color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 900,
                  }}>{active ? '✓' : ''}</span>
                  <span style={{ fontWeight: 600, color: active ? t.color.gold : t.color.text }}>{b.label}</span>
                </div>
                {active && (
                  <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginRight: 30, lineHeight: 1.5 }}>💡 {b.counter}</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
        <Button onClick={onNext}>המשך ←</Button>
      </div>
    </>
  )
}

// ─── Phase: Weekly actions ──────────────────────────────
function PhaseWeekly({ template, value, setValue, onNext, onBack }) {
  const suggestions = useMemo(() => {
    if (template.kind === 'weight_change') {
      const dir = template.delta < 0 ? 'ירידה' : 'עלייה'
      return [
        `3-4 אימוני התנגדות בשבוע`,
        `2-3 אימוני קרדיו קלים`,
        `מעקב יומי אחר קלוריות בטלפון`,
        `שקילה שבועית ביום קבוע בבוקר`,
        `לפחות 8 שעות שינה 5/7 לילות`,
      ]
    }
    if (template.kind === 'lift_pr') return [
      `3 אימוני כוח בשבוע לפי תכנית (5/3/1 מומלץ)`,
      `לרשום כל סט - משקל × חזרות × RPE`,
      `אימון הכן ליום שבו התרגיל המרכזי`,
      `1.6-2.2 גרם חלבון לק״ג משקל גוף ביום`,
      `שינה 7-9 שעות - חלון ההחלמה`,
    ]
    if (template.kind === 'endurance') return [
      `3 ריצות בשבוע לפי כלל ה-80/20 (רוב איטי)`,
      `אימון אינטרוולים אחד בשבוע`,
      `הליכה של 30 דק׳ בימי מנוחה`,
      `לתעד קילומטרז׳ שבועי - עלייה של 10% בלבד`,
    ]
    if (template.kind === 'habit_streak') return [
      `לסמן את ההרגל במעקב היומי`,
      `לשים תזכורת בטלפון בשעה קבועה`,
      `להכין את התנאים מראש (equipment ready)`,
    ]
    if (template.kind === 'blood_marker') return [
      `בדיקה חוזרת בעוד 8 שבועות`,
      `שינוי תזונתי ספציפי לפי הסמן`,
      `להוסיף תוסף רלוונטי (אחרי התייעצות)`,
    ]
    return [
      `להשקיע לפחות 4 שעות בשבוע במטרה`,
      `לתעד התקדמות פעם בשבוע`,
      `להעריך מחדש כל 4 שבועות`,
    ]
  }, [template])

  const toggle = (s) => setValue(value.includes(s) ? value.filter(x => x !== s) : [...value, s])

  return (
    <>
      <Card>
        <SectionHeader
          title="מיני-מטרות שבועיות"
          subtitle="פירוק המטרה הגדולה לפעולות שאפשר לעשות השבוע. בחר/י לפחות 3"
        />
        <div style={{ display:'grid', gap: 8, marginTop: 14 }}>
          {suggestions.map((s, i) => {
            const active = value.includes(s)
            return (
              <button key={i} onClick={() => toggle(s)} style={{
                padding: 14, background: active ? t.color.goldGlow : t.color.bgSoft,
                border:`1px solid ${active ? t.color.gold : t.color.border}`,
                borderRadius: t.radius.md, cursor:'pointer', color: active ? t.color.gold : t.color.text,
                fontFamily:'inherit', fontSize: t.font.md, textAlign:'right',
                display:'flex', alignItems:'center', gap: 10,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: active ? t.color.gold : 'transparent',
                  border:`2px solid ${active ? t.color.gold : t.color.border}`,
                  color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 900,
                }}>{active ? '✓' : ''}</span>
                <span>{s}</span>
              </button>
            )
          })}
        </div>
      </Card>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
        <Button onClick={onNext} disabled={value.length < 2}>המשך ← ({value.length}/3+)</Button>
      </div>
    </>
  )
}

// ─── Phase: Review ─────────────────────────────────────
function PhaseReview({ direction, template, customTarget, setCustomTarget, customWeeks, setCustomWeeks, why, barriers, weeklyActions, onBack, onCommit }) {
  return (
    <>
      <Card style={{ padding: 24 }}>
        <SectionHeader title="סקירה סופית + התאמה אישית" subtitle="בדוק/י שהכל נכון - ואפשר לשנות מספרים אם צריך" />

        <div style={{ padding: 18, background: t.color.goldGlow, borderRadius: t.radius.md, border:`1px solid ${t.color.gold}`, marginBottom: 20 }}>
          <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>המטרה שלך</div>
          <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold, marginBottom: 4 }}>{template?.label}</div>
          <div style={{ fontSize: t.font.sm, color: t.color.text }}>{direction?.label}</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12, marginBottom: 20 }}>
          {template?.target != null && (
            <div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>יעד ({template.unit})</div>
              <Input type="number" value={customTarget || template.target} onChange={e => setCustomTarget(e.target.value)} />
            </div>
          )}
          {template?.delta != null && (
            <div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>שינוי ({template.unit})</div>
              <Input type="number" value={customTarget || Math.abs(template.delta)} onChange={e => setCustomTarget(e.target.value)} />
            </div>
          )}
          <div>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>מספר שבועות</div>
            <Input type="number" value={customWeeks} onChange={e => setCustomWeeks(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>ה-Why שלך</div>
          <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontStyle:'italic' }}>"{why}"</div>
        </div>

        {barriers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>מכשולים שזוהו ({barriers.length})</div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              {barriers.map(id => {
                const b = COMMON_BARRIERS.find(x => x.id === id)
                return <Badge key={id} color={t.color.warning}>{b?.label}</Badge>
              })}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>מיני-מטרות שבועיות ({weeklyActions.length})</div>
          <div style={{ display:'grid', gap: 6 }}>
            {weeklyActions.map((a, i) => (
              <div key={i} style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm }}>
                ✓ {a}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display:'flex', justifyContent:'space-between', gap: 10 }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
        <Button onClick={onCommit} icon="🎯">שמור מטרה והתחל!</Button>
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────
function translateKind(kind) {
  return ({
    weight_change:'שינוי משקל', body_fat:'שומן גוף', lift_pr:'שיא בהרמה',
    endurance:'סבולת', sessions:'מספר אימונים', habit_streak:'רצף הרגלים',
    measurement:'מדד גוף', sleep:'שינה', mood:'מצב-רוח', blood_marker:'סמן דם',
    health_marker:'סמן בריאותי',
  }[kind] || kind)
}

function Stepper({ phase }) {
  const phases = [
    { key:'coaching', label:'ליווי' },
    { key:'direction', label:'כיוון' },
    { key:'template', label:'מטרה' },
    { key:'why', label:'Why' },
    { key:'barriers', label:'מכשולים' },
    { key:'weekly', label:'שבועיים' },
    { key:'review', label:'סקירה' },
  ]
  const curIdx = phases.findIndex(p => p.key === phase)
  return (
    <div style={{ display:'flex', gap: 6, overflowX:'auto' }}>
      {phases.filter(p => phase === 'coaching' || p.key !== 'coaching').map((p, i, arr) => {
        const idx = phases.indexOf(p)
        const active = idx === curIdx
        const done = idx < curIdx
        return (
          <div key={p.key} style={{
            flex:1, minWidth:'max-content', padding:'6px 10px', textAlign:'center',
            background: done ? t.color.gold : active ? t.color.goldGlow : t.color.bgSoft,
            color: done ? '#0d0d14' : active ? t.color.gold : t.color.textDim,
            borderRadius: t.radius.sm, fontSize: t.font.xs, fontWeight: 600,
          }}>{p.label}</div>
        )
      })}
    </div>
  )
}
