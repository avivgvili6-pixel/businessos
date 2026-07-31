import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs, Modal, EmptyState, ProgressBar } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { exercises, MUSCLE_GROUPS, EQUIPMENT, CATEGORIES, LEVELS, workoutSplits } from '../../../data/exercises'
import { todayKey, DAYS_HE } from '../../../utils/date'

export function Train() {
  const [tab, setTab] = useState('plan')
  return (
    <>
      <Tabs tabs={[
        { key:'plan',    label:'התכנית שלי' },
        { key:'library', label:'מאגר תרגילים' },
        { key:'builder', label:'מחולל תכניות' },
        { key:'history', label:'היסטוריה' },
      ]} active={tab} onChange={setTab} />
      {tab === 'plan' && <MyPlan />}
      {tab === 'library' && <Library />}
      {tab === 'builder' && <Builder />}
      {tab === 'history' && <History />}
    </>
  )
}

function MyPlan() {
  const { state, logWorkout } = useApp()
  const [session, setSession] = useState(null)
  const plan = state.plan

  if (!plan) return <EmptyState icon="🏋️" title="עדיין אין תכנית פעילה" subtitle="בנה תכנית מותאמת לפי המטרה שלך במחולל התכניות" />

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader
          title={plan.name}
          subtitle={`${plan.split} · ${plan.days} ימים · ${plan.weeks} שבועות`}
          action={<Badge color={t.color.gold}>שבוע {plan.currentWeek || 1}</Badge>}
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {plan.sessions.map((s, i) => (
            <Card key={i} hover style={{ cursor:'pointer', padding: 18 }} onClick={() => setSession(s)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{s.name}</div>
                <Badge>{DAYS_HE[(i+1) % 7]}</Badge>
              </div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>{s.exercises.length} תרגילים</div>
              <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                {s.exercises.slice(0, 4).map((e, j) => <Badge key={j} color={t.color.textDim}>{e.name}</Badge>)}
                {s.exercises.length > 4 && <Badge color={t.color.textDim}>+{s.exercises.length - 4}</Badge>}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <SessionRunner session={session} onClose={() => setSession(null)} onFinish={(log) => { logWorkout({ ...log, date: new Date().toISOString() }); setSession(null) }} />
    </div>
  )
}

function SessionRunner({ session, onClose, onFinish }) {
  const { state } = useApp()
  const [log, setLog] = useState(() => buildInitialLog(session, state.workoutLogs))
  const [restRemaining, setRestRemaining] = useState(0)
  const [restTotal, setRestTotal] = useState(90)
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    if (session) setLog(buildInitialLog(session, state.workoutLogs))
  }, [session])

  React.useEffect(() => {
    if (restRemaining <= 0) return
    timerRef.current = setInterval(() => setRestRemaining(r => r - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [restRemaining])

  const startRest = (seconds = 90) => { setRestTotal(seconds); setRestRemaining(seconds) }
  const skipRest = () => setRestRemaining(0)

  if (!session) return null

  return (
    <Modal open={!!session} onClose={onClose} title={`אימון: ${session.name}`} width={720}>
      {restRemaining > 0 && (
        <div style={{
          position:'sticky', top: 0, zIndex: 10, marginBottom: 12, padding: 14,
          background:`linear-gradient(90deg, ${t.color.gold}22 0%, ${t.color.gold}44 ${100 - (restRemaining/restTotal)*100}%, ${t.color.bgSoft} ${100 - (restRemaining/restTotal)*100}%)`,
          border:`1px solid ${t.color.gold}`, borderRadius: t.radius.md,
          display:'flex', alignItems:'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>⏱️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>מנוחה</div>
            <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold, fontFamily:'Space Mono, monospace' }}>
              {Math.floor(restRemaining/60)}:{String(restRemaining%60).padStart(2,'0')}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={skipRest}>דלג</Button>
        </div>
      )}
      <div style={{ display:'grid', gap: 14 }}>
        {log.map((ex, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{ex.name}</div>
              <Badge>{ex.sets.length}×{ex.reps || 8}</Badge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr', gap: 8, alignItems:'center' }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>סט</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>משקל</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>חזרות</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>RPE</div>
              {ex.sets.map((s, j) => (
                <React.Fragment key={j}>
                  <div style={{ color: t.color.gold, fontWeight: 700 }}>{j+1}</div>
                  <Input value={s.w} onChange={e => updateSet(i, j, 'w', e.target.value)} placeholder={ex.suggestedWeight ? `${ex.suggestedWeight}` : 'ק״ג'} />
                  <Input value={s.r} onChange={e => updateSet(i, j, 'r', e.target.value)} placeholder={String(ex.reps || 8)} />
                  <div style={{ display:'flex', gap: 4 }}>
                    <Input value={s.rpe} onChange={e => updateSet(i, j, 'rpe', e.target.value)} placeholder="1-10" />
                    <button type="button" onClick={() => startRest(90)} title="התחל מנוחה 90ש׳" style={{
                      background: t.color.bgSoft, border:`1px solid ${t.color.border}`, color: t.color.gold,
                      borderRadius: t.radius.sm, cursor:'pointer', padding:'0 10px', fontSize: 16,
                    }}>⏱</button>
                  </div>
                </React.Fragment>
              ))}
              {ex.suggestedWeight && !ex.sets.some(s => s.w) && (
                <div style={{ gridColumn: '1 / -1', fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>
                  💡 באימון האחרון: <b style={{ color: t.color.gold }}>{ex.suggestedWeight} ק״ג</b> · המלצה להעלות 2.5 ק״ג אם ה-RPE היה מתחת ל-8
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display:'flex', gap: 10, justifyContent:'flex-end', marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose}>בטל</Button>
        <Button onClick={() => onFinish({ sessionName: session.name, exercises: log })}>סיים ורשום ✓</Button>
      </div>
    </Modal>
  )

  function updateSet(i, j, key, val) {
    setLog(l => l.map((ex, ii) => ii !== i ? ex : { ...ex, sets: ex.sets.map((s, jj) => jj !== j ? s : { ...s, [key]: val }) }))
  }
}

function Library() {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('')
  const [cat, setCat] = useState('')
  const [lvl, setLvl] = useState('')
  const [eq, setEq] = useState('')

  const filtered = useMemo(() => exercises.filter(e =>
    (!q || e.name.includes(q)) &&
    (!muscle || e.muscle === muscle) &&
    (!cat || e.category === cat) &&
    (!lvl || e.level === lvl) &&
    (!eq || e.equipment === eq)
  ), [q, muscle, cat, lvl, eq])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap: 10 }} className="hfos-grid-5">
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 חיפוש תרגיל..." />
          <Select value={muscle} onChange={e => setMuscle(e.target.value)}>
            <option value="">שריר</option>{MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">קטגוריה</option>{CATEGORIES.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={lvl} onChange={e => setLvl(e.target.value)}>
            <option value="">רמה</option>{LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={eq} onChange={e => setEq(e.target.value)}>
            <option value="">ציוד</option>{EQUIPMENT.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(ex => (
          <Card key={ex.id} hover style={{ padding: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{ex.name}</div>
              <Badge>{ex.level}</Badge>
            </div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 12 }}>
              <Badge color={t.color.gold}>{ex.muscle}</Badge>
              <Badge color={t.color.textDim}>{ex.category}</Badge>
              <Badge color={t.color.textDim}>{ex.equipment}</Badge>
            </div>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, borderTop:`1px solid ${t.color.border}`, paddingTop: 10 }}>💡 {ex.tips}</div>
          </Card>
        ))}
        {!filtered.length && <EmptyState icon="🔍" title="לא נמצאו תרגילים" subtitle="נסה לשנות את הפילטרים" />}
      </div>
      <style>{`@media (max-width: 900px) { .hfos-grid-5 { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}

function Builder() {
  const { state, setPlan } = useApp()
  const [splitKey, setSplitKey] = useState('upper_lower')
  const [weeks, setWeeks] = useState(state.profile.targetPeriodWeeks || 8)
  const [level, setLevel] = useState(state.profile.experience || 'בינוני')

  const preview = useMemo(() => buildPlan({ splitKey, weeks, level, goalKey: state.profile.goalKey }), [splitKey, weeks, level, state.profile.goalKey])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader title="מחולל תכניות חכם" subtitle="בונה תכנית מותאמת לפי מטרה, רמה ותקופה" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Select label="פיצול" value={splitKey} onChange={e => setSplitKey(e.target.value)}>
            {Object.entries(workoutSplits).map(([k,v]) => <option key={k} value={k}>{v.label} ({v.days} ימים)</option>)}
          </Select>
          <Select label="רמה" value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
          <Input type="number" label="שבועות" value={weeks} onChange={e => setWeeks(+e.target.value)} min={4} max={52} />
        </div>
      </Card>

      <Card>
        <SectionHeader title="תצוגה מקדימה" subtitle={`${preview.days} ימי אימון בשבוע · ${preview.weeks} שבועות`}
          action={<Button onClick={() => setPlan(preview)}>אמץ תכנית ✓</Button>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {preview.sessions.map((s, i) => (
            <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, border:`1px solid ${t.color.border}` }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: t.color.gold }}>יום {i+1} · {s.name}</div>
              <div style={{ display:'grid', gap: 4 }}>
                {s.exercises.map((e, j) => (
                  <div key={j} style={{ fontSize: t.font.sm, display:'flex', justifyContent:'space-between' }}>
                    <span>{e.name}</span>
                    <span style={{ color: t.color.textDim }}>{e.sets}×{e.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function buildPlan({ splitKey, weeks, level, goalKey }) {
  const split = workoutSplits[splitKey]
  const goalRepMap = { cut:12, recomp:8, maintain:10, lean_bulk:8, bulk:6 }
  const baseReps = goalRepMap[goalKey] || 8
  const setsByLevel = { 'מתחיל':3, 'בינוני':4, 'מתקדם':5 }
  const sets = setsByLevel[level] || 3

  const sessions = split.sessions.map(name => {
    const focus = name.toLowerCase()
    let picks
    if (focus.includes('דחיפה')) picks = ['bench','ohp','dip','pushup','triceps_pd','lateral']
    else if (focus.includes('משיכה')) picks = ['pullup','row','curl','face_pull','rdl']
    else if (focus.includes('רגליים') || focus.includes('תחתון')) picks = ['squat','rdl','leg_press','lunge','hip_thrust','plank']
    else if (focus.includes('חזה')) picks = ['bench','dip','pushup','lateral']
    else if (focus.includes('גב')) picks = ['pullup','row','face_pull','curl']
    else if (focus.includes('כתפ')) picks = ['ohp','lateral','face_pull']
    else if (focus.includes('ידיים')) picks = ['curl','triceps_pd','dip']
    else if (focus.includes('אינטרוול') || focus.includes('hiit')) picks = ['kb_swing','burpee','row_erg','pushup']
    else if (focus.includes('liss') || focus.includes('אירובי')) picks = ['bike','run','row_erg']
    else if (focus.includes('עליון')) picks = ['bench','row','ohp','pullup','curl','triceps_pd']
    else picks = ['squat','bench','row','ohp','plank','lunge']
    const exs = picks.map(id => {
      const e = exercises.find(x => x.id === id)
      return e ? { id: e.id, name: e.name, sets, reps: baseReps } : null
    }).filter(Boolean)
    return { name, exercises: exs }
  })

  return {
    name: `${split.label} · ${weeks} שבועות`,
    split: split.label,
    days: split.days,
    weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}

function buildInitialLog(session, priorLogs) {
  if (!session) return []
  return session.exercises.map(e => {
    const lastEntry = findLastEntry(priorLogs, e.id || e.name)
    const suggestedWeight = lastEntry ? topWeight(lastEntry) : null
    return {
      ...e,
      suggestedWeight,
      sets: Array.from({ length: e.sets || 3 }, () => ({ w: '', r: '', rpe: '' })),
    }
  })
}

function findLastEntry(logs, exId) {
  for (const log of logs) {
    for (const ex of log.exercises || []) {
      if (ex.id === exId || ex.name === exId) return ex
    }
  }
  return null
}

function topWeight(ex) {
  const w = (ex.sets || []).map(s => +s.w).filter(x => !isNaN(x) && x > 0)
  return w.length ? Math.max(...w) : null
}

function History() {
  const { state } = useApp()
  const { workoutLogs } = state
  if (!workoutLogs.length) return <EmptyState icon="📖" title="עדיין אין היסטוריה" subtitle="אימונים שתסיים ירשמו כאן אוטומטית" />
  const weekVolume = [4, 6, 5, 8, 7, 9, 8, 10]
  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader title="נפח שבועי (סטים)" />
        <Sparkline data={weekVolume} height={80} />
      </Card>
      <Card>
        <SectionHeader title="אימונים אחרונים" />
        <div style={{ display:'grid', gap: 8 }}>
          {workoutLogs.slice(0, 10).map((log, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
              <div>
                <div style={{ fontWeight: 600 }}>{log.sessionName}</div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(log.date).toLocaleDateString('he-IL')}</div>
              </div>
              <Badge>{log.exercises.length} תרגילים</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
