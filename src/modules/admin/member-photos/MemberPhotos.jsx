import React, { useState, useEffect } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Badge, SectionHeader, EmptyState, Button } from '../../../components/ui/UI'
import { SLoader } from '../../../components/ui/SLoader'
import { listProgressPhotos, signedPhotoUrl } from '../../../services/supabaseSync'
import { supabaseEnabled } from '../../../lib/supabase'

// Admin view of member progress photos. Currently shows only the current
// device's photos (localStorage limitation) - real cross-user sync
// requires the Supabase backend (planned).

const ANGLES = ['front','side','back']
const ANGLE_LABEL = { front:'חזית', side:'צד', back:'גב'}

export function MemberPhotos() {
 const { state } = useApp()
 const [cloudPhotos, setCloudPhotos] = useState([])
 const [loading, setLoading] = useState(supabaseEnabled)
 const [comparing, setComparing] = useState(null)

 // Load photos from cloud (RLS filters: admin sees all, member sees own)
 useEffect(() => {
 if (!supabaseEnabled) return
 let mounted = true
 ;(async () => {
 const rows = await listProgressPhotos()
 // Resolve signed URLs for each
 const withUrls = await Promise.all((rows || []).map(async r => ({
 id: r.id,
 date: r.date,
 angle: r.angle,
 note: r.note,
 userId: r.user_id,
 dataUrl: await signedPhotoUrl(r.storage_path),
 })))
 if (mounted) { setCloudPhotos(withUrls); setLoading(false) }
 })()
 return () => { mounted = false }
 }, [])

 const localPhotos = state.progressPhotos || []
 const photos = supabaseEnabled ? cloudPhotos : localPhotos

 if (loading) {
 return (
 <Card style={{ padding: 40 }}>
 <SLoader size={96} label="טוען תמונות מהענן" />
 </Card>
 )
 }

 if (!photos.length) {
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ padding: 40, textAlign:'center'}}>
 <div style={{ fontSize: 56, marginBottom: 12 }}> </div>
 <h2 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 10 }}>אין עדיין תמונות התקדמות</h2>
 <p style={{ color: t.color.textDim, maxWidth: 500, margin:'0 auto', lineHeight: 1.6 }}>
 כשמתאמנים יעלו תמונות דרך "התקדמות → תמונות"— תוכל לצפות בהן כאן.
 </p>
 </Card>
 {supabaseEnabled ? (
 <Card style={{ padding: 16, background: `${t.color.info}12`, border: `1px solid ${t.color.info}` }}>
 <div style={{ display:'flex', gap: 10, alignItems:'flex-start'}}>
 <span style={{ fontSize: 24 }}> </span>
 <div style={{ flex: 1, fontSize: t.font.sm, color: t.color.text, lineHeight: 1.6 }}>
 <b style={{ color: t.color.info }}>מסונכרן לענן:</b> ברגע שמתאמן יעלה תמונה — היא תופיע כאן אוטומטית מכל מכשיר.
 </div>
 </div>
 </Card>
 ) : (
 <Card style={{ padding: 16, background: `${t.color.warning}12`, border: `1px solid ${t.color.warning}` }}>
 <div style={{ display:'flex', gap: 10, alignItems:'flex-start'}}>
 <span style={{ fontSize: 24 }}> </span>
 <div style={{ flex: 1, fontSize: t.font.sm, color: t.color.text, lineHeight: 1.6 }}>
 <b style={{ color: t.color.warning }}>מקומי בלבד:</b> Supabase לא מחובר. תמונות נשמרות ב-localStorage של המכשיר.
 </div>
 </div>
 </Card>
 )}
 </div>
 )
 }

 const byAngle = { front: [], side: [], back: [] }
 photos.forEach(p => (byAngle[p.angle] || (byAngle[p.angle] = [])).push(p))
 Object.keys(byAngle).forEach(k => byAngle[k].sort((a, b) => new Date(b.date) - new Date(a.date)))

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card style={{ padding: 20, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)` }}>
 <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 6 }}>
 <span style={{ fontSize: 28 }}> </span>
 <h1 style={{ fontSize: t.font.xxl, fontWeight: 800 }}>תמונות התקדמות</h1>
 </div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
 {photos.length} תמונות · חזית: {byAngle.front.length} · צד: {byAngle.side.length} · גב: {byAngle.back.length}
 </div>
 </Card>

 {ANGLES.map(angle => {
 const list = byAngle[angle] || []
 if (!list.length) return null
 const first = list[list.length - 1]
 const last = list[0]
 const canCompare = list.length >= 2

 return (
 <Card key={angle} style={{ padding: 20 }}>
 <SectionHeader
 title={`${ANGLE_LABEL[angle]} (${list.length} תמונות)`}
 action={canCompare && (
 <Button size="sm"onClick={() => setComparing({ angle, first, last })}>
 השווה before/now
 </Button>
 )}
 />
 <div style={{
 display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap: 10,
 marginTop: 14,
 }}>
 {list.map(p => (
 <div key={p.id} style={{
 position:'relative', paddingTop:'133%',
 background: t.color.bgSoft, borderRadius: t.radius.md, overflow:'hidden',
 border: `1px solid ${t.color.border}`,
 }}>
 <img src={p.dataUrl} alt=""style={{
 position:'absolute', inset: 0, width:'100%', height:'100%', objectFit:'cover',
 }} />
 <div style={{
 position:'absolute', bottom: 0, left: 0, right: 0,
 background:'linear-gradient(180deg, transparent, rgba(0,0,0,.8))',
 padding:'20px 8px 6px', color:'#fff', fontSize: t.font.xs, textAlign:'center',
 }}>
 {new Date(p.date).toLocaleDateString('he-IL')}
 </div>
 </div>
 ))}
 </div>
 </Card>
 )
 })}

 {comparing && (
 <div onClick={() => setComparing(null)} style={{
 position:'fixed', inset: 0, background:'rgba(0,0,0,.9)', zIndex: 1000,
 display:'grid', placeItems:'center', padding: 20,
 }}>
 <div onClick={e => e.stopPropagation()} style={{
 maxWidth: 700, width:'100%', direction:'rtl',
 background: t.color.bgElevated, borderRadius: t.radius.lg, padding: 20,
 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
 <div style={{ fontWeight: 800, fontSize: t.font.lg }}>השוואה — {ANGLE_LABEL[comparing.angle]}</div>
 <button onClick={() => setComparing(null)} style={{
 background: t.color.bgSoft, border:'none', color: t.color.text,
 width: 34, height: 34, borderRadius:'50%', cursor:'pointer', fontSize: 16,
 }}> </button>
 </div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
 {[comparing.first, comparing.last].map((p, i) => (
 <div key={i}>
 <div style={{ textAlign:'center', marginBottom: 6, color: t.color.gold, fontWeight: 700 }}>
 {i === 0 ? 'BEFORE':'NOW'}
 </div>
 <div style={{ paddingTop:'133%', position:'relative', background: t.color.bgSoft, borderRadius: t.radius.md, overflow:'hidden'}}>
 <img src={p.dataUrl} alt="" style={{
 position:'absolute', inset: 0, width:'100%', height:'100%', objectFit:'cover',
 }} />
 </div>
 <div style={{ textAlign:'center', marginTop: 6, color: t.color.textDim, fontSize: t.font.xs }}>
 {new Date(p.date).toLocaleDateString('he-IL')}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
