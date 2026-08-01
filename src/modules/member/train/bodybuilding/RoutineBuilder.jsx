import React, { useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Card, Button, Input, Badge } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { EXERCISES, EXERCISE_BY_ID, EQUIPMENT } from '../../../../data/bodybuilding/exercises'
import { calculateWarmup } from '../../../../data/bodybuilding/calculators'

// Routine builder — Standard create/edit routine with add exercise + sets table.
export function RoutineBuilder({ routine, open, onClose }) {
 const { bbSaveRoutine, state } = useApp()
 const [name, setName] = useState(routine?.name || '')
 const [emoji, setEmoji] = useState(routine?.emoji || '')
 const [exercises, setExercises] = useState(routine?.exercises ? JSON.parse(JSON.stringify(routine.exercises)) : [])
 const [addingExercise, setAddingExercise] = useState(false)
 const settings = state.workoutSettings || {}

 const handleSave = () => {
 if (!name.trim()) return alert('שם ה-routine חובה')
 if (!exercises.length) return alert('הוסף לפחות תרגיל אחד')
 const saved = {
 id: routine?.id || `custom_${Date.now()}`,
 name: name.trim(),
 emoji,
 createdBy:'user',
 exercises,
 }
 bbSaveRoutine(saved)
 onClose()
 }

 const addExercise = (exercise) => {
 setExercises(prev => [...prev, {
 exerciseId: exercise.id,
 equipment: exercise.equipment,
 notes:'',
 restSeconds: settings.defaultRestSeconds || 90,
 sets: [{ type:'working', weight: 0, reps: 0 }],
 }])
 setAddingExercise(false)
 }

 const updateExercise = (idx, patch) => {
 setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, ...patch } : ex))
 }

 const deleteExercise = (idx) => {
 setExercises(prev => prev.filter((_, i) => i !== idx))
 }

 return (
 <Modal open={open} onClose={onClose} title={routine ? 'ערוך Routine':'צור Routine חדש'} width={640}>
 {/* Info banner */}
 <div style={{
 background: `${t.color.warning}22`, borderRadius: t.radius.sm,
 padding: 12, marginBottom: t.space.md, color: t.color.warning, fontSize: t.font.sm,
 }}>
 Routines הן תבניות לשימוש חוזר. הזן משקל וחזרות מראש או השאר ריק להזנה בזמן אמת.
 </div>

 {/* Title + emoji */}
 <div style={{ display:'flex', gap: 8, marginBottom: t.space.md }}>
 <button style={{
 width: 60, height: 44, fontSize: 24,
 background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
 borderRadius: t.radius.sm, cursor:'pointer',
 }} onClick={() => {
 const emojis = ['','','','','','','','','']
 const idx = emojis.indexOf(emoji)
 setEmoji(emojis[(idx + 1) % emojis.length])
 }}>{emoji}</button>
 <Input
 placeholder="שם ה-Routine (למשל: חזה וכתפיים)"
 value={name}
 onChange={e => setName(e.target.value)}
 />
 </div>

 {/* Exercises list */}
 {exercises.length === 0 && (
 <div style={{
 padding: t.space.xxl, textAlign:'center',
 background: t.color.bgSoft, borderRadius: t.radius.md, marginBottom: t.space.md,
 }}>
 <div style={{ fontSize: 40, marginBottom: 8 }}> </div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: 12 }}>
 אין תרגילים. התחל בהוספת תרגיל.
 </div>
 </div>
 )}

 {exercises.map((ex, idx) => (
 <ExerciseInRoutine
 key={idx}
 exerciseInRoutine={ex}
 idx={idx}
 onUpdate={patch => updateExercise(idx, patch)}
 onDelete={() => deleteExercise(idx)}
 rpeEnabled={settings.rpeEnabled}
 />
 ))}

 <Button variant="primary"size="lg"onClick={() => setAddingExercise(true)} style={{ width:'100%', justifyContent:'center', marginTop: t.space.md }}>
 + הוסף תרגיל
 </Button>

 {/* Save/Cancel */}
 <div style={{ display:'flex', gap: 8, marginTop: t.space.lg, position:'sticky', bottom: -24, background: t.color.bgElevated, padding:'16px 0', borderTop: `1px solid ${t.color.border}` }}>
 <Button variant="ghost"onClick={onClose} style={{ flex: 1, justifyContent:'center'}}>ביטול</Button>
 <Button variant="primary"onClick={handleSave} style={{ flex: 2, justifyContent:'center'}}> שמור</Button>
 </div>

 {/* Add exercise picker */}
 {addingExercise && (
 <ExercisePicker
 open={addingExercise}
 onClose={() => setAddingExercise(false)}
 onSelect={addExercise}
 />
 )}
 </Modal>
 )
}

