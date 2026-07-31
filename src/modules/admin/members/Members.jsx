import React, { useState, useEffect } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button, Input, Select, Badge, SectionHeader, Modal, ProgressBar, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { storage } from '../../../utils/storage'

export function Members() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [risk, setRisk] = useState('')
  const [selected, setSelected] = useState(null)
  const [showDemo, setShowDemo] = useState(false)

  // Real members would come from a backend. For now, we show an honest empty
  // state and let the admin opt-in to sample data for UI preview.
  const [demoMembers, setDemoMembers] = useState([])
  useEffect(() => {
    if (showDemo && !demoMembers.length) {
      import('../../../data/mockUsers').then(m => setDemoMembers(m.mockMembers))
    }
  }, [showDemo])

  const source = showDemo ? demoMembers : []
  const filtered = source.filter(m =>
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

      {!showDemo && (
        <Card style={{ padding: 20, background: `${t.color.info}10`, borderColor: t.color.info }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 28 }}>📡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>אין עדיין מתאמנים רשומים</div>
              <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.5 }}>
                כשמתאמנים ייצרו חשבון עם המייל שלהם, הם יופיעו כאן. כדי לראות איך זה נראה עם נתונים - הפעל תצוגת דמו.
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDemo(true)}>הצג תצוגת דמו</Button>
          </div>
        </Card>
      )}

      {showDemo && (
        <div style={{ padding: 10, background: t.color.goldGlow, border: `1px solid ${t.color.gold}`, borderRadius: t.radius.md, fontSize: t.font.sm, color: t.color.gold, textAlign: 'center' }}>
          🎭 תצוגת דמו פעילה - הנתונים כאן דמיוניים
          <button onClick={() => setShowDemo(false)} style={{ background: 'none', border: 'none', color: t.color.gold, marginRight: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>כבה</button>
        </div>
      )}

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
  // synthesize trends from member data (deterministic per member for stable demo)
  const seed = member.id.charCodeAt(1) || 3
  const rand = (i) => Math.abs(Math.sin(seed * 12.9898 + i * 78.233)) % 1
  const weightSeries = Array.from({ length: 12 }, (_, i) => +(member.weightKg + (rand(i)-0.5)*3).toFixed(1))
  const adherenceSeries = Array.from({ length: 8 }, (_, i) => Math.min(100, Math.max(30, member.adherence + Math.round((rand(i+5)-0.5)*20))))
  const moodSeries = Array.from({ length: 14 }, (_, i) => Math.min(10, Math.max(2, Math.round(member.mood + (rand(i+10)-0.5)*3))))
  const strengthSeries = Array.from({ length: 8 }, (_, i) => Math.round(80 + i*4 + rand(i+20)*6))

  return (
    <Modal open={!!member} onClose={onClose} title={member.name} width={860}>
      <div style={{ display:'grid', gap: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 10, textAlign:'center' }} className="hfos-member-stats">
          <MiniStat label="גיל" value={member.age} />
          <MiniStat label="משקל" value={`${member.weightKg}ק״ג`} />
          <MiniStat label="דבקות" value={`${member.adherence}%`} />
          <MiniStat label="מצב רוח" value={`${member.mood}/10`} />
          <MiniStat label="אימונים/שב׳" value={member.sessionsThisWeek} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }} className="hfos-member-charts">
          <TrendCard title="משקל" data={weightSeries} unit="ק״ג" color={t.color.gold} sub="12 שבועות" />
          <TrendCard title="דבקות" data={adherenceSeries} unit="%" color={t.color.success} sub="8 שבועות" />
          <TrendCard title="מצב-רוח" data={moodSeries} unit="/10" color={t.color.info} sub="14 ימים" />
          <TrendCard title="ביצועי כוח (סקוואט)" data={strengthSeries} unit="ק״ג" color={t.color.purple} sub="8 שבועות" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          <SummaryRow label="מטרה"        value={member.goal} />
          <SummaryRow label="מנוי"         value={member.plan} />
          <SummaryRow label="מאמן"         value={member.coach} />
          <SummaryRow label="Check-in אחרון" value={member.lastCheckin} />
        </div>

        <Card style={{ background: t.color.bgSoft, padding: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, display:'flex', alignItems:'center', gap: 8 }}>
            <Badge color={t.color.gold}>🧠 המלצת המנוע</Badge>
          </div>
          <div style={{ fontSize: t.font.sm, color: t.color.text, lineHeight: 1.6 }}>
            {coachRecommendation(member)}
          </div>
        </Card>

        <div style={{ display:'flex', gap: 10, justifyContent:'flex-end', flexWrap:'wrap' }}>
          <Button variant="ghost">📧 שלח הודעה</Button>
          <Button variant="ghost">📅 קבע פגישה</Button>
          <Button variant="outline">📋 עדכן תכנית</Button>
          <Button>👁️ צפה כמתאמן</Button>
        </div>
      </div>
      <style>{`
        @media (max-width: 700px) {
          .hfos-member-stats { grid-template-columns: 1fr 1fr !important; }
          .hfos-member-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Modal>
  )
}

function TrendCard({ title, data, unit, color, sub }) {
  const last = data[data.length - 1]
  const first = data[0]
  const delta = last - first
  const pct = first ? Math.round((delta / first) * 100) : 0
  const positive = delta >= 0
  return (
    <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
        <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>{title}</div>
        <Badge color={positive ? t.color.success : t.color.warning}>
          {positive ? '↗' : '↘'} {pct}%
        </Badge>
      </div>
      <div style={{ fontSize: t.font.xxl, fontWeight: 800, color, marginBottom: 6 }}>
        {last}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}> {unit}</span>
      </div>
      <Sparkline data={data} height={40} color={color} />
      <div style={{ fontSize: 10, color: t.color.textMuted, marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function coachRecommendation(m) {
  if (m.risk === 'high') return `${m.name} בסיכון נטישה. דבקות ${m.adherence}%, ${m.sessionsThisWeek} אימונים השבוע. המלצה: שיחת טלפון אישית ובחינת סיבות (עומס עבודה? פציעה? תזונה?). מומלץ להציע 2 שבועות של תכנית מקוצרת (30 דק׳ × 3 בשבוע) לחזרה הדרגתית.`
  if (m.risk === 'medium') return `${m.name} מראה סימני האטה. שווה Check-in אישי בפגישה הבאה - לוודא שהמטרות עדיין רלוונטיות ושהתכנית לא נשחקה. שקול הכנסת אתגר חדש (מדד PR חדש) לחידוש מוטיבציה.`
  if (m.adherence >= 85) return `ביצועים מצוינים - דבקות גבוהה ומצב-רוח יציב. הזדמנות לפרוגרסיה: העלאת עומס בתרגילי מפתח, או הוספת יום אימון חמישי. שווה להזמין בסוף החודש כמודל להשראה למתאמנים חדשים.`
  return `${m.name} על מסלול טוב. המשך במה שעובד. פגישה חודשית להערכת התקדמות תספיק.`
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
