import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Stat, ProgressBar } from '../../../components/ui/UI'
import { Sparkline, BarChart, DonutSegments } from '../../../components/charts/Charts'
import { mockMembers, mockTeam, mockAlerts } from '../../../data/mockUsers'

export function Overview() {
  const activeMembers = mockMembers.filter(m => m.status === 'active').length
  const atRisk = mockMembers.filter(m => m.risk === 'high' || m.risk === 'medium').length
  const avgAdherence = Math.round(mockMembers.reduce((s, m) => s + m.adherence, 0) / mockMembers.length)
  const avgMood = (mockMembers.reduce((s, m) => s + m.mood, 0) / mockMembers.length).toFixed(1)

  return (
    <div style={{ display:'grid', gap: 20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KpiCard icon="👥" label="מתאמנים פעילים" value={activeMembers} delta="+3 השבוע" color={t.color.gold} />
        <KpiCard icon="💰" label="MRR" value="₪84,200" delta="+8.2% חודש שעבר" color={t.color.success} />
        <KpiCard icon="📊" label="דבקות ממוצעת" value={`${avgAdherence}%`} delta="+4% משבוע שעבר" color={t.color.info} />
        <KpiCard icon="😊" label="שביעות רצון" value={`${avgMood}/10`} delta="יציב" color={t.color.gold} />
        <KpiCard icon="⚠️" label="מתאמנים בסיכון" value={atRisk} delta="דורש תשומת לב" color={t.color.danger} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap: 20 }} className="hfos-grid-2">
        <Card>
          <SectionHeader title="הכנסות חודשיות" subtitle="12 חודשים אחרונים" />
          <BarChart
            labels={['ינ׳','פב׳','מר׳','אפ׳','מא׳','יו׳','יו׳','אג׳','ספ׳','אק׳','נו׳','דצ׳']}
            data={[52,58,61,65,68,71,72,74,78,80,82,84]}
            formatValue={v => `${v}K`}
            color={t.color.gold}
          />
        </Card>
        <Card>
          <SectionHeader title="פילוח מנויים" />
          <DonutSegments size={160} segments={[
            { value: mockMembers.filter(m => m.plan === 'פרימיום').length, color: t.color.gold },
            { value: mockMembers.filter(m => m.plan === 'סטנדרט').length, color: t.color.info },
            { value: mockMembers.filter(m => m.plan === 'בייסיק').length, color: t.color.textDim },
          ]} />
          <div style={{ marginTop: 14, display:'grid', gap: 6 }}>
            <LegendRow color={t.color.gold} label="פרימיום" count={mockMembers.filter(m => m.plan === 'פרימיום').length} />
            <LegendRow color={t.color.info} label="סטנדרט"  count={mockMembers.filter(m => m.plan === 'סטנדרט').length} />
            <LegendRow color={t.color.textDim} label="בייסיק" count={mockMembers.filter(m => m.plan === 'בייסיק').length} />
          </div>
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20 }} className="hfos-grid-2">
        <Card>
          <SectionHeader title="התראות דחופות" action={<Badge color={t.color.danger}>{mockAlerts.filter(a => a.severity === 'high').length}</Badge>} />
          <div style={{ display:'grid', gap: 10 }}>
            {mockAlerts.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, borderRight:`3px solid ${a.severity === 'high' ? t.color.danger : a.severity === 'medium' ? t.color.warning : t.color.info}` }}>
                <div style={{ fontWeight: 600, fontSize: t.font.sm }}>{a.title}</div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectionHeader title="נצילות מאמנים" />
          <div style={{ display:'grid', gap: 12 }}>
            {mockTeam.filter(t => t.role === 'Coach').map(coach => (
              <div key={coach.id}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: t.font.sm }}>{coach.name}</span>
                  <span style={{ fontSize: t.font.sm, color: t.color.gold }}>{coach.hoursThisWeek}h / {coach.activeMembers} מתאמנים</span>
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

function LegendRow({ color, label, count }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: t.font.sm }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
        <span>{label}</span>
      </div>
      <span style={{ color: t.color.textDim }}>{count} מתאמנים</span>
    </div>
  )
}
