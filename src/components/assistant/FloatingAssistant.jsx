import React, { useState, useEffect, useRef } from 'react'
import { t } from '../../theme/tokens'

// Floating help bubble - navigation + fitness answers + mental redirect.
// Kept intentionally simple: keyword-matched answers, chip suggestions,
// and a clear escalation to the mental coach for personal questions.

const QUICK_QUESTIONS = [
  { q: 'איך אני מוסיף אימון?', k: 'add_workout' },
  { q: 'איפה בונים תכנית?', k: 'build_plan' },
  { q: 'איך רושמים ארוחה?', k: 'add_meal' },
  { q: 'מה זה 1RM?', k: 'what_1rm' },
  { q: 'איך מוסיפים ליומן Google?', k: 'calendar' },
]

// Personal/emotional keywords that route to the mental coach
const MENTAL_KEYWORDS = [
  'מרגיש', 'לחוץ', 'עצוב', 'חרד', 'מפחד', 'כועס', 'מדוכא', 'עייף', 'שחוק',
  'לא רוצה', 'מוותר', 'קשה לי', 'ריקנות', 'בודד', 'מבולבל', 'רוצה לבכות',
  'אני לא מסוגל', 'שנאה', 'תסכול',
]

const ANSWERS = {
  add_workout: 'עבור ל־**אימונים → התכנית שלי** ולחץ על כרטיס האימון. תוכל לרשום סטים, משקל, וחזרות בזמן אמת עם טיימר מנוחה אוטומטי.',
  build_plan: 'עבור ל־**מטרה** ולחץ על הכפתור הזהב **"בנה לי תכנית ✨"**. תעבור wizard של 3 שלבים: אימונים → תזונה → מנטלי, ותקבל תכנית הוליסטית תוך 2 דקות.',
  add_meal: 'עבור ל־**תזונה → היום → + הוסף**. יש 3 אפשרויות: חיפוש במאגר, סריקת ברקוד (עובד עם OpenFoodFacts), או הזנה ידנית של מזון אישי.',
  what_1rm: 'זה המשקל המקסימלי שאתה יכול להרים חזרה אחת בתרגיל מסוים. עבור ל־**פרופיל → יכולת מירבית** להזין. כל האחוזים בתכניות (5×5 @ 78%) מחושבים מזה.',
  calendar: 'עבור ל־**יומן** בתפריט. תוכל להוריד קובץ ICS לשבוע שלם, או להוסיף כל אירוע בקליק אחד ל-Google Calendar.',
  progress: 'עבור ל־**התקדמות** בתפריט. אתה יכול לרשום מדידות גוף (משקל, שומן, היקפים), להעלות תמונות before/after, ולתעד שיאים אישיים.',
  rehab: 'עבור ל־**שיקום** בתפריט. בחר אזור בגוף (כתף/גב/ברך וכו׳), ענה על שאלון קצר, ותקבל פרוטוקול 4 שבועות מותאם.',
  bloodtest: 'עבור ל־**תזונה → בדיקות דם**. הזן ערכים ידנית ותקבל פרשנות תזונתית: מה תקין, מה נמוך/גבוה, ומה לאכול כדי לתקן.',
  goal: 'עבור ל־**מטרה**. אם עוד לא הגדרת, בחר "בואו נבנה מטרה" - 3 קליקים בשפת כושר.',
  install: 'iPhone: לחץ שיתוף ⬆️ → הוסף למסך הבית. Android: יופיע banner "התקן את האפליקציה".',
  default: 'לא הבנתי בדיוק. תוכל לנסות אחת מהשאלות המוצעות למעלה, או לכתוב אחרת. לשאלות אישיות/רגשיות - יש את המאמן המנטלי בתפריט.',
}

