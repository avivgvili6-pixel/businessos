import React, { useMemo, useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Card, Button, Input, Badge } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { EXERCISES, EXERCISE_BY_ID, EQUIPMENT, MUSCLE_GROUPS } from '../../../../data/bodybuilding/exercisesUnified'
import { ExerciseGuideButton } from '../../../../components/train/ExerciseGuidePopover'

// ─── Level & goal presets ─────────────────────────────────
// 4 levels, each layers on intensifiers (supersets, dropsets)
const LEVELS = {
  beginner:    { he: 'מתחיל',   en: 'Beginner',    workingSets: 3, intensifiers: 'none' },
  intermediate:{ he: 'בינוני',  en: 'Intermediate',workingSets: 3, intensifiers: 'none' },
  advanced:    { he: 'מתקדם',   en: 'Advanced',    workingSets: 4, intensifiers: 'superset_last_pair' },
  expert:      { he: 'אקספרט',  en: 'Expert',      workingSets: 4, intensifiers: 'superset_and_dropset' },
}

const GOALS = {
  hypertrophy: { he: 'היפרטרופיה', en: 'Hypertrophy',  reps: [8, 12],  rest: 75 },
  endurance:   { he: 'סיבולת',    en: 'Endurance',    reps: [15, 20], rest: 40 },
  strength:    { he: 'כוח מירבי', en: 'Max strength', reps: [3, 5],   rest: 210 },
}

// Flat list of muscle-key → he/en label, drawn from MUSCLE_GROUPS
const ALL_MUSCLES = (() => {
  const out = []
  Object.values(MUSCLE_GROUPS).forEach(section => {
    Object.entries(section.muscles || {}).forEach(([key, m]) => {
      out.push({ key, he: m.he, en: m.en })
    })
  })
  return out
})()

// ─── Root ─────────────────────────────────────────────────
export function RoutineBuilder({ routine, open, onClose }) {
  const [mode, setMode] = useState(routine ? 'manual' : 'choose')
  const [seedExercises, setSeedExercises] = useState(null)

  const enterAuto = () => setMode('auto')
  const enterManual = (seed) => { setSeedExercises(seed || null); setMode('manual') }
  const back = () => setMode('choose')

  if (mode === 'choose') {
    return (
      <Modal open={open} onClose={onClose} title="צור Routine חדש" width={620}>
        <ModeChooser onAuto={enterAuto} onManual={() => enterManual(null)} />
      </Modal>
    )
  }

  if (mode === 'auto') {
    return (
      <Modal open={open} onClose={() => { back(); onClose() }} title="בנייה אוטומטית" width={720}>
        <AutoBuilder
          onGenerated={(exercises) => enterManual(exercises)}
          onCancel={back}
        />
      </Modal>
    )
  }

  return (
    <ManualBuilder
      routine={routine}
      seedExercises={seedExercises}
      open={open}
      onClose={onClose}
      onBack={routine ? null : back}
    />
  )
}

// ─── Mode chooser ─────────────────────────────────────────
function ModeChooser({ onAuto, onManual }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.24em',
        textTransform: 'uppercase', color: t.color.silver2, fontWeight: 600,
        textAlign: 'center', marginBottom: 4,
      }}>
        איך תרצה לבנות?
      </div>

      <ChoiceCard
        title="בנייה אוטומטית"
        subtitle="בחר שרירים · מטרה · רמה — המערכת בונה"
        bullets={[
          'שרירים: סמן איזה שרירים לתקוף',
          'מטרה: היפרטרופיה / סיבולת / כוח מירבי',
          'רמה: 4 רמות, מהמתחיל ועד סופרסטים + דרופסטים',
        ]}
        cta="בואו נבנה →"
        primary
        onClick={onAuto}
      />

      <ChoiceCard
        title="בנייה קלאסית"
        subtitle="אתה מרכיב תרגיל־תרגיל, ידני מלא"
        bullets={[
          'בחר תרגילים ממאגר של 280+ תרגילים',
          'הגדר סטים, חזרות, מנוחות',
          'סמן סופרסטים ודרופסטים על תבנית התרגיל',
        ]}
        cta="בואו נבנה →"
        onClick={onManual}
      />
    </div>
  )
}

