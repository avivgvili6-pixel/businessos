import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge } from '../../../components/ui/UI'
import { templateToGoal } from '../../../data/goals'

// Simple 3-tap goal builder in warm fitness language.
// Pick a goal → pick how much → pick when → done.

const QUICK_GOALS = [
  {
    id:'lose_weight', icon:'⚖️', label:'לרדת במשקל', tag:'הכי פופולרי', color:'#c8a84b',
    subtitle:'לרדת קילוגרמים ולהרגיש קליל יותר',
    amounts: [
      { value:3,  label:'3 ק״ג',  hint:'שינוי קטן ומורגש' },
      { value:5,  label:'5 ק״ג',  hint:'שינוי משמעותי במראה' },
      { value:10, label:'10 ק״ג', hint:'טרנספורמציה אמיתית', recommended:true },
      { value:15, label:'15 ק״ג', hint:'יעד גדול, נצטרך זמן' },
    ],
    template: (v) => ({ id:'lose_kg', label:`לרדת ${v} ק״ג`, kind:'weight_change', delta:-v, unit:'ק״ג', weeks: Math.max(8, v * 3) }),
    direction: 'aesthetics',
  },
  {
    id:'build_muscle', icon:'💪', label:'לבנות שריר',
    subtitle:'מסת שריר, מראה חטוב, כוח',
    amounts: [
      { value:2, label:'2 ק״ג שריר', hint:'התחלה מוצקה' },
      { value:4, label:'4 ק״ג שריר', hint:'שינוי נראה לעין', recommended:true },
      { value:6, label:'6 ק״ג שריר', hint:'ידרוש תזונה מדויקת' },
    ],
    template: (v) => ({ id:'gain_muscle', label:`לעלות ${v} ק״ג במסת שריר`, kind:'weight_change', delta:+v, unit:'ק״ג', weeks: v * 6 }),
    direction: 'aesthetics',
  },
  {
    id:'get_stronger', icon:'🏋️', label:'להתחזק',
    subtitle:'שיאים חדשים בסקוואט/בנץ/דדליפט',
    amounts: [
      { value:'squat_100',    label:'סקוואט 100 ק״ג',     hint:'אתגר קלאסי לגברים' },
      { value:'bench_bw',     label:'לחיצה במשקל גופי',  hint:'סימן דרך חשוב', recommended:true },
      { value:'deadlift_2x',  label:'דדליפט פי 2 מהמשקל', hint:'הישג מרשים' },
      { value:'first_pullup', label:'המתח הראשון שלי',    hint:'טוב במיוחד לנשים' },
    ],
    template: (v) => {
      const map = {
        squat_100:    { label:'להגיע לסקוואט 100 ק״ג',    kind:'lift_pr', lift:'squat',    target:100, unit:'ק״ג', weeks:24 },
        bench_bw:     { label:'לחיצת חזה במשקל גוף',       kind:'lift_pr', lift:'bench',    target:null, unit:'משקל גוף', weeks:24 },
        deadlift_2x:  { label:'דדליפט פי 2 ממשקל גוף',     kind:'lift_pr', lift:'deadlift', target:null, unit:'2× משקל גוף', weeks:36 },
        first_pullup: { label:'המתח הראשון',               kind:'lift_pr', lift:'pullup',   target:1,    unit:'חזרה', weeks:12 },
      }
      return { id: v, ...map[v] }
    },
    direction: 'performance',
  },
  {
    id:'run', icon:'🏃', label:'לרוץ יותר',
    subtitle:'סבולת אירובית ובריאות לב',
    amounts: [
      { value:5,  label:'5 ק״מ ברצף',      hint:'התחלה מצוינת', recommended:true },
      { value:10, label:'10 ק״מ ברצף',      hint:'מרחק סמל' },
      { value:21, label:'חצי מרתון (21 ק״מ)', hint:'אתגר משמעותי' },
      { value:42, label:'מרתון מלא (42 ק״מ)', hint:'הכי גדול שיש' },
    ],
    template: (v) => ({ id:`run_${v}`, label:`לרוץ ${v} ק״מ ברצף`, kind:'endurance', distance:v, unit:'ק״מ', weeks: v * 2 + 6 }),
    direction: 'performance',
  },
  {
    id:'body_fat', icon:'✂️', label:'להוריד שומן',
    subtitle:'לחטב את הגוף בלי לרדת מדי במשקל',
    amounts: [
      { value:3, label:'3% שומן פחות',  hint:'שינוי עדין' },
      { value:5, label:'5% שומן פחות',  hint:'שינוי משמעותי', recommended:true },
      { value:8, label:'8% שומן פחות',  hint:'עבודה רצינית' },
    ],
    template: (v) => ({ id:'cut_fat', label:`להוריד ${v}% שומן גוף`, kind:'body_fat', delta:-v, unit:'%', weeks: v * 4 }),
    direction: 'aesthetics',
  },
  {
    id:'energy', icon:'⚡', label:'יותר אנרגיה',
    subtitle:'להתעורר טוב, לא לקרוס אחה"צ',
    amounts: [
      { value:'sleep', label:'לישון 7-8 שעות',         hint:'הבסיס לכל השאר', recommended:true },
      { value:'walks', label:'הליכה יומית 30 דק׳',      hint:'אירובי מתון' },
      { value:'water', label:'לשתות 3 ליטר מים',        hint:'קל להטמיע' },
    ],
    template: (v) => {
      const map = {
        sleep: { label:'לישון 7-8 שעות רצוף', kind:'sleep', target:7.5, unit:'שעות', weeks:8 },
        walks: { label:'הליכה יומית של 30 דק׳', kind:'habit_streak', habit:'הליכה 30 דק׳', weeks:8 },
        water: { label:'לשתות 3 ליטר מים ביום', kind:'habit_streak', habit:'3 ליטר מים', weeks:6 },
      }
      return { id: v, ...map[v] }
    },
    direction: 'energy',
  },
  {
    id:'calm', icon:'🧘', label:'להירגע',
    subtitle:'פחות סטרס, יותר שקט נפשי',
    amounts: [
      { value:'mood',       label:'מצב-רוח יותר טוב',        hint:'מדד ממוצע 7+/10', recommended:true },
      { value:'meditation', label:'מדיטציה 10 דק׳ יומי',      hint:'הכי מוכח מדעית' },
      { value:'no_phone',   label:'ללא טלפון בשעה 1 של הבוקר', hint:'שינוי גדול, פשוט להתחיל' },
    ],
    template: (v) => {
      const map = {
        mood:       { label:'מצב רוח ממוצע 7+/10', kind:'mood', target:7, weeks:8 },
        meditation: { label:'מדיטציה 10 דק׳ ביום', kind:'habit_streak', habit:'מדיטציה יומית', weeks:8 },
        no_phone:   { label:'ללא טלפון בשעה הראשונה של הבוקר', kind:'habit_streak', habit:'ללא טלפון בבוקר', weeks:6 },
      }
      return { id: v, ...map[v] }
    },
    direction: 'mental',
  },
  {
    id:'health', icon:'❤️', label:'סתם להיות בריא',
    subtitle:'תזונה טובה, פעילות סדירה',
    amounts: [
      { value:'sessions',  label:'3 אימונים בשבוע קבוע',   hint:'הכי חשוב', recommended:true },
      { value:'meal_prep', label:'הכנת ארוחות מבעוד מועד', hint:'שינוי מהותי בתזונה' },
      { value:'checkup',   label:'בדיקות דם תקינות',        hint:'ליווי מוסדר' },
    ],
    template: (v) => {
      const map = {
        sessions:  { label:'3 אימונים בשבוע קבוע',      kind:'habit_streak', habit:'3 אימונים/שבוע',   weeks:12 },
        meal_prep: { label:'הכנת ארוחות 4 ימים בשבוע', kind:'habit_streak', habit:'הכנת ארוחות',       weeks:8 },
        checkup:   { label:'להביא את כל בדיקות הדם לתקין', kind:'health_marker', metric:'בדיקות',      weeks:16 },
      }
      return { id: v, ...map[v] }
    },
    direction: 'health',
  },
]

