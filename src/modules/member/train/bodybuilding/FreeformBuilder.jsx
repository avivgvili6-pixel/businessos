import React, { useMemo, useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Button, Card } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { EXERCISES } from '../../../../data/bodybuilding/exercisesUnified'
import {
  parseWorkoutRequest,
  MUSCLE_HE, GOAL_HE, EQUIPMENT_HE, LEVEL_HE,
  exerciseCountForDuration,
} from '../../../../utils/nlWorkoutParser'
import { modeFromState, TRAINING_MODES } from '../../../../data/trainingMode'

// Freeform natural-language → generated Routine.
// User types what they want, sees live-parsed preview, then generates.
// On generate: builds Routine using existing pattern (compound-first
// then isolation per muscle) and opens the standard RoutineBuilder
// with the result pre-populated so they can edit/save.
//
// Props:
//   open, onClose
//   onGenerated(exercises) — hands back the built exercise array; the
//     parent (RoutineBuilder) pipes it into its manual editor.

const EXAMPLES = [
  'חזה יד קדמית ורגליים, נפח וכוח, אני בחדר כושר, 60 דקות',
  'דחיפה כבד בבית עם משקולות',
  'גב וכתפיים, סיבולת, 40 דקות',
  'רגליים כבד, כוח מירבי, מוט',
]