function ChoiceCard({ title, subtitle, bullets, cta, primary, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'right',
        background: primary
          ? `linear-gradient(160deg, ${t.color.wineGlow || 'rgba(165,42,58,0.12)'} 0%, ${t.color.bgElevated} 60%)`
          : t.color.bgSoft,
        border: `1px solid ${primary ? t.color.wineLight : t.color.border}`,
        borderRadius: t.radius.lg,
        padding: 20, cursor: 'pointer', fontFamily: 'inherit', color: t.color.text,
        transition: t.transition,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = t.color.wineLight}
      onMouseLeave={e => e.currentTarget.style.borderColor = primary ? t.color.wineLight : t.color.border}
    >
      <div style={{
        fontFamily: t.font.family.display, fontSize: 22, fontWeight: 800,
        color: primary ? t.color.wineLight : t.color.ink,
        marginBottom: 4, letterSpacing: '-0.01em',
      }}>{title}</div>
      <div style={{ color: t.color.silver1, fontSize: 13, marginBottom: 12 }}>{subtitle}</div>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'grid', gap: 5, fontSize: 12.5, color: t.color.bone,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ color: t.color.wineLight, fontFamily: 'monospace' }}>›</span>
            {b}
          </li>
        ))}
      </ul>
      <div style={{
        marginTop: 14, color: t.color.wineLight, fontWeight: 600, fontSize: 13,
      }}>{cta}</div>
    </button>
  )
}

