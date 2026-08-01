import React, { useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Badge, Button, SectionHeader, EmptyState, Tabs } from '../../../components/ui/UI'
import { runEngine, severityColor, moduleLabel } from '../../../engine/adaptationEngine'

const SEV_LABEL = { high:'דחוף', medium:'להיום', low:'מגמה'}

export function Insights({ go }) {
 const { state } = useApp()
 const [filter, setFilter] = React.useState('all')
 const insights = useMemo(() => runEngine(state), [state])

 const counts = {
 all: insights.length,
 high: insights.filter(i => i.severity === 'high').length,
 medium: insights.filter(i => i.severity === 'medium').length,
 low: insights.filter(i => i.severity === 'low').length,
 }

 const shown = filter === 'all'? insights : insights.filter(i => i.severity === filter)

 return (
 <div style={{ display:'grid', gap: 20 }}>
 <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 28, position:'relative', overflow:'hidden'}}>
 <div style={{ position:'absolute', top: -30, left: -30, width: 160, height: 160, background: t.color.goldGlow, borderRadius:'50%', filter:'blur(40px)'}} />
 <Badge> Adaptation Engine</Badge>
 <div style={{ marginTop: 12 }}>
 <h1 style={{ fontSize: t.font.xxxl, fontWeight: 800, marginBottom: 6 }}>
 {insights.length ? `${insights.length} תובנות חיות` :'הכל תקין כרגע'}
 </h1>
 <div style={{ color: t.color.textDim, fontSize: t.font.md }}>
 המנוע קורא את כל הנתונים שלך - שינה, אימונים, תזונה, מצב-רוח, בדיקות דם - ומזהה מה חשוב לפעולה עכשיו.
 </div>
 </div>
 </Card>

 <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12 }} className="hfos-grid-4">
 <CounterCard label="הכל"count={counts.all} color={t.color.gold} active={filter==='all'} onClick={() => setFilter('all')} />
 <CounterCard label="דחוף"count={counts.high} color={t.color.danger} active={filter==='high'} onClick={() => setFilter('high')} />
 <CounterCard label="להיום"count={counts.medium} color={t.color.warning} active={filter==='medium'} onClick={() => setFilter('medium')} />
 <CounterCard label="מגמה"count={counts.low} color={t.color.info} active={filter==='low'} onClick={() => setFilter('low')} />
 </div>

 {!shown.length ? (
 <EmptyState icon=" "title="אין תובנות בקטגוריה זו"subtitle="המשיך את השגרה - הכל עובד"/>
 ) : (
 <div style={{ display:'grid', gap: 12 }}>
 {shown.map(ins => <InsightCard key={ins.id} insight={ins} go={go} />)}
 </div>
 )}

 <Card style={{ padding: 20 }}>
 <SectionHeader title="איך המנוע חושב?"/>
 <div style={{ display:'grid', gap: 10, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.7 }}>
 <div> <b style={{ color: t.color.text }}>שינה × ביצועים:</b> שינה מתחת ל-6 שעות → הפחתת נפח 20-30% + פוקוס על טכניקה</div>
 <div> <b style={{ color: t.color.text }}>מצב-רוח × תזונה:</b> ירידה במצב-רוח + ויטמין D/B12 נמוך → תעדוף תזונתי-מנטלי משולב</div>
 <div> <b style={{ color: t.color.text }}>אימונים × התאוששות:</b> 6+ אימונים + שינה נמוכה → סימני over-training</div>
 <div> <b style={{ color: t.color.text }}>הרגלים × מומנטום:</b> streaks + עקביות → הזדמנות לפרוגרסיה מכוונת</div>
 <div style={{ marginTop: 10, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.xs }}>
 הגרסה הנוכחית: מנוע חוקים. הגרסה הבאה תוסיף שכבת LLM (Claude) לתובנות מותאמות-אישית עמוקות יותר.
 </div>
 </div>
 </Card>
 <style>{`@media (max-width: 900px) { .hfos-grid-4 { grid-template-columns: 1fr 1fr !important; } }`}</style>
 </div>
 )
}

function CounterCard({ label, count, color, active, onClick }) {
 return (
 <button onClick={onClick} style={{
 padding: 18, background: active ? t.color.goldGlow : t.color.bgCard,
 border: `1px solid ${active ? t.color.gold : t.color.border}`,
 borderRadius: t.radius.lg, cursor:'pointer', textAlign:'right',
 fontFamily:'inherit', transition: t.transition,
 }}>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color }}>{count}</div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginTop: 4 }}>{label}</div>
 </button>
 )
}

function InsightCard({ insight, go }) {
 const sev = severityColor(insight.severity)
 return (
 <Card style={{ padding: 20, borderRight: `4px solid ${sev}` }} hover>
 <div style={{ display:'flex', gap: 16, alignItems:'flex-start'}}>
 <div style={{
 width: 52, height: 52, borderRadius: 14,
 background: `${sev}22`, display:'flex', alignItems:'center', justifyContent:'center',
 fontSize: 26, flexShrink: 0,
 }}>{insight.icon}</div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 8, flexWrap:'wrap' }}>
 <Badge color={sev}>{SEV_LABEL[insight.severity]}</Badge>
 <Badge color={t.color.textDim}>{moduleLabel(insight.module)}</Badge>
 </div>
 <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 6 }}>{insight.title}</div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.6, marginBottom: 14 }}>{insight.body}</div>
 {insight.action && (
 <Button size="sm" onClick={() => go?.(insight.action.target)}>
 {insight.action.label} ←
 </Button>
 )}
 </div>
 </div>
 </Card>
 )
}
