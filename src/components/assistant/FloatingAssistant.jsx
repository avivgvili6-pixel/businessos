import React, { useState, useEffect, useRef } from 'react'
import { t } from '../../theme/tokens'
import { useApp } from '../../store/AppStore'
import { askAiCoach, aiEnabled, isMentalQuestion } from '../../services/aiCoach'

// Floating AI coach - powered by Gemini when configured, falls back to
// keyword answers when offline / not configured.

const QUICK_QUESTIONS = [
  { q: 'איך אני מוסיף אימון?' },
  { q: 'מה זה 1RM?' },
  { q: 'כמה חלבון ליום?' },
  { q: 'איך משפרים שינה?' },
  { q: 'איך בונים תכנית?' },
]

const MENTAL_KEYWORDS = ['מרגיש רע', 'לחוץ', 'עצוב', 'חרד', 'מפחד', 'כועס', 'מדוכא',
  'שחוק נפשית', 'לא רוצה יותר', 'מוותר', 'קשה לי נפשית', 'ריקנות', 'בודד',
  'רוצה לבכות', 'שנאה', 'תסכול נפשי']

const FALLBACK_ANSWERS = {
  add_workout: 'עבור ל־**אימונים → התכנית שלי** ולחץ על כרטיס האימון. תוכל לרשום סטים, משקל, וחזרות בזמן אמת עם טיימר מנוחה אוטומטי.',
  build_plan: 'עבור ל־**מטרה** ולחץ על **"בנה לי תכנית ✨"**. תעבור wizard של 3 שלבים.',
  add_meal: 'עבור ל־**תזונה → היום → + הוסף**. יש 3 אפשרויות: חיפוש, ברקוד, או הזנה ידנית.',
  what_1rm: 'המשקל המקסימלי בחזרה אחת. עבור ל־**פרופיל → יכולת מירבית** להזין. כל האחוזים בתכניות מחושבים מזה.',
  calendar: 'עבור ל־**יומן** בתפריט. אפשר להוריד קובץ ICS לשבוע שלם או להוסיף לGoogle Calendar.',
  progress: 'עבור ל־**התקדמות** בתפריט. אפשר לרשום מדידות, להעלות תמונות, ולתעד שיאים אישיים.',
  rehab: 'עבור ל־**שיקום** בתפריט. בחר אזור, ענה על שאלון, וקבל פרוטוקול 4 שבועות.',
  bloodtest: 'עבור ל־**תזונה → בדיקות דם**. הזן ערכים ותקבל פרשנות תזונתית.',
  goal: 'עבור ל־**מטרה**. אם עוד לא הגדרת, בחר "בואו נבנה מטרה" - 3 קליקים.',
  install: 'iPhone: שיתוף ⬆️ → הוסף למסך הבית. Android: יופיע banner "התקן את האפליקציה".',
  default: 'לא הבנתי בדיוק. נסה לנסח אחרת או בחר מהשאלות המוצעות. לשאלות אישיות/רגשיות - יש את המאמן המנטלי בתפריט.',
}

function matchFallback(text) {
  const lower = text.toLowerCase().trim()
  if (!lower) return null
  for (const kw of MENTAL_KEYWORDS) {
    if (lower.includes(kw)) return { key: 'MENTAL', text: null }
  }
  if (/אימון|תרגיל|לרשום/.test(lower)) return { key: 'add_workout', text: FALLBACK_ANSWERS.add_workout }
  if (/תכנית|לבנות|תוכנית/.test(lower)) return { key: 'build_plan', text: FALLBACK_ANSWERS.build_plan }
  if (/ארוחה|אוכל|קלוריות|מזון/.test(lower)) return { key: 'add_meal', text: FALLBACK_ANSWERS.add_meal }
  if (/1rm|יכולת מירבית|מקסימום/.test(lower)) return { key: 'what_1rm', text: FALLBACK_ANSWERS.what_1rm }
  if (/יומן|calendar|לו״ז|לוז/.test(lower)) return { key: 'calendar', text: FALLBACK_ANSWERS.calendar }
  if (/משקל גוף|התקדמות|מדידה|תמונ|שיא|pr/i.test(lower)) return { key: 'progress', text: FALLBACK_ANSWERS.progress }
  if (/שיקום|פציעה|כאב/.test(lower)) return { key: 'rehab', text: FALLBACK_ANSWERS.rehab }
  if (/דם|בדיקה|ויטמין/.test(lower)) return { key: 'bloodtest', text: FALLBACK_ANSWERS.bloodtest }
  if (/מטרה|goal|יעד/.test(lower)) return { key: 'goal', text: FALLBACK_ANSWERS.goal }
  if (/להתקין|התקנה|install|מסך הבית/.test(lower)) return { key: 'install', text: FALLBACK_ANSWERS.install }
  return { key: 'default', text: FALLBACK_ANSWERS.default }
}