export function FreeformBuilder({ open, onClose, onGenerated }) {
  const { state } = useApp()
  const [text, setText] = useState('')
  const inheritedMode = modeFromState(state)

  const parsed = useMemo(() => parseWorkoutRequest(text), [text])

  // Effective params — fill missing slots with sensible defaults
  const goal = parsed.goal || inheritedMode || 'hypertrophy'
  const level = parsed.level || 'intermediate'
  const totalExercises = exerciseCountForDuration(parsed.duration) || 6

  const canGenerate = parsed.muscles.length > 0

  const generate = () => {
    if (!canGenerate) return
    const exercises = buildFromParams({
      muscles: parsed.muscles,
      goal,
      level,
      equipment: parsed.equipment,
      totalExercises,
    })
    if (!exercises.length) {
      alert('לא נמצאו תרגילים מתאימים במאגר לשילוב שביקשת. נסה תיאור אחר.')
      return
    }
    onGenerated(exercises)
  }

  const useExample = (ex) => setText(ex)

  return (
    <Modal open={open} onClose={onClose} title="בונה אימון מטקסט" width={640}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <div style={{
            fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700, marginBottom: 8,
          }}>תאר את האימון שאתה רוצה</div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'למשל: "חזה יד קדמית ורגליים, נפח וכוח, חדר כושר, 60 דקות"'}
            rows={4}
            autoFocus
            style={{
              width: '100%', padding: 14,
              background: t.color.bgSoft,
              border: `1px solid ${text ? t.color.wineLight : t.color.border}`,
              borderRadius: t.radius.md,
              color: t.color.text, fontFamily: 'inherit', fontSize: 14,
              lineHeight: 1.55, resize: 'vertical', outline: 'none',
              direction: 'rtl', transition: t.transition,
            }}
          />
        </div>

        {/* Examples */}
        <div>
          <div style={{
            fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: t.color.silver2, fontWeight: 600, marginBottom: 6,
          }}>דוגמאות · לחיצה ממלאת</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => useExample(ex)} style={{
                padding: '5px 10px',
                background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
                borderRadius: t.radius.pill, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 11, color: t.color.silver1, textAlign: 'right',
              }}>{ex}</button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <Card style={{
          padding: 16,
          background: text
            ? `linear-gradient(160deg, rgba(199,64,80,0.06) 0%, ${t.color.bgElevated} 60%)`
            : t.color.bgSoft,
          border: `1px solid ${text ? 'rgba(199,64,80,0.35)' : t.color.border}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 10,
          }}>
            <div style={{
              fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.24em',
              textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
            }}>מה זיהיתי</div>
            {text && (
              <div style={{
                fontFamily: t.font.family.mono, fontSize: 10,
                color: parsed.confidence >= 70 ? '#4a9c6a' : parsed.confidence >= 40 ? t.color.wineLight : t.color.silver2,
                fontWeight: 700,
              }}>{parsed.confidence}% זיהוי</div>
            )}
          </div>

          {!text && (
            <div style={{ fontSize: 13, color: t.color.silver2, textAlign: 'center', padding: '8px 0' }}>
              התיאור שלך יתפרש כאן בזמן אמת
            </div>
          )}

          {text && (
            <div style={{ display: 'grid', gap: 8 }}>
              <SlotRow label="שרירים" ok={parsed.muscles.length > 0}>
                {parsed.muscles.length > 0
                  ? parsed.muscles.map(m => MUSCLE_HE[m] || m).join(' · ')
                  : 'לא זוהו — הוסף למשל "חזה" או "רגליים"'}
              </SlotRow>
              <SlotRow label="מטרה" ok={!!parsed.goal} inherited={!parsed.goal}>
                {GOAL_HE[goal]}
                {!parsed.goal && <em style={{ color: t.color.silver2, fontSize: 11, marginInlineStart: 6 }}>· יורש מהמטרה שלך</em>}
              </SlotRow>
              <SlotRow label="ציוד" ok={!!parsed.equipment}>
                {parsed.equipment ? EQUIPMENT_HE[parsed.equipment] : 'כל הציוד — לא צוין'}
              </SlotRow>
              <SlotRow label="רמה" ok={!!parsed.level} inherited={!parsed.level}>
                {LEVEL_HE[level]}
                {!parsed.level && <em style={{ color: t.color.silver2, fontSize: 11, marginInlineStart: 6 }}>· ברירת מחדל</em>}
              </SlotRow>
              <SlotRow label="משך" ok={!!parsed.duration}>
                {parsed.duration ? `${parsed.duration} דק׳ · ~${totalExercises} תרגילים` : `לא צוין · ~${totalExercises} תרגילים`}
              </SlotRow>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onClose}>ביטול</Button>
          <Button variant="primary" onClick={generate} disabled={!canGenerate}>
            {canGenerate ? 'צור אימון ←' : 'הזן שרירים כדי להמשיך'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function SlotRow({ label, ok, inherited, children }) {
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'baseline',
      padding: '8px 10px',
      background: 'rgba(0,0,0,0.15)',
      borderRadius: t.radius.sm,
      borderInlineStart: `2px solid ${ok ? '#4a9c6a' : inherited ? t.color.wineLight : t.color.border}`,
    }}>
      <span style={{
        fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: ok ? '#4a9c6a' : inherited ? t.color.wineLight : t.color.silver2,
        fontWeight: 700, minWidth: 60, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: 13, color: t.color.text }}>{children}</span>
    </div>
  )
}

// ─── Build routine exercises from parsed params ─────────────
// Same pattern the AutoBuilder uses: pick 1-2 exercises per muscle,
// prefer compound first (barbell/dumbbell/bodyweight), then isolation
// (cable/machine). Apply goal reps + level intensifiers.
function buildFromParams({ muscles, goal, level, equipment, totalExercises }) {
  const mode = TRAINING_MODES[goal] || TRAINING_MODES.hypertrophy
  const workingSets = level === 'beginner' ? 3 : level === 'intermediate' ? 3 : 4
  const reps = Math.round((mode.repRange[0] + mode.repRange[1]) / 2)
  const restSeconds = mode.restSeconds

  // Equipment filter — soft filter (prefer, don't exclude)
  const equipmentPref = (eq) => {
    if (!equipment || equipment === 'gym') return true // gym = all allowed
    if (equipment === 'bodyweight') return eq === 'bodyweight' || eq === 'none'
    return eq === equipment || eq === 'bodyweight' // fallback to bodyweight if specific equipment out
  }

  // How many exercises per muscle
  const perMuscle = Math.max(1, Math.round(totalExercises / muscles.length))

  const picked = []
  const usedIds = new Set()

  for (const muscleKey of muscles) {
    const candidates = EXERCISES.filter(e => e.primaryMuscle === muscleKey)
    if (!candidates.length) continue

    // Sort: preferred equipment first, then compound before isolation
    const compound = ['barbell', 'dumbbell', 'bodyweight']
    const scored = candidates.map(ex => ({
      ex,
      score: (equipmentPref(ex.equipment) ? 2 : 0)
           + (compound.includes(ex.equipment) ? 1 : 0),
    })).sort((a, b) => b.score - a.score)

    const pickedForMuscle = []
    for (const { ex } of scored) {
      if (pickedForMuscle.length >= perMuscle) break
      if (usedIds.has(ex.id)) continue
      pickedForMuscle.push(ex)
      usedIds.add(ex.id)
    }

    for (const ex of pickedForMuscle) {
      const sets = []
      for (let i = 0; i < workingSets; i++) {
        sets.push({ type: 'working', weight: 0, reps })
      }
      picked.push({
        exerciseId: ex.id,
        equipment: ex.equipment,
        notes: '',
        restSeconds,
        supersetGroup: null,
        sets,
      })
    }
  }

  // Expert level → add a superset on the last pair + a dropset
  if (level === 'expert' && picked.length >= 2) {
    const grp = 'ss_' + Date.now()
    picked[picked.length - 2].supersetGroup = grp
    picked[picked.length - 1].supersetGroup = grp
    // Dropset on last set of first exercise
    picked[picked.length - 2].sets.push({
      type: 'dropset', weight: 0, reps: Math.max(6, reps - 4),
    })
  }
  // Advanced → single superset on last pair
  else if (level === 'advanced' && picked.length >= 2) {
    const grp = 'ss_' + Date.now()
    picked[picked.length - 2].supersetGroup = grp
    picked[picked.length - 1].supersetGroup = grp
  }

  return picked
}