function ExerciseInRoutine({ exerciseInRoutine: ex, idx, onUpdate, onDelete, rpeEnabled }) {
 const exercise = EXERCISE_BY_ID[ex.exerciseId]
 if (!exercise) return null

 const addSet = (type = 'working') => {
 onUpdate({ sets: [...(ex.sets || []), { type, weight: 0, reps: 0 }] })
 }
 const updateSet = (setIdx, patch) => {
 onUpdate({ sets: ex.sets.map((s, i) => i === setIdx ? { ...s, ...patch } : s) })
 }
 const removeSet = (setIdx) => {
 onUpdate({ sets: ex.sets.filter((_, i) => i !== setIdx) })
 }
 const toggleWarmup = (setIdx) => {
 const s = ex.sets[setIdx]
 updateSet(setIdx, { type: s.type === 'warmup'? 'working':'warmup'})
 }

 return (
 <Card style={{ marginBottom: t.space.md }}>
 {/* Exercise header */}
 <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 8 }}>
 <span style={{ fontSize: 24 }}>{EQUIPMENT[ex.equipment]?.icon || ''}</span>
 <b style={{ color: t.color.info, flex: 1, fontSize: t.font.md }}>{exercise.he}</b>
 <button onClick={onDelete} style={{
 background:'none', border:'none', color: t.color.danger,
 fontSize: 20, cursor:'pointer',
 }}> </button>
 </div>

 {/* Notes */}
 <input
 placeholder="הוסף notes..."
 value={ex.notes || ''}
 onChange={e => onUpdate({ notes: e.target.value })}
 style={{
 width:'100%', padding: 8, background: t.color.bgSoft,
 border: `1px solid ${t.color.borderSoft}`, borderRadius: t.radius.sm,
 color: t.color.text, fontFamily:'inherit', fontSize: t.font.sm,
 marginBottom: 8,
 }}
 />

 {/* Rest timer */}
 <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12, fontSize: t.font.sm, color: t.color.info }}>
 ⏱ Rest:
 <input
 type="number"
 value={ex.restSeconds || 90}
 onChange={e => onUpdate({ restSeconds: +e.target.value })}
 style={{
 width: 70, padding: 4, background: t.color.bgSoft,
 border: `1px solid ${t.color.borderSoft}`, borderRadius: 4,
 color: t.color.text, fontFamily:'inherit', textAlign:'center',
 }}
 />
 <span style={{ color: t.color.textDim }}>שניות</span>
 </div>

 {/* Sets table */}
 <div style={{ display:'grid', gap: 4 }}>
 <div style={{ display:'grid', gridTemplateColumns:'50px 1fr 1fr 40px', gap: 8, fontSize: t.font.xs, color: t.color.textDim, padding:'4px 8px'}}>
 <span>SET</span>
 <span>KG</span>
 <span>REPS</span>
 <span></span>
 </div>
 {(ex.sets || []).map((s, si) => {
 const setLabel = s.type === 'warmup'? 'W': ex.sets.slice(0, si + 1).filter(x => x.type !== 'warmup').length
 const isWarmup = s.type === 'warmup'
 return (
 <div key={si} style={{
 display:'grid', gridTemplateColumns:'50px 1fr 1fr 40px', gap: 8,
 padding:'8px', background: isWarmup ? `${t.color.gold}11` : t.color.bgSoft,
 borderRadius: 4, alignItems:'center',
 }}>
 <button onClick={() => toggleWarmup(si)} style={{
 background:'none', border:'none',
 color: isWarmup ? t.color.gold : t.color.text,
 fontWeight: 900, fontSize: t.font.md, cursor:'pointer',
 textAlign:'center',
 }}>{setLabel}</button>
 <input type="number"value={s.weight || ''} onChange={e => updateSet(si, { weight: +e.target.value })}
 placeholder="—"style={setInput}
 />
 <input type="number"value={s.reps || ''} onChange={e => updateSet(si, { reps: +e.target.value })}
 placeholder="—"style={setInput}
 />
 <button onClick={() => removeSet(si)} style={{
 background:'none', border:'none', color: t.color.danger,
 cursor:'pointer', fontSize: 16,
 }}>×</button>
 </div>
 )
 })}
 </div>

 <div style={{ display:'flex', gap: 8, marginTop: 8 }}>
 <Button variant="ghost"size="sm"onClick={() => addSet('working')} style={{ flex: 1, justifyContent:'center'}}>
 + סט
 </Button>
 <Button variant="ghost"size="sm"onClick={() => addSet('warmup')} style={{ flex: 1, justifyContent:'center'}}>
 + חימום
 </Button>
 </div>
 </Card>
 )
}

const setInput = {
 padding: 6, background:'#0d0d14',
 border: `1px solid ${t.color.borderSoft}`, borderRadius: 4,
 color: t.color.text, fontFamily:'inherit', textAlign:'center', width:'100%',
}

// Sub-modal for picking an exercise
function ExercisePicker({ open, onClose, onSelect }) {
 const [query, setQuery] = useState('')
 const filtered = query.trim()
 ? EXERCISES.filter(e =>
 e.he.toLowerCase().includes(query.toLowerCase()) ||
 e.en.toLowerCase().includes(query.toLowerCase())
 ).slice(0, 30)
 : EXERCISES.slice(0, 30)

 return (
 <Modal open={open} onClose={onClose} title="בחר תרגיל"width={520}>
 <Input placeholder="חיפוש..." value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: t.space.md }} />
 <div style={{ display:'grid', gap: 6, maxHeight: 400, overflowY:'auto'}}>
 {filtered.map(ex => (
 <button key={ex.id} onClick={() => onSelect(ex)} style={{
 display:'flex', alignItems:'center', gap: 12, padding: 10,
 background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
 borderRadius: t.radius.sm, cursor:'pointer', textAlign:'right',
 fontFamily:'inherit', color: t.color.text,
 }}>
 <span style={{ fontSize: 20 }}>{EQUIPMENT[ex.equipment]?.icon || ''}</span>
 <div style={{ flex: 1 }}>
 <div style={{ color: t.color.info, fontWeight: 600 }}>{ex.he}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{ex.en}</div>
 </div>
 </button>
 ))}
 </div>
 </Modal>
 )
}
