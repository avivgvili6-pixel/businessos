import React, { useMemo, useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Button, Card } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { EXERCISES } from '../../../../data/bodybuilding/exercisesUnified'
import {
  parseWorkoutRequest,
  MUSCLE_HE, GOAL_HE, EQUIPMENT_HE, LEVEL_HE, GENDER_HE, SECONDARY_GOAL_HE,
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
  'תכתוב אימון למתאמנת ברמה גבוהה בת 40 שרוצה להתחטב ולתחזק, מיקוד בבטן ליבה רגליים ועכוז',
  'חזה יד קדמית ורגליים, נפח וכוח, חדר כושר, 60 דקות',
  'דחיפה כבד בבית עם משקולות',
  'גב וכתפיים, סיבולת, 40 דקות',
]

export function FreeformBuilder({ open, onClose, onGenerated }) {
  const { state } = useApp()
  const [text, setText] = useState('')
  const inheritedMode = modeFromState(state)

  // Manual overrides — only used when the parser did NOT catch it
  const [genderOverride, setGenderOverride] = useState(null) // 'female' | 'male' | null
  const [ageOverride, setAgeOverride] = useState(null)       // number | null

  const parsed = useMemo(() => parseWorkoutRequest(text), [text])

  // Effective params — parser first, manual override next, sensible defaults last
  const goal = parsed.goal || inheritedMode || 'hypertrophy'
  const level = parsed.level || 'intermediate'
  const gender = parsed.gender || genderOverride || null
  const age = parsed.age || ageOverride || null
  const totalExercises = exerciseCountForDuration(parsed.duration) || 6

  const canGenerate = parsed.muscles.length > 0

  const generate = () => {
    if (!canGenerate) return
    const exercises = buildFromParams({
      muscles: parsed.muscles,
      goal,
      secondaryGoal: parsed.secondaryGoal,
      level,
      equipment: parsed.equipment,
      totalExercises,
      gender,
      age,
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
                {parsed.secondaryGoal && (
                  <span style={{ marginInlineStart: 6, color: '#4a9c6a', fontSize: 11, fontWeight: 700 }}>
                    · {SECONDARY_GOAL_HE[parsed.secondaryGoal]}
                  </span>
                )}
                {!parsed.goal && <em style={{ color: t.color.silver2, fontSize: 11, marginInlineStart: 6 }}>· יורש מהמטרה שלך</em>}
              </SlotRow>
              <SlotRow label="מין" ok={!!parsed.gender} inherited={!parsed.gender && !!genderOverride}>
                {gender ? GENDER_HE[gender] : 'לא צוין'}
                {!parsed.gender && genderOverride && <em style={{ color: t.color.silver2, fontSize: 11, marginInlineStart: 6 }}>· הושלם ידנית</em>}
              </SlotRow>
              <SlotRow label="גיל" ok={!!parsed.age} inherited={!parsed.age && !!ageOverride}>
                {age ? `${age}` : 'לא צוין'}
                {!parsed.age && ageOverride && <em style={{ color: t.color.silver2, fontSize: 11, marginInlineStart: 6 }}>· הושלם ידנית</em>}
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

        {/* Manual quick-completions — appear only when the parser missed something */}
        {text && (!parsed.gender || !parsed.age) && (
          <QuickCompletions
            missingGender={!parsed.gender}
            missingAge={!parsed.age}
            genderOverride={genderOverride}
            ageOverride={ageOverride}
            onGender={setGenderOverride}
            onAge={setAgeOverride}
          />
        )}

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

// Manual chip picker — only rendered when the text-parser missed something.
// Kept minimal on purpose: the primary path is still natural language.
function QuickCompletions({ missingGender, missingAge, genderOverride, ageOverride, onGender, onAge }) {
  return (
    <div style={{
      padding: 12,
      background: `linear-gradient(180deg, rgba(0,229,255,0.05) 0%, ${t.color.bgSoft} 100%)`,
      border: `1px dashed rgba(0,229,255,0.3)`,
      borderRadius: t.radius.md,
      display: 'grid', gap: 12,
    }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.24em',
        textTransform: 'uppercase', color: '#00E5FF', fontWeight: 700,
      }}>השלמות מהירות · אופציונלי</div>

      {missingGender && (
        <div>
          <div style={{ fontSize: 11, color: t.color.silver1, marginBottom: 6 }}>מין:</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ k: 'female', label: 'נקבה' }, { k: 'male', label: 'זכר' }].map(o => {
              const on = genderOverride === o.k
              return (
                <button key={o.k} onClick={() => onGender(on ? null : o.k)} style={{
                  padding: '6px 14px',
                  background: on ? '#00E5FF22' : 'transparent',
                  border: `1px solid ${on ? '#00E5FF' : t.color.border}`,
                  color: on ? '#00E5FF' : t.color.silver1,
                  borderRadius: t.radius.pill, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 700,
                }}>{o.label}</button>
              )
            })}
          </div>
        </div>
      )}

      {missingAge && (
        <div>
          <div style={{ fontSize: 11, color: t.color.silver1, marginBottom: 6 }}>
            גיל: <span style={{ color: '#00E5FF', fontWeight: 800 }}>{ageOverride || '—'}</span>
          </div>
          <input
            type="range"
            min={15}
            max={70}
            step={1}
            value={ageOverride || 30}
            onChange={e => onAge(+e.target.value)}
            style={{
              width: '100%', accentColor: '#00E5FF', direction: 'ltr',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.color.silver2 }}>
            <span>15</span><span>70</span>
          </div>
        </div>
      )}
    </div>
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
// Extended: uses gender + age + secondaryGoal to bias exercise selection
// and rest timing on top of the base compound-then-isolation pattern.
function buildFromParams({ muscles, goal, secondaryGoal, level, equipment, totalExercises, gender, age }) {
  const mode = TRAINING_MODES[goal] || TRAINING_MODES.hypertrophy
  const workingSets = level === 'beginner' ? 3 : level === 'intermediate' ? 3 : 4
  // Toning shortens the load and lengthens the set — pushes reps toward the
  // upper end of the endurance range; maintenance sits mid-hypertrophy.
  let reps = Math.round((mode.repRange[0] + mode.repRange[1]) / 2)
  if (secondaryGoal === 'toning') reps = Math.max(reps, mode.repRange[1] - 1)
  if (secondaryGoal === 'maintenance') reps = Math.min(10, Math.max(8, reps))

  // Older trainees get more rest — recovery capacity drops after 40, more
  // sharply after 50. Younger stays on the mode default.
  let restSeconds = mode.restSeconds
  if (age && age >= 50) restSeconds += 30
  else if (age && age >= 40) restSeconds += 15

  // Equipment filter — soft filter (prefer, don't exclude)
  const equipmentPref = (eq) => {
    if (!equipment || equipment === 'gym') return true
    if (equipment === 'bodyweight') return eq === 'bodyweight' || eq === 'none'
    return eq === equipment || eq === 'bodyweight'
  }

  // Muscles the female-toning bias emphasizes — these get an extra pick
  // when female + toning is requested.
  const femaleTonePriorityMuscles = new Set(['glutes', 'hamstrings', 'abdominals', 'lower_back'])
  const isFemaleToning = gender === 'female' && (secondaryGoal === 'toning' || goal === 'endurance')

  // How many exercises per muscle — biased muscles get +1
  const basePerMuscle = Math.max(1, Math.round(totalExercises / muscles.length))
  const perMuscleFor = (muscleKey) => {
    if (isFemaleToning && femaleTonePriorityMuscles.has(muscleKey)) return basePerMuscle + 1
    return basePerMuscle
  }

  // Compound-heavy for younger + strength/hypertrophy; skew toward
  // cable/machine for older trainees (kinder joints, easier setup).
  const isOlder = age && age >= 45
  const compoundEquipment = ['barbell', 'dumbbell', 'bodyweight']
  const jointFriendlyEquipment = ['cable', 'machine', 'band']

  const picked = []
  const usedIds = new Set()

  for (const muscleKey of muscles) {
    const candidates = EXERCISES.filter(e => e.primaryMuscle === muscleKey)
    if (!candidates.length) continue

    const scored = candidates.map(ex => {
      let score = 0
      if (equipmentPref(ex.equipment)) score += 3
      if (isOlder) {
        if (jointFriendlyEquipment.includes(ex.equipment)) score += 2
      } else {
        if (compoundEquipment.includes(ex.equipment)) score += 2
      }
      return { ex, score }
    }).sort((a, b) => b.score - a.score)

    const pickedForMuscle = []
    const target = perMuscleFor(muscleKey)
    for (const { ex } of scored) {
      if (pickedForMuscle.length >= target) break
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
    picked[picked.length - 2].sets.push({
      type: 'dropset', weight: 0, reps: Math.max(6, reps - 4),
    })
  } else if (level === 'advanced' && picked.length >= 2) {
    const grp = 'ss_' + Date.now()
    picked[picked.length - 2].supersetGroup = grp
    picked[picked.length - 1].supersetGroup = grp
  }

  return picked
}
