import React, { useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Card, Button, Badge, SectionHeader } from '../../../../components/ui/UI'
import { useApp } from '../../../../store/AppStore'
import { WIZARD_STEPS, generatePersonalisedProgram } from '../../../../data/bodybuilding/programGenerator'
import { LEVELS, GOALS, EQUIPMENT_TYPES } from '../../../../data/bodybuilding/programs'
import { ROUTINE_BY_ID } from '../../../../data/bodybuilding/routines'
import { ProgramDetail } from './ProgramDetail'

// 4-question wizard that generates a personalised program.
export function TrainerGenerator() {
  const { state, bbSetActiveProgram } = useApp()
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)
  const [result, setResult] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const current = WIZARD_STEPS[step]
  const isLast = step === WIZARD_STEPS.length - 1

  const pick = (value) => {
    const newAnswers = { ...answers, [current.key]: value }
    setAnswers(newAnswers)
    if (step < WIZARD_STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 200)
    } else {
      // Generate immediately when last step is answered
      const gen = generatePersonalisedProgram(newAnswers)
      setResult(gen)
    }
  }

  const restart = () => { setAnswers({}); setStep(0); setResult(null) }

  const activate = () => {
    if (!result?.program) return
    bbSetActiveProgram(result.program)
    alert(`התוכנית "${result.program.name}" הופעלה! עבור לטאב Routines כדי להתחיל.`)
  }

  // Result view
  if (result) {
    const p = result.program
    return (
      <div>
        <SectionHeader title="🎯 התוכנית שלך" subtitle={result.reason} />
        <Card glow style={{ borderColor: t.color.gold, marginBottom: t.space.md }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: t.space.md }}>
            <div style={{ fontSize: 60 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.gold, marginBottom: 4 }}>
                {p.name}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge color={t.color.gold}>{LEVELS[p.level]?.he}</Badge>
                <Badge color={t.color.purple}>{GOALS[p.goal]?.he}</Badge>
                <Badge color={t.color.info}>{EQUIPMENT_TYPES[p.equipment]?.he}</Badge>
                <Badge color={t.color.success}>{p.daysPerWeek} ימים</Badge>
                <Badge color={t.color.textDim}>{p.weeksRecommended} שבועות</Badge>
              </div>
            </div>
          </div>
          {p.description && (
            <div style={{ color: t.color.text, fontSize: t.font.md, lineHeight: 1.6, marginBottom: t.space.md }}>
              {p.description}
            </div>
          )}
          {p.inspiration && (
            <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: t.space.md }}>
              בהשראת: {p.inspiration}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="lg" onClick={activate} style={{ flex: 2, justifyContent: 'center' }}>
              ✓ הפעל את התוכנית
            </Button>
            <Button variant="ghost" onClick={() => setDetailOpen(true)}>👁 פרטים</Button>
            <Button variant="outline" onClick={restart}>🔄 שוב</Button>
          </div>
        </Card>

        {detailOpen && (
          <ProgramDetail program={p} open={detailOpen} onClose={() => setDetailOpen(false)} />
        )}
      </div>
    )
  }

  // Wizard view
  return (
    <div>
      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: t.space.lg }}>
        {WIZARD_STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= step ? t.color.gold : t.color.bgSoft,
          }} />
        ))}
      </div>

      {/* Intro */}
      {step === 0 && !answers.goal && (
        <Card style={{ marginBottom: t.space.md, background: `${t.color.gold}11`, borderColor: t.color.gold }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 40 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 700, color: t.color.text, marginBottom: 4 }}>מחולל תוכנית אישית</div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>
                4 שאלות → תוכנית מותאמת אישית מוכנה לפעולה
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Question */}
      <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.text, marginBottom: t.space.md, textAlign: 'center' }}>
        {current.question}
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gap: 10 }}>
        {current.options.map(opt => (
          <button key={opt.value} onClick={() => pick(opt.value)} style={{
            padding: t.space.lg, background: t.color.bgCard,
            border: `1.5px solid ${t.color.border}`, borderRadius: t.radius.md,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right',
            display: 'flex', alignItems: 'center', gap: 12,
            transition: t.transition,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.color.gold; e.currentTarget.style.background = `${t.color.gold}11` }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.color.border; e.currentTarget.style.background = t.color.bgCard }}
          >
            <div style={{ fontSize: 32 }}>{opt.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: t.color.text, fontSize: t.font.md }}>{opt.label}</div>
              {opt.description && <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>{opt.description}</div>}
            </div>
            <span style={{ color: t.color.textMuted, fontSize: 24 }}>›</span>
          </button>
        ))}
      </div>

      {/* Back button */}
      {step > 0 && (
        <Button variant="ghost" onClick={() => setStep(step - 1)} style={{ marginTop: t.space.md }}>
          → חזור
        </Button>
      )}
    </div>
  )
}
