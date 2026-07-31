import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button, ProgressBar } from '../../../components/ui/UI'
import { BarChart } from '../../../components/charts/Charts'
import { mockMembers } from '../../../data/mockUsers'

export function Billing() {
  const mrr = 84200
  const arpu = Math.round(mrr / mockMembers.filter(m => m.status === 'active').length)
  const overdue = mockMembers.filter(m => m.id === 'm4' || m.id === 'm8')

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <StatCard label="MRR" value={`₪${mrr.toLocaleString()}`} delta="+8.2%" color={t.color.gold} />
        <StatCard label="ARR" value={`₪${(mrr*12).toLocaleString()}`} delta="+8.2%" color={t.color.success} />
        <StatCard label="ARPU" value={`₪${arpu}`} delta="+₪12" color={t.color.info} />
        <StatCard label="Churn חודשי" value="2.4%" delta="-0.3%" color={t.color.success} />
        <StatCard label="פיגורים" value={overdue.length} delta="דורש טיפול" color={t.color.warning} />
      </div>

      <Card>
        <SectionHeader title="הכנסות חודשיות (₪)" subtitle="12 חודשים אחרונים" />
        <BarChart
          labels={['ינ׳','פב׳','מר׳','אפ׳','מא׳','יו׳','יו׳','אג׳','ספ׳','אק׳','נו׳','דצ׳']}
          data={[52,58,61,65,68,71,72,74,78,80,82,84]}
          formatValue={v => `${v}K`}
          color={t.color.gold}
        />
      </Card>

      <Card>
        <SectionHeader title="פיגורי תשלום" action={<Button>שלח תזכורת לכולם</Button>} />
        {overdue.length === 0 ? (
          <div style={{ padding: 40, textAlign:'center', color: t.color.textDim }}>אין פיגורים פעילים</div>
        ) : (
          <div style={{ display:'grid', gap: 10 }}>
            {overdue.map(m => (
              <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, borderRight:`3px solid ${t.color.warning}` }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>מנוי {m.plan} · פיגור של 12 ימים</div>
                </div>
                <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                  <Badge color={t.color.warning}>₪280</Badge>
                  <Button size="sm" variant="outline">גבייה</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="חבילות מנוי" action={<Button icon="+">חבילה חדשה</Button>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { name:'בייסיק',   price:180, features:['גישה לחדר כושר','שיעורים קבוצתיים'], color: t.color.textDim, members: 1 },
            { name:'סטנדרט',   price:320, features:['הכל בבייסיק','תכנית אימון אישית','ליווי מאמן'], color: t.color.info, members: 4 },
            { name:'פרימיום', price:580, features:['הכל בסטנדרט','תזונאי אישי','מאמן מנטלי','בדיקות דם'], color: t.color.gold, members: 5, popular: true },
          ].map(pkg => (
            <Card key={pkg.name} style={{ padding: 20, border:`1px solid ${pkg.popular ? t.color.gold : t.color.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{pkg.name}</div>
                {pkg.popular && <Badge>הכי פופולרי</Badge>}
              </div>
              <div style={{ fontSize: t.font.xxxl, fontWeight: 800, color: pkg.color, marginBottom: 10 }}>
                ₪{pkg.price}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}>/חודש</span>
              </div>
              <div style={{ display:'grid', gap: 6, marginBottom: 14 }}>
                {pkg.features.map((f, i) => <div key={i} style={{ fontSize: t.font.sm, color: t.color.textDim }}>✓ {f}</div>)}
              </div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{pkg.members} מנויים פעילים</div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatCard({ label, value, delta, color }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: t.font.xxl, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{delta}</div>
    </Card>
  )
}
