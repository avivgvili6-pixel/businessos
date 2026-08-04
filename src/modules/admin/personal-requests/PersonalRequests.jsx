import React, { useState, useEffect } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader, EmptyState } from '../../../components/ui/UI'
import { SLoader } from '../../../components/ui/SLoader'
import { listTrainingRequests, updateTrainingRequestStatus } from '../../../services/supabaseSync'
import { supabaseEnabled } from '../../../lib/supabase'

const STATUS_META = {
 new: { label:'חדשה', color:'#c8a84b', icon:'' },
 contacted: { label:'יצרתי קשר', color:'#5aa0ff', icon:'' },
 scheduled: { label:'תואם אימון', color:'#3fbf5c', icon:'' },
 declined: { label:'נדחה', color:'#ff6666', icon:'' },
}

export function PersonalRequests() {
 const { state, updateTrainingRequest } = useApp()
 const [statusFilter, setStatusFilter] = useState('all')
 const [expanded, setExpanded] = useState(null)
 const [cloudRequests, setCloudRequests] = useState(null)
 const [loading, setLoading] = useState(supabaseEnabled)

 // Fetch cloud requests (real submissions from other devices)
 useEffect(() => {
 if (!supabaseEnabled) return
 let mounted = true
 listTrainingRequests().then(rows => {
 if (!mounted) return
 setCloudRequests(rows)
 setLoading(false)
 })
 return () => { mounted = false }
 }, [])

 // Merge cloud + local, dedup by id (cloud wins)
 const local = state.personalTrainingRequests || []
 const cloud = cloudRequests || []
 const seenIds = new Set(cloud.map(r => r.id))
 const requests = [...cloud, ...local.filter(r => !seenIds.has(r.id))]

 const setStatus = async (id, patch) => {
 updateTrainingRequest(id, patch) // local update
 if (supabaseEnabled) {
 await updateTrainingRequestStatus(id, patch)
 // Refresh cloud copy
 const rows = await listTrainingRequests()
 setCloudRequests(rows)
 }
 }
 const filtered = statusFilter === 'all'? requests : requests.filter(r => (r.status || 'new') === statusFilter)

 const counts = {
 all: requests.length,
 new: requests.filter(r => (r.status || 'new') === 'new').length,
 contacted: requests.filter(r => r.status === 'contacted').length,
 scheduled: requests.filter(r => r.status === 'scheduled').length,
 }

 if (loading) {
 return (
 <Card style={{ padding: 40 }}>
 <SLoader size={96} label="טוען בקשות מהענן" />
 </Card>
 )
 }

 if (!requests.length) {
 return (
 <EmptyState
 icon=""
 title="עדיין אין בקשות אימון אישי"
 subtitle="כשמתאמן ימלא את הטופס בעמוד 'אימון אישי'הבקשה תופיע כאן"
 />
 )
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ padding: 20, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)` }}>
 <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 8 }}>
 <span style={{ fontSize: 28 }}> </span>
 <h1 style={{ fontSize: t.font.xxl, fontWeight: 800 }}>בקשות אימון אישי</h1>
 </div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
 {counts.new} חדשות · {counts.contacted} בטיפול · {counts.scheduled} תואמו
 </div>
 </Card>

 {/* Filters */}
 <div style={{ display:'flex', gap: 8, overflowX:'auto', paddingBottom: 4 }}>
 {[
 { v:'all', label: `הכל (${counts.all})` },
 { v:'new', label: ` חדשות (${counts.new})` },
 { v:'contacted', label: ` בטיפול (${counts.contacted})` },
 { v:'scheduled', label: ` תואמו (${counts.scheduled})` },
 ].map(f => (
 <button key={f.v} onClick={() => setStatusFilter(f.v)} style={{
 padding:'8px 14px', borderRadius: 999,
 background: statusFilter === f.v ? t.color.gold : t.color.bgSoft,
 color: statusFilter === f.v ? '#0d0d14': t.color.text,
 border: `1px solid ${statusFilter === f.v ? t.color.gold : t.color.border}`,
 cursor:'pointer', fontFamily:'inherit', fontWeight: 700, fontSize: t.font.sm,
 whiteSpace:'nowrap',
 }}>{f.label}</button>
 ))}
 </div>

 {/* Requests list */}
 <div style={{ display:'grid', gap: 12 }}>
 {filtered.map(r => {
 const meta = STATUS_META[r.status || 'new']
 const isOpen = expanded === r.id
 return (
 <Card key={r.id} style={{ padding: 18 }}>
 {/* Summary row */}
 <div style={{ display:'flex', gap: 12, alignItems:'flex-start', flexWrap:'wrap'}}>
 <div style={{ flex: 1, minWidth: 200 }}>
 <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 6, flexWrap:'wrap'}}>
 <span style={{ fontWeight: 800, fontSize: t.font.lg }}>{r.name}</span>
 <Badge color={meta.color}>{meta.icon} {meta.label}</Badge>
 </div>
 <div style={{ display:'flex', gap: 12, fontSize: t.font.sm, color: t.color.textDim, flexWrap:'wrap'}}>
 <span> {r.phone}</span>
 <span> {r.email}</span>
 {r.age && <span>גיל {r.age}</span>}
 </div>
 <div style={{ marginTop: 6, fontSize: t.font.xs, color: t.color.textMuted }}>
 התקבל: {new Date(r.submittedAt).toLocaleString('he-IL')}
 </div>
 </div>
 <Button variant="ghost"size="sm"onClick={() => setExpanded(isOpen ? null : r.id)}>
 {isOpen ? 'סגור פרטים':'הצג פרטים'}
 </Button>
 </div>

 {/* Goals preview */}
 <div style={{ marginTop: 10, display:'flex', gap: 6, flexWrap:'wrap'}}>
 {(r.goals || []).map(g => <Badge key={g}>{g}</Badge>)}
 </div>

 {/* Expanded detail */}
 {isOpen && (
 <div style={{ marginTop: 16, padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md, display:'grid', gap: 12 }}>
 <Field label="רמת ניסיון"value={r.level} />
 <Field label="פורמט מבוקש"value={r.format} />
 <Field label="תדירות"value={r.frequency} />
 <Field label="זמנים מועדפים"value={(r.timePref || []).join(',')} />
 <Field label="פעילות נוכחית"value={r.currentActivity || '—'} />
 <Field label="פציעות/מגבלות"value={r.injuries || 'אין'} />
 <Field label="למה עכשיו"value={r.whyNow} big />
 {r.notes && <Field label="הערות"value={r.notes} big />}
 </div>
 )}

 {/* Actions */}
 <div style={{ marginTop: 14, display:'flex', gap: 8, flexWrap:'wrap'}}>
 <Button
 variant="outline"
 size="sm"
 icon=""
 onClick={() => { window.location.href = `tel:${r.phone.replace(/[^\d+]/g,'')}` }}
 >חייג</Button>
 <Button
 variant="outline"
 size="sm"
 icon=""
 onClick={() => { window.location.href = `mailto:${r.email}?subject=${encodeURIComponent('בקשת האימון האישי שלך')}` }}
 >שלח מייל</Button>
 <Button
 variant="outline"
 size="sm"
 icon=""
 onClick={() => window.open(`https://wa.me/${r.phone.replace(/[^\d+]/g,'')}`,'_blank')}
 >WhatsApp</Button>
 <div style={{ flex: 1 }} />
 {(r.status || 'new') === 'new'&& (
 <Button size="sm"onClick={() => setStatus(r.id, { status:'contacted'})}>סמן כטופל</Button>
 )}
 {r.status === 'contacted'&& (
 <Button size="sm"onClick={() => setStatus(r.id, { status:'scheduled'})}>תיאמתי אימון </Button>
 )}
 {r.status !== 'declined'&& (
 <Button variant="ghost"size="sm" onClick={() => {
 if (confirm('לסמן את הבקשה כדחויה?')) setStatus(r.id, { status:'declined'})
 }}>דחה</Button>
 )}
 </div>
 </Card>
 )
 })}
 </div>
 </div>
 )
}

function Field({ label, value, big }) {
 return (
 <div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 4, fontWeight: 700 }}>{label}</div>
 <div style={{ fontSize: t.font.sm, lineHeight: big ? 1.6 : 1.4, whiteSpace: big ? 'pre-wrap':'normal' }}>{value}</div>
 </div>
 )
}
