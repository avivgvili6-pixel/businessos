import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button, Tabs } from '../../../components/ui/UI'
import { mockAlerts, mockMembers } from '../../../data/mockUsers'

const TYPE_LABELS = {
  churn_risk: 'סיכון נטישה',
  blood_marker: 'סמן דם חריג',
  performance_drop: 'ירידת ביצועים',
  mood_low: 'מצב-רוח נמוך',
  plateau: 'פלטו',
}

export function Alerts() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? mockAlerts : mockAlerts.filter(a => a.severity === filter)

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <Kpi label="דחוף" count={mockAlerts.filter(a => a.severity === 'high').length} color={t.color.danger} />
        <Kpi label="בינוני" count={mockAlerts.filter(a => a.severity === 'medium').length} color={t.color.warning} />
        <Kpi label="קל" count={mockAlerts.filter(a => a.severity === 'low').length} color={t.color.info} />
        <Kpi label="סה״כ פעילות" count={mockAlerts.length} color={t.color.gold} />
      </div>

      <Tabs
        tabs={[
          { key:'all',    label:'הכל' },
          { key:'high',   label:'דחוף' },
          { key:'medium', label:'בינוני' },
          { key:'low',    label:'קל' },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div style={{ display:'grid', gap: 10 }}>
        {filtered.map(a => {
          const m = mockMembers.find(x => x.id === a.memberId)
          const sev = { high:['דחוף', t.color.danger], medium:['בינוני', t.color.warning], low:['קל', t.color.info] }[a.severity]
          return (
            <Card key={a.id} style={{ padding: 18, borderRight: `4px solid ${sev[1]}` }} hover>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 16, flexWrap:'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 8 }}>
                    <Badge color={sev[1]}>{sev[0]}</Badge>
                    <Badge color={t.color.textDim}>{TYPE_LABELS[a.type]}</Badge>
                    {m && <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>מאמן: {m.coach}</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: 10 }}>{a.desc}</div>
                  <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm }}>
                    💡 <b style={{ color: t.color.gold }}>המלצת פעולה:</b> {a.suggestion}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap: 8 }}>
                  <Button size="sm">בצע פעולה</Button>
                  <Button variant="ghost" size="sm">סגור</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Kpi({ label, count, color }) {
  return (
    <Card style={{ padding: 18, textAlign:'center' }}>
      <div style={{ fontSize: t.font.xxxl, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginTop: 4 }}>{label}</div>
    </Card>
  )
}