export function FloatingAssistant({ onOpenMentalCoach }) {
  const { state } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  const userContext = {
    name: state.profile?.name,
    sex: state.profile?.sex,
    age: state.profile?.age,
    goal: (state.goals || []).find(g => g.status === 'active')?.title,
    plan: state.plan?.name,
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = aiEnabled
        ? 'היי! אני המדריך שלך מבוסס AI. שאל אותי כל שאלה - אימונים, תזונה, שינה, הורמונים, ניווט באפליקציה. במה אוכל לעזור?'
        : 'היי! אני המדריך שלך. אני עוזר לך למצוא דברים באפליקציה ולענות על שאלות מהירות. במה אוכל לעזור?'
      setMessages([{ role: 'bot', text: greeting }])
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, thinking])

  const send = async (text) => {
    const q = (text || '').trim()
    if (!q || thinking) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')

    // Mental question detection - always route to mental coach regardless of AI
    if (isMentalQuestion(q)) {
      setMessages(m => [...m, {
        role: 'bot', mental: true,
        text: 'זו שאלה שראויה למאמן המנטלי — שם תוכל לקבל שיחה עמוקה יותר. רוצה שאעביר אותך?',
      }])
      return
    }

    setThinking(true)

    // Try AI first
    if (aiEnabled) {
      const aiReply = await askAiCoach({
        question: q,
        history: messages,
        userContext,
      })
      if (aiReply) {
        setMessages(m => [...m, { role: 'bot', text: aiReply, ai: true }])
        setThinking(false)
        return
      }
    }

    // Fallback to keyword matching
    setTimeout(() => {
      const match = matchFallback(q)
      if (match?.key === 'MENTAL') {
        setMessages(m => [...m, { role: 'bot', mental: true, text: 'זו שאלה למאמן המנטלי. רוצה שאעביר אותך?' }])
      } else {
        setMessages(m => [...m, { role: 'bot', text: match?.text || FALLBACK_ANSWERS.default }])
      }
      setThinking(false)
    }, 300)
  }

  const goToMental = () => { setOpen(false); onOpenMentalCoach?.() }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="פתח את המדריך"
          style={{
            position: 'fixed', bottom: 90, left: 20, zIndex: 900,
            width: 58, height: 58, borderRadius: '50%',
            background: t.color.gold, color: '#0d0d14',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, boxShadow: `0 8px 32px rgba(0,0,0,.5), 0 0 24px ${t.color.gold}44`,
            transition: 'transform .2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >💬</button>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 90, left: 20, zIndex: 900,
          width: 360, maxWidth: 'calc(100vw - 40px)',
          height: 520, maxHeight: 'calc(100vh - 140px)',
          background: t.color.bgElevated,
          border: `1px solid ${t.color.gold}`, borderRadius: t.radius.lg,
          boxShadow: '0 20px 60px rgba(0,0,0,.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          direction: 'rtl',
        }}>
          {/* Header */}
          <div style={{
            padding: 14, background: t.color.gold, color: '#0d0d14',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{aiEnabled ? '🧠' : '💬'}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>המדריך שלך{aiEnabled ? ' · AI' : ''}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>
                  {aiEnabled ? 'אימונים · תזונה · הורמונים · שינה · פציעות' : 'ניווט + שאלות מהירות'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="סגור" style={{
              background: 'rgba(0,0,0,.15)', border: 'none', color: '#0d0d14',
              width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14,
              display: 'grid', placeItems: 'center',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: 14,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end',
                maxWidth: '88%',
              }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  background: m.role === 'user' ? t.color.gold : t.color.bgSoft,
                  color: m.role === 'user' ? '#0d0d14' : t.color.text,
                  fontSize: 13, lineHeight: 1.6,
                }} dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                {m.ai && (
                  <div style={{ fontSize: 9, color: t.color.textDim, marginTop: 2, textAlign: 'left', paddingLeft: 4 }}>
                    ✨ AI · Gemini
                  </div>
                )}
                {m.mental && (
                  <button onClick={goToMental} style={{
                    marginTop: 6, padding: '8px 14px', background: t.color.gold, color: '#0d0d14',
                    border: 'none', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
                  }}>🧠 עבור למאמן המנטלי ←</button>
                )}
              </div>
            ))}
            {thinking && (
              <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  background: t.color.bgSoft, color: t.color.textDim,
                  fontSize: 13, lineHeight: 1.55, fontStyle: 'italic',
                }}>
                  <span style={{ display: 'inline-flex', gap: 3 }}>
                    <span style={{ animation: 'hfos-blink 1.4s infinite' }}>•</span>
                    <span style={{ animation: 'hfos-blink 1.4s infinite 0.2s' }}>•</span>
                    <span style={{ animation: 'hfos-blink 1.4s infinite 0.4s' }}>•</span>
                  </span>
                  <span style={{ marginRight: 6 }}>{aiEnabled ? 'המדריך חושב...' : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick chips */}
          {messages.length <= 1 && !thinking && (
            <div style={{ padding: 10, borderTop: `1px solid ${t.color.border}`, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => send(q.q)} style={{
                  padding: '5px 10px', background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
                  color: t.color.text, borderRadius: 999, cursor: 'pointer', fontSize: 11,
                  fontFamily: 'inherit',
                }}>{q.q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(input) }} style={{
            display: 'flex', gap: 6, padding: 10,
            borderTop: `1px solid ${t.color.border}`,
          }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder={aiEnabled ? 'שאל אותי כל שאלה...' : 'כתוב שאלה...'}
              style={{
                flex: 1, padding: '9px 12px', background: t.color.bgSoft,
                border: `1px solid ${t.color.border}`, borderRadius: 10,
                color: t.color.text, fontFamily: 'inherit', fontSize: 13,
                outline: 'none', direction: 'rtl',
              }} />
            <button type="submit" disabled={!input.trim() || thinking} style={{
              padding: '9px 16px', background: t.color.gold, color: '#0d0d14',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              fontFamily: 'inherit', fontSize: 13, opacity: thinking ? 0.5 : 1,
            }}>שלח</button>
          </form>
          <style>{`@keyframes hfos-blink { 0%,80%,100% { opacity: .3 } 40% { opacity: 1 } }`}</style>
        </div>
      )}
    </>
  )
}

function formatText(txt) {
  if (!txt) return ''
  return String(txt)
    .replace(/\*\*(.+?)\*\*/g, '<b style="color:#c8a84b">$1</b>')
    .replace(/\n/g, '<br>')
}
