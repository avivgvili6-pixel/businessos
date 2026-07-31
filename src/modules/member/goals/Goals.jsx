import React, { useState, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader, EmptyState, ProgressBar, Modal, Input, Ring } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { GoalBuilder } from './GoalBuilder'
import { PlanBuilder } from './PlanBuilder'
import { DIRECTIONS } from '../../../data/goals'

export function Goals() {
  const { state, removeGoal, checkinGoal } = useApp()
  const [building, setBuilding] = useState(false)
  const [buildingPlan, setBuildingPlan] = useState(false)
  const [checkinFor, setCheckinFor] = useState(null)
  const [checkinValue, setCheckinValue] = useState('')
  const [checkinNote, setCheckinNote] = useState('')

  const active = (state.goals || []).find(g => g.status === 'active')

  if (building) {
    return <GoalBuilder onDone={() => setBuilding(false)} />
  }
  if (buildingPlan) {
    return <PlanBuilder onDone={() => { setBuildingPlan(false); alert('🎉 התכנית ההוליסטית שלך נשמרה! עבור ל"אימונים" לראות את התכנית') }} onCancel={() => setBuildingPlan(false)} />
  }

  if (!active) {
    return (
      <Card style={{ padding: 32, textAlign:'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>עדיין אין לך מטרה פעילה</h2>
        <div style={{ color: t.color.textDim, marginBottom: 24, maxWidth: 480, margin:'0 auto 24px', lineHeight: 1.6 }}>
          מטרה מדידה היא הדבר החשוב ביותר להתקדמות. גם אם אתה לא בטוח מה - נגלה יחד בעזרת שאלות מנחות.
        </div>
        <Button size="lg" onClick={() => setBuilding(true)} icon="🎯">בואו נבנה מטרה</Button>
      </Card>
    )
  }

  const daysSince = Math.floor((Date.now() - new Date(active.startDate)) / (24 * 3600 * 1000))
  const dir = DIRECTIONS.find(d => d.id === active.direction)

  // Progress from actual data
  const progress = computeProgress(active, state)

  const submitCheckin = () => {
    if (checkinValue === '' || isNaN(+checkinValue)) return
    checkinGoal(checkinFor.id, +checkinValue, checkinNote)
    setCheckinFor(null); setCheckinValue(''); setCheckinNote('')
  }

  return (
    <div style={{ display:'grid', gap: 20 }}>
      {/* Hero card */}
      <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 28, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, left:-30, width:180, height:180, background:t.color.goldGlow, borderRadius:'50%', filter:'blur(40px)' }} />
        <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 12 }}>
          <Badge>🎯 המטרה הפעילה שלך</Badge>
          {dir && <Badge color={t.color.textDim}>{dir.icon} {dir.label}</Badge>}
        </div>
        <h1 style={{ fontSize: t.font.hero, fontWeight: 900, marginBottom: 12, lineHeight: 1.1 }}>{active.title}</h1>
        {active.why && (
          <div style={{ fontStyle:'italic', color: t.color.textDim, marginBottom: 20, fontSize: t.font.md, lineHeight: 1.5, position:'relative', zIndex: 1 }}>
            "{active.why}"
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 24, alignItems:'center', position:'relative', zIndex: 1 }} className="hfos-goal-hero">
          <Ring
            value={progress.pct}
            max={100}
            size={110}
            stroke={10}
            color={progress.pct >= 80 ? t.color.success : progress.pct >= 50 ? t.color.gold : t.color.warning}
            label={`${progress.pct}%`}
            sublabel="למטרה"
          />
          <div style={{ display:'grid', gap: 10 }}>
            <div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 4 }}>מתחילת המטרה</div>
              <div style={{ fontWeight: 700 }}>{daysSince === 0 ? 'התחלת היום 🚀' : `יום ${daysSince} בדרך`}</div>
            </div>
            {progress.currentValue != null && progress.targetValue != null && (
              <div>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 4 }}>נותר להשיג</div>
                <div style={{ fontWeight: 700, color: t.color.gold }}>
                  {Math.abs(progress.targetValue - progress.currentValue).toFixed(1)} {active.metric?.unit || ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Metric card - shows current vs target */}
      {progress.currentValue != null && progress.targetValue != null && (
        <Card>
          <SectionHeader title={progress.metricLabel} action={
            <Button size="sm" onClick={() => { setCheckinFor(active); setCheckinValue(String(progress.currentValue || '')) }}>
              + עדכן מדד
            </Button>
          } />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12, textAlign:'center' }} className="hfos-metric-grid">
            <div style={{ padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>נקודת התחלה</div>
              <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.textDim }}>{progress.startValue ?? '—'}</div>
            </div>
            <div style={{ padding: 16, background: t.color.goldGlow, borderRadius: t.radius.md, border:`1px solid ${t.color.gold}` }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>כרגע</div>
              <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold }}>{progress.currentValue}</div>
            </div>
            <div style={{ padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>יעד</div>
              <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.success }}>{progress.targetValue}</div>
            </div>
          </div>
          {progress.trend && progress.trend.length > 1 && (
            <div style={{ marginTop: 16 }}>
              <Sparkline data={progress.trend} height={50} color={t.color.gold} />
            </div>
          )}
        </Card>
      )}

      {/* Weekly actions */}
      {active.weeklyActions?.length > 0 && (
        <Card>
          <SectionHeader title="המיני-מטרות השבועיות שלך" subtitle="הפעולות שיובילו אותך למטרה הגדולה" />
          <div style={{ display:'grid', gap: 8 }}>
            {active.weeklyActions.map((a, i) => (
              <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, display:'flex', gap: 12, alignItems:'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: t.color.gold, color:'#0d0d14',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>{i+1}</div>
                <div style={{ flex: 1, fontSize: t.font.sm }}>{a}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Barriers reminder */}
      {active.barriers?.length > 0 && (
        <Card style={{ background:`${t.color.warning}10`, borderColor: t.color.warning }}>
          <SectionHeader title="⚠ המכשולים שהזהרת מהם" subtitle="שים לב אליהם בשבוע הקרוב" />
          <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
            {active.barriers.map(id => <Badge key={id} color={t.color.warning}>{id}</Badge>)}
          </div>
        </Card>
      )}

      {/* BIG bridge CTA - the "now what?" answer */}
      {!state.plan && (
        <Card style={{ padding: 24, background: `linear-gradient(135deg, ${t.color.goldGlow} 0%, ${t.color.bgElevated} 100%)`, border: `1px solid ${t.color.gold}` }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 48 }}>🚀</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, fontSize: t.font.xl, color: t.color.gold, marginBottom: 6 }}>
                יש לך מטרה - עכשיו איך משיגים אותה?
              </div>
              <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.5 }}>
                בואי נבנה יחד תכנית הוליסטית - אימונים + תזונה + מעטפת מנטלית - הכל מותאם אישית תוך 2 דקות
              </div>
            </div>
            <Button size="lg" onClick={() => setBuildingPlan(true)}>בנה לי תכנית ✨</Button>
          </div>
        </Card>
      )}

      {state.plan && (
        <Card style={{ padding: 16, background: `${t.color.success}10`, border: `1px solid ${t.color.success}` }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>יש לך תכנית פעילה: {state.plan.name}</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>עבור ל״אימונים״ כדי להתחיל</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setBuildingPlan(true)}>בנה תכנית מחדש</Button>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap: 10, flexWrap:'wrap' }}>
        <Button variant="outline" onClick={() => setBuilding(true)}>🎯 שנה מטרה</Button>
        <Button variant="ghost" onClick={() => { if (confirm('לבטל את המטרה?')) removeGoal(active.id) }}>מחק מטרה</Button>
      </div>

      {/* Checkin history */}
      {active.checkins?.length > 0 && (
        <Card>
          <SectionHeader title="עדכונים אחרונים" />
          <div style={{ display:'grid', gap: 8 }}>
            {active.checkins.slice(0, 6).map((c, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                <div>
                  <div style={{ fontWeight: 700, color: t.color.gold }}>{c.value}</div>
                  {c.note && <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{c.note}</div>}
                </div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(c.date).toLocaleDateString('he-IL')}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={!!checkinFor} onClose={() => setCheckinFor(null)} title="עדכון מדד" width={420}>
        <div style={{ display:'grid', gap: 12 }}>
          <Input type="number" label={`ערך נוכחי (${checkinFor?.metric?.unit || ''})`} value={checkinValue} onChange={e => setCheckinValue(e.target.value)} />
          <Input label="הערה (אופציונלי)" value={checkinNote} onChange={e => setCheckinNote(e.target.value)} placeholder="איך אתה מרגיש? מה עבד השבוע?" />
          <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
            <Button variant="ghost" onClick={() => setCheckinFor(null)}>בטל</Button>
            <Button onClick={submitCheckin}>שמור</Button>
          </div>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 700px) {
          .hfos-goal-hero { grid-template-columns: 1fr !important; text-align: center; }
          .hfos-metric-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// Compute progress from actual data
function computeProgress(goal, state) {
  let currentValue = null, targetValue = null, startValue = null, metricLabel = '', trend = []

  switch (goal.kind) {
    case 'weight_change': {
      const meas = state.measurements.filter(m => m.weight != null).sort((a,b) => new Date(a.date) - new Date(b.date))
      if (meas.length) {
        startValue = meas[0].weight
        currentValue = meas[meas.length - 1].weight
        targetValue = +(startValue + goal.metric.delta).toFixed(1)
        trend = meas.map(m => m.weight)
        metricLabel = 'משקל גוף (ק״ג)'
      }
      break
    }
    case 'body_fat': {
      const meas = state.measurements.filter(m => m.bodyFat != null).sort((a,b) => new Date(a.date) - new Date(b.date))
      if (meas.length) {
        startValue = meas[0].bodyFat
        currentValue = meas[meas.length - 1].bodyFat
        targetValue = +(startValue + goal.metric.delta).toFixed(1)
        trend = meas.map(m => m.bodyFat)
        metricLabel = 'אחוז שומן (%)'
      }
      break
    }
    case 'lift_pr': {
      const prs = state.personalRecords.filter(p => p.exercise?.includes(hebrewLift(goal.metric.lift))).sort((a,b) => new Date(a.date) - new Date(b.date))
      if (prs.length) {
        startValue = Math.round(prs[0].weight * (1 + prs[0].reps/30))
        currentValue = Math.round(prs[prs.length - 1].weight * (1 + prs[prs.length - 1].reps/30))
        targetValue = goal.metric.target
        trend = prs.map(p => Math.round(p.weight * (1 + p.reps/30)))
        metricLabel = `${hebrewLift(goal.metric.lift)} - e1RM (ק״ג)`
      }
      break
    }
    case 'sleep': {
      const cs = state.moodCheckins.filter(c => c.sleepHours != null).sort((a,b) => new Date(a.date) - new Date(b.date))
      if (cs.length) {
        startValue = cs[0].sleepHours
        currentValue = +(cs.slice(-7).reduce((s,c) => s + c.sleepHours, 0) / Math.min(7, cs.length)).toFixed(1)
        targetValue = goal.metric.target
        trend = cs.map(c => c.sleepHours)
        metricLabel = 'שעות שינה (ממוצע 7 ימים)'
      }
      break
    }
    case 'mood': {
      const cs = state.moodCheckins.filter(c => c.mood != null).sort((a,b) => new Date(a.date) - new Date(b.date))
      if (cs.length) {
        startValue = cs[0].mood
        currentValue = +(cs.slice(-7).reduce((s,c) => s + c.mood, 0) / Math.min(7, cs.length)).toFixed(1)
        targetValue = goal.metric.target
        trend = cs.map(c => c.mood)
        metricLabel = 'מצב-רוח (ממוצע 7 ימים)'
      }
      break
    }
    case 'blood_marker': {
      const latest = state.bloodTests[0]
      if (latest && latest.values[goal.metric.marker]) {
        currentValue = +latest.values[goal.metric.marker]
        targetValue = goal.metric.target
        metricLabel = `סמן דם: ${goal.metric.marker}`
      }
      break
    }
    default:
      break
  }

  // Include user check-ins for override
  if (goal.checkins?.length) {
    const latestCheckin = goal.checkins[0].value
    if (latestCheckin != null && currentValue == null) currentValue = latestCheckin
  }

  // Overall % - based purely on metric progress, no time pressure
  let pct = 0
  if (currentValue != null && targetValue != null && startValue != null) {
    const total = Math.abs(targetValue - startValue)
    const done = Math.abs(currentValue - startValue)
    pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  }

  return { pct, currentValue, targetValue, startValue, metricLabel, trend }
}

function hebrewLift(key) {
  return ({ squat:'סקוואט', bench:'לחיצת חזה', deadlift:'דדליפט', ohp:'לחיצת כתפיים', pullup:'מתח' })[key] || key
}
