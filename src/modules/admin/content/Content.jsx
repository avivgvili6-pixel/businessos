import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button, Tabs, Input, Select } from '../../../components/ui/UI'
import { exercises, workoutSplits, MUSCLE_GROUPS, CATEGORIES } from '../../../data/exercises'
import { foods } from '../../../data/foods'
import { dietTemplates } from '../../../utils/calc'

export function Content() {
 const [tab, setTab] = useState('templates')
 return (
 <>
 <Tabs tabs={[
 { key:'templates', label:'תבניות תכניות'},
 { key:'exercises', label:'מאגר תרגילים'},
 { key:'diets', label:'תבניות תזונה'},
 { key:'foods', label:'מאגר מזון'},
 ]} active={tab} onChange={setTab} />

 {tab === 'templates'&& <PlanTemplates />}
 {tab === 'exercises'&& <ExerciseBank />}
 {tab === 'diets'&& <DietBank />}
 {tab === 'foods'&& <FoodBank />}
 </>
 )
}

function PlanTemplates() {
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title="תבניות תכניות אימון"action={<Button icon="+">תבנית חדשה</Button>} />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
 {Object.entries(workoutSplits).map(([k, v]) => (
 <Card key={k} hover style={{ padding: 20 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{v.label}</div>
 <Badge color={t.color.gold}>{v.days} ימים</Badge>
 </div>
 <div style={{ display:'grid', gap: 4, marginBottom: 14 }}>
 {v.sessions.slice(0, 4).map((s, i) => (
 <div key={i} style={{ fontSize: t.font.sm, color: t.color.textDim, padding:'4px 0', borderBottom:`1px solid ${t.color.border}` }}>
 יום {i+1}: {s}
 </div>
 ))}
 {v.sessions.length > 4 && <div style={{ fontSize: t.font.xs, color: t.color.textMuted }}>+ {v.sessions.length - 4} נוספים</div>}
 </div>
 <div style={{ display:'flex', gap: 8 }}>
 <Button variant="outline"size="sm">שכפל</Button>
 <Button variant="ghost"size="sm">שלח למתאמן</Button>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )
}

function ExerciseBank() {
 const [q, setQ] = useState('')
 const [muscle, setMuscle] = useState('')
 const list = exercises.filter(e => (!q || e.name.includes(q)) && (!muscle || e.muscle === muscle))
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ padding: 16 }}>
 <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr auto', gap: 10 }}>
 <Input placeholder="חפש..." value={q} onChange={e => setQ(e.target.value)} />
 <Select value={muscle} onChange={e => setMuscle(e.target.value)}>
 <option value="">כל הקבוצות</option>{MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
 </Select>
 <Button icon="+">תרגיל חדש</Button>
 </div>
 </Card>
 <Card>
 <div style={{ overflowX:'auto'}}>
 <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 700 }}>
 <thead>
 <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
 {['תרגיל','שריר ראשי','קטגוריה','רמה','ציוד'].map(h => (
 <th key={h} style={{ textAlign:'right', padding: 12, fontSize: t.font.xs, color: t.color.textDim }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {list.map(e => (
 <tr key={e.id} style={{ borderBottom:`1px solid ${t.color.border}` }}>
 <td style={{ padding: 12, fontWeight: 600 }}>{e.name}</td>
 <td style={{ padding: 12 }}><Badge color={t.color.gold}>{e.muscle}</Badge></td>
 <td style={{ padding: 12, fontSize: t.font.sm }}>{e.category}</td>
 <td style={{ padding: 12, fontSize: t.font.sm }}>{e.level}</td>
 <td style={{ padding: 12, fontSize: t.font.sm, color: t.color.textDim }}>{e.equipment}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 )
}

function DietBank() {
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title="תבניות תזונה"action={<Button icon="+">תבנית חדשה</Button>} />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
 {Object.entries(dietTemplates).map(([k, v]) => (
 <Card key={k} style={{ padding: 20 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 8 }}>{v.label}</div>
 <div style={{ display:'flex', gap: 6, marginBottom: 12 }}>
 <Badge color={t.color.info}>{v.p}% חלבון</Badge>
 <Badge color={t.color.gold}>{v.c}% פחמימות</Badge>
 <Badge color={t.color.warning}>{v.f}% שומן</Badge>
 </div>
 <Button variant="outline"size="sm">שכפל למתאמן</Button>
 </Card>
 ))}
 </div>
 </div>
 )
}

function FoodBank() {
 const [q, setQ] = useState('')
 const list = foods.filter(f => !q || f.name.includes(q))
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ padding: 16 }}>
 <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap: 10 }}>
 <Input placeholder="חפש..." value={q} onChange={e => setQ(e.target.value)} />
 <Button icon="+">מזון חדש</Button>
 </div>
 </Card>
 <Card>
 <div style={{ overflowX:'auto'}}>
 <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 600 }}>
 <thead>
 <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
 {['שם','קטגוריה','קלוריות','חלבון','פחמימות','שומן'].map(h => (
 <th key={h} style={{ textAlign:'right', padding: 12, fontSize: t.font.xs, color: t.color.textDim }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {list.map(f => (
 <tr key={f.id} style={{ borderBottom:`1px solid ${t.color.border}` }}>
 <td style={{ padding: 12, fontWeight: 600 }}>{f.name}</td>
 <td style={{ padding: 12 }}><Badge color={t.color.textDim}>{f.cat}</Badge></td>
 <td style={{ padding: 12, color: t.color.gold, fontWeight: 700 }}>{f.kcal}</td>
 <td style={{ padding: 12, color: t.color.info }}>{f.p}ג׳</td>
 <td style={{ padding: 12 }}>{f.c}ג׳</td>
 <td style={{ padding: 12, color: t.color.warning }}>{f.f}ג׳</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 )
}
