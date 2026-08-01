import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Stat, ProgressBar } from '../../../components/ui/UI'
import { Sparkline, BarChart, DonutSegments } from '../../../components/charts/Charts'
import { mockMembers, mockTeam, mockAlerts } from '../../../data/mockUsers'
import { useI18n } from '../../../i18n/i18n'

export function Overview() {
 const { isRTL } = useI18n()
 const activeMembers = mockMembers.filter(m => m.status === 'active').length
 const atRisk = mockMembers.filter(m => m.risk === 'high'|| m.risk === 'medium').length
 const avgAdherence = Math.round(mockMembers.reduce((s, m) => s + m.adherence, 0) / mockMembers.length)
 const avgMood = (mockMembers.reduce((s, m) => s + m.mood, 0) / mockMembers.length).toFixed(1)

 return (
 <div style={{ display:'grid', gap: 20 }}>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
 <KpiCard icon="" label={isRTL ? 'מתאמנים פעילים' : 'Active members'} value={activeMembers} delta={isRTL ? '+3 השבוע' : '+3 this week'} color={t.color.gold} />
 <KpiCard icon=" " label="MRR" value={isRTL ? '₪84,200' : '$22,750'} delta={isRTL ? '+8.2% חודש שעבר' : '+8.2% vs last month'} color={t.color.success} />
 <KpiCard icon=" " label={isRTL ? 'דבקות ממוצעת' : 'Average adherence'} value={`${avgAdherence}%`} delta={isRTL ? '+4% משבוע שעבר' : '+4% vs last week'} color={t.color.info} />
 <KpiCard icon=" " label={isRTL ? 'שביעות רצון' : 'Satisfaction'} value={`${avgMood}/10`} delta={isRTL ? 'יציב' : 'Stable'} color={t.color.gold} />
 <KpiCard icon=" " label={isRTL ? 'מתאמנים בסיכון' : 'At-risk members'} value={atRisk} delta={isRTL ? 'דורש תשומת לב' : 'Needs attention'} color={t.color.danger} />
 </div>

 <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 20 }} className="hfos-grid-2">
 <Card>
 <SectionHeader
   title={isRTL ? 'הכנסות חודשיות' : 'Monthly revenue'}
   subtitle={isRTL ? '12 חודשים אחרונים' : 'Last 12 months'}
 />
 <BarChart
 labels={isRTL
   ? ['ינ׳','פב׳','מר׳','אפ׳','מא׳','יו׳','יו׳','אג׳','ספ׳','אק׳','נו׳','דצ׳']
   : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']}
 data={[52,58,61,65,68,71,72,74,78,80,82,84]}
 formatValue={v => `${v}K`}
 color={t.color.gold}
 />
 </Card>
 <Card>
 <SectionHeader title={isRTL ? 'פילוח מנויים' : 'Subscription breakdown'} />
 <DonutSegments size={160} segments={[
 { value: mockMembers.filter(m => m.plan === 'פרימיום').length, color: t.color.gold },
 { value: mockMembers.filter(m => m.plan === 'סטנדרט').length, color: t.color.info },
 { value: mockMembers.filter(m => m.plan === 'בייסיק').length, color: t.color.textDim },
 ]} />
 <div style={{ marginTop: 14, display:'grid', gap: 6 }}>
 <LegendRow color={t.color.gold} label={isRTL ? 'פרימיום' : 'Premium'} count={mockMembers.filter(m => m.plan === 'פרימיום').length} isRTL={isRTL} />
 <LegendRow color={t.color.info} label={isRTL ? 'סטנדרט' : 'Standard'} count={mockMembers.filter(m => m.plan === 'סטנדרט').length} isRTL={isRTL} />
 <LegendRow color={t.color.textDim} label={isRTL ? 'בייסיק' : 'Basic'} count={mockMembers.filter(m => m.plan === 'בייסיק').length} isRTL={isRTL} />
 </div>
 </Card>
 </div>

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20 }} className="hfos-grid-2">
 <Card>
 <SectionHeader title={isRTL ? 'התראות דחופות' : 'Urgent alerts'} action={<Badge color={t.color.danger}>{mockAlerts.filter(a => a.severity === 'high').length}</Badge>} />
 <div style={{ display:'grid', gap: 10 }}>
 {mockAlerts.slice(0, 4).map(a => (
 <div key={a.id} style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, borderRight:`3px solid ${a.severity === 'high'? t.color.danger : a.severity === 'medium'? t.color.warning : t.color.info}` }}>
 <div style={{ fontWeight: 600, fontSize: t.font.sm }}>{a.title}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{a.desc}</div>
 </div>
 ))}
 </div>
 </Card>
 <Card>
 <SectionHeader title={isRTL ? 'נצילות מאמנים' : 'Coach utilization'} />
 <div style={{ display:'grid', gap: 12 }}>
 {mockTeam.filter(tm => tm.role === 'Coach').map(coach => (
 <div key={coach.id}>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
 <span style={{ fontSize: t.font.sm }}>{coach.name}</span>
 <span style={{ fontSize: t.font.sm, color: t.color.gold }}>
   {coach.hoursThisWeek}h / {coach.activeMembers} {isRTL ? 'מתאמנים' : 'members'}
 </span>
 </div>
 <ProgressBar value={coach.hoursThisWeek} max={40} />
 </div>
 ))}
 </div>
 </Card>
 </div>
 <style>{`@media (max-width: 900px) { .hfos-grid-2 { grid-template-columns: 1fr !important; } }`}</style>
 </div>
 )
}

function KpiCard({ icon, label, value, delta, color }) {
 return (
 <Card style={{ padding: 20 }}>
 <div style={{ display:'flex', alignItems:'center', gap: 8, color: t.color.textDim, fontSize: t.font.sm, marginBottom: 8 }}>
 <span>{icon}</span>{label}
 </div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color }}>{value}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{delta}</div>
 </Card>
 )
}

function LegendRow({ color, label, count, isRTL }) {
 return (
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: t.font.sm }}>
 <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
 <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
 <span>{label}</span>
 </div>
 <span style={{ color: t.color.textDim }}>{count} {isRTL ? 'מתאמנים' : 'members'}</span>
 </div>
 )
}
