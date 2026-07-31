import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader } from '../../../components/ui/UI'
import { LOCATIONS, EQUIPMENT, STYLES, GOALS, generateWorkout } from '../../../data/quickWorkouts'

export function QuickBuilder() {
  const { logWorkout } = useApp()
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState({
    location: 'home',
    duration: 30,
    equipment: ['bodyweight'],
    style: 'functional',
    goal: 'conditioning',
  })
  const [workout, setWorkout] = useState(null)

  const set = (patch) => setChoice(c => ({ ...c, ...patch }))

  const generate = () => {
    const w = generateWorkout(choice)
    setWorkout(w)
    setStep(5)
  }

  const pickLocation = (loc) => {
    set({ location: loc.id, equipment: loc.defaultEquipment })
    setStep(1)
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      {step < 5 && (
        <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
          <Badge>⚡ מחולל אימון מהיר</Badge>
          <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>אימון בכל מקום, כל זמן</h2>
          <div style={{ color: t.color.textDim, marginTop: 6 }}>
            מלון? חופשה? חדר כושר? חוץ? נבנה לך אימון של 10-60 דקות לפי הציוד והסגנון שאתה אוהב.
          </div>

          {/* stepper */}
          <div style={{ display:'flex', gap: 6, marginTop: 20 }}>
            {['מיקום','זמן','ציוד','סגנון','מטרה'].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: 8, textAlign:'center',
                background: i <= step ? t.color.goldGlow : t.color.bgSoft,
                border: `1px solid ${i === step ? t.color.gold : 'transparent'}`,
                borderRadius: t.radius.sm, fontSize: t.font.xs, fontWeight: 600,
                color: i <= step ? t.color.gold : t.color.textDim,
              }}>
                {i + 1}. {s}
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 0 && <StepLocation onPick={pickLocation} />}
      {step === 1 && <StepDuration value={choice.duration} onChange={v => set({ duration: v })} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <StepEquipment value={choice.equipment} onChange={v => set({ equipment: v })} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
      {step === 3 && <StepStyle value={choice.style} onChange={v => set({ style: v })} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
      {step === 4 && <StepGoal value={choice.goal} onChange={v => set({ goal: v })} onGenerate={generate} onBack={() => setStep(3)} />}
      {step === 5 && workout && (
        <WorkoutResult
          workout={workout}
          choice={choice}
          onRestart={() => { setWorkout(null); setStep(0) }}
          onLog={() => { logWorkout({ date: new Date().toISOString(), sessionName: `${STYLES.find(s => s.id === workout.style)?.label} · ${workout.totalDuration} דק׳`, exercises: workout.main.blocks.map(b => ({ id:b.name, name:b.name, sets:[] })) }); alert('אימון נרשם ביומן ✓') }}
        />
      )}
    </div>
  )
}

// ─── Steps ─────────────────────────────────────────────
function StepLocation({ onPick }) {
  return (
    <div>
      <SectionHeader title="איפה אתה עכשיו?" subtitle="נבחר ציוד ברירת מחדל בהתאם" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {LOCATIONS.map(loc => (
          <Card key={loc.id} hover style={{ padding: 24, cursor:'pointer', textAlign:'center' }} onClick={() => onPick(loc)}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{loc.icon}</div>
            <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{loc.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepDuration({ value, onChange, onNext, onBack }) {
  const opts = [10, 15, 20, 30, 45, 60]
  return (
    <Card>
      <SectionHeader title="כמה זמן יש לך?" subtitle="נכייל את המבנה בהתאם" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {opts.map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: 24, background: value === v ? t.color.goldGlow : t.color.bgSoft,
            border: `1px solid ${value === v ? t.color.gold : t.color.border}`,
            borderRadius: t.radius.md, color: value === v ? t.color.gold : t.color.text,
            fontFamily:'inherit', cursor:'pointer', fontWeight: 700, fontSize: t.font.xxl,
          }}>{v}<span style={{ fontSize: t.font.sm, marginRight: 4, color: t.color.textDim }}>דק׳</span></button>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} />
    </Card>
  )
}

function StepEquipment({ value, onChange, onNext, onBack }) {
  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  }
  return (
    <Card>
      <SectionHeader title="איזה ציוד יש לך?" subtitle="ניתן לבחור כמה" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        {EQUIPMENT.map(eq => (
          <button key={eq.id} onClick={() => toggle(eq.id)} style={{
            padding: '14px 16px', background: value.includes(eq.id) ? t.color.goldGlow : t.color.bgSoft,
            border: `1px solid ${value.includes(eq.id) ? t.color.gold : t.color.border}`,
            borderRadius: t.radius.md, color: value.includes(eq.id) ? t.color.gold : t.color.text,
            fontFamily:'inherit', cursor:'pointer', fontWeight: 600, fontSize: t.font.sm, textAlign:'right',
            display:'flex', alignItems:'center', gap: 10,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 4,
              background: value.includes(eq.id) ? t.color.gold : 'transparent',
              border:`2px solid ${value.includes(eq.id) ? t.color.gold : t.color.border}`,
              color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 900,
            }}>{value.includes(eq.id) ? '✓' : ''}</span>
            {eq.label}
          </button>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} disabled={!value.length} />
    </Card>
  )
}

function StepStyle({ value, onChange, onNext, onBack }) {
  return (
    <Card>
      <SectionHeader title="סגנון האימון?" subtitle="נבנה מבנה מתאים לסגנון" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {STYLES.map(s => (
          <Card key={s.id} hover style={{
            padding: 18, cursor:'pointer',
            border:`1px solid ${value === s.id ? t.color.gold : t.color.border}`,
            background: value === s.id ? t.color.goldGlow : undefined,
          }} onClick={() => onChange(s.id)}>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 26 }}>{s.icon}</span>
              <div style={{ fontWeight: 700, fontSize: t.font.lg, color: value === s.id ? t.color.gold : t.color.text }}>{s.label}</div>
            </div>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.5 }}>{s.desc}</div>
          </Card>
        ))}
      </div>
      <StepFooter onBack={onBack} onNext={onNext} />
    </Card>
  )
}

function StepGoal({ value, onChange, onGenerate, onBack }) {
  return (
    <Card>
      <SectionHeader title="מה המטרה של האימון?" subtitle="השלב האחרון - ניצור אימון מלא" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
        {GOALS.map(g => (
          <button key={g.id} onClick={() => onChange(g.id)} style={{
            padding: 16, background: value === g.id ? t.color.goldGlow : t.color.bgSoft,
            border: `1px solid ${value === g.id ? t.color.gold : t.color.border}`,
            borderRadius: t.radius.md, color: value === g.id ? t.color.gold : t.color.text,
            fontFamily:'inherit', cursor:'pointer', fontWeight: 600, fontSize: t.font.sm,
          }}>{g.label}</button>
        ))}
      </div>
      <StepFooter onBack={onBack} nextLabel="⚡ צור אימון" onNext={onGenerate} />
    </Card>
  )
}

function StepFooter({ onBack, onNext, disabled, nextLabel = 'המשך ←' }) {
  return (
    <div style={{ marginTop: 20, display:'flex', gap: 10, justifyContent:'space-between' }}>
      <Button variant="ghost" onClick={onBack}>→ חזור</Button>
      <Button onClick={onNext} disabled={disabled}>{nextLabel}</Button>
    </div>
  )
}

// ─── Result ─────────────────────────────────────────────
function WorkoutResult({ workout, choice, onRestart, onLog }) {
  const style = STYLES.find(s => s.id === workout.style)
  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap: 16 }}>
          <div>
            <Badge>{style?.icon} {style?.label}</Badge>
            <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>האימון שלך מוכן ⚡</h2>
            <div style={{ color: t.color.textDim, marginTop: 4 }}>
              {workout.totalDuration} דקות · {LOCATIONS.find(l => l.id === choice.location)?.label} · {choice.equipment.map(e => EQUIPMENT.find(x => x.id === e)?.label).filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onRestart}>↻ צור מחדש</Button>
            <Button onClick={onLog}>רשום ביומן ✓</Button>
          </div>
        </div>
      </Card>

      <BlockCard title={workout.warmup.title} minutes={workout.warmup.duration} color={t.color.info}>
        {workout.warmup.blocks.map((b, i) => (
          <BlockItem key={i} num={i+1} name={typeof b === 'string' ? b : b.name} desc={typeof b === 'string' ? '' : b.prescription} />
        ))}
      </BlockCard>

      <BlockCard title={workout.main.title} minutes={workout.main.duration} color={t.color.gold} format={workout.main.format}>
        {workout.main.prescription && (
          <div style={{
            padding: 14, background: t.color.bg, borderRadius: t.radius.md, marginBottom: 12,
            fontFamily:'Space Mono, monospace', fontSize: t.font.sm, whiteSpace:'pre-wrap',
          }}>
            {workout.main.prescription}
          </div>
        )}
        {workout.main.blocks.map((b, i) => (
          <BlockItem key={i} num={i+1} name={b.name} desc={b.prescription} muscle={b.muscle} />
        ))}
        {workout.main.notes && (
          <div style={{ marginTop: 14, padding: 12, background: t.color.goldGlow, borderRadius: t.radius.sm, border:`1px solid ${t.color.gold}`, fontSize: t.font.sm }}>
            💡 <b style={{ color: t.color.gold }}>הערה:</b> {workout.main.notes}
          </div>
        )}
      </BlockCard>

      <BlockCard title={workout.cooldown.title} minutes={workout.cooldown.duration} color={t.color.success}>
        {workout.cooldown.blocks.map((b, i) => (
          <BlockItem key={i} num={i+1} name={typeof b === 'string' ? b : b.name} desc={typeof b === 'string' ? '' : b.prescription} />
        ))}
      </BlockCard>
    </div>
  )
}

function BlockCard({ title, minutes, color, format, children }) {
  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${t.color.border}` }}>
        <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
          <div style={{ width: 6, height: 24, background: color, borderRadius: 3 }} />
          <div style={{ fontWeight: 800, fontSize: t.font.xl }}>{title}</div>
          {format && <Badge color={color}>{format}</Badge>}
        </div>
        <Badge color={t.color.textDim}>⏱ {minutes} דק׳</Badge>
      </div>
      <div style={{ display:'grid', gap: 8 }}>{children}</div>
    </Card>
  )
}

function BlockItem({ num, name, desc, muscle }) {
  return (
    <div style={{ display:'flex', gap: 12, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md }}>
      <div style={{
        width: 28, height: 28, borderRadius:'50%', background: t.color.gold, color:'#0d0d14',
        display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 800, flexShrink: 0, fontSize: 12,
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{name}</div>
        {desc && <div style={{ fontSize: t.font.sm, color: t.color.textDim, fontFamily:'Space Mono, monospace' }}>{desc}</div>}
      </div>
      {muscle && <Badge color={t.color.textDim}>{muscle}</Badge>}
    </div>
  )
}
