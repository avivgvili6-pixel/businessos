import React, { useState, useRef } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { useI18n } from '../../../i18n/i18n'
import { Card, Button, Input, Badge, SectionHeader, Modal } from '../../../components/ui/UI'
import { extractTextFromPDF, parseWorkoutText } from '../../../utils/pdfParser'

const MAX_MB = 10

// Map an error code from extractTextFromPDF into a friendly bilingual string.
function friendlyError(code, isRTL) {
  const dict = {
    password: {
      he: 'הקובץ מוגן בסיסמה. הסר את ההגנה ונסה שוב.',
      en: 'This PDF is password-protected. Remove the password and try again.',
    },
    invalid: {
      he: 'הקובץ פגום או לא תקין. ודא שזה PDF שלם.',
      en: 'The file is corrupt or not a valid PDF.',
    },
    empty: {
      he: 'הקובץ ריק.',
      en: 'The PDF has no pages.',
    },
    scanned: {
      he: 'ה-PDF הזה סרוק כתמונה — אין בו טקסט לחילוץ. הדבק/י את התכנית בלשונית "הדבק טקסט".',
      en: 'This PDF is a scanned image — there is no text to extract. Paste the plan into the "Paste text" tab instead.',
    },
    worker: {
      he: 'לא ניתן היה לטעון את מנוע קריאת ה-PDF. רענן/י את הדף ונסה/י שוב.',
      en: "Couldn't start the PDF engine. Please refresh the page and try again.",
    },
    size: {
      he: `הקובץ גדול מדי. הגבול הוא ${MAX_MB}MB.`,
      en: `File too large. The limit is ${MAX_MB}MB.`,
    },
    type: {
      he: 'רק קבצי PDF נתמכים כרגע.',
      en: 'Only PDF files are supported.',
    },
    unknown: {
      he: 'לא ניתן לקרוא את הקובץ. נסה/י PDF אחר או השתמש/י בהדבקת טקסט.',
      en: "Couldn't read the file. Try another PDF or paste the text manually.",
    },
  }
  const entry = dict[code] || dict.unknown
  return isRTL ? entry.he : entry.en
}

