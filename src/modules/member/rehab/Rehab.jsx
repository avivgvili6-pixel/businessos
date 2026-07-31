import React, { useState, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader, Modal, EmptyState, Input, Select, Tabs, ProgressBar } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { bodyAreas, assessmentQuestions, redFlags, protocols } from '../../../data/rehab'
import { rehabCuesFor } from '../../../data/rehabCues'

export function Rehab() {
  const { state } = useApp()
  const [tab, setTab] = useState(state.rehabPrograms.length ? 'active' : 'start')
  return (
    <>
      <Tabs tabs={[
        { key:'active',  label:`התכניות שלי${state.rehabPrograms.length ? ' (' + state.rehabPrograms.length + ')' : ''}` },
        { key:'start',   label:'התחל שיקום חדש' },
        { key:'library', label:'ספריית שיקום' },
      ]} active={tab} onChange={setTab} />

      {tab === 'active'  && <ActivePrograms />}
      {tab === 'start'   && <StartFlow onDone={() => setTab('active')} />}
      {tab === 'library' && <Library />}
    </>
  )
}

function ActivePrograms() {
  const { state, logRehabPain, logRehabSession, stopRehab } = useApp()
  const [painModal, setPainModal] = useState(null)
  const [painValue, setPainValue] = useState(3)
  const [painNote, setPainNote] = useState('')

  if (!state.rehabPrograms.length) {
    return <EmptyState icon="🩹" title="עדיין אין תכנית שיקום פעילה" subtitle="לחץ על ׳התחל שיקום חדש׳ כדי לבנות פרוטוקול מותאם לאזור פציעה או חולשה" />
  }

  return (
    <div style={{ display:'grid', gap: 20 }}>
      {state.rehabPrograms.map(p => {
        const area = bodyAreas.find(a => a.id === p.area)
        const protocol = protocols[p.area]
        const daysSinceStart = Math.floor((Date.now() - new Date(p.startedAt)) / (24*3600*1000))
        const currentWeek = Math.min(protocol?.duration || 4, Math.floor(daysSinceStart / 7) + 1)
        const painSeries = p.painLog.slice().reverse().map(l => l.pain)
        const painTrend = painSeries.length > 1 ? painSeries[painSeries.length - 1] - painSeries[0] : 0

        return (
          <Card key={p.id} style={{ padding: 0, overflow:'hidden' }}>
            <div style={{
              padding: 20, background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`,
              borderBottom: `1px solid ${t.color.border}`,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap: 16 }}>
                <div>
                  <div style={{ display:'flex', gap: 10, alignItems:'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 34 }}>{area?.icon}</span>
                    <div>
                      <h2 style={{ fontSize: t.font.xxl, fontWeight: 800 }}>{protocol?.title}</h2>
                      <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>שבוע {currentWeek} מתוך {protocol?.duration} · יום {daysSinceStart + 1}</div>
                    </div>
                  </div>
                  <ProgressBar value={currentWeek} max={protocol?.duration || 4} />
                </div>
                <div style={{ display:'flex', gap: 8 }}>
                  <Button size="sm" onClick={() => { setPainModal(p); setPainValue(p.painLog[0]?.pain || 3) }}>סמן רמת כאב</Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm('לסיים את התכנית?')) stopRehab(p.id) }}>סיים</Button>
                </div>
              </div>
            </div>

            <div style={{ padding: 20, display:'grid', gridTemplateColumns:'2fr 1fr', gap: 20 }} className="hfos-rehab-grid">
              <div>
                {protocol?.weeks.filter(w => w.week === currentWeek).map(week => (
                  <div key={week.week}>
                    <Badge color={t.color.gold}>שבוע {week.week}</Badge>
                    <div style={{ fontWeight: 700, fontSize: t.font.lg, marginTop: 8, marginBottom: 10 }}>{week.focus}</div>
                    <div style={{ display:'grid', gap: 6 }}>
                      {week.exercises.map((ex, i) => <RehabExerciseRow key={i} index={i} exercise={ex} />)}
                    </div>
                    <div style={{ marginTop: 14, display:'flex', gap: 8 }}>
                      <Button onClick={() => { logRehabSession(p.id, week.week); alert('אימון נרשם ✓') }}>סיימתי את האימון היום ✓</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gap: 14, alignContent:'start' }}>
                <Card style={{ padding: 14, background: t.color.bgSoft }}>
                  <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>מעקב כאב</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold }}>
                      {p.painLog[0]?.pain ?? '?'}<span style={{ fontSize: t.font.sm, color: t.color.textDim }}>/10</span>
                    </div>
                    {painTrend !== 0 && (
                      <Badge color={painTrend < 0 ? t.color.success : t.color.warning}>
                        {painTrend < 0 ? '↘' : '↗'} {Math.abs(painTrend)}
                      </Badge>
                    )}
                  </div>
                  {painSeries.length > 1 && <div style={{ marginTop: 10 }}><Sparkline data={painSeries} height={40} color={t.color.warning} /></div>}
                  <div style={{ fontSize: 10, color: t.color.textMuted, marginTop: 6 }}>{p.painLog.length} רישומים</div>
                </Card>

                <Card style={{ padding: 14, background: t.color.bgSoft }}>
                  <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>אימונים שהושלמו</div>
                  <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.success }}>{p.sessions.length}</div>
                </Card>

                <Card style={{ padding: 14, background: `${t.color.warning}15`, borderColor: t.color.warning }}>
                  <div style={{ fontSize: t.font.xs, color: t.color.warning, fontWeight: 700, marginBottom: 8 }}>⚠ דגלים אדומים</div>
                  <div style={{ display:'grid', gap: 4 }}>
                    {(redFlags[p.area] || redFlags.general).slice(0, 3).map((f, i) => (
                      <div key={i} style={{ fontSize: t.font.xs, color: t.color.text }}>• {f}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: t.color.textDim, marginTop: 8 }}>אם משהו מהרשימה - פנה לרופא</div>
                </Card>
              </div>
            </div>

            <div style={{ padding: 16, borderTop:`1px solid ${t.color.border}`, background: t.color.bgSoft }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6, fontWeight: 700 }}>עקרונות מנחים</div>
              <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                {protocol?.principles.map((pr, i) => <Badge key={i} color={t.color.textDim}>{pr}</Badge>)}
              </div>
            </div>
          </Card>
        )
      })}

      <Modal open={!!painModal} onClose={() => setPainModal(null)} title="רישום כאב" width={420}>
        <div style={{ display:'grid', gap: 16 }}>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <span>רמת כאב</span>
              <b style={{ color: painValue > 6 ? t.color.danger : painValue > 3 ? t.color.warning : t.color.success }}>{painValue}/10</b>
            </div>
            <input type="range" min={0} max={10} value={painValue} onChange={e => setPainValue(+e.target.value)} style={{ width:'100%' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize: 10, color: t.color.textMuted, marginTop: 2 }}>
              <span>אין כאב</span><span>קל</span><span>מטריד</span><span>חזק</span><span>אסון</span>
            </div>
          </div>
          <Input label="הערה (אופציונלי)" placeholder="מתי הרגשתי? מה עזר?" value={painNote} onChange={e => setPainNote(e.target.value)} />
          <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
            <Button variant="ghost" onClick={() => setPainModal(null)}>ביטול</Button>
            <Button onClick={() => { logRehabPain(painModal.id, painValue, painNote); setPainModal(null); setPainNote('') }}>שמור</Button>
          </div>
        </div>
      </Modal>

      <style>{`@media (max-width: 900px) { .hfos-rehab-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function StartFlow({ onDone }) {
  const { startRehab } = useApp()
  const [area, setArea] = useState(null)
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0) // 0 = pick area, 1 = assessment, 2 = summary

  const commit = () => {
    startRehab({
      id: 'rehab_' + Date.now(),
      area: area.id,
      startedAt: new Date().toISOString(),
      assessment: answers,
      painLog: answers.pain != null ? [{ date: new Date().toISOString(), pain: answers.pain, note: 'התחלת תכנית' }] : [],
      sessions: [],
    })
    onDone?.()
  }

  if (step === 0) return (
    <div>
      <SectionHeader title="בחר אזור לחיזוק / שיקום" subtitle="הפיזיו-AI ייבנה פרוטוקול 4-שבועות מותאם" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {bodyAreas.map(a => (
          <Card key={a.id} hover style={{ padding: 20, cursor:'pointer', textAlign:'center' }} onClick={() => { setArea(a); setStep(1) }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 6 }}>{a.name}</div>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.5 }}>
              {a.common.slice(0, 2).join(' · ')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  if (step === 1) return (
    <div>
      <div style={{ marginBottom: 20, display:'flex', gap: 10, alignItems:'center' }}>
        <Button variant="ghost" size="sm" onClick={() => setStep(0)}>← חזור</Button>
        <Badge color={t.color.gold}>{area.icon} {area.name}</Badge>
      </div>
      <Card>
        <SectionHeader title="הערכה קצרה" subtitle="שאלות שיעזרו לנו להתאים את התכנית" />
        <div style={{ display:'grid', gap: 20 }}>
          {assessmentQuestions.map(q => (
            <div key={q.id}>
              <div style={{ fontSize: t.font.sm, marginBottom: 8 }}>{q.q}</div>
              {q.type === 'slider' && (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: t.color.textMuted }}>{q.min}</span>
                    <b style={{ color: t.color.gold }}>{answers[q.id] ?? Math.round((q.min + q.max)/2)}</b>
                    <span style={{ fontSize: 10, color: t.color.textMuted }}>{q.max}</span>
                  </div>
                  <input type="range" min={q.min} max={q.max} value={answers[q.id] ?? Math.round((q.min + q.max)/2)}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: +e.target.value }))} style={{ width:'100%' }} />
                </>
              )}
              {q.type === 'select' && (
                <Select value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}>
                  <option value="">בחר...</option>
                  {q.options.map(o => <option key={o} value={o}>{o}</option>)}
                </Select>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign:'left' }}>
          <Button onClick={() => setStep(2)}>המשך לתצוגה מקדימה ←</Button>
        </div>
      </Card>
    </div>
  )

  // step 2 - summary + start
  const protocol = protocols[area.id]
  const flags = redFlags[area.id] || redFlags.general
  return (
    <div style={{ display:'grid', gap: 16 }}>
      <div style={{ display:'flex', gap: 10, alignItems:'center' }}>
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← חזור</Button>
      </div>

      {answers.pain >= 7 && (
        <Card style={{ padding: 16, background:`${t.color.danger}15`, borderColor: t.color.danger }}>
          <div style={{ fontWeight: 700, color: t.color.danger, marginBottom: 6 }}>⚠ כאב גבוה - שקול לפנות לרופא/פיזיותרפיסט לפני התחלת תכנית</div>
          <div style={{ fontSize: t.font.sm, color: t.color.text }}>סימנת כאב של {answers.pain}/10. אנחנו ממליצים לקבל אבחון מקצועי לפני עומס.</div>
        </Card>
      )}

      <Card>
        <SectionHeader title={protocol?.title} subtitle={`${protocol?.duration} שבועות · פרוטוקול מתקדם`} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10, marginBottom: 20 }} className="hfos-weeks">
          {protocol?.weeks.map(w => (
            <div key={w.week} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
              <div style={{ color: t.color.gold, fontWeight: 700, fontSize: t.font.sm, marginBottom: 6 }}>שבוע {w.week}</div>
              <div style={{ fontSize: t.font.xs, color: t.color.text, marginBottom: 8, minHeight: 30 }}>{w.focus}</div>
              <div style={{ fontSize: 10, color: t.color.textMuted }}>{w.exercises.length} תרגילים</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 14, background:`${t.color.warning}10`, borderRadius: t.radius.md, marginBottom: 14 }}>
          <div style={{ fontSize: t.font.xs, color: t.color.warning, fontWeight: 700, marginBottom: 6 }}>⚠ עצור והתייעץ עם רופא אם:</div>
          <div style={{ fontSize: t.font.sm, color: t.color.text, lineHeight: 1.7 }}>
            {flags.slice(0, 4).map((f, i) => <div key={i}>• {f}</div>)}
          </div>
        </div>

        <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
          <Button variant="ghost" onClick={() => setStep(1)}>שנה תשובות</Button>
          <Button onClick={commit}>התחל תכנית ✓</Button>
        </div>
      </Card>
      <style>{`@media (max-width: 700px) { .hfos-weeks { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}

function Library() {
  const [selected, setSelected] = useState(null)
  return (
    <div style={{ display:'grid', gap: 16 }}>
      <SectionHeader title="ספריית פרוטוקולים" subtitle="עיין בכל אזורי הגוף - בחר לצפייה מלאה" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {bodyAreas.map(a => {
          const p = protocols[a.id]
          return (
            <Card key={a.id} hover style={{ padding: 18, cursor:'pointer' }} onClick={() => setSelected(a)}>
              <div style={{ display:'flex', gap: 12, alignItems:'center', marginBottom: 10 }}>
                <span style={{ fontSize: 30 }}>{a.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{a.name}</div>
                  {p && <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{p.duration} שבועות</div>}
                </div>
              </div>
              <div style={{ display:'flex', gap: 4, flexWrap:'wrap' }}>
                {a.common.map(c => <Badge key={c} color={t.color.textDim}>{c}</Badge>)}
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.icon} ${selected.name}` : ''} width={720}>
        {selected && protocols[selected.id] && (
          <div style={{ display:'grid', gap: 14 }}>
            <div style={{ fontSize: t.font.lg, fontWeight: 700, color: t.color.gold }}>{protocols[selected.id].title}</div>
            {protocols[selected.id].weeks.map(w => (
              <div key={w.week} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
                <Badge color={t.color.gold}>שבוע {w.week}</Badge>
                <div style={{ fontWeight: 700, marginTop: 6, marginBottom: 8 }}>{w.focus}</div>
                <div style={{ display:'grid', gap: 4 }}>
                  {w.exercises.map((e, i) => <div key={i} style={{ fontSize: t.font.sm }}>{i+1}. {e}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

// Row for a single rehab exercise: number + name + expand for video/cues
function RehabExerciseRow({ index, exercise }) {
  const [open, setOpen] = useState(false)
  const cues = rehabCuesFor(exercise)
  const hasVideo = !!cues?.ytId

  return (
    <div style={{ background: t.color.bgSoft, borderRadius: t.radius.sm }}>
      <div style={{ display: 'flex', gap: 10, padding: 10, alignItems: 'center' }}>
        <div style={{ color: t.color.gold, fontWeight: 700, minWidth: 20 }}>{index + 1}.</div>
        <div style={{ flex: 1, fontSize: t.font.sm }}>{exercise}</div>
        {cues ? (
          <button onClick={() => setOpen(o => !o)} style={{
            background: hasVideo ? t.color.gold : 'transparent',
            color: hasVideo ? '#0d0d14' : t.color.gold,
            border: `1px solid ${t.color.gold}`,
            borderRadius: t.radius.pill, padding: '4px 12px',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>{hasVideo ? '▶ סרטון' : '💡 הסבר'}</button>
        ) : null}
      </div>
      {open && cues && (
        <div style={{ padding: '4px 12px 14px 12px', borderTop: `1px solid ${t.color.border}` }}>
          {hasVideo && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 6 }}>
                סרטון הסבר{cues.ytBy ? ` · ${cues.ytBy}` : ''}
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: t.radius.sm, overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${cues.ytId}?rel=0`}
                  title={exercise}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </div>
          )}
          {cues.cues && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: t.font.xs, fontWeight: 700, color: t.color.gold, marginBottom: 4 }}>📋 דגשים</div>
              <ul style={{ margin: 0, paddingRight: 16, fontSize: t.font.xs, lineHeight: 1.6, color: t.color.text }}>
                {cues.cues.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {cues.warn && (
            <div>
              <div style={{ fontSize: t.font.xs, fontWeight: 700, color: t.color.warning, marginBottom: 4 }}>⚠️ שים לב</div>
              <ul style={{ margin: 0, paddingRight: 16, fontSize: t.font.xs, lineHeight: 1.6, color: t.color.text }}>
                {cues.warn.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