// ─── Auto builder ─────────────────────────────────────────
function AutoBuilder({ onGenerated, onCancel }) {
  const [muscles, setMuscles] = useState([])
  const [goalKey, setGoalKey] = useState('hypertrophy')
  const [levelKey, setLevelKey] = useState('intermediate')

  const toggleMuscle = (key) => {
    setMuscles(prev => prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key])
  }

  const generate = () => {
    if (!muscles.length) { alert('בחר לפחות שריר אחד'); return }
    const built = buildRoutineExercises({ muscles, goal: GOALS[goalKey], level: LEVELS[levelKey] })
    if (!built.length) { alert('לא נמצאו תרגילים מתאימים במאגר לשרירים שנבחרו'); return }
    onGenerated(built)
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {/* Step 1 — muscles */}
      <div>
        <StepLabel n="1" title="שרירים" hint="סמן איזה שרירים לאמן" />
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8,
          padding: 10, background: t.color.bgSoft, borderRadius: t.radius.md,
        }}>
          {ALL_MUSCLES.map(m => {
            const on = muscles.includes(m.key)
            return (
              <button
                key={m.key}
                onClick={() => toggleMuscle(m.key)}
                style={{
                  padding: '6px 12px',
                  background: on ? t.color.wineLight : 'transparent',
                  border: `1px solid ${on ? t.color.wineLight : t.color.border}`,
                  color: on ? t.color.white : t.color.silver1,
                  borderRadius: t.radius.pill, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600, transition: t.transition,
                }}
              >{m.he}</button>
            )
          })}
        </div>
        {muscles.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 11, color: t.color.silver2 }}>
            {muscles.length} שרירים נבחרו
          </div>
        )}
      </div>

      {/* Step 2 — goal */}
      <div>
        <StepLabel n="2" title="מטרה" hint="קובעת חזרות ומנוחות" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
          {Object.entries(GOALS).map(([key, g]) => {
            const on = goalKey === key
            return (
              <button
                key={key}
                onClick={() => setGoalKey(key)}
                style={{
                  padding: 14, textAlign: 'center',
                  background: on ? `${t.color.wineLight}22` : t.color.bgSoft,
                  border: `1px solid ${on ? t.color.wineLight : t.color.border}`,
                  borderRadius: t.radius.md, cursor: 'pointer', fontFamily: 'inherit',
                  color: t.color.text, transition: t.transition,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: on ? t.color.wineLight : t.color.text }}>{g.he}</div>
                <div style={{ fontSize: 11, color: t.color.textDim, marginTop: 4 }}>
                  {g.reps[0]}–{g.reps[1]} חזרות · {g.rest}ש׳ מנוחה
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 3 — level */}
      <div>
        <StepLabel n="3" title="רמה" hint="ככל שגבוה יותר — יותר סופרסטים ודרופסטים" />
        <div style={{
          display: 'flex', gap: 4, background: t.color.bgSoft,
          padding: 4, borderRadius: t.radius.md, marginTop: 8,
        }}>
          {Object.entries(LEVELS).map(([key, l]) => {
            const on = levelKey === key
            return (
              <button
                key={key}
                onClick={() => setLevelKey(key)}
                style={{
                  flex: 1, padding: '10px 4px', border: 'none',
                  background: on ? t.color.bgCard : 'transparent',
                  color: on ? t.color.wineLight : t.color.silver1,
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                  borderRadius: t.radius.sm, cursor: 'pointer',
                }}
              >{l.he}</button>
            )
          })}
        </div>
        <div style={{
          marginTop: 8, padding: 10, background: `${t.color.wineLight}0d`,
          borderRadius: t.radius.sm, fontSize: 12, color: t.color.bone,
          borderInlineStart: `2px solid ${t.color.wineLight}`,
        }}>
          {LEVELS[levelKey].workingSets} סטים עבודה לתרגיל · {intensifierLabel(LEVELS[levelKey].intensifiers)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>← חזור</Button>
        <Button
          variant="primary"
          onClick={generate}
          style={{ flex: 2, justifyContent: 'center' }}
          disabled={!muscles.length}
        >
          צור אימון ←
        </Button>
      </div>
    </div>
  )
}

function StepLabel({ n, title, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span style={{
        fontFamily: t.font.family.mono, fontSize: 11, letterSpacing: '0.18em',
        color: t.color.wineLight, fontWeight: 700,
      }}>{n}</span>
      <span style={{ fontFamily: t.font.family.display, fontSize: 18, fontWeight: 700, color: t.color.text }}>
        {title}
      </span>
      <span style={{ fontSize: 11, color: t.color.silver2, marginInlineStart: 'auto' }}>{hint}</span>
    </div>
  )
}

function intensifierLabel(kind) {
  if (kind === 'none') return 'בלי סופרסטים / דרופסטים'
  if (kind === 'superset_last_pair') return 'סופרסט על שני התרגילים האחרונים'
  if (kind === 'superset_and_dropset') return 'סופרסט על 2 זוגות + דרופסט בסט האחרון של הראשון'
  return ''
}

// ─── Auto-build algorithm ─────────────────────────────────
// Pick 2 exercises per muscle (1 compound-ish + 1 isolation-ish), apply
// goal reps + rest, apply level intensifiers.
function buildRoutineExercises({ muscles, goal, level }) {
  const out = []
  const reps = Math.round((goal.reps[0] + goal.reps[1]) / 2)

  muscles.forEach(muscleKey => {
    const candidates = EXERCISES.filter(e => e.primaryMuscle === muscleKey)
    if (!candidates.length) return
    // Pick up to 2 exercises, prefer barbell/dumbbell (compound) first
    const compound = candidates.filter(e => ['barbell', 'dumbbell', 'bodyweight'].includes(e.equipment))
    const iso = candidates.filter(e => ['cable', 'machine'].includes(e.equipment))
    const picks = [
      compound[0] || candidates[0],
      iso[0] || candidates[1] || compound[1],
    ].filter(Boolean).filter((x, i, arr) => arr.findIndex(y => y.id === x.id) === i).slice(0, 2)

    picks.forEach(ex => {
      const sets = []
      for (let i = 0; i < level.workingSets; i++) {
        sets.push({ type: 'working', weight: 0, reps })
      }
      out.push({
        exerciseId: ex.id,
        equipment: ex.equipment,
        notes: '',
        restSeconds: goal.rest,
        supersetGroup: null,
        sets,
      })
    })
  })

  // Apply intensifiers based on level
  if (level.intensifiers === 'superset_last_pair' && out.length >= 2) {
    const grp = 'ss1'
    out[out.length - 2].supersetGroup = grp
    out[out.length - 1].supersetGroup = grp
  } else if (level.intensifiers === 'superset_and_dropset' && out.length >= 4) {
    out[out.length - 4].supersetGroup = 'ss1'
    out[out.length - 3].supersetGroup = 'ss1'
    out[out.length - 2].supersetGroup = 'ss2'
    out[out.length - 1].supersetGroup = 'ss2'
    // Add a dropset to the last set of the first superset's first exercise
    const target = out[out.length - 4]
    target.sets.push({ type: 'dropset', weight: 0, reps: Math.max(6, reps - 4) })
  }

  return out
}

// ─── Manual builder (existing, extended with superset/dropset) ────
function ManualBuilder({ routine, seedExercises, open, onClose, onBack }) {
  const { bbSaveRoutine, state } = useApp()
  const [name, setName] = useState(routine?.name || '')
  const [emoji, setEmoji] = useState(routine?.emoji || '')
  const [exercises, setExercises] = useState(
    routine?.exercises
      ? JSON.parse(JSON.stringify(routine.exercises))
      : (seedExercises || [])
  )
  const [addingExercise, setAddingExercise] = useState(false)
  const settings = state.workoutSettings || {}

  const handleSave = () => {
    if (!name.trim()) return alert('שם ה-Routine חובה')
    if (!exercises.length) return alert('הוסף לפחות תרגיל אחד')
    const saved = {
      id: routine?.id || `custom_${Date.now()}`,
      name: name.trim(),
      emoji,
      createdBy: 'user',
      exercises,
    }
    bbSaveRoutine(saved)
    onClose()
  }

  const addExercise = (exercise) => {
    setExercises(prev => [...prev, {
      exerciseId: exercise.id,
      equipment: exercise.equipment,
      notes: '',
      restSeconds: settings.defaultRestSeconds || 90,
      supersetGroup: null,
      sets: [{ type: 'working', weight: 0, reps: 0 }],
    }])
    setAddingExercise(false)
  }

  const updateExercise = (idx, patch) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, ...patch } : ex))
  }
  const deleteExercise = (idx) => setExercises(prev => prev.filter((_, i) => i !== idx))

  const toggleSupersetWithNext = (idx) => {
    if (idx >= exercises.length - 1) return
    const current = exercises[idx]
    const next = exercises[idx + 1]
    if (current.supersetGroup && current.supersetGroup === next.supersetGroup) {
      // Unlink
      updateExercise(idx, { supersetGroup: null })
      updateExercise(idx + 1, { supersetGroup: null })
    } else {
      const grp = `ss_${Date.now()}_${idx}`
      updateExercise(idx, { supersetGroup: grp })
      updateExercise(idx + 1, { supersetGroup: grp })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={routine ? 'ערוך Routine' : 'צור Routine חדש'} width={640}>
      {/* Back button (only when arrived via chooser) */}
      {onBack && (
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: t.color.wineLight,
          padding: '4px 0', marginBottom: 12, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 12, fontWeight: 600,
        }}>← חזור לבחירת מצב</button>
      )}

      {seedExercises && (
        <div style={{
          background: 'rgba(74,156,106,0.08)', border: '1px solid rgba(74,156,106,0.35)',
          borderRadius: t.radius.sm, padding: 12, marginBottom: t.space.md,
          color: '#4a9c6a', fontSize: t.font.sm,
        }}>
          ✓ נבנה אוטומטית — ערוך משקלים ותרגילים לפי הצורך
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: t.space.md }}>
        <button style={{
          width: 60, height: 44, fontSize: 24,
          background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
          borderRadius: t.radius.sm, cursor: 'pointer',
        }} onClick={() => {
          const emojis = ['💪', '🔥', '⚡', '🏋️', '🎯', '🚀', '💥']
          const idx = emojis.indexOf(emoji)
          setEmoji(emojis[(idx + 1) % emojis.length])
        }}>{emoji || '＋'}</button>
        <Input placeholder="שם ה-Routine" value={name} onChange={e => setName(e.target.value)} />
      </div>

      {exercises.length === 0 && (
        <div style={{
          padding: t.space.xxl, textAlign: 'center',
          background: t.color.bgSoft, borderRadius: t.radius.md, marginBottom: t.space.md,
          color: t.color.textDim, fontSize: t.font.sm,
        }}>
          אין תרגילים. התחל בהוספת תרגיל.
        </div>
      )}

      {exercises.map((ex, idx) => (
        <ExerciseInRoutine
          key={idx}
          exerciseInRoutine={ex}
          idx={idx}
          onUpdate={patch => updateExercise(idx, patch)}
          onDelete={() => deleteExercise(idx)}
          onToggleSupersetWithNext={idx < exercises.length - 1 ? () => toggleSupersetWithNext(idx) : null}
          isSupersetTopHalf={exercises[idx + 1]?.supersetGroup && exercises[idx + 1].supersetGroup === ex.supersetGroup}
          isSupersetBottomHalf={exercises[idx - 1]?.supersetGroup && exercises[idx - 1].supersetGroup === ex.supersetGroup}
        />
      ))}

      <Button variant="primary" size="lg" onClick={() => setAddingExercise(true)} style={{ width: '100%', justifyContent: 'center', marginTop: t.space.md }}>
        + הוסף תרגיל
      </Button>

      <div style={{
        display: 'flex', gap: 8, marginTop: t.space.lg,
        position: 'sticky', bottom: -24, background: t.color.bgElevated,
        padding: '16px 0', borderTop: `1px solid ${t.color.border}`,
      }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>ביטול</Button>
        <Button variant="primary" onClick={handleSave} style={{ flex: 2, justifyContent: 'center' }}>שמור Routine</Button>
      </div>

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

function ExerciseInRoutine({ exerciseInRoutine: ex, idx, onUpdate, onDelete, onToggleSupersetWithNext, isSupersetTopHalf, isSupersetBottomHalf }) {
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
  const cycleSetType = (setIdx) => {
    const s = ex.sets[setIdx]
    const next = s.type === 'working' ? 'warmup' : s.type === 'warmup' ? 'dropset' : 'working'
    updateSet(setIdx, { type: next })
  }

  const isInSuperset = !!ex.supersetGroup
  const borderColor = isInSuperset ? t.color.wineLight : t.color.border

  return (
    <>
      {isSupersetBottomHalf && (
        <div style={{
          padding: '4px 0', textAlign: 'center',
          fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em',
          color: t.color.wineLight, fontWeight: 700,
          marginTop: -8, marginBottom: -4,
        }}>↕ SUPERSET</div>
      )}
      <Card style={{
        marginBottom: t.space.md,
        border: `1px solid ${borderColor}`,
        borderTopLeftRadius: isSupersetBottomHalf ? 0 : undefined,
        borderTopRightRadius: isSupersetBottomHalf ? 0 : undefined,
        borderBottomLeftRadius: isSupersetTopHalf ? 0 : undefined,
        borderBottomRightRadius: isSupersetTopHalf ? 0 : undefined,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>{EQUIPMENT[ex.equipment]?.icon || ''}</span>
          <b style={{ color: t.color.wineLight, flex: 1, minWidth: 100, fontSize: t.font.md }}>{exercise.he}</b>
          <ExerciseGuideButton exercise={exercise} compact />
          <button onClick={onDelete} style={{
            background: 'transparent', border: `1px solid ${t.color.border}`,
            color: t.color.textDim, cursor: 'pointer', padding: '4px 8px',
            borderRadius: t.radius.sm, fontFamily: 'inherit', fontSize: 14,
          }}>×</button>
        </div>

        {/* Meta row: rest + link-superset */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.color.silver1 }}>
            <span style={{ color: t.color.silver2 }}>מנוחה:</span>
            <input
              type="number"
              value={ex.restSeconds || 90}
              onChange={e => onUpdate({ restSeconds: +e.target.value })}
              style={{
                width: 60, padding: 4, background: t.color.bgSoft,
                border: `1px solid ${t.color.border}`, borderRadius: 4,
                color: t.color.text, fontFamily: 'inherit', textAlign: 'center', fontSize: 12,
              }}
            /><span style={{ color: t.color.silver2 }}>ש׳</span>
          </div>
          {onToggleSupersetWithNext && (
            <button
              onClick={onToggleSupersetWithNext}
              style={{
                background: isSupersetTopHalf ? t.color.wineLight : 'transparent',
                border: `1px solid ${t.color.wineLight}`,
                color: isSupersetTopHalf ? t.color.white : t.color.wineLight,
                padding: '4px 10px', borderRadius: t.radius.pill, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
              }}
            >
              {isSupersetTopHalf ? '↕ סופרסט עם הבא — פעיל' : '↕ צור סופרסט עם התרגיל הבא'}
            </button>
          )}
        </div>

        {/* Notes */}
        <input
          placeholder="הערות (אופציונלי)"
          value={ex.notes || ''}
          onChange={e => onUpdate({ notes: e.target.value })}
          style={{
            width: '100%', padding: 8, background: t.color.bgSoft,
            border: `1px solid ${t.color.border}`, borderRadius: t.radius.sm,
            color: t.color.text, fontFamily: 'inherit', fontSize: t.font.sm,
            marginBottom: 12,
          }}
        />

        {/* Sets */}
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: 8,
            fontSize: t.font.xs, color: t.color.textDim, padding: '4px 8px',
          }}>
            <span>סוג</span><span>ק״ג</span><span>חזרות</span><span></span>
          </div>
          {(ex.sets || []).map((s, si) => (
            <SetRow key={si} set={s} onCycleType={() => cycleSetType(si)} onUpdate={patch => updateSet(si, patch)} onRemove={() => removeSet(si)} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => addSet('working')} style={{ flex: 1, justifyContent: 'center' }}>+ סט עבודה</Button>
          <Button variant="ghost" size="sm" onClick={() => addSet('warmup')} style={{ flex: 1, justifyContent: 'center' }}>+ חימום</Button>
          <Button variant="ghost" size="sm" onClick={() => addSet('dropset')} style={{ flex: 1, justifyContent: 'center' }}>+ דרופסט</Button>
        </div>
      </Card>
    </>
  )
}

function SetRow({ set, onCycleType, onUpdate, onRemove }) {
  const isWarmup = set.type === 'warmup'
  const isDropset = set.type === 'dropset'
  const tint = isWarmup ? `${t.color.gold}15`
    : isDropset ? `${t.color.wineLight}18`
    : t.color.bgSoft
  const label = isWarmup ? 'W' : isDropset ? 'D' : '•'
  const labelColor = isWarmup ? t.color.gold : isDropset ? t.color.wineLight : t.color.text

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: 8,
      padding: 8, background: tint, borderRadius: 4, alignItems: 'center',
      marginInlineStart: isDropset ? 16 : 0,
    }}>
      <button onClick={onCycleType} style={{
        background: 'transparent', border: `1px solid ${labelColor}44`,
        color: labelColor, fontWeight: 800, fontSize: 12,
        cursor: 'pointer', textAlign: 'center', padding: '4px 0',
        borderRadius: 4, fontFamily: 'inherit',
      }} title="לחיצה מחליפה בין: עבודה / חימום / דרופסט">
        {label}
      </button>
      <input type="number" value={set.weight || ''} onChange={e => onUpdate({ weight: +e.target.value })} placeholder="—" style={setInput} />
      <input type="number" value={set.reps || ''} onChange={e => onUpdate({ reps: +e.target.value })} placeholder="—" style={setInput} />
      <button onClick={onRemove} style={{
        background: 'transparent', border: 'none', color: t.color.danger,
        cursor: 'pointer', fontSize: 16,
      }}>×</button>
    </div>
  )
}

