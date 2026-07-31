import React, { useState, useRef, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs, Modal, EmptyState } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { bmi } from '../../../utils/calc'

const BODY_METRICS = [
  { key:'weight',  label:'משקל',       unit:'ק״ג', color:'#c8a84b' },
  { key:'bodyFat', label:'אחוז שומן',  unit:'%',   color:'#e0a05a' },
  { key:'waist',   label:'מותניים',    unit:'ס״מ', color:'#5a9be0' },
  { key:'chest',   label:'חזה',        unit:'ס״מ', color:'#a878e0' },
  { key:'hips',    label:'ירכיים',     unit:'ס״מ', color:'#5ac889' },
  { key:'arms',    label:'זרוע',       unit:'ס״מ', color:'#e05a5a' },
  { key:'thighs',  label:'ירך',        unit:'ס״מ', color:'#e0a05a' },
]

export function Progress() {
  const [tab, setTab] = useState('overview')
  return (
    <>
      <Tabs tabs={[
        { key:'overview', label:'סקירה' },
        { key:'measure',  label:'מדידות גוף' },
        { key:'photos',   label:'תמונות התקדמות' },
        { key:'prs',      label:'שיאים אישיים' },
      ]} active={tab} onChange={setTab} />
      {tab === 'overview' && <Overview />}
      {tab === 'measure'  && <Measurements />}
      {tab === 'photos'   && <ProgressPhotos />}
      {tab === 'prs'      && <PRs />}
    </>
  )
}

function Overview() {
  const { state } = useApp()
  const latest = state.measurements[0]
  const first = state.measurements[state.measurements.length - 1]
  const _bmi = latest?.weight ? bmi(latest.weight, state.profile.heightCm) : null

  const trends = BODY_METRICS.map(m => {
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
            <Badge>📈 Progress</Badge>
            <h1 style={{ fontSize: t.font.xxxl, fontWeight: 800, marginTop: 10 }}>
              {daysTracking > 0 ? `${daysTracking} ימי מסע` : 'התחל את המסע'}
            </h1>
            <div style={{ color: t.color.textDim, marginTop: 6 }}>
              {state.measurements.length} מדידות · {state.progressPhotos.length} תמונות · {state.personalRecords.length} שיאים
            </div>
          </div>
          {latest && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, auto)', gap: 20 }}>
              <MiniBig label="משקל" value={latest.weight} unit="ק״ג" />
              {latest.bodyFat && <MiniBig label="שומן" value={latest.bodyFat} unit="%" />}
              {_bmi && <MiniBig label="BMI" value={_bmi} unit="" />}
            </div>
          )}
        </div>
      </Card>

      {!trends.length && (
        <EmptyState icon="📏" title="עדיין אין מדידות" subtitle="עבור לטאב ״מדידות גוף״ והוסף מדידה ראשונה - נעקוב אחרי כל שינוי" />
      )}

      {!!trends.length && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {trends.map(m => (
            <Card key={m.key} style={{ padding: 18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: t.font.sm, color: t.color.textDim }}>{m.label}</span>
                {m.change !== 0 && (
                  <Badge color={m.change < 0 ? t.color.success : t.color.warning}>
                    {m.change > 0 ? '+' : ''}{m.change}{m.unit}
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: m.color, marginBottom: 8 }}>
                {m.latest}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}> {m.unit}</span>
              </div>
              <Sparkline data={m.values} height={40} color={m.color} />
              <div style={{ fontSize: 10, color: t.color.textMuted, marginTop: 4 }}>{m.values.length} מדידות</div>
            </Card>
          ))}
        </div>
      )}

      {state.personalRecords.length > 0 && (
        <Card>
          <SectionHeader title="שיאים אחרונים" />
          <div style={{ display:'grid', gap: 8 }}>
            {state.personalRecords.slice(0, 5).map(pr => (
              <div key={pr.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                <div>
                  <div style={{ fontWeight: 700 }}>🏆 {pr.exercise}</div>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(pr.date).toLocaleDateString('he-IL')}</div>
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.gold }}>{pr.weight} ק״ג × {pr.reps}</div>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
                    e1RM: {Math.round(pr.weight * (1 + pr.reps/30))} ק״ג
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
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{label}</div>
      <div style={{ fontSize: t.font.xxxl, fontWeight: 800, color: t.color.gold, lineHeight: 1 }}>{value}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}> {unit}</span></div>
    </div>
  )
}