export function PdfImporter() {
  const { setPlan } = useApp()
  const { isRTL } = useI18n()
  const T = isRTL ? HE : EN

  const fileRef = useRef(null)
  const [mode, setMode] = useState('upload') // upload | paste
  const [status, setStatus] = useState(null) // null | loading | parsed | error | empty
  const [rawText, setRawText] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [sessions, setSessions] = useState([])
  const [planName, setPlanName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [errorDetail, setErrorDetail] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setStatus('error'); setErrorMsg(friendlyError('type', isRTL)); setErrorDetail('')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setStatus('error'); setErrorMsg(friendlyError('size', isRTL)); setErrorDetail('')
      return
    }
    setStatus('loading'); setErrorMsg(''); setErrorDetail('')
    try {
      const text = await extractTextFromPDF(file)
      const parsed = parseWorkoutText(text)
      setRawText(text)
      setSessions(parsed)
      setPlanName(file.name.replace(/\.pdf$/i, ''))
      setStatus(parsed.length ? 'parsed' : 'empty')
    } catch (err) {
      console.error('[PdfImporter] extract failed:', err)
      setStatus('error')
      setErrorMsg(friendlyError(err?.code || 'unknown', isRTL))
      setErrorDetail(err?.message ? String(err.message).slice(0, 240) : '')
    }
    e.target.value = ''
  }

  const handlePasteText = () => {
    if (!pastedText.trim()) return
    setStatus('loading'); setErrorMsg(''); setErrorDetail('')
    try {
      const parsed = parseWorkoutText(pastedText)
      setRawText(pastedText)
      setSessions(parsed)
      setPlanName(isRTL ? 'תכנית מיובאת' : 'Imported plan')
      setStatus(parsed.length ? 'parsed' : 'empty')
    } catch (err) {
      console.error('[PdfImporter] parse failed:', err)
      setStatus('error'); setErrorMsg(friendlyError('unknown', isRTL))
    }
  }

  const adopt = () => {
    const finalName = planName || (isRTL ? 'תכנית מיובאת' : 'Imported plan')
    const plan = {
      name: finalName,
      imported: true,
      split: sessions.length + (isRTL ? ' אימונים' : ' workouts'),
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
    alert(isRTL
      ? `התכנית "${finalName}" אומצה. עבור לטאב "התכנית שלי".`
      : `Plan "${finalName}" adopted. Open the "My plan" tab.`)
    setSessions([]); setRawText(''); setPastedText(''); setStatus(null); setPlanName('')
  }

  const reset = () => {
    setSessions([]); setRawText(''); setStatus(null); setPastedText(''); setErrorMsg(''); setErrorDetail('')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card style={{ background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
        <Badge>{T.kicker}</Badge>
        <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>{T.title}</h2>
        <div style={{ color: t.color.textDim, marginTop: 6 }}>{T.subtitle}</div>
      </Card>

      {status !== 'parsed' && (
        <>
          <div style={{ display: 'flex', gap: 6, background: t.color.bgSoft, padding: 4, borderRadius: t.radius.md }}>
            <ModeChip active={mode === 'upload'} onClick={() => setMode('upload')}>{T.tabPdf}</ModeChip>
            <ModeChip active={mode === 'paste'} onClick={() => setMode('paste')}>{T.tabPaste}</ModeChip>
          </div>

          {mode === 'upload' && (
            <Card style={{ padding: 40, textAlign: 'center' }}>
              <div style={{
                border: `2px dashed ${t.color.border}`, borderRadius: t.radius.lg,
                padding: 40, cursor: 'pointer', transition: t.transition,
              }}
                onClick={() => fileRef.current?.click()}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.color.wineLight}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.color.border}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={t.color.wineLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 12 15 15" />
                  </svg>
                </div>
                <div style={{ fontSize: t.font.lg, fontWeight: 700, marginBottom: 6 }}>{T.cta}</div>
                <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>{T.hint}</div>
                <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
              </div>
              {status === 'loading' && (
                <div style={{ marginTop: 20, color: t.color.wineLight, fontWeight: 600 }}>{T.reading}</div>
              )}
              {status === 'error' && (
                <div style={{ marginTop: 20, padding: 12, background: `${t.color.danger}15`, borderRadius: t.radius.sm, color: t.color.danger, textAlign: isRTL ? 'right' : 'left' }}>
                  <div>{errorMsg}</div>
                  {errorDetail && (
                    <details style={{ marginTop: 8, fontSize: t.font.xs, opacity: 0.75 }}>
                      <summary style={{ cursor: 'pointer' }}>{T.techDetails}</summary>
                      <pre style={{ marginTop: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{errorDetail}</pre>
                    </details>
                  )}
                </div>
              )}
              {status === 'empty' && (
                <div style={{ marginTop: 20, padding: 12, background: `${t.color.warning}15`, borderRadius: t.radius.sm, color: t.color.warning, fontSize: t.font.sm, textAlign: isRTL ? 'right' : 'left' }}>
                  {T.noExercises}
                </div>
              )}
            </Card>
          )}

          {mode === 'paste' && (
            <Card>
              <SectionHeader title={T.pasteTitle} subtitle={T.pasteSubtitle} />
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder={isRTL
                  ? `יום א' - דחיפה\nלחיצת חזה 5x5 @ 80%\nלחיצת כתפיים 4x8\nמקבילים 3x10\n\nיום ב' - משיכה\n...`
                  : `Day 1 - Push\nBench press 5x5 @ 80%\nOverhead press 4x8\nDips 3x10\n\nDay 2 - Pull\n...`}
                style={{
                  width: '100%', minHeight: 240, padding: 14, background: t.color.bgSoft,
                  border: `1px solid ${t.color.border}`, borderRadius: t.radius.md, color: t.color.text,
                  fontFamily: 'Space Mono, monospace', fontSize: t.font.sm, direction: isRTL ? 'rtl' : 'ltr',
                  outline: 'none', resize: 'vertical',
                }}
              />
              <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setPastedText('')}>{T.clear}</Button>
                <Button onClick={handlePasteText} disabled={!pastedText.trim()}>{T.analyze}</Button>
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
          T={T}
          isRTL={isRTL}
        />
      )}
    </div>
  )
}

function ModeChip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 14px', border: 'none', fontFamily: 'inherit', cursor: 'pointer',
      background: active ? t.color.bgCard : 'transparent',
      color: active ? t.color.wineLight : t.color.textDim,
      fontWeight: 600, borderRadius: t.radius.sm, fontSize: t.font.sm,
    }}>{children}</button>
  )
}

