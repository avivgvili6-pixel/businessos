import React, { useState, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, Input } from '../../../components/ui/UI'
import { templateToGoal } from '../../../data/goals'
import { exercises, MUSCLE_GROUPS } from '../../../data/exercises'

// Simple 2-tap goal builder in warm fitness language.
// Pick a goal → set the amount (wheel/slider or discrete options) → done.
// No deadline commitment - the plan builder later handles pacing.

const QUICK_GOALS = [
 {
 id:'lose_weight', icon:'', label:'לרדת במשקל', tag:'הכי פופולרי',
 subtitle:'לרדת קילוגרמים ולהרגיש קליל יותר',
 input: { type:'wheel', unit:'ק״ג', min:1, max:40, step:1, default:5, format: v => `${v} ק״ג` },
 template: (v) => ({ id:'lose_kg', label:`לרדת ${v} ק״ג`, kind:'weight_change', delta:-v, unit:'ק״ג', weeks: Math.max(8, v * 3) }),
 direction:'aesthetics',
 },
 {
 id:'build_muscle', icon:'', label:'לבנות שריר',
 subtitle:'מסת שריר, מראה חטוב, כוח',
 input: { type:'wheel', unit:'ק״ג שריר', min:1, max:15, step:0.5, default:4, format: v => `${v} ק״ג שריר` },
 template: (v) => ({ id:'gain_muscle', label:`לעלות ${v} ק״ג במסת שריר`, kind:'weight_change', delta:+v, unit:'ק״ג', weeks: Math.max(8, Math.round(v * 6)) }),
 direction:'aesthetics',
 },
 {
 id:'get_stronger', icon:'', label:'להתחזק',
 subtitle:'בחר תרגיל מהמאגר וקבע יעד משקל',
 input: { type:'exercise_picker' },
 template: (v) => ({
 id:`lift_${v.exerciseId}`,
 label: v.target
 ? `להגיע ל-${v.target} ק״ג ב${v.exerciseName}`
 : `לבצע חזרה אחת של ${v.exerciseName}`,
 kind:'lift_pr',
 lift: v.exerciseId,
 target: v.target,
 unit: v.target ? 'ק״ג' : 'חזרה',
 weeks: 16,
 }),
 direction:'performance',
 },
 {
 id:'run', icon:'', label:'לרוץ יותר',
 subtitle:'סבולת אירובית ובריאות לב',
 input: { type:'wheel', unit:'ק״מ', min:1, max:42, step:1, default:5, format: v => `${v} ק״מ ברצף` },
 template: (v) => ({ id:`run_${v}`, label:`לרוץ ${v} ק״מ ברצף`, kind:'endurance', distance:v, unit:'ק״מ', weeks: Math.max(6, v * 2 + 6) }),
 direction:'performance',
 },
 {
 id:'body_fat', icon:'', label:'להוריד שומן',
 subtitle:'לחטב את הגוף בלי לרדת מדי במשקל',
 input: { type:'wheel', unit:'% שומן', min:1, max:15, step:0.5, default:5, format: v => `${v}% שומן פחות` },
 template: (v) => ({ id:'cut_fat', label:`להוריד ${v}% שומן גוף`, kind:'body_fat', delta:-v, unit:'%', weeks: Math.max(8, Math.round(v * 4)) }),
 direction:'aesthetics',
 },
 {
 id:'energy', icon:'', label:'יותר אנרגיה',
 subtitle:'להתעורר טוב, לא לקרוס אחה"צ',
 input: {
 type:'chips',
 options: [
 { value:'sleep', label:'לישון 7-8 שעות', hint:'הבסיס לכל השאר', recommended:true },
 { value:'walks', label:'הליכה יומית 30 דק׳', hint:'אירובי מתון'},
 { value:'water', label:'לשתות 3 ליטר מים', hint:'קל להטמיע'},
 ],
 },
 template: (v) => {
 const map = {
 sleep: { label:'לישון 7-8 שעות רצוף', kind:'sleep', target:7.5, unit:'שעות', weeks:8 },
 walks: { label:'הליכה יומית של 30 דק׳', kind:'habit_streak', habit:'הליכה 30 דק׳', weeks:8 },
 water: { label:'לשתות 3 ליטר מים ביום', kind:'habit_streak', habit:'3 ליטר מים', weeks:6 },
 }
 return { id: v, ...map[v] }
 },
 direction:'energy',
 },
 {
 id:'calm', icon:'', label:'להירגע',
 subtitle:'פחות סטרס, יותר שקט נפשי',
 input: {
 type:'chips',
 options: [
 { value:'mood', label:'מצב-רוח יותר טוב', hint:'מדד ממוצע 7+/10', recommended:true },
 { value:'meditation', label:'מדיטציה 10 דק׳ יומי', hint:'הכי מוכח מדעית'},
 { value:'no_phone', label:'ללא טלפון בשעה הראשונה', hint:'שינוי גדול, פשוט להתחיל'},
 ],
 },
 template: (v) => {
 const map = {
 mood: { label:'מצב רוח ממוצע 7+/10', kind:'mood', target:7, weeks:8 },
 meditation: { label:'מדיטציה 10 דק׳ ביום', kind:'habit_streak', habit:'מדיטציה יומית', weeks:8 },
 no_phone: { label:'ללא טלפון בשעה הראשונה של הבוקר', kind:'habit_streak', habit:'ללא טלפון בבוקר', weeks:6 },
 }
 return { id: v, ...map[v] }
 },
 direction:'mental',
 },
 {
 id:'health', icon:'', label:'סתם להיות בריא',
 subtitle:'תזונה טובה, פעילות סדירה',
 input: {
 type:'chips',
 options: [
 { value:'sessions', label:'3 אימונים בשבוע קבוע', hint:'הכי חשוב', recommended:true },
 { value:'meal_prep', label:'הכנת ארוחות מבעוד מועד', hint:'שינוי מהותי בתזונה'},
 { value:'checkup', label:'בדיקות דם תקינות', hint:'ליווי מוסדר'},
 ],
 },
 template: (v) => {
 const map = {
 sessions: { label:'3 אימונים בשבוע קבוע', kind:'habit_streak', habit:'3 אימונים/שבוע', weeks:12 },
 meal_prep: { label:'הכנת ארוחות 4 ימים בשבוע', kind:'habit_streak', habit:'הכנת ארוחות', weeks:8 },
 checkup: { label:'להביא את כל בדיקות הדם לתקין', kind:'health_marker', metric:'בדיקות', weeks:16 },
 }
 return { id: v, ...map[v] }
 },
 direction:'health',
 },
]

