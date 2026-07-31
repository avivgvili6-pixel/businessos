import React, { useState, useRef } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Badge, SectionHeader, EmptyState, Modal } from '../../../components/ui/UI'
import { extractTextFromPDF, parseWorkoutText, parseExerciseLine } from '../../../utils/pdfParser'

export function PdfImporter() {
  const { setPlan } = useApp()
  const fileRef = useRef(null)
  const [mode, setMode] = useState('upload') // upload | paste
  const [status, setStatus] = useState(null) // null | loading | parsed | error
  const [rawText, setRawText] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [sessions, setSessions] = useState([])
  const [planName, setPlanName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error'); setErrorMsg('רק קבצי PDF נתמכים כרגע')
      return
    }
    setStatus('loading'); setErrorMsg('')
    try {
      const text = await extractTextFromPDF(file)
      const parsed = parseWorkoutText(text)
      setRawText(text)
      setSessions(parsed)
      setPlanName(file.name.replace(/\.pdf$/i, ''))
      setStatus(parsed.length ? 'parsed' : 'empty')
    } catch (err) {
      setStatus('error')
      setErrorMsg('לא ניתן לקרוא את הקובץ. ודא שזה PDF תקין ולא סרוק כתמונה.')
    }
    e.target.value = ''
  }

  const handlePasteText = () => {
    if (!pastedText.trim()) return
    setStatus('loading'); setErrorMsg('')
    try {
      const parsed = parseWorkoutText(pastedText)
      setRawText(pastedText)
      setSessions(parsed)
      setPlanName('תכנית מיובאת')
      setStatus(parsed.length ? 'parsed' : 'empty')
    } catch (err) {
      setStatus('error'); setErrorMsg('שגיאה בפרסור')
    }
  }

  const adopt = () => {
    const plan = {
      name: planName || 'תכנית מיובאת',
      imported: true,
      split: sessions.length + ' אימונים',
      days: sessions.length,
      weeks: 4,
      currentWeek: 1,
      sessions: sessions.map(s => ({
        name: s.name,
        exercises: s.exercises.map(e => ({
          id: e.name, name: e.name, sets: e.sets || 3, reps: e.reps || 8,
          intensity: e.intensity, suggestedWeight: e.weight,
        })),
      })),
      createdAt: new Date().toISOString(),
    }
    setPlan(plan)
    alert(`התכנית "${planName}" אומצה. עבור לטאב "התכנית שלי"`)
    // reset
    setSessions([]); setRawText(''); setPastedText(''); setStatus(null); setPlanName('')
  }

  const reset = () => {
    setSessions([]); setRawText(''); setStatus(null); setPastedText(''); setErrorMsg('')
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
        <Badge>📄 ייבוא תכנית</Badge>
        <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>העלה תכנית שיש לך</h2>
        <div style={{ color: t.color.textDim, marginTop: 6 }}>
          יש לך PDF של תכנית אימון ממאמן? העלה את הקובץ - נזהה תרגילים, סטים, חזרות, ואחוזים אוטומטית.
        </div>
      </Card>

      {status !== 'parsed' && (
        <>
          <div style={{ display:'flex', gap: 6, background: t.color.bgSoft, padding: 4, borderRadius: t.radius.md }}>
            <ModeChip active={mode === 'upload'} onClick={() => setMode('upload')}>📎 קובץ PDF</ModeChip>
            <ModeChip active={mode === 'paste'}  onClick={() => setMode('paste')}>📝 הדבק טקסט</ModeChip>
          </div>

          {mode === 'upload' && (
            <Card style={{ padding: 40, textAlign:'center' }}>
              <div style={{
                border:`2px dashed ${t.color.border}`, borderRadius: t.radius.lg,
                padding: 40, cursor:'pointer', transition: t.transition,
              }}
                onClick={() => fileRef.current?.click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.color.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.color.border}>
                <div style={{ fontSize: 64, marginBottom: 16, opacity: .6 }}>📄</div>
                <div style={{ fontSize: t.font.lg, fontWeight: 700, marginBottom: 6 }}>לחץ להעלאת PDF</div>
                <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>עד 10MB · תמיכה בעברית ובאנגלית</div>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display:'none' }} />
              </div>
              {status === 'loading' && (
                <div style={{ marginTop: 20, color: t.color.gold, fontWeight: 600 }}>קורא את הקובץ...</div>
              )}
              {status === 'error' && (
                <div style={{ marginTop: 20, padding: 12, background:`${t.color.danger}15`, borderRadius: t.radius.sm, color: t.color.danger }}>
                  ⚠ {errorMsg}
                </div>
              )}
              {status === 'empty' && (
                <div style={{ marginTop: 20, padding: 12, background:`${t.color.warning}15`, borderRadius: t.radius.sm, color: t.color.warning, fontSize: t.font.sm }}>
                  ⚠ לא זוהו תרגילים בקובץ. אולי הוא סרוק כתמונה או שהפורמט לא מוכר. נסה להעתיק את הטקסט ידנית ולהדביק בלשונית "הדבק טקסט".
                </div>
              )}
            </Card>
          )}

          {mode === 'paste' && (
            <Card>
              <SectionHeader
                title="הדבק תכנית טקסט"
                subtitle='דוגמאות למה שהמנתח מזהה: "סקוואט 5×5 @ 75%" · "יום א׳" · "3 sets of 10 pushups"'
              />
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder={`יום א' - דחיפה\nלחיצת חזה 5x5 @ 80%\nלחיצת כתפיים 4x8\nמקבילים 3x10\nפייס פול 3x15\n\nיום ב' - משיכה\n...`}
                style={{
                  width:'100%', minHeight: 240, padding: 14, background: t.color.bgSoft,
                  border:`1px solid ${t.color.border}`, borderRadius: t.radius.md, color: t.color.text,
                  fontFamily:'Space Mono, monospace', fontSize: t.font.sm, direction:'rtl',
                  outline:'none', resize:'vertical',
                }}
              />
              <div style={{ marginTop: 12, display:'flex', gap: 10, justifyContent:'flex-end' }}>
                <Button variant="ghost" onClick={() => setPastedText('')}>נקה</Button>
                <Button onClick={handlePasteText} disabled={!pastedText.trim()}>נתח טקסט</Button>
              </div>
            </Card>
          )}
        </>
      )}

      {status === 'parsed' && sessions.length > 0 && (
        <ParsedPreview
          sessions={sessions}
          setSessions={setSessions}
          planName={planName}
          setPlanName={setPlanName}
          rawText={rawText}
          onAdopt={adopt}
          onReset={reset}
        />
      )}
    </div>
  )
}

function ModeChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding:'10px 14px', border:'none', fontFamily:'inherit', cursor:'pointer',
      background: active ? t.color.bgCard : 'transparent',
      color: active ? t.color.gold : t.color.textDim,
      fontWeight: 600, borderRadius: t.radius.sm, fontSize: t.font.sm,
    }}>{children}</button>
  )
}

function ParsedPreview({ sessions, setSessions, planName, setPlanName, rawText, onAdopt, onReset }) {
  const [showRaw, setShowRaw] = useState(false)

  const editExercise = (si, ei, patch) => {
    setSessions(s => s.map((sess, i) => i !== si ? sess : {
      ...sess,
      exercises: sess.exercises.map((ex, j) => j !== ei ? ex : { ...ex, ...patch }),
    }))
  }
  const removeExercise = (si, ei) => {
    setSessions(s => s.map((sess, i) => i !== si ? sess : {
      ...sess, exercises: sess.exercises.filter((_, j) => j !== ei),
    }))
  }
  const editSessionName = (si, name) => {
    setSessions(s => s.map((sess, i) => i !== si ? sess : { ...sess, name }))
  }
  const removeSession = (si) => setSessions(s => s.filter((_, i) => i !== si))
  const addExercise = (si) => setSessions(s => s.map((sess, i) => i !== si ? sess : { ...sess, exercises: [...sess.exercises, { name: 'תרגיל חדש', sets: 3, reps: 10 }] }))

  const totalExercises = sessions.reduce((n, s) => n + s.exercises.length, 0)

  return (
    <>
      <Card style={{ padding: 20, background:`${t.color.success}10`, border:`1px solid ${t.color.success}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap: 12 }}>
          <div>
            <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div style={{ fontWeight: 700, fontSize: t.font.lg }}>זוהה בהצלחה</div>
            </div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
              {sessions.length} אימונים · {totalExercises} תרגילים · מוכן לעריכה ואישור
            </div>
          </div>
          <div style={{ display:'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw(true)}>הצג טקסט מקורי</Button>
            <Button variant="ghost" size="sm" onClick={onReset}>ייבא קובץ אחר</Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="שם התכנית" />
        <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="לדוגמה: תכנית מהמאמן דני" />
      </Card>

      {sessions.map((sess, si) => (
        <Card key={si} style={{ padding: 20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14, gap: 8 }}>
            <input
              value={sess.name}
              onChange={e => editSessionName(si, e.target.value)}
              style={{
                flex: 1, background:'transparent', border:'none', outline:'none',
                color: t.color.gold, fontWeight: 700, fontSize: t.font.lg,
                borderBottom: `1px dashed ${t.color.border}`, padding:'4px 0', direction:'rtl',
              }}
            />
            <Badge>{sess.exercises.length} תרגילים</Badge>
            <Button variant="ghost" size="sm" onClick={() => removeSession(si)}>🗑</Button>
          </div>

          <div style={{ display:'grid', gap: 8 }}>
            {sess.exercises.map((ex, ei) => (
              <div key={ei} style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 60px 60px 80px 80px auto', gap: 8, alignItems:'center' }} className="hfos-imp-row">
                  <input value={ex.name} onChange={e => editExercise(si, ei, { name: e.target.value })} style={inputStyle} />
                  <input type="number" value={ex.sets || ''} onChange={e => editExercise(si, ei, { sets: +e.target.value || 0 })} placeholder="סטים" style={{ ...inputStyle, textAlign:'center' }} />
                  <input type="number" value={ex.reps || ''} onChange={e => editExercise(si, ei, { reps: +e.target.value || 0 })} placeholder="חזרות" style={{ ...inputStyle, textAlign:'center' }} />
                  <input type="text" value={ex.intensity ? Math.round(ex.intensity * 100) + '%' : ''} onChange={e => { const v = parseInt(e.target.value); editExercise(si, ei, { intensity: v ? v/100 : null }) }} placeholder="% 1RM" style={{ ...inputStyle, textAlign:'center', color: t.color.gold }} />
                  <input type="number" value={ex.weight || ''} onChange={e => editExercise(si, ei, { weight: +e.target.value || null })} placeholder="ק״ג" style={{ ...inputStyle, textAlign:'center' }} />
                  <button onClick={() => removeExercise(si, ei)} style={{ background:'none', border:'none', color: t.color.textMuted, cursor:'pointer', fontSize: 18 }}>✕</button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addExercise(si)}>+ הוסף תרגיל</Button>
          </div>
        </Card>
      ))}

      <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
        <Button variant="ghost" onClick={onReset}>ביטול</Button>
        <Button onClick={onAdopt} disabled={!sessions.length}>אמץ כתכנית ✓</Button>
      </div>

      <Modal open={showRaw} onClose={() => setShowRaw(false)} title="טקסט שחולץ מה-PDF" width={620}>
        <pre style={{
          padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm,
          fontSize: t.font.xs, whiteSpace:'pre-wrap', maxHeight: 400, overflow:'auto',
          fontFamily:'Space Mono, monospace', direction:'rtl',
        }}>{rawText}</pre>
      </Modal>

      <style>{`@media (max-width: 700px) {
        .hfos-imp-row {
          grid-template-columns: 1fr 1fr 1fr auto !important;
          gap: 6px !important;
        }
        .hfos-imp-row > input:nth-child(4),
        .hfos-imp-row > input:nth-child(5) { grid-column: span 2 !important; }
      }`}</style>
    </>
  )
}

const inputStyle = {
  padding:'8px 10px', background: 'rgba(0,0,0,.2)',
  border:'1px solid rgba(255,255,255,.05)', borderRadius: 6, color: '#f5f2e8',
  fontFamily:'inherit', fontSize: 13, outline:'none', width:'100%', direction:'rtl',
}
