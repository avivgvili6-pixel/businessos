import React, { useEffect, useRef, useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Card, Button, Badge } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { EXERCISE_BY_ID, EQUIPMENT } from '../../../../data/bodybuilding/exercises'
import { calculatePlates, platesNotation } from '../../../../data/bodybuilding/calculators'
import { Kicker, SectionHead, Label, Button as SButton } from '../../../../design/components/primitives'
import { ExerciseGuideButton } from '../../../../components/train/ExerciseGuidePopover'

// Progress persists across close/reopen — user asked for
// "לא להתאפס אחרי אימון אלא אם לחצי על לאפס".
const storageKey = (routineId) => `hfos:runner_state:${routineId}`

const buildInitialLive = (routine) => (routine.exercises || []).map(ex => ({
  ...ex,
  collapsed: false,
  sets: (ex.sets || []).map(s => ({ ...s, completed: false, actualWeight: s.weight, actualReps: s.reps })),
}))

const loadPersistedLive = (routine) => {
  if (typeof window === 'undefined') return buildInitialLive(routine)
  try {
    const raw = localStorage.getItem(storageKey(routine.id))
    if (!raw) return buildInitialLive(routine)
    const stored = JSON.parse(raw)
    // Merge stored state onto the fresh routine template so schema changes
    // in the routine (added/removed exercises) don't crash the runner.
    const fresh = buildInitialLive(routine)
    fresh.forEach((ex, i) => {
      const storedEx = stored[i]
      if (!storedEx) return
      ex.collapsed = !!storedEx.collapsed
      ex.sets.forEach((s, j) => {
        const storedSet = storedEx.sets?.[j]
        if (!storedSet) return
        s.completed = !!storedSet.completed
        if (Number.isFinite(storedSet.actualWeight)) s.actualWeight = storedSet.actualWeight
        if (Number.isFinite(storedSet.actualReps)) s.actualReps = storedSet.actualReps
      })
    })
    return fresh
  } catch {
    return buildInitialLive(routine)
  }
}