export function SimpleGoal({ onDone, onGoAdvanced }) {
  const { setGoal } = useApp()
  const [step, setStep] = useState('pick')
  const [category, setCategory] = useState(null)
  const [amount, setAmount] = useState(null)
  const [weeks, setWeeks] = useState(null)

  const pickCategory = (cat) => { setCategory(cat); setStep('amount') }
  const pickAmount = (amt) => {
    setAmount(amt)
    // Set default weeks based on template
    const template = category.template(amt.value)
    setWeeks(template.weeks)
    setStep('when')
  }

  const finish = () => {
    const template = category.template(amount.value)
    if (weeks) template.weeks = weeks
    const goal = templateToGoal(template, { direction: category.direction, why: '' })
    setGoal(goal)
    onDone?.(goal)
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      {/* Simple progress dots */}
      <div style={{ display:'flex', gap: 6, justifyContent:'center' }}>
        {['pick', 'amount', 'when'].map(s => {
          const done = ['pick','amount','when'].indexOf(step) >= ['pick','amount','when'].indexOf(s)
          const active = step === s
          return (
            <div key={s} style={{
              width: active ? 30 : 10, height: 10, borderRadius: 5,
              background: done ? t.color.gold : t.color.bgSoft,
              transition: t.transition,
            }} />
          )
        })}
      </div>

      {step === 'pick'   && <PickCategory onPick={pickCategory} onAdvanced={onGoAdvanced} />}
      {step === 'amount' && <PickAmount category={category} onPick={pickAmount} onBack={() => setStep('pick')} />}
      {step === 'when'   && <PickWhen category={category} amount={amount} weeks={weeks} setWeeks={setWeeks} onDone={finish} onBack={() => setStep('amount')} />}
    </div>
  )
}