function ParsedPreview({ sessions, setSessions, planName, setPlanName, rawText, onAdopt, onReset, T, isRTL }) {
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
  const addExercise = (si) => setSessions(s => s.map((sess, i) => i !== si ? sess : {
    ...sess,
    exercises: [...sess.exercises, { name: isRTL ? 'תרגיל חדש' : 'New exercise', sets: 3, reps: 10 }],
  }))

  const totalExercises = sessions.reduce((n, s) => n + s.exercises.length, 0)

  return (
    <>
      <Card style={{ padding: 20, background: `${t.color.success}10`, border: `1px solid ${t.color.success}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: t.font.lg, marginBottom: 6 }}>{T.detected}</div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
              {sessions.length} {isRTL ? 'אימונים' : 'workouts'} · {totalExercises} {isRTL ? 'תרגילים' : 'exercises'} · {T.reviewReady}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw(true)}>{T.showRaw}</Button>
            <Button variant="ghost" size="sm" onClick={onReset}>{T.importAnother}</Button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title={T.planName} />
        <Input value={planName} onChange={e => setPlanName(e.target.value)} placeholder={T.planPlaceholder} />
      </Card>

      {sessions.map((sess, si) => (
        <Card key={si} style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 8 }}>
            <input
              value={sess.name}
              onChange={e => editSessionName(si, e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: t.color.wineLight, fontWeight: 700, fontSize: t.font.lg,
                borderBottom: `1px dashed ${t.color.border}`, padding: '4px 0',
                direction: isRTL ? 'rtl' : 'ltr',
              }}
            />
            <Badge>{sess.exercises.length} {isRTL ? 'תרגילים' : 'ex'}</Badge>
            <Button variant="ghost" size="sm" onClick={() => removeSession(si)}>{T.remove}</Button>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {sess.exercises.map((ex, ei) => (
              <div key={ei} style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 60px 60px 80px 80px auto', gap: 8, alignItems: 'center' }} className="hfos-imp-row">
                  <input value={ex.name} onChange={e => editExercise(si, ei, { name: e.target.value })} style={inputStyle(isRTL)} />
                  <input type="number" value={ex.sets || ''} onChange={e => editExercise(si, ei, { sets: +e.target.value || 0 })} placeholder={T.sets} style={{ ...inputStyle(isRTL), textAlign: 'center' }} />
                  <input type="number" value={ex.reps || ''} onChange={e => editExercise(si, ei, { reps: +e.target.value || 0 })} placeholder={T.reps} style={{ ...inputStyle(isRTL), textAlign: 'center' }} />
                  <input type="text" value={ex.intensity ? Math.round(ex.intensity * 100) + '%' : ''} onChange={e => { const v = parseInt(e.target.value); editExercise(si, ei, { intensity: v ? v / 100 : null }) }} placeholder="% 1RM" style={{ ...inputStyle(isRTL), textAlign: 'center', color: t.color.wineLight }} />
                  <input type="number" value={ex.weight || ''} onChange={e => editExercise(si, ei, { weight: +e.target.value || null })} placeholder={T.kg} style={{ ...inputStyle(isRTL), textAlign: 'center' }} />
                  <button onClick={() => removeExercise(si, ei)} style={{ background: 'none', border: 'none', color: t.color.textMuted, cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addExercise(si)}>+ {T.addExercise}</Button>
          </div>
        </Card>
      ))}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onReset}>{T.cancel}</Button>
        <Button onClick={onAdopt} disabled={!sessions.length}>{T.adopt}</Button>
      </div>

      <Modal open={showRaw} onClose={() => setShowRaw(false)} title={T.rawTextTitle} width={620}>
        <pre style={{
          padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm,
          fontSize: t.font.xs, whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto',
          fontFamily: 'Space Mono, monospace', direction: isRTL ? 'rtl' : 'ltr',
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

const inputStyle = (isRTL) => ({
  padding: '8px 10px', background: 'rgba(0,0,0,.2)',
  border: '1px solid rgba(255,255,255,.05)', borderRadius: 6, color: '#f5f2e8',
  fontFamily: 'inherit', fontSize: 13, outline: 'none', width: '100%',
  direction: isRTL ? 'rtl' : 'ltr',
})

const HE = {
  kicker: 'ייבוא תכנית',
  title: 'העלה תכנית שיש לך',
  subtitle: 'יש לך PDF של תכנית אימון ממאמן? העלה את הקובץ — נזהה תרגילים, סטים, חזרות ואחוזים אוטומטית.',
  tabPdf: 'קובץ PDF',
  tabPaste: 'הדבק טקסט',
  cta: 'לחץ להעלאת PDF',
  hint: `עד ${MAX_MB}MB · תמיכה בעברית ובאנגלית`,
  reading: 'קורא את הקובץ…',
  techDetails: 'פרטים טכניים',
  noExercises: 'לא זוהו תרגילים בקובץ. אולי הוא סרוק כתמונה או שהפורמט לא מוכר. נסה/י להעתיק את הטקסט ידנית ולהדביק בלשונית "הדבק טקסט".',
  pasteTitle: 'הדבק תכנית טקסט',
  pasteSubtitle: 'דוגמאות למה שהמנתח מזהה: "סקוואט 5×5 @ 75%" · "יום א׳" · "3 sets of 10 pushups"',
  clear: 'נקה',
  analyze: 'נתח טקסט',
  detected: 'זוהה בהצלחה',
  reviewReady: 'מוכן לעריכה ואישור',
  showRaw: 'הצג טקסט מקורי',
  importAnother: 'ייבא קובץ אחר',
  planName: 'שם התכנית',
  planPlaceholder: 'לדוגמה: התכנית של המאמן דני',
  remove: 'הסר',
  sets: 'סטים',
  reps: 'חזרות',
  kg: 'ק״ג',
  addExercise: 'הוסף תרגיל',
  cancel: 'ביטול',
  adopt: 'אמץ כתכנית',
  rawTextTitle: 'טקסט שחולץ מה-PDF',
}

const EN = {
  kicker: 'Import plan',
  title: 'Upload the plan you have',
  subtitle: `Got a PDF training plan from your coach? Upload it — we'll extract exercises, sets, reps and percentages automatically.`,
  tabPdf: 'PDF file',
  tabPaste: 'Paste text',
  cta: 'Tap to upload a PDF',
  hint: `Up to ${MAX_MB}MB · Hebrew & English supported`,
  reading: 'Reading the file…',
  techDetails: 'Technical details',
  noExercises: 'No exercises detected. The PDF may be a scanned image or an unknown format. Try copying the text and pasting it into the "Paste text" tab.',
  pasteTitle: 'Paste the plan as text',
  pasteSubtitle: 'Examples the parser understands: "Back Squat 5×5 @ 75%" · "Day 1" · "3 sets of 10 pushups"',
  clear: 'Clear',
  analyze: 'Analyze text',
  detected: 'Detected successfully',
  reviewReady: 'ready to review and adopt',
  showRaw: 'Show original text',
  importAnother: 'Import another file',
  planName: 'Plan name',
  planPlaceholder: `e.g. Coach Danny's program`,
  remove: 'Remove',
  sets: 'sets',
  reps: 'reps',
  kg: 'kg',
  addExercise: 'Add exercise',
  cancel: 'Cancel',
  adopt: 'Adopt as my plan',
  rawTextTitle: 'Text extracted from PDF',
}
