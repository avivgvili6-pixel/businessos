import React, { useState, useEffect } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button, Badge, SectionHeader, EmptyState, Input, Modal } from '../../../components/ui/UI'
import { useAuth } from '../../../auth/AuthContext'
import { storage } from '../../../utils/storage'

// Admin-only screen for handling coach signup requests + managing invites.
//
// Coach requests are stored per-device (no backend yet). Two flows:
// A) A coach fills the request form on THIS device → admin sees it here
// B) A coach elsewhere asks the admin verbally → admin uses "הזמן מאמן"
// to generate an invite URL (with ?coach=email) and shares it. Coach
// opens that URL once → their browser is whitelisted and they can log
// in as a coach immediately.

export function CoachRequests() {
 const { inviteCoach, revokeCoach, listCoaches } = useAuth()
 const [requests, setRequests] = useState(() => storage.get('coach-requests') || [])
 const [coaches, setCoaches] = useState(() => listCoaches())
 const [inviteOpen, setInviteOpen] = useState(false)
 const [inviteEmail, setInviteEmail] = useState('')
 const [inviteName, setInviteName] = useState('')
 const [linkOpen, setLinkOpen] = useState(null)

 const refresh = () => {
 setRequests(storage.get('coach-requests') || [])
 setCoaches(listCoaches())
 }

 useEffect(() => {
 const handler = () => refresh()
 window.addEventListener('storage', handler)
 return () => window.removeEventListener('storage', handler)
 }, [])

 const pending = requests.filter(r => r.status === 'pending')
 const handled = requests.filter(r => r.status !== 'pending')

 const approve = (req) => {
 inviteCoach(req.email)
 const updated = requests.map(r => r.email === req.email ? { ...r, status:'approved', approvedAt: new Date().toISOString() } : r)
 storage.set('coach-requests', updated)
 refresh()
 setLinkOpen(buildInviteLink(req.email))
 }

 const reject = (req) => {
 if (!confirm(`לדחות את הבקשה של ${req.name}?`)) return
 const updated = requests.map(r => r.email === req.email ? { ...r, status:'rejected'} : r)
 storage.set('coach-requests', updated)
 refresh()
 }

 const submitDirect = () => {
 const email = inviteEmail.trim().toLowerCase()
 if (!email.includes('@')) return
 inviteCoach(email)
 // Also add to requests as approved so it shows in history
 const existing = storage.get('coach-requests') || []
 if (!existing.find(r => r.email === email)) {
 storage.set('coach-requests', [{
 email, name: inviteName || email.split('@')[0], specialty:'הוזמן ישירות',
 requestedAt: new Date().toISOString(), status:'approved', approvedAt: new Date().toISOString(),
 }, ...existing])
 }
 setInviteEmail(''); setInviteName(''); setInviteOpen(false)
 refresh()
 setLinkOpen(buildInviteLink(email))
 }

 return (
 <div style={{ display:'grid', gap: 20 }}>
 <Card style={{ background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
 <Badge> בקשות מאמנים והזמנות</Badge>
 <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>ניהול גישות של מאמנים</h2>
 <div style={{ color: t.color.textDim, marginTop: 6, fontSize: t.font.sm, lineHeight: 1.6 }}>
 שני מסלולים - מאמן ממלא בקשה במסך הכניסה, או שאתה מזמין ישירות בקישור אישי.
 </div>
 <div style={{ marginTop: 16, display:'flex', gap: 10, flexWrap:'wrap'}}>
 <Button icon="+"onClick={() => setInviteOpen(true)}>הזמן מאמן חדש</Button>
 </div>
 </Card>

 {/* Pending requests */}
 <Card>
 <SectionHeader
 title={`בקשות ממתינות (${pending.length})`}
 subtitle="מאמנים שנרשמו במסך הכניסה וממתינים לאישורך"
 />
 {pending.length === 0 ? (
 <EmptyState icon="" title="אין בקשות ממתינות"subtitle="ברגע שמאמן ימלא בקשה במסך הכניסה - הבקשה תופיע כאן"/>
 ) : (
 <div style={{ display:'grid', gap: 10 }}>
 {pending.map((req, i) => (
 <Card key={i} style={{ padding: 16, background: t.color.bgSoft }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12, flexWrap:'wrap'}}>
 <div style={{ flex: 1, minWidth: 220 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 4 }}>{req.name}</div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>{req.email}</div>
 <div style={{ display:'grid', gap: 4, fontSize: t.font.sm }}>
 <div> <b>התמחות:</b> {req.specialty}</div>
 {req.experience && <div>⏱ <b>ניסיון:</b> {req.experience} שנים</div>}
 {req.phone && <div> <b>טלפון:</b> {req.phone}</div>}
 <div style={{ color: t.color.textDim, fontSize: t.font.xs, marginTop: 4 }}>
 נשלח: {new Date(req.requestedAt).toLocaleString('he-IL')}
 </div>
 </div>
 </div>
 <div style={{ display:'flex', gap: 8 }}>
 <Button variant="ghost"size="sm"onClick={() => reject(req)}>דחה</Button>
 <Button size="sm"onClick={() => approve(req)}>אשר </Button>
 </div>
 </div>
 </Card>
 ))}
 </div>
 )}
 </Card>

 {/* Approved coaches */}
 <Card>
 <SectionHeader title={`מאמנים מאושרים (${coaches.length})`} />
 {coaches.length === 0 ? (
 <div style={{ padding: 20, textAlign:'center', color: t.color.textDim, fontSize: t.font.sm }}>
 עדיין לא אישרת מאמנים
 </div>
 ) : (
 <div style={{ display:'grid', gap: 8 }}>
 {coaches.map((email, i) => {
 const req = requests.find(r => r.email === email)
 return (
 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
 <div>
 <div style={{ fontWeight: 600 }}>{req?.name || email.split('@')[0]}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{email}{req?.specialty ? ` · ${req.specialty}` :''}</div>
 </div>
 <div style={{ display:'flex', gap: 8 }}>
 <Button variant="ghost"size="sm"onClick={() => setLinkOpen(buildInviteLink(email))}>שתף קישור</Button>
 <Button variant="danger"size="sm"onClick={() => { if (confirm(`לבטל גישה של ${email}?`)) { revokeCoach(email); refresh() } }}>הסר</Button>
 </div>
 </div>
 )
 })}
 </div>
 )}
 </Card>

 {/* History */}
 {handled.length > 0 && (
 <Card>
 <SectionHeader title="היסטוריית בקשות"/>
 <div style={{ display:'grid', gap: 6 }}>
 {handled.map((r, i) => (
 <div key={i} style={{ display:'flex', justifyContent:'space-between', padding: 8, fontSize: t.font.sm, color: t.color.textDim }}>
 <span>{r.name} · {r.email}</span>
 <Badge color={r.status === 'approved'? t.color.success : t.color.danger}>{r.status === 'approved'? 'מאושר':'נדחה'}</Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Invite direct modal */}
 <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="הזמן מאמן חדש"width={460}>
 <div style={{ display:'grid', gap: 12 }}>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
 הזן את המייל של המאמן - נייצר קישור אישי שהוא יפתח פעם אחת ואז יוכל להיכנס כמאמן.
 </div>
 <Input label="שם המאמן (אופציונלי)"value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="עידן דהן"/>
 <Input label="מייל"type="email"value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="coach@example.com"autoFocus />
 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end'}}>
 <Button variant="ghost"onClick={() => setInviteOpen(false)}>בטל</Button>
 <Button onClick={submitDirect} disabled={!inviteEmail.includes('@')}>צור קישור</Button>
 </div>
 </div>
 </Modal>

 {/* Show generated link modal */}
 <Modal open={!!linkOpen} onClose={() => setLinkOpen(null)} title="קישור הזמנה"width={520}>
 {linkOpen && (
 <div style={{ display:'grid', gap: 12 }}>
 <div style={{ color: t.color.text, fontSize: t.font.sm, lineHeight: 1.6 }}>
 שלח את הקישור למאמן. כשהוא יפתח אותו - הוא יוכל להיכנס עם המייל שלו כמאמן.
 </div>
 <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontFamily:'Space Mono, monospace', fontSize: t.font.xs, wordBreak:'break-all', border: `1px solid ${t.color.gold}` }}>
 {linkOpen}
 </div>
 <div style={{ display:'flex', gap: 10 }}>
 <Button onClick={() => { navigator.clipboard?.writeText(linkOpen); alert('הקישור הועתק') }} style={{ flex: 1 }}> העתק קישור</Button>
 <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('היי, הוזמנת להצטרף כמאמן ב-Holistic Fitness OS:'+ linkOpen)}`,'_blank')} style={{ flex: 1 }}> WhatsApp</Button>
 </div>
 </div>
 )}
 </Modal>
 </div>
 )
}

function buildInviteLink(email) {
 const base = window.location.origin + window.location.pathname
 return `${base}?coach=${encodeURIComponent(email)}`
}