// Simple keyword matcher
function matchAnswer(text) {
  const lower = text.toLowerCase().trim()
  if (!lower) return null
  // Mental keyword detection first
  for (const kw of MENTAL_KEYWORDS) {
    if (lower.includes(kw)) return { key: 'MENTAL', text: null }
  }
  // Navigation keywords
  if (/אימון|תרגיל|לרשום/.test(lower)) return { key: 'add_workout', text: ANSWERS.add_workout }
  if (/תכנית|לבנות תכנית|תוכנית/.test(lower)) return { key: 'build_plan', text: ANSWERS.build_plan }
  if (/ארוחה|אוכל|קלוריות|מזון/.test(lower)) return { key: 'add_meal', text: ANSWERS.add_meal }
  if (/1rm|יכולת מירבית|מקסימום/.test(lower)) return { key: 'what_1rm', text: ANSWERS.what_1rm }
  if (/יומן|calendar|לו״ז|לוז/.test(lower)) return { key: 'calendar', text: ANSWERS.calendar }
  if (/משקל גוף|התקדמות|מדידה|תמונ|שיא|pr/i.test(lower)) return { key: 'progress', text: ANSWERS.progress }
  if (/שיקום|פציעה|כאב/.test(lower)) return { key: 'rehab', text: ANSWERS.rehab }
  if (/דם|בדיקה|ויטמין/.test(lower)) return { key: 'bloodtest', text: ANSWERS.bloodtest }
  if (/מטרה|goal|יעד/.test(lower)) return { key: 'goal', text: ANSWERS.goal }
  if (/להתקין|התקנה|install|מסך הבית/.test(lower)) return { key: 'install', text: ANSWERS.install }
  return { key: 'default', text: ANSWERS.default }
}

export function FloatingAssistant({ onOpenMentalCoach }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: 'היי! אני המדריך שלך. אני עוזר לך למצוא דברים באפליקציה ולענות על שאלות מהירות. במה אוכל לעזור?',
      }])
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const send = (text) => {
    const q = (text || '').trim()
    if (!q) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')

    setTimeout(() => {
      const match = matchAnswer(q)
      if (match?.key === 'MENTAL') {
        setMessages(m => [...m, {
          role: 'bot',
          mental: true,
          text: 'זו שאלה שראויה למאמן המנטלי - שם תוכל לקבל שיחה עמוקה יותר. רוצה שאעביר אותך?',
        }])
      } else {
        setMessages(m => [...m, { role: 'bot', text: match?.text || ANSWERS.default }])
      }
    }, 350)
  }

  const handleQuick = (item) => {
    send(item.q)
  }

  const goToMental = () => {
    setOpen(false)
    onOpenMentalCoach?.()
  }

  return (
    <>
      {/* Floating button */}
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
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, left: 20, zIndex: 900,
          width: 340, maxWidth: 'calc(100vw - 40px)',
          height: 480, maxHeight: 'calc(100vh - 140px)',
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
              <span style={{ fontSize: 20 }}>💬</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>המדריך שלך</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>שאל אותי כל שאלה על הפלטפורמה</div>
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
                maxWidth: '85%',
              }}>
                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  background: m.role === 'user' ? t.color.gold : t.color.bgSoft,
                  color: m.role === 'user' ? '#0d0d14' : t.color.text,
                  fontSize: 13, lineHeight: 1.55,
                }} dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
                {m.mental && (
                  <button onClick={goToMental} style={{
                    marginTop: 6, padding: '8px 14px', background: t.color.gold, color: '#0d0d14',
                    border: 'none', borderRadius: 999, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
                  }}>🧠 עבור למאמן המנטלי ←</button>
                )}
              </div>
            ))}
          </div>

          {/* Quick chips (shown until first user message) */}
          {messages.length <= 1 && (
            <div style={{ padding: 10, borderTop: `1px solid ${t.color.border}`, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => handleQuick(q)} style={{
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
              placeholder="כתוב שאלה..."
              style={{
                flex: 1, padding: '9px 12px', background: t.color.bgSoft,
                border: `1px solid ${t.color.border}`, borderRadius: 10,
                color: t.color.text, fontFamily: 'inherit', fontSize: 13,
                outline: 'none', direction: 'rtl',
              }} />
            <button type="submit" disabled={!input.trim()} style={{
              padding: '9px 16px', background: t.color.gold, color: '#0d0d14',
              border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              fontFamily: 'inherit', fontSize: 13,
            }}>שלח</button>
          </form>
        </div>
      )}
    </>
  )
}

// Basic markdown-lite for bold text
function formatText(txt) {
  if (!txt) return ''
  return String(txt)
    .replace(/\*\*(.+?)\*\*/g, '<b style="color:#c8a84b">$1</b>')
    .replace(/\n/g, '<br>')
}
