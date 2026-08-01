import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button } from '../../../components/ui/UI'
import { BarChart, Sparkline, DonutSegments } from '../../../components/charts/Charts'
import { mockMembers } from '../../../data/mockUsers'

export function Analytics() {
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title="אנליטיקה עסקית ותפעולית"action={<Button variant="outline">ייצא CSV</Button>} />

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20 }} className="hfos-grid-2">
 <Card>
 <SectionHeader title="קונברז׳ן ליד → מנוי"/>
 <BarChart labels={['לידים','טסט','נרשמו','שילמו','חודש 2']} data={[240, 180, 95, 78, 71]} color={t.color.gold} />
 <div style={{ marginTop: 10, fontSize: t.font.sm, color: t.color.textDim }}>שיעור המרה סופי: <b style={{ color: t.color.gold }}>29.6%</b></div>
 </Card>
 <Card>
 <SectionHeader title="Cohort Retention"/>
 <div style={{ display:'grid', gap: 6 }}>
 {['ינואר','פברואר','מרץ','אפריל'].map((month, i) => (
 <div key={month} style={{ display:'flex', alignItems:'center', gap: 8 }}>
 <span style={{ width: 60, fontSize: t.font.sm, color: t.color.textDim }}>{month}</span>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap: 3, flex: 1 }}>
 {[100, 82, 71, 65, 60, 56].map((v, j) => j >= i ? (
 <div key={j} style={{
 background: `${t.color.gold}${Math.round(v*2.55).toString(16).padStart(2,'0')}`,
 padding:'6px 4px', borderRadius: 4, textAlign:'center', fontSize: 10, color:'#0d0d14', fontWeight: 700,
 }}>{v}%</div>
 ) : <div key={j} />)}
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>

 <Card>
 <SectionHeader title="מטרות המתאמנים - פילוח"/>
 <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 30, alignItems:'center'}}>
 <DonutSegments size={180} segments={[
 { value: mockMembers.filter(m => m.goal.includes('חיטוב')).length, color: t.color.gold },
 { value: mockMembers.filter(m => m.goal.includes('מסה')).length, color: t.color.info },
 { value: mockMembers.filter(m => m.goal.includes('כוח')).length, color: t.color.purple },
 { value: mockMembers.filter(m => m.goal.includes('ירידה')).length, color: t.color.danger },
 { value: mockMembers.filter(m => m.goal.includes('בריאות')).length, color: t.color.success },
 ]} />
 <div style={{ display:'grid', gap: 8 }}>
 {[
 { color: t.color.gold, label:'חיטוב', count: mockMembers.filter(m => m.goal.includes('חיטוב')).length },
 { color: t.color.info, label:'עלייה במסה', count: mockMembers.filter(m => m.goal.includes('מסה')).length },
 { color: t.color.purple, label:'כוח', count: mockMembers.filter(m => m.goal.includes('כוח')).length },
 { color: t.color.danger, label:'ירידה במשקל', count: mockMembers.filter(m => m.goal.includes('ירידה')).length },
 { color: t.color.success, label:'בריאות כללית', count: mockMembers.filter(m => m.goal.includes('בריאות')).length },
 ].map((g, i) => (
 <div key={i} style={{ display:'flex', alignItems:'center', gap: 10, padding: 8, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
 <div style={{ width: 12, height: 12, background: g.color, borderRadius: 3 }} />
 <span style={{ flex: 1 }}>{g.label}</span>
 <Badge color={g.color}>{g.count}</Badge>
 </div>
 ))}
 </div>
 </div>
 </Card>

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 12 }} className="hfos-grid-3">
 <MiniReport title="דבקות ממוצעת"value="72%"trend={[68, 70, 71, 72, 74, 72]} color={t.color.gold} />
 <MiniReport title="ממוצע ביקורים/שבוע"value="3.2"trend={[2.8, 3.0, 3.1, 3.2, 3.4, 3.2]} color={t.color.info} />
 <MiniReport title="שביעות רצון"value="4.7/5" trend={[4.5, 4.6, 4.6, 4.7, 4.8, 4.7]} color={t.color.success} />
 </div>
 <style>{`@media (max-width: 900px) { .hfos-grid-2, .hfos-grid-3 { grid-template-columns: 1fr !important; } }`}</style>
 </div>
 )
}

function MiniReport({ title, value, trend, color }) {
 return (
 <Card style={{ padding: 18 }}>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>{title}</div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color, marginBottom: 8 }}>{value}</div>
 <Sparkline data={trend} height={40} color={color} />
 </Card>
 )
}