export function SimpleGoal({ onDone, onGoAdvanced }) {
 const { setGoal } = useApp()
 const [step, setStep] = useState('pick')
 const [category, setCategory] = useState(null)

 const pickCategory = (cat) => { setCategory(cat); setStep('amount') }

 const finish = (value) => {
 const template = category.template(value)
 const goal = templateToGoal(template, { direction: category.direction, why:''})
 setGoal(goal)
 onDone?.(goal)
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 {/* Simple progress dots - only 2 steps now */}
 <div style={{ display:'flex', gap: 6, justifyContent:'center'}}>
 {['pick','amount'].map(s => {
 const done = ['pick','amount'].indexOf(step) >= ['pick','amount'].indexOf(s)
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

 {step === 'pick'&& <PickCategory onPick={pickCategory} onAdvanced={onGoAdvanced} />}
 {step === 'amount'&& <PickAmount category={category} onDone={finish} onBack={() => setStep('pick')} />}
 </div>
 )
}

function PickCategory({ onPick, onAdvanced }) {
 return (
 <>
 <div style={{ textAlign:'center', padding:'20px 0 10px'}}>
 <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>מה אתה רוצה?</h2>
 <div style={{ color: t.color.textDim, fontSize: t.font.md }}>בחר מטרה - כמות תוך שנייה - ויוצאים לדרך</div>
 </div>

 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
 {QUICK_GOALS.map(cat => (
 <Card key={cat.id} hover style={{ padding: 20, cursor:'pointer', position:'relative'}} onClick={() => onPick(cat)}>
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

function PickAmount({ category, onDone, onBack }) {
 const kind = category.input.type
 const headline = kind === 'wheel'
 ? 'קבע/י את הכמות המדויקת שלך'
 : kind === 'exercise_picker'
 ? 'בחר תרגיל וקבע יעד משקל'
 : 'איזה יעד מתאים לך?'

 return (
 <>
 <div style={{ textAlign:'center', padding:'20px 0 10px'}}>
 <div style={{ fontSize: 40, marginBottom: 10 }}>{category.icon}</div>
 <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 6 }}>{category.label}</h2>
 <div style={{ color: t.color.textDim, fontSize: t.font.md }}>{headline}</div>
 </div>

 {kind === 'wheel' && <WheelPicker input={category.input} onDone={onDone} />}
 {kind === 'chips' && <ChipsPicker options={category.input.options} onDone={onDone} />}
 {kind === 'exercise_picker' && <ExercisePicker onDone={onDone} />}

 <div style={{ textAlign:'center', marginTop: 8 }}>
 <button onClick={onBack} style={{
 background:'none', border:'none', color: t.color.textDim,
 cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm,
 }}>→ חזור</button>
 </div>
 </>
 )
}

// ─── Exercise picker ────────────────────────────────────────────
// Search + filter (by muscle / alphabetical) over the whole exercise
// database. Pick one, set the target weight (kg), save.
function ExercisePicker({ onDone }) {
 const [query, setQuery] = useState('')
 const [mode, setMode] = useState('muscle') // 'muscle' | 'alpha'
 const [activeMuscle, setActiveMuscle] = useState(null)
 const [selected, setSelected] = useState(null)
 const [target, setTarget] = useState('')

 const availableMuscles = useMemo(() => {
 const set = new Set(exercises.map(e => e.muscle))
 return MUSCLE_GROUPS.filter(m => set.has(m))
 }, [])

 const list = useMemo(() => {
 let out = exercises
 if (query.trim()) {
 const q = query.trim().toLowerCase()
 out = out.filter(e => e.name.toLowerCase().includes(q))
 }
 if (mode === 'muscle' && activeMuscle) {
 out = out.filter(e => e.muscle === activeMuscle || (e.secondary || []).includes(activeMuscle))
 }
 if (mode === 'alpha') {
 out = [...out].sort((a, b) => a.name.localeCompare(b.name, 'he'))
 } else {
 out = [...out].sort((a, b) => a.muscle.localeCompare(b.muscle, 'he') || a.name.localeCompare(b.name, 'he'))
 }
 return out
 }, [query, mode, activeMuscle])

 const commit = () => {
 if (!selected) return
 const targetKg = target ? Math.max(0, +target) : null
 onDone({
 exerciseId: selected.id,
 exerciseName: selected.name,
 target: targetKg,
 })
 }

 if (selected) {
 return (
 <Card style={{ padding: 24 }}>
 <div style={{ textAlign:'center', paddingBottom: 18 }}>
 <Badge color={t.color.wineLight}>{selected.muscle}</Badge>
 <div style={{ fontWeight: 800, fontSize: t.font.xxl, marginTop: 10 }}>{selected.name}</div>
 {selected.tips && (
 <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginTop: 6 }}>{selected.tips}</div>
 )}
 </div>

 <div style={{ marginBottom: 16 }}>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>
 יעד משקל (ק״ג) — השאר ריק ליעד "לבצע חזרה אחת"
 </div>
 <Input
 type="number"
 inputMode="numeric"
 placeholder="לדוגמה: 100"
 value={target}
 onChange={e => setTarget(e.target.value)}
 />
 </div>

 <div style={{ display:'flex', gap: 10, justifyContent:'center', flexWrap:'wrap'}}>
 <Button variant="ghost" onClick={() => { setSelected(null); setTarget('') }}>← החלף תרגיל</Button>
 <Button size="lg" onClick={commit}>
 {target ? `יאללה — ${target} ק״ג ב${selected.name}` : `יאללה — חזרה ראשונה ב${selected.name}`}
 </Button>
 </div>
 </Card>
 )
 }

 return (
 <Card style={{ padding: 18 }}>
 <Input
 placeholder=" חפש תרגיל (למשל: סקוואט)…"
 value={query}
 onChange={e => setQuery(e.target.value)}
 />

 <div style={{ display:'flex', gap: 6, background: t.color.bgSoft, padding: 4, borderRadius: t.radius.md, marginTop: 12 }}>
 <ModeChip active={mode === 'muscle'} onClick={() => setMode('muscle')}>לפי שריר</ModeChip>
 <ModeChip active={mode === 'alpha'} onClick={() => { setMode('alpha'); setActiveMuscle(null) }}>לפי א-ב</ModeChip>
 </div>

 {mode === 'muscle' && (
 <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginTop: 12 }}>
 <FilterChip active={!activeMuscle} onClick={() => setActiveMuscle(null)}>הכל</FilterChip>
 {availableMuscles.map(m => (
 <FilterChip key={m} active={activeMuscle === m} onClick={() => setActiveMuscle(m)}>{m}</FilterChip>
 ))}
 </div>
 )}

 <div style={{
 marginTop: 14, display:'grid', gap: 6,
 maxHeight: 380, overflowY:'auto',
 padding: 4,
 }}>
 {list.length === 0 && (
 <div style={{ padding: 20, textAlign:'center', color: t.color.textDim, fontSize: t.font.sm }}>
 לא נמצא תרגיל. נסה חיפוש אחר או פילטר אחר.
 </div>
 )}
 {list.map(ex => (
 <button
 key={ex.id}
 onClick={() => setSelected(ex)}
 style={{
 padding:'12px 14px',
 background: t.color.bgSoft,
 border:`1px solid ${t.color.border}`,
 borderRadius: t.radius.sm,
 color: t.color.text, cursor:'pointer', fontFamily:'inherit',
 textAlign:'right', width:'100%',
 display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12,
 transition: t.transition,
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor = t.color.wineLight }}
 onMouseLeave={e => { e.currentTarget.style.borderColor = t.color.border }}
 >
 <div style={{ flex: 1, minWidth: 0, textAlign:'right'}}>
 <div style={{ fontWeight: 700, fontSize: t.font.md }}>{ex.name}</div>
 <div style={{ color: t.color.textDim, fontSize: t.font.xs, marginTop: 2 }}>
 {ex.muscle} · {ex.equipment} · {ex.level}
 </div>
 </div>
 <div style={{ color: t.color.wineLight, fontSize: 18 }}>←</div>
 </button>
 ))}
 </div>

 <div style={{ marginTop: 10, fontSize: t.font.xs, color: t.color.textMuted, textAlign:'center'}}>
 {list.length} תרגילים במאגר {activeMuscle ? `· מסונן ל${activeMuscle}` : ''}
 </div>
 </Card>
 )
}

function ModeChip({ active, onClick, children }) {
 return (
 <button onClick={onClick} style={{
 flex: 1, padding:'10px 14px', border:'none', fontFamily:'inherit', cursor:'pointer',
 background: active ? t.color.bgCard :'transparent',
 color: active ? t.color.wineLight : t.color.textDim,
 fontWeight: 600, borderRadius: t.radius.sm, fontSize: t.font.sm,
 }}>{children}</button>
 )
}

function FilterChip({ active, onClick, children }) {
 return (
 <button onClick={onClick} style={{
 padding:'6px 12px',
 background: active ? t.color.wineLight :'transparent',
 border:`1px solid ${active ? t.color.wineLight : t.color.border}`,
 color: active ? t.color.white : t.color.silver1,
 borderRadius: t.radius.pill, cursor:'pointer', fontFamily:'inherit',
 fontSize: t.font.xs, fontWeight: 600,
 transition: t.transition,
 }}>{children}</button>
 )
}

// Number wheel: big display + slider + fine +/- buttons.
// Feels wheel-like on mobile via native range drag.
function WheelPicker({ input, onDone }) {
 const [value, setValue] = useState(input.default)
 const bump = (delta) => {
 const next = +(value + delta).toFixed(1)
 if (next >= input.min && next <= input.max) setValue(next)
 }
 const display = input.format ? input.format(value) : `${value} ${input.unit}`

 return (
 <Card style={{ padding: 24 }}>
 {/* Big number display */}
 <div style={{ textAlign:'center', padding:'18px 0 12px'}}>
 <div style={{ fontSize: 64, fontWeight: 900, color: t.color.gold, lineHeight: 1, marginBottom: 6 }}>
 {value}
 </div>
 <div style={{ fontSize: t.font.md, color: t.color.textDim, fontWeight: 600 }}>{display}</div>
 </div>

 {/* +/- fine controls */}
 <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: 14, marginBottom: 18 }}>
 <button onClick={() => bump(-input.step)} aria-label="הפחת"style={circleBtn(t)}>−</button>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, minWidth: 60, textAlign:'center'}}>
 קפיצות של {input.step}
 </div>
 <button onClick={() => bump(+input.step)} aria-label="הוסף"style={circleBtn(t)}>+</button>
 </div>

 {/* Range slider (the "wheel") */}
 <div style={{ padding:'0 6px'}}>
 <input
 type="range"
 min={input.min}
 max={input.max}
 step={input.step}
 value={value}
 onChange={e => setValue(+e.target.value)}
 style={{
 width:'100%',
 height: 8,
 direction:'ltr',
 accentColor: t.color.gold,
 cursor:'pointer',
 }}
 />
 <div style={{ display:'flex', justifyContent:'space-between', fontSize: t.font.xs, color: t.color.textDim, marginTop: 6 }}>
 <span>{input.min}</span>
 <span>{input.max}</span>
 </div>
 </div>

 <div style={{ marginTop: 24, display:'flex', justifyContent:'center'}}>
 <Button size="lg"icon=" " onClick={() => onDone(value)}>יאללה, זו המטרה!</Button>
 </div>
 </Card>
 )
}

function ChipsPicker({ options, onDone }) {
 return (
 <div style={{ display:'grid', gap: 10 }}>
 {options.map((opt, i) => (
 <Card key={i} hover style={{
 padding: 20, cursor:'pointer', display:'flex', alignItems:'center', gap: 16,
 borderColor: opt.recommended ? t.color.gold : t.color.border,
 }} onClick={() => onDone(opt.value)}>
 <div style={{ flex: 1 }}>
 <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 4 }}>
 <div style={{ fontWeight: 800, fontSize: t.font.xl, color: opt.recommended ? t.color.gold : t.color.text }}>{opt.label}</div>
 {opt.recommended && <Badge color={t.color.gold}>מומלץ</Badge>}
 </div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>{opt.hint}</div>
 </div>
 <div style={{ color: t.color.gold, fontSize: 20 }}>←</div>
 </Card>
 ))}
 </div>
 )
}

function circleBtn(t) {
 return {
 width: 44, height: 44, borderRadius:'50%',
 background: t.color.bgSoft, border:`1px solid ${t.color.border}`,
 color: t.color.text, cursor:'pointer', fontFamily:'inherit',
 fontSize: 22, fontWeight: 800,
 display:'flex', alignItems:'center', justifyContent:'center',
 }
}
