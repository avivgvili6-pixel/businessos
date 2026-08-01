import React from 'react'
import { t } from '../../../../theme/tokens'
import { Modal, Card, Button, Badge } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { LEVELS, GOALS, EQUIPMENT_TYPES } from '../../../../data/bodybuilding/programs'
import { ROUTINE_BY_ID, estimateDurationMin } from '../../../../data/bodybuilding/routines'
import { EXERCISE_BY_ID } from '../../../../data/bodybuilding/exercises'

// Program detail modal — shown when user taps a program card in Explore.
export function ProgramDetail({ program, open, onClose }) {
  const { state, bbSaveProgram, bbUnsaveProgram, bbSetActiveProgram } = useApp()
  const saved = state.bbSavedPrograms?.includes(program.id)

  const routines = (program.routines || []).map(rid => ROUTINE_BY_ID[rid]).filter(Boolean)
  const uniqueRoutines = Array.from(new Map(routines.map(r => [r.id, r])).values())

  const toggleSave = () => {
    if (saved) bbUnsaveProgram(program.id)
    else bbSaveProgram(program.id)
  }
  const startProgram = () => {
    bbSetActiveProgram(program)
    onClose()
    alert(`התוכנית "${program.name}" הופעלה! תוכל להריץ אימונים מה-Routines שלה.`)
  }

  return (
    <Modal open={open} onClose={onClose} title={program.name} width={640}>
      {/* Cover */}
      <div style={{
        background: `linear-gradient(135deg, ${t.color.gold}22, ${t.color.purple}22)`,
        borderRadius: t.radius.md, padding: t.space.xxl,
        textAlign: 'center', marginBottom: t.space.md,
      }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>{program.emoji}</div>
        <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.text }}>{program.name}</div>
        {program.inspiration && (
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 8 }}>
            בהשראת: {program.inspiration}
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: t.space.md }}>
        <Badge color={t.color.gold}>{LEVELS[program.level]?.he}</Badge>
        <Badge color={t.color.purple}>{GOALS[program.goal]?.he}</Badge>
        <Badge color={t.color.info}>{EQUIPMENT_TYPES[program.equipment]?.he}</Badge>
        <Badge color={t.color.success}>{program.daysPerWeek} ימים/שבוע</Badge>
        <Badge color={t.color.textDim}>{program.weeksRecommended} שבועות</Badge>
      </div>

      {/* Description */}
      <div style={{ color: t.color.text, fontSize: t.font.md, lineHeight: 1.7, marginBottom: t.space.lg }}>
        {program.description}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: t.space.lg }}>
        <Button variant="primary" size="lg" onClick={startProgram} style={{ flex: 2, justifyContent: 'center' }}>
          ▶ הפעל את התוכנית
        </Button>
        <Button variant={saved ? 'solid' : 'outline'} onClick={toggleSave}>
          {saved ? '💾 שמור ✓' : '💾 שמור'}
        </Button>
      </div>

      {/* Routines list */}
      <div style={{ fontSize: t.font.md, fontWeight: 700, color: t.color.gold, marginBottom: t.space.md }}>
        📋 Routines ({uniqueRoutines.length})
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {uniqueRoutines.map(r => (
          <RoutinePreview key={r.id} routine={r} />
        ))}
      </div>
    </Modal>
  )
}

function RoutinePreview({ routine }) {
  const duration = estimateDurationMin(routine)
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{routine.emoji || '🏋️'}</span>
        <b style={{ color: t.color.text, fontSize: t.font.md, flex: 1 }}>{routine.name}</b>
        <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>~{duration} דק'</span>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {(routine.exercises || []).slice(0, 6).map((ex, i) => {
          const exercise = EXERCISE_BY_ID[ex.exerciseId]
          if (!exercise) return null
          const workingSets = (ex.sets || []).filter(s => s.type !== 'warmup').length
          const range = getRepRange(ex.sets)
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: t.font.sm,
              borderBottom: i < 5 ? `1px solid ${t.color.borderSoft}` : 'none',
            }}>
              <span style={{ color: t.color.info, fontWeight: 600 }}>{exercise.he}</span>
              <span style={{ color: t.color.textDim, fontSize: t.font.xs }}>
                {workingSets} sets · {range}
              </span>
            </div>
          )
        })}
        {(routine.exercises || []).length > 6 && (
          <div style={{ fontSize: t.font.xs, color: t.color.textMuted, textAlign: 'center', marginTop: 4 }}>
            + {routine.exercises.length - 6} נוספים
          </div>
        )}
      </div>
    </Card>
  )
}

function getRepRange(sets) {
  if (!sets?.length) return '—'
  const reps = sets.filter(s => s.type !== 'warmup').map(s => s.reps).filter(r => r > 0)
  if (!reps.length) return '—'
  const min = Math.min(...reps)
  const max = Math.max(...reps)
  return min === max ? `${min} reps` : `${min}-${max} reps`
}