// Live routine runner — user goes through exercises, logs sets, uses rest timer.
export function RoutineRunner({ routine, open, onClose }) {
 const { logWorkout, bbUpdateExercisePR, state } = useApp()
 const settings = state.workoutSettings || {}

 // Working state: array parallel to routine.exercises, each with
 // completed[si]=true/false + actual weight/reps + a per-exercise
 // collapsed flag. Persisted to localStorage per-routine.
 const [live, setLive] = useState(() => loadPersistedLive(routine))
 const [restEnd, setRestEnd] = useState(null) // Date.now() when rest ends, or null
 const [now, setNow] = useState(Date.now())
 const [plateOpen, setPlateOpen] = useState(null) // { weight } to calculate plates for
 const startedAt = useRef(Date.now())

 // Persist on every change
 useEffect(() => {
   if (typeof window === 'undefined') return
   try {
     localStorage.setItem(storageKey(routine.id), JSON.stringify(live))
   } catch {}
 }, [live, routine.id])

 useEffect(() => {
 if (!restEnd) return
 const id = setInterval(() => setNow(Date.now()), 250)
 return () => clearInterval(id)
 }, [restEnd])

 const restRemaining = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : 0
 useEffect(() => {
 if (restEnd && now >= restEnd) {
 setRestEnd(null)
 try {
 if (typeof window !== 'undefined'&& 'vibrate'in navigator) navigator.vibrate([200, 50, 200])
 } catch {}
 }
 }, [now, restEnd])

 const toggleSet = (exIdx, setIdx) => {
 const exInRoutine = live[exIdx]
 const s = exInRoutine.sets[setIdx]
 const newCompleted = !s.completed
 setLive(prev => prev.map((ex, i) => i !== exIdx ? ex : {
 ...ex,
 sets: ex.sets.map((ss, j) => j !== setIdx ? ss : { ...ss, completed: newCompleted }),
 }))
 // Start rest timer only when marking completed (not un-completing)
 if (newCompleted && exInRoutine.restSeconds > 0) {
 setRestEnd(Date.now() + exInRoutine.restSeconds * 1000)
 }
 // Update PR if this is a working set that was just completed
 if (newCompleted && s.type !== 'warmup'&& s.actualWeight > 0 && s.actualReps > 0) {
 bbUpdateExercisePR({
 exerciseId: exInRoutine.exerciseId,
 weight: s.actualWeight,
 reps: s.actualReps,
 date: new Date().toISOString(),
 })
 }
 }

 const updateActual = (exIdx, setIdx, field, value) => {
 setLive(prev => prev.map((ex, i) => i !== exIdx ? ex : {
 ...ex,
 sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: +value }),
 }))
 }

 const adjustRest = (delta) => {
 if (!restEnd) return
 setRestEnd(prev => prev + delta * 1000)
 }
 const skipRest = () => setRestEnd(null)

 const toggleCollapse = (exIdx) => {
   setLive(prev => prev.map((ex, i) => i !== exIdx ? ex : { ...ex, collapsed: !ex.collapsed }))
 }

 const resetProgress = () => {
   const anyChecked = live.some(ex => ex.sets.some(s => s.completed))
   const msg = anyChecked
     ? 'לאפס את כל הסימונים והמשקלים בשגרה הזאת? הפעולה לא הפיכה.'
     : 'לאפס את השגרה למצב ההתחלתי?'
   if (!confirm(msg)) return
   const fresh = buildInitialLive(routine)
   setLive(fresh)
   try { localStorage.removeItem(storageKey(routine.id)) } catch {}
 }

 const finish = () => {
 // Total session volume
 const totalVolume = live.reduce((total, ex) => total + (ex.sets || []).filter(s => s.completed && s.type !== 'warmup').reduce((sum, s) => sum + (s.actualWeight * s.actualReps), 0), 0)
 const durationMin = Math.round((Date.now() - startedAt.current) / 60000)

 logWorkout({
 date: new Date().toISOString(),
 sessionName: `BB — ${routine.name}`,
 exercises: live.map(ex => {
 const exercise = EXERCISE_BY_ID[ex.exerciseId]
 return {
 id: ex.exerciseId,
 name: exercise?.he || ex.exerciseId,
 sets: (ex.sets || []).filter(s => s.completed).map(s => ({
 w: s.actualWeight, r: s.actualReps, type: s.type,
 })),
 }
 }),
 bbMeta: {
 routineId: routine.id,
 durationMin,
 totalVolume,
 },
 })

 // Update session volume PRs
 for (const ex of live) {
 const exVolume = (ex.sets || []).filter(s => s.completed && s.type !== 'warmup').reduce((sum, s) => sum + (s.actualWeight * s.actualReps), 0)
 if (exVolume > 0) {
 bbUpdateExercisePR({
 exerciseId: ex.exerciseId,
 weight: 0, reps: 0, sessionVolume: exVolume,
 date: new Date().toISOString(),
 })
 }
 }

 alert(` סיימת!\n⏱ ${durationMin} דקות\n ${totalVolume.toFixed(0)}kg נפח כולל`)
 onClose()
 }

 return (
 <Modal open={open} onClose={onClose} title={routine.name} width={640}>
 {/* Rest timer banner (when active) — Sport-Refined */}
 {restEnd && restRemaining > 0 && (
 <div style={{
 position:'relative',
 background: `linear-gradient(160deg, ${t.color.wineGlow}, transparent 60%), linear-gradient(160deg, ${t.color.panel}, ${t.color.charcoal})`,
 border: `1px solid ${t.color.wineLight}`,
 borderRadius: t.radius.xl,
 padding:'20px 22px 18px',
 marginBottom: t.space.md,
 textAlign:'center',
 overflow:'hidden',
 }}>
 <div style={{ marginBottom: 6 }}>
 <Kicker>מנוחה · Rest</Kicker>
 </div>
 <div style={{
 fontFamily: t.font.family.display,
 fontSize: 56, fontWeight: t.font.weight.med,
 color: t.color.white,
 letterSpacing:'-0.05em',
 fontVariantNumeric:'tabular-nums',
 lineHeight: 1,
 marginBottom: 12,
 }}>
 {Math.floor(restRemaining / 60)}:{String(restRemaining % 60).padStart(2,'0')}
 </div>
 <div style={{ display:'flex', gap: 8, justifyContent:'center'}}>
 <SButton variant="ghost"size="sm"onClick={() => adjustRest(-15)}>−15s</SButton>
 <SButton variant="ghost"size="sm"onClick={() => adjustRest(15)}>+15s</SButton>
 <SButton variant="primary"size="sm"onClick={skipRest}>דלג</SButton>
 </div>
 </div>
 )}

 {/* Exercises */}
 {live.map((ex, idx) => {
 const exercise = EXERCISE_BY_ID[ex.exerciseId]
 if (!exercise) return null
 const totalWorking = ex.sets.filter(s => s.type !== 'warmup').length
 const completedWorking = ex.sets.filter(s => s.type !== 'warmup'&& s.completed).length
 const allDone = totalWorking > 0 && completedWorking >= totalWorking
 const collapsed = !!ex.collapsed
 return (
 <Card key={idx} style={{
 marginBottom: t.space.md,
 border: allDone ? `1px solid ${t.color.wineLight}55` : undefined,
 }}>
 {/* Header — the whole row is a clickable collapse target */}
 <button
   type="button"
   onClick={() => toggleCollapse(idx)}
   style={{
     display:'flex', alignItems:'flex-start', justifyContent:'space-between',
     gap: 8, width:'100%', textAlign:'right',
     background:'transparent', border:'none', cursor:'pointer',
     padding: 0, marginBottom: collapsed ? 0 : 14,
     paddingBottom: collapsed ? 0 : 12,
     borderBottom: collapsed ? 'none' : `1px solid ${t.color.hairline}`,
     fontFamily:'inherit', color: t.color.text,
   }}
   aria-expanded={!collapsed}
 >
 <div style={{ flex: 1 }}>
 <div style={{ marginBottom: 6, display:'flex', alignItems:'center', gap: 8 }}>
 <Kicker color="wine">תרגיל {idx + 1}</Kicker>
 {allDone && (
 <span style={{
   fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.24em',
   color: '#4a9c6a', fontWeight: 700, textTransform: 'uppercase',
 }}>· בוצע</span>
 )}
 </div>
 <div style={{
 fontFamily: t.font.family.display,
 fontSize: 22, fontWeight: t.font.weight.semi,
 color: t.color.white,
 letterSpacing:'-0.025em',
 lineHeight: 1.05,
 }}>{exercise.he}</div>
 <div style={{ marginTop: 6 }}>
 <Label>
 {completedWorking}/{totalWorking} סטים · מנוחה {ex.restSeconds}s
 </Label>
 </div>
 </div>
 <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 6 }}>
   <div style={{
     fontFamily: t.font.family.display,
     fontSize: 34, fontWeight: t.font.weight.med,
     color: t.color.silver3,
     letterSpacing:'-0.03em',
     fontVariantNumeric:'tabular-nums',
     lineHeight: 1,
   }}>{String(idx + 1).padStart(2,'0')}</div>
   <span style={{
     fontFamily: t.font.family.mono, fontSize: 10, letterSpacing:'0.16em',
     color: t.color.silver2, textTransform:'uppercase',
   }}>
     {collapsed ? '▾ הרחב' : '▴ סגור'}
   </span>
 </div>
 </button>

 {!collapsed && (
 <div onClick={e => e.stopPropagation()} style={{ marginBottom: 4 }}>
   <div style={{ marginBottom: 10 }}>
     <ExerciseGuideButton exerciseName={exercise.he} compact />
   </div>
 </div>
 )}

 {!collapsed && ex.notes && (
 <div style={{
 background: t.color.panel, padding: 10, borderRadius: t.radius.sm,
 fontSize: t.font.body, color: t.color.silver1, marginBottom: 10,
 border: `1px solid ${t.color.hairline}`,
 letterSpacing:'-0.005em',
 }}>
 {ex.notes}
 </div>
 )}

 {!collapsed && (
 <div style={{
 display:'grid', gridTemplateColumns:'50px 1fr 1fr 40px 40px', gap: 6,
 fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: t.font.track.label,
 color: t.color.silver3, textTransform:'uppercase',
 padding:'4px 6px',
 }}>
 <span>Set</span>
 <span>Kg</span>
 <span>Reps</span>
 <span>Plate</span>
 <span>·</span>
 </div>
 )}
 {!collapsed && ex.sets.map((s, si) => {
 const setNumber = s.type === 'warmup'? 'W': ex.sets.slice(0, si + 1).filter(x => x.type !== 'warmup').length
 return (
 <div key={si} style={{
 display:'grid', gridTemplateColumns:'50px 1fr 1fr 40px 40px', gap: 6,
 padding:'10px 6px',
 background: s.completed ? `${t.color.wineGlow}` : s.type === 'warmup'? `${t.color.panel}` : t.color.charcoal,
 border: `1px solid ${s.completed ? t.color.wineLight : t.color.hairline}`,
 borderRadius: t.radius.sm, alignItems:'center', marginBottom: 4,
 }}>
 <span style={{
 textAlign:'center',
 fontFamily: t.font.family.display,
 fontSize: 16, fontWeight: t.font.weight.semi,
 color: s.type === 'warmup'? t.color.silver2 : s.completed ? t.color.wineLight : t.color.white,
 letterSpacing:'-0.02em',
 fontVariantNumeric:'tabular-nums',
 }}>{setNumber}</span>
 <input type="number"value={s.actualWeight || ''}
 onChange={e => updateActual(idx, si,'actualWeight', e.target.value)}
 placeholder={String(s.weight || '—')} style={setInput}
 />
 <input type="number"value={s.actualReps || ''}
 onChange={e => updateActual(idx, si,'actualReps', e.target.value)}
 placeholder={String(s.reps || '—')} style={setInput}
 />
 <button
 onClick={() => setPlateOpen({ weight: s.actualWeight || s.weight })}
 disabled={!settings.plateCalculatorEnabled || !s.actualWeight}
 title="חישוב פלטות"
 style={{
 background:'none', border: `1px solid ${s.actualWeight ? t.color.border :'transparent'}`,
 borderRadius: t.radius.sm,
 cursor: s.actualWeight ? 'pointer':'default',
 color: s.actualWeight ? t.color.silver1 : t.color.silver3,
 width: 32, height: 32,
 fontFamily: t.font.family.mono, fontSize: 10, letterSpacing:'0.14em',
 textTransform:'uppercase',
 }}
 >P</button>
 <button
 onClick={() => toggleSet(idx, si)}
 style={{
 background: s.completed ? t.color.wineLight :'transparent',
 border: `1.5px solid ${s.completed ? t.color.wineLight : t.color.border}`,
 borderRadius:'50%', cursor:'pointer',
 color: s.completed ? t.color.white : t.color.silver3,
 width: 32, height: 32, display:'flex',
 alignItems:'center', justifyContent:'center',
 fontSize: 14, fontWeight: 700,
 }}
 >{s.completed ? '' :''}</button>
 </div>
 )
 })}
 </Card>
 )
 })}

 {/* Sticky footer — reset + finish */}
 <div style={{
   position:'sticky', bottom: -24, background: t.color.bgElevated,
   padding:'16px 0', borderTop: `1px solid ${t.color.border}`,
   display:'flex', gap: 10,
 }}>
 <SButton variant="ghost" size="lg" onClick={resetProgress}>לאפס</SButton>
 <div style={{ flex: 1 }}>
   <SButton variant="primary" size="lg" onClick={finish} full>
     סיים אימון
   </SButton>
 </div>
 </div>
 <div style={{
   textAlign:'center', fontSize: 11, color: t.color.silver2,
   fontFamily: t.font.family.mono, letterSpacing: '0.14em',
   textTransform: 'uppercase', marginTop: 8,
 }}>
   הסימונים נשמרים בין ביקורים · "לאפס" מוחק הכל
 </div>

 {/* Plate calculator modal */}
 {plateOpen && (
 <Modal open={!!plateOpen} onClose={() => setPlateOpen(null)} title="Plate Calculator" width={400}>
 <PlateCalcDisplay weight={plateOpen.weight} />
 </Modal>
 )}
 </Modal>
 )
}

