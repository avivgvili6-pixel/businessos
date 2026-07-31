import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Modal, Badge, Button } from '../../../components/ui/UI'
import { exercises } from '../../../data/exercises'

// Expandable, on-demand exercise guide: shows video + form cues + tips.
// Rendered inline (compact button) or as a modal.

export function ExerciseGuideButton({ exerciseId, exerciseName, style }) {
  const [open, setOpen] = useState(false)
  const ex = exercises.find(e => e.id === exerciseId) || exercises.find(e => e.name === exerciseName)
  if (!ex || (!ex.yt && !ex.formCues && !ex.tips)) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="הצג דגשי ביצוע וסרטון הסבר"
        style={{
          background: 'transparent', border: `1px solid ${t.color.border}`,
          color: t.color.gold, borderRadius: t.radius.pill, padding: '4px 10px',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 4, transition: t.transition,
          ...style,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = t.color.gold}
        onMouseLeave={e => e.currentTarget.style.borderColor = t.color.border}
      >
        💡 דגשים
      </button>
      <ExerciseGuideModal open={open} onClose={() => setOpen(false)} exercise={ex} />
    </>
  )
}

export function ExerciseGuideModal({ open, onClose, exercise }) {
  if (!exercise) return null
  return (
    <Modal open={open} onClose={onClose} title={exercise.name} width={640}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {exercise.muscle && <Badge color={t.color.gold}>{exercise.muscle}</Badge>}
        {exercise.equipment && <Badge color={t.color.textDim}>{exercise.equipment}</Badge>}
        {exercise.level && <Badge color={t.color.info}>{exercise.level}</Badge>}
      </div>

      {exercise.yt && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: t.font.md, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ff0000' }}>▶</span> סרטון הסבר
            </div>
            {exercise.ytBy && <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>ע״י {exercise.ytBy}</div>}
          </div>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: t.radius.md, overflow: 'hidden', background: '#000' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${exercise.yt}?rel=0`}
              title={exercise.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
        </div>
      )}

      {exercise.formCues && exercise.formCues.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: t.font.md, marginBottom: 10, color: t.color.gold }}>
            📌 דגשי ביצוע
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {exercise.formCues.map((cue, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: t.color.gold, color: '#0d0d14',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontWeight: 800, fontSize: 12,
                }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: t.font.sm, lineHeight: 1.5 }}>{cue}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exercise.tips && (
        <div style={{ padding: 14, background: t.color.goldGlow, borderRadius: t.radius.md, border: `1px solid ${t.color.gold}` }}>
          <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6, fontSize: t.font.sm }}>💡 טיפ מהיר</div>
          <div style={{ fontSize: t.font.sm, lineHeight: 1.5 }}>{exercise.tips}</div>
        </div>
      )}

      {!exercise.yt && !exercise.formCues && (
        <div style={{ padding: 20, textAlign: 'center', color: t.color.textDim, fontSize: t.font.sm }}>
          עדיין אין הסברים מפורטים לתרגיל זה
        </div>
      )}
    </Modal>
  )
}