function Measurements() {
  const { state, addMeasurement, removeMeasurement } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), weight:'', bodyFat:'', waist:'', chest:'', hips:'', arms:'', thighs:'', note:'' })
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  const save = () => {
    const m = { date: form.date + 'T08:00:00', note: form.note }
    for (const k of ['weight','bodyFat','waist','chest','hips','arms','thighs']) {
      if (form[k]) m[k] = +form[k]
    }
    addMeasurement(m)
    setForm({ date: new Date().toISOString().slice(0,10), weight:'', bodyFat:'', waist:'', chest:'', hips:'', arms:'', thighs:'', note:'' })
    setOpen(false)
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <SectionHeader title="מדידות גוף" subtitle={`${state.measurements.length} מדידות שמורות`} action={<Button onClick={() => setOpen(true)}>+ מדידה חדשה</Button>} />

      {!state.measurements.length ? (
        <EmptyState icon="📏" title="עדיין אין מדידות" subtitle="הוסף מדידה ראשונה - נחשב אוטומטית שינויים לאורך זמן" />
      ) : (
        <Card style={{ padding: 0, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
                {['תאריך','משקל','שומן %','מותניים','חזה','ירכיים','זרוע','ירך',''].map(h => (
                  <th key={h} style={{ textAlign:'right', padding: 12, fontSize: t.font.xs, color: t.color.textDim }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.measurements.map((m, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${t.color.border}` }}>
                  <td style={{ padding: 12, fontSize: t.font.sm }}>{new Date(m.date).toLocaleDateString('he-IL')}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: t.color.gold }}>{m.weight || '—'}</td>
                  <td style={{ padding: 12 }}>{m.bodyFat || '—'}</td>
                  <td style={{ padding: 12 }}>{m.waist || '—'}</td>
                  <td style={{ padding: 12 }}>{m.chest || '—'}</td>
                  <td style={{ padding: 12 }}>{m.hips || '—'}</td>
                  <td style={{ padding: 12 }}>{m.arms || '—'}</td>
                  <td style={{ padding: 12 }}>{m.thighs || '—'}</td>
                  <td style={{ padding: 12 }}><Button variant="ghost" size="sm" onClick={() => removeMeasurement(i)}>✕</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="מדידה חדשה" width={620}>
        <div style={{ display:'grid', gap: 12 }}>
          <Input type="date" label="תאריך" value={form.date} onChange={e => set({ date: e.target.value })} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <Input type="number" label="משקל (ק״ג)" value={form.weight} onChange={e => set({ weight: e.target.value })} />
            <Input type="number" label="אחוז שומן (%)" value={form.bodyFat} onChange={e => set({ bodyFat: e.target.value })} />
          </div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>היקפים (ס״מ):</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 10 }}>
            <Input type="number" label="מותניים" value={form.waist} onChange={e => set({ waist: e.target.value })} />
            <Input type="number" label="חזה" value={form.chest} onChange={e => set({ chest: e.target.value })} />
            <Input type="number" label="ירכיים" value={form.hips} onChange={e => set({ hips: e.target.value })} />
            <Input type="number" label="זרוע" value={form.arms} onChange={e => set({ arms: e.target.value })} />
            <Input type="number" label="ירך" value={form.thighs} onChange={e => set({ thighs: e.target.value })} />
          </div>
          <Input label="הערה" value={form.note} onChange={e => set({ note: e.target.value })} />
          <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>בטל</Button>
            <Button onClick={save}>שמור</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProgressPhotos() {
  const { state, addProgressPhoto, removeProgressPhoto } = useApp()
  const [angle, setAngle] = useState('front')
  const [compareOpen, setCompareOpen] = useState(false)
  const fileRef = useRef(null)

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      addProgressPhoto({
        id: 'photo_' + Date.now(),
        date: new Date().toISOString(),
        dataUrl: reader.result,
        angle,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = '' // reset
  }

  const byAngle = { front: [], side: [], back: [] }
  for (const p of state.progressPhotos) (byAngle[p.angle] ||= []).push(p)

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader
          title="תמונות התקדמות"
          subtitle={`${state.progressPhotos.length} תמונות · ההעלאה נשמרת מקומית במכשיר בלבד`}
          action={
            <div style={{ display:'flex', gap: 8 }}>
              {state.progressPhotos.length >= 2 && <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)}>השווה</Button>}
              <Button size="sm" onClick={() => fileRef.current?.click()}>📷 העלה תמונה</Button>
            </div>
          }
        />
        <div style={{ display:'flex', gap: 8, marginBottom: 12 }}>
          {[{k:'front',l:'חזית'},{k:'side',l:'צד'},{k:'back',l:'גב'}].map(a => (
            <button key={a.k} onClick={() => setAngle(a.k)} style={{
              padding:'6px 14px', background: angle === a.k ? t.color.gold : t.color.bgSoft,
              color: angle === a.k ? '#0d0d14' : t.color.text,
              border:`1px solid ${angle === a.k ? t.color.gold : t.color.border}`,
              borderRadius: t.radius.pill, cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm, fontWeight: 600,
            }}>{a.l}</button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display:'none' }} />

        {byAngle[angle].length === 0 ? (
          <EmptyState icon="📷" title="עדיין אין תמונות בזווית זו" subtitle="ההמלצה: תמונה בכל שבוע, אותה תאורה, אותו בגד - כדי לראות שינויים אמיתיים" />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {byAngle[angle].map(p => (
              <div key={p.id} style={{ position:'relative', borderRadius: t.radius.md, overflow:'hidden' }}>
                <img src={p.dataUrl} alt="" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover' }} />
                <div style={{
                  position:'absolute', bottom: 0, left: 0, right: 0, padding: 6,
                  background:'linear-gradient(transparent, rgba(0,0,0,.85))', color: '#fff', fontSize: t.font.xs,
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                  <span>{new Date(p.date).toLocaleDateString('he-IL')}</span>
                  <button onClick={() => removeProgressPhoto(p.id)} style={{ background:'rgba(0,0,0,.5)', color:'#fff', border:'none', borderRadius: 4, padding:'2px 6px', cursor:'pointer' }}>✕</button>
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
  const [leftIdx, setLeftIdx] = useState(photos.length - 1)
  const [rightIdx, setRightIdx] = useState(0)
  React.useEffect(() => { if (open) { setLeftIdx(photos.length - 1); setRightIdx(0) } }, [open, photos.length])
  if (!open || photos.length < 2) return null
  return (
    <Modal open={open} onClose={onClose} title="השוואת תמונות" width={720}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
        {[{i:leftIdx, set:setLeftIdx, label:'לפני'}, {i:rightIdx, set:setRightIdx, label:'אחרי'}].map((side, j) => (
          <div key={j}>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6, textAlign:'center' }}>
              {side.label} · {new Date(photos[side.i]?.date).toLocaleDateString('he-IL')}
            </div>
            <img src={photos[side.i]?.dataUrl} alt="" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius: t.radius.md }} />
            <input type="range" min="0" max={photos.length - 1} value={side.i} onChange={e => side.set(+e.target.value)} style={{ width:'100%', marginTop: 8 }} />
          </div>
        ))}
      </div>
    </Modal>
  )
}

function PRs() {
  const { state, addPR, removePR } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ exercise:'', weight:'', reps:'', note:'' })
  const set = (patch) => setForm(f => ({ ...f, ...patch }))

  const save = () => {
    if (!form.exercise || !form.weight) return
    addPR({
      id: 'pr_' + Date.now(),
      exercise: form.exercise,
      weight: +form.weight,
      reps: +form.reps || 1,
      date: new Date().toISOString(),
      note: form.note,
    })
    setForm({ exercise:'', weight:'', reps:'', note:'' })
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
      <SectionHeader title="שיאים אישיים" subtitle={`${state.personalRecords.length} שיאים ב-${byExercise.length} תרגילים`} action={<Button onClick={() => setOpen(true)}>+ שיא חדש</Button>} />

      {!byExercise.length ? (
        <EmptyState icon="🏆" title="עדיין אין שיאים רשומים" subtitle="רשום את השיאים שלך - נחשב e1RM אוטומטית ונעקוב אחר פרוגרסיה" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {byExercise.map(g => (
            <Card key={g.name} style={{ padding: 18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: t.font.lg }}>🏆 {g.name}</div>
                <Badge color={t.color.gold}>e1RM: {Math.round(g.best.weight * (1 + g.best.reps/30))}</Badge>
              </div>
              <div style={{ marginBottom: 10, padding: 10, background: t.color.goldGlow, borderRadius: t.radius.sm, border:`1px solid ${t.color.gold}` }}>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 4 }}>שיא נוכחי</div>
                <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold }}>
                  {g.best.weight} ק״ג × {g.best.reps}
                </div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(g.best.date).toLocaleDateString('he-IL')}</div>
              </div>
              {g.prs.length > 1 && (
                <>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6 }}>היסטוריה ({g.prs.length})</div>
                  <Sparkline data={g.prs.slice().reverse().map(p => p.weight * (1 + p.reps/30))} height={30} />
                </>
              )}
              <div style={{ marginTop: 8, display:'grid', gap: 4 }}>
                {g.prs.slice(0, 3).map(pr => (
                  <div key={pr.id} style={{ display:'flex', justifyContent:'space-between', fontSize: t.font.xs, padding:'4px 0' }}>
                    <span style={{ color: t.color.textDim }}>{new Date(pr.date).toLocaleDateString('he-IL')}</span>
                    <span>{pr.weight}×{pr.reps}</span>
                    <button onClick={() => removePR(pr.id)} style={{ background:'none', border:'none', color: t.color.textMuted, cursor:'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="שיא חדש 🏆" width={480}>
        <div style={{ display:'grid', gap: 12 }}>
          <Input label="תרגיל" placeholder="לדוגמה: סקוואט אחורי" value={form.exercise} onChange={e => set({ exercise: e.target.value })} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            <Input type="number" label="משקל (ק״ג)" value={form.weight} onChange={e => set({ weight: e.target.value })} />
            <Input type="number" label="חזרות" value={form.reps} onChange={e => set({ reps: e.target.value })} />
          </div>
          <Input label="הערה (אופציונלי)" value={form.note} onChange={e => set({ note: e.target.value })} />
          {form.weight && form.reps && (
            <div style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, textAlign:'center' }}>
              e1RM מוערך: <b style={{ color: t.color.gold }}>{Math.round(form.weight * (1 + form.reps/30))} ק״ג</b>
            </div>
          )}
          <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>בטל</Button>
            <Button onClick={save} disabled={!form.exercise || !form.weight}>שמור שיא</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
