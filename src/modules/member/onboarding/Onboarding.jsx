import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Button, Card, Input, Select } from '../../../components/ui/UI'
import { activityFactors, goalAdjustments, dietTemplates } from '../../../utils/calc'

const STEPS = ['ברוכים הבאים','פרטים אישיים','מטרה וניסיון','תזונה','סיום']

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    name: '', age: 30, sex: 'male', heightCm: 175, weightKg: 75,
    activity: 'moderate', experience: 'בינוני',
    goalKey: 'recomp', targetPeriodWeeks: 12,
    dietKey: 'balanced', constraints: '',
  })

  const set = (patch) => setData(d => ({ ...d, ...patch }))
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1))
  const prev = () => setStep(s => Math.max(0, s - 1))
  const finish = () => completeOnboarding(data)

  return (
    <div style={{
      minHeight:'100vh', background: t.color.bg, display:'flex', alignItems:'center', justifyContent:'center',
      padding: t.space.lg, direction:'rtl', color: t.color.text,
    }}>
      <Card style={{ maxWidth: 620, width:'100%', padding: 40 }} glow>
        <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:t.color.gold, color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:22 }}>H</div>
          <div>
            <div style={{ fontWeight:800, fontSize: t.font.lg }}>Holistic Fitness OS</div>
            <div style={{ fontSize:t.font.xs, color:t.color.textDim, letterSpacing:1 }}>ONBOARDING</div>
          </div>
        </div>

        {/* stepper */}
        <div style={{ display:'flex', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              flex:1, height: 4, borderRadius: 2,
              background: i <= step ? t.color.gold : t.color.bgSoft, transition: t.transition,
            }} />
          ))}
        </div>

        <div style={{ minHeight: 340 }}>
          {step === 0 && <StepWelcome />}
          {step === 1 && <StepPersonal data={data} set={set} />}
          {step === 2 && <StepGoal data={data} set={set} />}
          {step === 3 && <StepDiet data={data} set={set} />}
          {step === 4 && <StepFinish data={data} />}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 28, gap: 12 }}>
          {step > 0 ? <Button variant="ghost" onClick={prev}>חזור</Button> : <span />}
          {step < STEPS.length - 1
            ? <Button onClick={next}>המשך ←</Button>
            : <Button onClick={finish} icon="✨">בוא נתחיל</Button>}
        </div>
      </Card>
    </div>
  )
}

function StepWelcome() {
  return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🏋️</div>
      <h1 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 12 }}>ברוכים הבאים למתחם ההוליסטי שלך</h1>
      <p style={{ color: t.color.textDim, fontSize: t.font.md, lineHeight: 1.7, maxWidth: 460, margin:'0 auto' }}>
        כאן תבנה תכניות אימון חכמות, תעקוב אחרי תזונה, תקבל ליווי מנטלי, ותראה איך כל החלקים מתחברים לתמונה אחת של קידמה.
      </p>
    </div>
  )
}

function StepPersonal({ data, set }) {
  return (
    <div style={{ display:'grid', gap: 14 }}>
      <Input label="שם מלא" placeholder="דנה כהן" value={data.name} onChange={e => set({ name: e.target.value })} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
        <Input type="number" label="גיל" value={data.age} onChange={e => set({ age: +e.target.value })} />
        <Select label="מין" value={data.sex} onChange={e => set({ sex: e.target.value })}>
          <option value="male">גבר</option>
          <option value="female">אישה</option>
        </Select>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
        <Input type="number" label="גובה (ס״מ)" value={data.heightCm} onChange={e => set({ heightCm: +e.target.value })} />
        <Input type="number" label="משקל (ק״ג)" value={data.weightKg} onChange={e => set({ weightKg: +e.target.value })} />
      </div>
      <Select label="רמת פעילות יומית" value={data.activity} onChange={e => set({ activity: e.target.value })}>
        {Object.entries(activityFactors).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
    </div>
  )
}

function StepGoal({ data, set }) {
  return (
    <div style={{ display:'grid', gap: 14 }}>
      <Select label="מטרה עיקרית" value={data.goalKey} onChange={e => set({ goalKey: e.target.value })}>
        {Object.entries(goalAdjustments).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
      </Select>
      <Select label="ניסיון באימונים" value={data.experience} onChange={e => set({ experience: e.target.value })}>
        <option value="מתחיל">מתחיל (0-1 שנה)</option>
        <option value="בינוני">בינוני (1-3 שנים)</option>
        <option value="מתקדם">מתקדם (3+ שנים)</option>
      </Select>
      <div>
        <div style={{ fontSize:t.font.sm, color:t.color.textDim, marginBottom:8 }}>תקופת יעד: {data.targetPeriodWeeks} שבועות</div>
        <input type="range" min="4" max="52" value={data.targetPeriodWeeks} onChange={e => set({ targetPeriodWeeks: +e.target.value })} style={{ width:'100%' }} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:t.font.xs, color:t.color.textMuted, marginTop:4 }}>
          <span>4 שב׳</span><span>26 שב׳</span><span>52 שב׳</span>
        </div>
      </div>
      <Input label="הגבלות/פציעות (אופציונלי)" placeholder="לדוגמה: כאבי גב תחתון" value={data.constraints} onChange={e => set({ constraints: e.target.value })} />
    </div>
  )
}

function StepDiet({ data, set }) {
  return (
    <div style={{ display:'grid', gap: 12 }}>
      <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: 4 }}>סגנון תזונה מועדף (ניתן לשנות בכל עת):</div>
      {Object.entries(dietTemplates).map(([k, v]) => (
        <div key={k} onClick={() => set({ dietKey: k })} style={{
          padding: '14px 16px', border: `1px solid ${data.dietKey === k ? t.color.gold : t.color.border}`,
          borderRadius: t.radius.md, cursor:'pointer',
          background: data.dietKey === k ? t.color.goldGlow : 'transparent',
          transition: t.transition,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight: 600, color: data.dietKey === k ? t.color.gold : t.color.text }}>{v.label}</div>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{v.p}% חלבון · {v.c}% פחמ׳ · {v.f}% שומן</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StepFinish({ data }) {
  return (
    <div style={{ textAlign:'center', padding: '20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
      <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>הכל מוכן{data.name ? `, ${data.name.split(' ')[0]}` : ''}</h2>
      <p style={{ color: t.color.textDim, fontSize: t.font.md, marginBottom: 24 }}>
        נכין לך תכנית אימון + יעדי תזונה מותאמים על סמך הנתונים שהזנת.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12, textAlign:'center' }}>
        {[
          { label:'BMI', val: (data.weightKg / ((data.heightCm/100)**2)).toFixed(1) },
          { label:'מטרה', val: goalAdjustments[data.goalKey]?.label.split(' ')[0] || '-' },
          { label:'תזונה', val: dietTemplates[data.dietKey]?.label || '-' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: t.font.lg, fontWeight: 700, color: t.color.gold }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