function PlateCalcDisplay({ weight }) {
 const result = calculatePlates(weight)
 return (
 <div style={{ textAlign:'center'}}>
 <div style={{ fontSize: 40, fontWeight: 900, color: t.color.gold, marginBottom: 12 }}>
 {weight}kg
 </div>
 {result.error && (
 <div style={{ color: t.color.warning, fontSize: t.font.sm, marginBottom: 12 }}>
 {result.error}
 </div>
 )}
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 16 }}>
 {platesNotation(result.plates, result.barbell)}
 </div>
 {/* Visual: bar + plates each side */}
 <div style={{
 display:'flex', alignItems:'center', justifyContent:'center',
 background: t.color.bgSoft, borderRadius: t.radius.md, padding: t.space.md, marginBottom: 12,
 }}>
 {/* left plates */}
 <PlatesGraph plates={result.plates} />
 {/* bar */}
 <div style={{ width: 60, height: 8, background:'#4a4a5a', margin:'0 8px'}} />
 {/* right plates (mirror) */}
 <PlatesGraph plates={result.plates} reverse />
 </div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
 לכל צד: {result.perSide.toFixed(1)}kg (מוט: {result.barbell}kg)
 </div>
 </div>
 )
}

function PlatesGraph({ plates, reverse }) {
 const list = reverse ? [...plates].reverse() : plates
 return (
 <div style={{ display:'flex', alignItems:'center'}}>
 {list.map((p, i) => (
 <div key={i} title={`${p.weight}kg`} style={{
 width: 8 + (p.weight / 25) * 8, // scale by weight
 height: 30 + (p.weight / 25) * 40,
 background: p.color, border: `1px solid ${t.color.border}`,
 marginRight: reverse ? 0 : 2,
 marginLeft: reverse ? 2 : 0,
 borderRadius: 2,
 }} />
 ))}
 </div>
 )
}

const setInput = {
 padding: 8, background: t.color.charcoal,
 border: `1px solid ${t.color.border}`, borderRadius: t.radius.sm,
 color: t.color.white,
 fontFamily: t.font.family.display,
 fontSize: 15, fontWeight: t.font.weight.semi,
 letterSpacing:'-0.02em',
 fontVariantNumeric:'tabular-nums',
 textAlign:'center', width:'100%', outline:'none',
}
