import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button } from '../../../components/ui/UI'
import { mockSchedule } from '../../../data/mockUsers'
import { DAYS_HE } from '../../../utils/date'

export function Schedule() {
 const days = DAYS_HE.slice(0, 6)
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title="לו״ז מתחם"subtitle="שבוע נוכחי"action={<Button icon="+">שיעור חדש</Button>} />
 <div style={{ overflowX:'auto'}}>
 <div style={{ display:'grid', gridTemplateColumns:`repeat(${days.length}, minmax(160px, 1fr))`, gap: 8, minWidth: 900 }}>
 {days.map((d, i) => (
 <div key={i} style={{ background: t.color.bgCard, borderRadius: t.radius.md, border:`1px solid ${t.color.border}`, minHeight: 400 }}>
 <div style={{ padding: 12, borderBottom:`1px solid ${t.color.border}`, textAlign:'center', fontWeight: 700, color: t.color.gold }}>{d}</div>
 <div style={{ padding: 8, display:'grid', gap: 6 }}>
 {mockSchedule.filter(c => c.day === i).map((c, j) => (
 <div key={j} style={{
 padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm,
 borderRight: `3px solid ${c.booked >= c.capacity ? t.color.danger : t.color.gold}`,
 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.sm }}>{c.time}</div>
 <div style={{ fontSize: t.font.sm, marginTop: 2 }}>{c.title}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>
 {c.coach} · {c.room}
 </div>
 <div style={{ marginTop: 6, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
 <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>הרשמות</span>
 <Badge color={c.booked >= c.capacity ? t.color.danger : t.color.success}>{c.booked}/{c.capacity}</Badge>
 </div>
 </div>
 ))}
 {!mockSchedule.some(c => c.day === i) && (
 <div style={{ textAlign:'center', color: t.color.textMuted, fontSize: t.font.xs, padding: 20 }}>אין שיעורים</div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )
}
