import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button, Input, Select, Badge, SectionHeader, Modal, ProgressBar, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { mockMembers } from '../../../data/mockUsers'

export function Members() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [risk, setRisk] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = mockMembers.filter(m =>
    (!q || m.name.includes(q)) &&
    (!status || m.status === status) &&
    (!risk || m.risk === risk)
  )

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap: 10 }} className="hfos-grid-members">
          <Input placeholder="🔍 חפש מתאמן..." value={q} onChange={e => setQ(e.target.value)} />
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="paused">מושהה</option>
          </Select>
          <Select value={risk} onChange={e => setRisk(e.target.value)}>
            <option value="">כל הסיכונים</option>
            <option value="low">נמוך</option>
            <option value="medium">בינוני</option>
            <option value="high">גבוה</option>
          </Select>
          <Button icon="+">הוסף מתאמן</Button>
        </div>
      </Card>

      <Card>
        <SectionHeader title={`מתאמנים (${filtered.length})`} />
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
                {['שם','מטרה','מאמן','מנוי','דבקות','מצב-רוח','אימונים','סיכון','סטטוס'].map(h => (
                  <th key={h} style={{ textAlign:'right', padding: '10px 12px', fontSize: t.font.xs, color: t.color.textDim, fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} onClick={() => setSelected(m)} style={{ borderBottom:`1px solid ${t.color.border}`, cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = t.color.bgSoft}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius:'50%', background: t.color.gold, color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 700, fontSize: 12 }}>{m.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{m.age} · הצטרף לפני {m.joinedDays} ימים</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: t.font.sm }}>{m.goal}</td>
                  <td style={{ padding: 12, fontSize: t.font.sm }}>{m.coach}</td>
                  <td style={{ padding: 12 }}><Badge color={m.plan === 'פרימיום' ? t.color.gold : t.color.textDim}>{m.plan}</Badge></td>
                  <td style={{ padding: 12, minWidth: 120 }}>
                    <div style={{ fontSize: t.font.xs, marginBottom: 4, color: t.color.textDim }}>{m.adherence}%</div>
                    <ProgressBar value={m.adherence} max={100} color={m.adherence >= 75 ? t.color.success : m.adherence >= 50 ? t.color.gold : t.color.danger} />
                  </td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{m.mood}/10</td>
                  <td style={{ padding: 12 }}>{m.sessionsThisWeek}</td>
                  <td style={{ padding: 12 }}><RiskBadge risk={m.risk} /></td>
                  <td style={{ padding: 12 }}><Badge color={m.status === 'active' ? t.color.success : t.color.warning}>{m.status === 'active' ? 'פעיל' : 'מושהה'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState icon="👥" title="לא נמצאו מתאמנים" />}
        </div>
      </Card>

      <MemberDrawer member={selected} onClose={() => setSelected(null)} />
      <style>{`@media (max-width: 900px) { .hfos-grid-members { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function RiskBadge({ risk }) {
  const map = { low:['נמוך', t.color.success], medium:['בינוני', t.color.warning], high:['גבוה', t.color.danger] }
  const [label, color] = map[risk] || ['—', t.color.textDim]
  return <Badge color={color}>{label}</Badge>
}

function MemberDrawer({ member, onClose }) {
  if (!member) return null
  return (
    <Modal open={!!member} onClose={onClose} title={member.name} width={720}>
      <div style={{ display:'grid', gap: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10, textAlign:'center' }}>
          <MiniStat label="גיל" value={member.age} />
          <MiniStat label="משקל" value={`${member.weightKg}ק״ג`} />
          <MiniStat label="דבקות" value={`${member.adherence}%`} />
          <MiniStat label="מצב רוח" value={`${member.mood}/10`} />
        </div>

        <Card style={{ background: t.color.bgSoft, padding: 14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>קורלציות אחרונות</div>
            <RiskBadge risk={member.risk} />
          </div>
          <Sparkline data={[65,68,72,70,74,71,73,76,74]} height={40} />
          <div style={{ marginTop: 8, fontSize: t.font.xs, color: t.color.textDim }}>מגמת דבקות · 9 שבועות אחרונים</div>
        </Card>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <SummaryRow label="מטרה"        value={member.goal} />
          <SummaryRow label="מנוי"         value={member.plan} />
          <SummaryRow label="מאמן"         value={member.coach} />
          <SummaryRow label="Check-in אחרון" value={member.lastCheckin} />
        </div>

        <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
          <Button variant="ghost">📧 שלח הודעה</Button>
          <Button variant="outline">📋 עדכן תכנית</Button>
          <Button>👁️ צפה כמתאמן</Button>
        </div>
      </div>
    </Modal>
  )
}

function MiniStat({ label, value }) {
  return (
    <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md }}>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{label}</div>
      <div style={{ fontSize: t.font.lg, fontWeight: 700, color: t.color.gold }}>{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )
}