function PickCategory({ onPick, onAdvanced }) {
  return (
    <>
      <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>מה אתה רוצה?</h2>
        <div style={{ color: t.color.textDim, fontSize: t.font.md }}>3 קליקים ויש לך מטרה מדידה</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {QUICK_GOALS.map(cat => (
          <Card key={cat.id} hover style={{ padding: 20, cursor:'pointer', position:'relative' }} onClick={() => onPick(cat)}>
            {cat.tag && (
              <Badge color={t.color.gold} style={{ position:'absolute', top: 12, left: 12 }}>{cat.tag}</Badge>
            )}
            <div style={{ fontSize: 42, marginBottom: 12 }}>{cat.icon}</div>
            <div style={{ fontWeight: 800, fontSize: t.font.xl, marginBottom: 6 }}>{cat.label}</div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.5 }}>{cat.subtitle}</div>
          </Card>
        ))}
      </div>

      {onAdvanced && (
        <div style={{ textAlign:'center', marginTop: 20 }}>
          <button onClick={onAdvanced} style={{
            background:'none', border:'none', color: t.color.textDim,
            textDecoration:'underline', cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm,
          }}>לא מצאת? עבור למחולל מלא ←</button>
        </div>
      )}
    </>
  )
}

function PickAmount({ category, onPick, onBack }) {
  return (
    <>
      <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{category.icon}</div>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 6 }}>{category.label}</h2>
        <div style={{ color: t.color.textDim, fontSize: t.font.md }}>כמה תרצה להשיג?</div>
      </div>

      <div style={{ display:'grid', gap: 10 }}>
        {category.amounts.map((amt, i) => (
          <Card key={i} hover style={{ padding: 20, cursor:'pointer', display:'flex', alignItems:'center', gap: 16, borderColor: amt.recommended ? t.color.gold : t.color.border }} onClick={() => onPick(amt)}>
            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: t.font.xl, color: amt.recommended ? t.color.gold : t.color.text }}>{amt.label}</div>
                {amt.recommended && <Badge color={t.color.gold}>מומלץ</Badge>}
              </div>
              <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>{amt.hint}</div>
            </div>
            <div style={{ color: t.color.gold, fontSize: 20 }}>←</div>
          </Card>
        ))}
      </div>

      <div style={{ textAlign:'center', marginTop: 8 }}>
        <button onClick={onBack} style={{
          background:'none', border:'none', color: t.color.textDim,
          cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm,
        }}>→ חזור</button>
      </div>
    </>
  )
}

function PickWhen({ category, amount, weeks, setWeeks, onDone, onBack }) {
  const options = [
    { label:'חודש (מהיר)',       weeks: 4,  hint:'אתגר קצר וממוקד' },
    { label:'2 חודשים',           weeks: 8,  hint:'זמן סביר להרגלים' },
    { label:'3 חודשים',           weeks: 12, hint:'הזמן הקלאסי לשינוי' },
    { label:'חצי שנה',            weeks: 26, hint:'קצב יציב ובר-קיימא' },
    { label:'שנה שלמה',           weeks: 52, hint:'טרנספורמציה עמוקה' },
  ]
  return (
    <>
      <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
        <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 6 }}>עד מתי?</h2>
        <div style={{ color: t.color.textDim, fontSize: t.font.md }}>המטרה: <b style={{ color: t.color.gold }}>{category.template(amount.value).label}</b></div>
      </div>

      <div style={{ display:'grid', gap: 10 }}>
        {options.map((opt, i) => (
          <button key={i} onClick={() => setWeeks(opt.weeks)} style={{
            padding: 18, background: weeks === opt.weeks ? t.color.goldGlow : t.color.bgSoft,
            border:`1px solid ${weeks === opt.weeks ? t.color.gold : t.color.border}`,
            borderRadius: t.radius.md, cursor:'pointer', textAlign:'right',
            fontFamily:'inherit', color: weeks === opt.weeks ? t.color.gold : t.color.text,
            display:'flex', alignItems:'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 2 }}>{opt.label}</div>
              <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>{opt.hint}</div>
            </div>
            {weeks === opt.weeks && <span style={{ color: t.color.gold, fontSize: 20 }}>✓</span>}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap: 10, justifyContent:'space-between', marginTop: 16 }}>
        <Button variant="ghost" onClick={onBack}>→ חזור</Button>
        <Button onClick={onDone} disabled={!weeks} icon="🎯" size="lg">התחל!</Button>
      </div>
    </>
  )
}