const setInput = {
  padding: 6, background: 'rgba(0,0,0,.25)',
  border: `1px solid ${t.color.border}`, borderRadius: 4,
  color: t.color.text, fontFamily: 'inherit', textAlign: 'center', width: '100%',
}

// ─── Exercise picker (with muscle filter + alphabetical) ─────────
function ExercisePicker({ open, onClose, onSelect }) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('muscle') // 'muscle' | 'alpha'
  const [activeMuscle, setActiveMuscle] = useState(null)

  const list = useMemo(() => {
    let out = EXERCISES
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      out = out.filter(e => e.he?.toLowerCase().includes(q) || e.en?.toLowerCase().includes(q))
    }
    if (mode === 'muscle' && activeMuscle) {
      out = out.filter(e => e.primaryMuscle === activeMuscle)
    }
    if (mode === 'alpha') {
      out = [...out].sort((a, b) => (a.he || '').localeCompare(b.he || '', 'he'))
    }
    return out.slice(0, 150)
  }, [query, mode, activeMuscle])

  return (
    <Modal open={open} onClose={onClose} title="בחר תרגיל" width={560}>
      <Input placeholder="חיפוש..." value={query} onChange={e => setQuery(e.target.value)} style={{ marginBottom: 10 }} />

      <div style={{ display: 'flex', gap: 4, background: t.color.bgSoft, padding: 4, borderRadius: t.radius.md, marginBottom: 10 }}>
        <button onClick={() => setMode('muscle')} style={filterTab(mode === 'muscle')}>לפי שריר</button>
        <button onClick={() => { setMode('alpha'); setActiveMuscle(null) }} style={filterTab(mode === 'alpha')}>לפי א־ב</button>
      </div>

      {mode === 'muscle' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <FilterPill on={!activeMuscle} onClick={() => setActiveMuscle(null)}>הכל</FilterPill>
          {ALL_MUSCLES.map(m => (
            <FilterPill key={m.key} on={activeMuscle === m.key} onClick={() => setActiveMuscle(m.key)}>{m.he}</FilterPill>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
        {list.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: t.color.textDim, fontSize: 13 }}>
            לא נמצאו תרגילים. נסה חיפוש/סינון אחר.
          </div>
        )}
        {list.map(ex => (
          <div key={ex.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: 10,
            background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
            borderRadius: t.radius.sm,
          }}>
            <button onClick={() => onSelect(ex)} style={{
              display: 'flex', alignItems: 'center', gap: 12, flex: 1,
              background: 'transparent', border: 'none', padding: 0,
              cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
              color: t.color.text, minWidth: 0,
            }}>
              <span style={{ fontSize: 18 }}>{EQUIPMENT[ex.equipment]?.icon || ''}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: t.color.wineLight, fontWeight: 600 }}>{ex.he}</div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{ex.en}</div>
              </div>
            </button>
            <ExerciseGuideButton exercise={ex} compact />
            {ex.source === 'general' && (
              <span style={{
                fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: t.color.silver2, padding: '2px 6px',
                border: `1px solid ${t.color.border}`, borderRadius: 3,
              }}>Lib</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: t.color.silver2, textAlign: 'center' }}>
        {list.length} תרגילים{activeMuscle ? ` · ${ALL_MUSCLES.find(m => m.key === activeMuscle)?.he}` : ''}
      </div>
    </Modal>
  )
}

const filterTab = (on) => ({
  flex: 1, padding: '8px 10px', border: 'none',
  background: on ? t.color.bgCard : 'transparent',
  color: on ? t.color.wineLight : t.color.textDim,
  fontFamily: 'inherit', fontWeight: 600, fontSize: 12,
  borderRadius: t.radius.sm, cursor: 'pointer',
})

function FilterPill({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 10px',
      background: on ? t.color.wineLight : 'transparent',
      border: `1px solid ${on ? t.color.wineLight : t.color.border}`,
      color: on ? t.color.white : t.color.silver1,
      borderRadius: t.radius.pill, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 11, fontWeight: 600,
    }}>{children}</button>
  )
}
