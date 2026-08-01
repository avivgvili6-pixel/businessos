import React, { useState, useRef, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { useAuth } from '../../../auth/AuthContext'
import { uploadProgressPhoto } from '../../../services/supabaseSync'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs, Modal, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { bmi } from '../../../utils/calc'
import { useI18n } from '../../../i18n/i18n'

const bodyMetrics = (isRTL) => [
 { key:'weight', label: isRTL ? 'משקל' : 'Weight', unit: isRTL ? 'ק״ג' : 'kg', color:'#c8a84b'},
 { key:'bodyFat', label: isRTL ? 'אחוז שומן' : 'Body fat', unit:'%', color:'#e0a05a'},
 { key:'waist', label: isRTL ? 'מותניים' : 'Waist', unit: isRTL ? 'ס״מ' : 'cm', color:'#5a9be0'},
 { key:'chest', label: isRTL ? 'חזה' : 'Chest', unit: isRTL ? 'ס״מ' : 'cm', color:'#a878e0'},
 { key:'hips', label: isRTL ? 'ירכיים' : 'Hips', unit: isRTL ? 'ס״מ' : 'cm', color:'#5ac889'},
 { key:'arms', label: isRTL ? 'זרוע' : 'Arms', unit: isRTL ? 'ס״מ' : 'cm', color:'#e05a5a'},
 { key:'thighs', label: isRTL ? 'ירך' : 'Thighs', unit: isRTL ? 'ס״מ' : 'cm', color:'#e0a05a'},
]

export function Progress() {
 const { isRTL } = useI18n()
 const [tab, setTab] = useState('overview')
 return (
 <>
 <Tabs tabs={[
 { key:'overview', label: isRTL ? 'סקירה' : 'Overview'},
 { key:'measure', label: isRTL ? 'מדידות גוף' : 'Body measurements'},
 { key:'photos', label: isRTL ? 'תמונות התקדמות' : 'Progress photos'},
 { key:'prs', label: isRTL ? 'שיאים אישיים' : 'Personal records'},
 ]} active={tab} onChange={setTab} />
 {tab === 'overview'&& <Overview />}
 {tab === 'measure'&& <Measurements />}
 {tab === 'photos'&& <ProgressPhotos />}
 {tab === 'prs'&& <PRs />}
 </>
 )
}

function Overview() {
 const { state } = useApp()
 const { isRTL } = useI18n()
 const latest = state.measurements[0]
 const first = state.measurements[state.measurements.length - 1]
 const _bmi = latest?.weight ? bmi(latest.weight, state.profile.heightCm) : null

 const trends = bodyMetrics(isRTL).map(m => {
 const values = state.measurements.map(x => x[m.key]).filter(v => v != null && !isNaN(v)).reverse()
 if (!values.length) return null
 const change = values.length > 1 ? +(values[values.length - 1] - values[0]).toFixed(1) : 0
 return { ...m, values, latest: values[values.length - 1], change }
 }).filter(Boolean)

 const daysTracking = first ? Math.floor((Date.now() - new Date(first.date)) / (24*3600*1000)) : 0

 return (
 <div style={{ display:'grid', gap: 20 }}>
 <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 28 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 20 }}>
 <div>
 <Badge> Progress</Badge>
 <h1 style={{ fontSize: t.font.xxxl, fontWeight: 800, marginTop: 10 }}>
 {daysTracking > 0 ? (isRTL ? `${daysTracking} ימי מסע` : `${daysTracking} days on the journey`) : (isRTL ? 'התחל את המסע' : 'Start the journey')}
 </h1>
 <div style={{ color: t.color.textDim, marginTop: 6 }}>
 {state.measurements.length} {isRTL ? 'מדידות' : 'measurements'} · {state.progressPhotos.length} {isRTL ? 'תמונות' : 'photos'} · {state.personalRecords.length} {isRTL ? 'שיאים' : 'PRs'}
 </div>
 </div>
 {latest && (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(3, auto)', gap: 20 }}>
 <MiniBig label={isRTL ? 'משקל' : 'Weight'} value={latest.weight} unit={isRTL ? 'ק״ג' : 'kg'} />
 {latest.bodyFat && <MiniBig label={isRTL ? 'שומן' : 'Fat'} value={latest.bodyFat} unit="%" />}
 {_bmi && <MiniBig label="BMI" value={_bmi} unit="" />}
 </div>
 )}
 </div>
 </Card>

 {!trends.length && (
 <EmptyState icon=" "title={isRTL ? 'עדיין אין מדידות' : 'No measurements yet'} subtitle={isRTL ? 'עבור לטאב ״מדידות גוף״ והוסף מדידה ראשונה - נעקוב אחרי כל שינוי' : 'Go to the "Body measurements" tab and add your first entry — we\'ll track every change'} />
 )}

 {!!trends.length && (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
 {trends.map(m => (
 <Card key={m.key} style={{ padding: 18 }}>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
 <span style={{ fontSize: t.font.sm, color: t.color.textDim }}>{m.label}</span>
 {m.change !== 0 && (
 <Badge color={m.change < 0 ? t.color.success : t.color.warning}>
 {m.change > 0 ? '+':''}{m.change}{m.unit}
 </Badge>
 )}
 </div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: m.color, marginBottom: 8 }}>
 {m.latest}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}> {m.unit}</span>
 </div>
 <Sparkline data={m.values} height={40} color={m.color} />
 <div style={{ fontSize: 10, color: t.color.textMuted, marginTop: 4 }}>{m.values.length} {isRTL ? 'מדידות' : 'entries'}</div>
 </Card>
 ))}
 </div>
 )}

 {state.personalRecords.length > 0 && (
 <Card>
 <SectionHeader title={isRTL ? 'שיאים אחרונים' : 'Recent PRs'} />
 <div style={{ display:'grid', gap: 8 }}>
 {state.personalRecords.slice(0, 5).map(pr => (
 <div key={pr.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
 <div>
 <div style={{ fontWeight: 700 }}> {pr.exercise}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(pr.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</div>
 </div>
 <div style={{ textAlign:'left'}}>
 <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.gold }}>{pr.weight} {isRTL ? 'ק״ג' : 'kg'} × {pr.reps}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
 e1RM: {Math.round(pr.weight * (1 + pr.reps/30))} {isRTL ? 'ק״ג' : 'kg'}
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 )
}

function MiniBig({ label, value, unit }) {
 return (
 <div style={{ textAlign:'center'}}>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{label}</div>
 <div style={{ fontSize: t.font.xxxl, fontWeight: 800, color: t.color.gold, lineHeight: 1 }}>{value}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}> {unit}</span></div>
 </div>
 )
}

function Measurements() {
 const { state, addMeasurement, removeMeasurement } = useApp()
 const { isRTL } = useI18n()
 const [open, setOpen] = useState(false)
 const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), weight:'', bodyFat:'', waist:'', chest:'', hips:'', arms:'', thighs:'', note:''})
 const set = (patch) => setForm(f => ({ ...f, ...patch }))

 const save = () => {
 const m = { date: form.date + 'T08:00:00', note: form.note }
 for (const k of ['weight','bodyFat','waist','chest','hips','arms','thighs']) {
 if (form[k]) m[k] = +form[k]
 }
 addMeasurement(m)
 setForm({ date: new Date().toISOString().slice(0,10), weight:'', bodyFat:'', waist:'', chest:'', hips:'', arms:'', thighs:'', note:''})
 setOpen(false)
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title={isRTL ? 'מדידות גוף' : 'Body measurements'} subtitle={`${state.measurements.length} ${isRTL ? 'מדידות שמורות' : 'saved entries'}`} action={<Button onClick={() => setOpen(true)}>+ {isRTL ? 'מדידה חדשה' : 'New measurement'}</Button>} />

 {!state.measurements.length ? (
 <EmptyState icon=" "title={isRTL ? 'עדיין אין מדידות' : 'No measurements yet'} subtitle={isRTL ? 'הוסף מדידה ראשונה - נחשב אוטומטית שינויים לאורך זמן' : 'Add your first entry — we\'ll calculate changes over time automatically'} />
 ) : (
 <Card style={{ padding: 0, overflow:'auto'}}>
 <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 700 }}>
 <thead>
 <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
 {(isRTL ? ['תאריך','משקל','שומן %','מותניים','חזה','ירכיים','זרוע','ירך',''] : ['Date','Weight','Fat %','Waist','Chest','Hips','Arms','Thighs','']).map(h => (
 <th key={h} style={{ textAlign:'right', padding: 12, fontSize: t.font.xs, color: t.color.textDim }}>{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {state.measurements.map((m, i) => (
 <tr key={i} style={{ borderBottom:`1px solid ${t.color.border}` }}>
 <td style={{ padding: 12, fontSize: t.font.sm }}>{new Date(m.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</td>
 <td style={{ padding: 12, fontWeight: 700, color: t.color.gold }}>{m.weight || '—'}</td>
 <td style={{ padding: 12 }}>{m.bodyFat || '—'}</td>
 <td style={{ padding: 12 }}>{m.waist || '—'}</td>
 <td style={{ padding: 12 }}>{m.chest || '—'}</td>
 <td style={{ padding: 12 }}>{m.hips || '—'}</td>
 <td style={{ padding: 12 }}>{m.arms || '—'}</td>
 <td style={{ padding: 12 }}>{m.thighs || '—'}</td>
 <td style={{ padding: 12 }}><Button variant="ghost"size="sm"onClick={() => removeMeasurement(i)}> </Button></td>
 </tr>
 ))}
 </tbody>
 </table>
 </Card>
 )}

 <Modal open={open} onClose={() => setOpen(false)} title={isRTL ? 'מדידה חדשה' : 'New measurement'} width={620}>
 <div style={{ display:'grid', gap: 12 }}>
 <Input type="date" label={isRTL ? 'תאריך' : 'Date'} value={form.date} onChange={e => set({ date: e.target.value })} />
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
 <Input type="number" label={isRTL ? 'משקל (ק״ג)' : 'Weight (kg)'} value={form.weight} onChange={e => set({ weight: e.target.value })} />
 <Input type="number" label={isRTL ? 'אחוז שומן (%)' : 'Body fat (%)'} value={form.bodyFat} onChange={e => set({ bodyFat: e.target.value })} />
 </div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>{isRTL ? 'היקפים (ס״מ):' : 'Circumferences (cm):'}</div>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10 }}>
 <Input type="number" label={isRTL ? 'מותניים' : 'Waist'} value={form.waist} onChange={e => set({ waist: e.target.value })} />
 <Input type="number" label={isRTL ? 'חזה' : 'Chest'} value={form.chest} onChange={e => set({ chest: e.target.value })} />
 <Input type="number" label={isRTL ? 'ירכיים' : 'Hips'} value={form.hips} onChange={e => set({ hips: e.target.value })} />
 <Input type="number" label={isRTL ? 'זרוע' : 'Arms'} value={form.arms} onChange={e => set({ arms: e.target.value })} />
 <Input type="number" label={isRTL ? 'ירך' : 'Thighs'} value={form.thighs} onChange={e => set({ thighs: e.target.value })} />
 </div>
 <Input label={isRTL ? 'הערה' : 'Note'} value={form.note} onChange={e => set({ note: e.target.value })} />
 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end'}}>
 <Button variant="ghost"onClick={() => setOpen(false)}>{isRTL ? 'בטל' : 'Cancel'}</Button>
 <Button onClick={save}>{isRTL ? 'שמור' : 'Save'}</Button>
 </div>
 </div>
 </Modal>
 </div>
 )
}

function ProgressPhotos() {
 const { state, addProgressPhoto, removeProgressPhoto } = useApp()
 const { user } = useAuth()
 const { isRTL } = useI18n()
 const [angle, setAngle] = useState('front')
 const [compareOpen, setCompareOpen] = useState(false)
 const fileRef = useRef(null)

 const onFile = (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 const reader = new FileReader()
 reader.onload = async () => {
 addProgressPhoto({
 id:'photo_'+ Date.now(),
 date: new Date().toISOString(),
 dataUrl: reader.result,
 angle,
 })
 // Fire-and-forget cloud upload (localStorage copy already saved above)
 try { await uploadProgressPhoto({ userId: user?.id, file, angle }) } catch (_) {}
 }
 reader.readAsDataURL(file)
 e.target.value = ''// reset
 }

 const byAngle = { front: [], side: [], back: [] }
 for (const p of state.progressPhotos) (byAngle[p.angle] ||= []).push(p)

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader
 title={isRTL ? 'תמונות התקדמות' : 'Progress photos'}
 subtitle={`${state.progressPhotos.length} ${isRTL ? 'תמונות · ההעלאה נשמרת מקומית במכשיר בלבד' : 'photos · uploads saved locally on device only'}`}
 action={
 <div style={{ display:'flex', gap: 8 }}>
 {state.progressPhotos.length >= 2 && <Button variant="outline"size="sm"onClick={() => setCompareOpen(true)}>{isRTL ? 'השווה' : 'Compare'}</Button>}
 <Button size="sm"onClick={() => fileRef.current?.click()}> {isRTL ? 'העלה תמונה' : 'Upload photo'}</Button>
 </div>
 }
 />
 <div style={{ display:'flex', gap: 8, marginBottom: 12 }}>
 {[{k:'front',l: isRTL ? 'חזית' : 'Front'},{k:'side',l: isRTL ? 'צד' : 'Side'},{k:'back',l: isRTL ? 'גב' : 'Back'}].map(a => (
 <button key={a.k} onClick={() => setAngle(a.k)} style={{
 padding:'6px 14px', background: angle === a.k ? t.color.gold : t.color.bgSoft,
 color: angle === a.k ? '#0d0d14': t.color.text,
 border:`1px solid ${angle === a.k ? t.color.gold : t.color.border}`,
 borderRadius: t.radius.pill, cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm, fontWeight: 600,
 }}>{a.l}</button>
 ))}
 </div>
 <input ref={fileRef} type="file"accept="image/*"capture="environment"onChange={onFile} style={{ display:'none'}} />

 {byAngle[angle].length === 0 ? (
 <EmptyState icon=" "title={isRTL ? 'עדיין אין תמונות בזווית זו' : 'No photos from this angle yet'} subtitle={isRTL ? 'ההמלצה: תמונה בכל שבוע, אותה תאורה, אותו בגד - כדי לראות שינויים אמיתיים' : 'Tip: one photo per week, same lighting, same outfit — so you can spot real changes'} />
 ) : (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
 {byAngle[angle].map(p => (
 <div key={p.id} style={{ position:'relative', borderRadius: t.radius.md, overflow:'hidden'}}>
 <img src={p.dataUrl} alt=""style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover'}} />
 <div style={{
 position:'absolute', bottom: 0, left: 0, right: 0, padding: 6,
 background:'linear-gradient(transparent, rgba(0,0,0,.85))', color:'#fff', fontSize: t.font.xs,
 display:'flex', justifyContent:'space-between', alignItems:'center',
 }}>
 <span>{new Date(p.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</span>
 <button onClick={() => removeProgressPhoto(p.id)} style={{ background:'rgba(0,0,0,.5)', color:'#fff', border:'none', borderRadius: 4, padding:'2px 6px', cursor:'pointer'}}> </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>

 <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} photos={byAngle[angle]} />
 </div>
 )
}

function CompareModal({ open, onClose, photos }) {
 const { isRTL } = useI18n()
 const [leftIdx, setLeftIdx] = useState(photos.length - 1)
 const [rightIdx, setRightIdx] = useState(0)
 React.useEffect(() => { if (open) { setLeftIdx(photos.length - 1); setRightIdx(0) } }, [open, photos.length])
 if (!open || photos.length < 2) return null
 return (
 <Modal open={open} onClose={onClose} title={isRTL ? 'השוואת תמונות' : 'Compare photos'} width={720}>
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
 {[{i:leftIdx, set:setLeftIdx, label: isRTL ? 'לפני' : 'Before'}, {i:rightIdx, set:setRightIdx, label: isRTL ? 'אחרי' : 'After'}].map((side, j) => (
 <div key={j}>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6, textAlign:'center'}}>
 {side.label} · {new Date(photos[side.i]?.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
 </div>
 <img src={photos[side.i]?.dataUrl} alt=""style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius: t.radius.md }} />
 <input type="range"min="0"max={photos.length - 1} value={side.i} onChange={e => side.set(+e.target.value)} style={{ width:'100%', marginTop: 8 }} />
 </div>
 ))}
 </div>
 </Modal>
 )
}

function PRs() {
 const { state, addPR, removePR } = useApp()
 const { isRTL } = useI18n()
 const [open, setOpen] = useState(false)
 const [form, setForm] = useState({ exercise:'', weight:'', reps:'', note:''})
 const set = (patch) => setForm(f => ({ ...f, ...patch }))

 const save = () => {
 if (!form.exercise || !form.weight) return
 addPR({
 id:'pr_'+ Date.now(),
 exercise: form.exercise,
 weight: +form.weight,
 reps: +form.reps || 1,
 date: new Date().toISOString(),
 note: form.note,
 })
 setForm({ exercise:'', weight:'', reps:'', note:''})
 setOpen(false)
 }

 // group by exercise, show best
 const byExercise = useMemo(() => {
 const map = {}
 for (const pr of state.personalRecords) {
 if (!map[pr.exercise]) map[pr.exercise] = []
 map[pr.exercise].push(pr)
 }
 return Object.entries(map).map(([name, prs]) => ({
 name,
 prs: prs.sort((a,b) => new Date(b.date) - new Date(a.date)),
 best: prs.reduce((max, p) => (p.weight * (1 + p.reps/30)) > (max.weight * (1 + max.reps/30)) ? p : max),
 }))
 }, [state.personalRecords])

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <SectionHeader title={isRTL ? 'שיאים אישיים' : 'Personal records'} subtitle={isRTL ? `${state.personalRecords.length} שיאים ב-${byExercise.length} תרגילים` : `${state.personalRecords.length} PRs across ${byExercise.length} exercises`} action={<Button onClick={() => setOpen(true)}>+ {isRTL ? 'שיא חדש' : 'New PR'}</Button>} />

 {!byExercise.length ? (
 <EmptyState icon=" "title={isRTL ? 'עדיין אין שיאים רשומים' : 'No PRs logged yet'} subtitle={isRTL ? 'רשום את השיאים שלך - נחשב e1RM אוטומטית ונעקוב אחר פרוגרסיה' : 'Log your PRs — we\'ll calculate e1RM automatically and track progression'} />
 ) : (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
 {byExercise.map(g => (
 <Card key={g.name} style={{ padding: 18 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.lg }}> {g.name}</div>
 <Badge color={t.color.gold}>e1RM: {Math.round(g.best.weight * (1 + g.best.reps/30))}</Badge>
 </div>
 <div style={{ marginBottom: 10, padding: 10, background: t.color.goldGlow, borderRadius: t.radius.sm, border:`1px solid ${t.color.gold}` }}>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 4 }}>{isRTL ? 'שיא נוכחי' : 'Current PR'}</div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold }}>
 {g.best.weight} {isRTL ? 'ק״ג' : 'kg'} × {g.best.reps}
 </div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(g.best.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</div>
 </div>
 {g.prs.length > 1 && (
 <>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6 }}>{isRTL ? 'היסטוריה' : 'History'} ({g.prs.length})</div>
 <Sparkline data={g.prs.slice().reverse().map(p => p.weight * (1 + p.reps/30))} height={30} />
 </>
 )}
 <div style={{ marginTop: 8, display:'grid', gap: 4 }}>
 {g.prs.slice(0, 3).map(pr => (
 <div key={pr.id} style={{ display:'flex', justifyContent:'space-between', fontSize: t.font.xs, padding:'4px 0'}}>
 <span style={{ color: t.color.textDim }}>{new Date(pr.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</span>
 <span>{pr.weight}×{pr.reps}</span>
 <button onClick={() => removePR(pr.id)} style={{ background:'none', border:'none', color: t.color.textMuted, cursor:'pointer'}}> </button>
 </div>
 ))}
 </div>
 </Card>
 ))}
 </div>
 )}

 <Modal open={open} onClose={() => setOpen(false)} title={isRTL ? 'שיא חדש ' : 'New PR'} width={480}>
 <div style={{ display:'grid', gap: 12 }}>
 <Input label={isRTL ? 'תרגיל' : 'Exercise'} placeholder={isRTL ? 'לדוגמה: סקוואט אחורי' : 'Example: back squat'} value={form.exercise} onChange={e => set({ exercise: e.target.value })} />
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
 <Input type="number" label={isRTL ? 'משקל (ק״ג)' : 'Weight (kg)'} value={form.weight} onChange={e => set({ weight: e.target.value })} />
 <Input type="number" label={isRTL ? 'חזרות' : 'Reps'} value={form.reps} onChange={e => set({ reps: e.target.value })} />
 </div>
 <Input label={isRTL ? 'הערה (אופציונלי)' : 'Note (optional)'} value={form.note} onChange={e => set({ note: e.target.value })} />
 {form.weight && form.reps && (
 <div style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, textAlign:'center'}}>
 {isRTL ? 'e1RM מוערך' : 'Estimated e1RM'}: <b style={{ color: t.color.gold }}>{Math.round(form.weight * (1 + form.reps/30))} {isRTL ? 'ק״ג' : 'kg'}</b>
 </div>
 )}
 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
 <Button variant="ghost" onClick={() => setOpen(false)}>{isRTL ? 'בטל' : 'Cancel'}</Button>
 <Button onClick={save} disabled={!form.exercise || !form.weight}>{isRTL ? 'שמור שיא' : 'Save PR'}</Button>
 </div>
 </div>
 </Modal>
 </div>
 )
}
