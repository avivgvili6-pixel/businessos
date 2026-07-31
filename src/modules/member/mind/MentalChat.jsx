import React, { useState, useRef, useEffect } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, EmptyState } from '../../../components/ui/UI'

const STARTERS = [
  { icon:'😰', text:'אני מרגיש לחוץ ומוצף' },
  { icon:'💭', text:'יש לי מחשבה שלא עוזבת אותי' },
  { icon:'😴', text:'לא מצליח לישון טוב' },
  { icon:'🎯', text:'אני מרגיש שאני לא מתקדם' },
  { icon:'💪', text:'רוצה להיות עקבי יותר' },
  { icon:'🙏', text:'אני רוצה לתרגל תודה' },
]

export function MentalChat() {
  const { state } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (messages.length === 0) {
      // context-aware greeting
      const last = state.moodCheckins[0]
      const greeting = last
        ? last.mood < 5
          ? 'היי, ראיתי שמצב-הרוח שלך נמוך היום. אני כאן להקשיב - מה קורה?'
          : last.mood >= 8
            ? 'איזה יופי לראות אותך במצב-רוח טוב היום. מה מרגיש נעים כרגע?'
            : 'היי, אני שמח שקפצת. איך אתה מרגיש עכשיו?'
        : 'שלום, אני המאמן המנטלי שלך. איך אתה מרגיש היום?'
      setMessages([{ role: 'bot', text: greeting, ts: Date.now() }])
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  const send = (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text, ts: Date.now() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply = generateReply(text, state, messages)
      setMessages(m => [...m, { role: 'bot', text: reply, ts: Date.now() }])
      setTyping(false)
    }, 800 + Math.random() * 600)
  }

  return (
    <Card style={{ padding: 0, overflow:'hidden', display:'flex', flexDirection:'column', height: '70vh', minHeight: 500 }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${t.color.border}`, display:'flex', gap: 12, alignItems:'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius:'50%', background: t.color.gold,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize: 20,
        }}>🧠</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>מאמן מנטלי</div>
          <div style={{ fontSize: t.font.xs, color: t.color.success, display:'flex', gap: 6, alignItems:'center' }}>
            <span style={{ width: 6, height: 6, background: t.color.success, borderRadius:'50%' }} />
            מודע לנתונים שלך
          </div>
        </div>
        <Badge color={t.color.textDim}>Beta</Badge>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY:'auto', padding: 16, display:'grid', gap: 12, alignContent:'start' }}>
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
        {typing && <Bubble msg={{ role:'bot', text:'· · ·' }} />}
      </div>

      {messages.length === 1 && (
        <div style={{ padding: 12, borderTop: `1px solid ${t.color.border}`, display:'flex', gap: 6, flexWrap:'wrap' }}>
          {STARTERS.map((s, i) => (
            <button key={i} onClick={() => send(s.text)} style={{
              padding:'8px 12px', background: t.color.bgSoft, border:`1px solid ${t.color.border}`,
              borderRadius: t.radius.pill, color: t.color.text, cursor:'pointer',
              fontFamily:'inherit', fontSize: t.font.xs, transition: t.transition,
            }}>
              {s.icon} {s.text}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{
        display:'flex', gap: 8, padding: 12, borderTop: `1px solid ${t.color.border}`,
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="כתוב מה שעל הלב..."
          style={{
            flex: 1, padding:'12px 14px', background: t.color.bgSoft,
            border:`1px solid ${t.color.border}`, borderRadius: t.radius.md,
            color: t.color.text, fontFamily:'inherit', fontSize: t.font.md, outline:'none', direction:'rtl',
          }}
        />
        <Button type="submit" disabled={!input.trim()}>שלח</Button>
      </form>
    </Card>
  )
}

function Bubble({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <div style={{
      display:'flex', gap: 8, alignItems:'flex-end',
      flexDirection: isBot ? 'row' : 'row-reverse',
    }}>
      {isBot && (
        <div style={{
          width: 28, height: 28, borderRadius:'50%', background: t.color.gold,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize: 14, flexShrink: 0,
        }}>🧠</div>
      )}
      <div style={{
        maxWidth: '75%', padding:'10px 14px', borderRadius: 16,
        background: isBot ? t.color.bgSoft : t.color.gold,
        color: isBot ? t.color.text : '#0d0d14',
        borderTopRightRadius: isBot ? 16 : 4,
        borderTopLeftRadius: isBot ? 4 : 16,
        fontSize: t.font.md, lineHeight: 1.55, whiteSpace: 'pre-wrap',
      }}>
        {msg.text}
      </div>
    </div>
  )
}

// pattern-aware canned responses
function generateReply(text, state, history) {
  const lower = text.toLowerCase()
  const last = state.moodCheckins[0]
  const avgSleep = state.moodCheckins.slice(0, 5).reduce((s, c) => s + (c.sleepHours || 7), 0) / Math.max(1, state.moodCheckins.slice(0, 5).length)

  // stress / overwhelm
  if (/לחוץ|מוצף|סטרס|חרד|לחץ|מטריף/.test(text)) {
    return `שמעתי אותך. סטרס כרוני משפיע על כל המערכת - גם על השינה וגם על ההתאוששות.\n\nרוצה לנסות תרגיל 4-7-8? נשיפה עמוקה, שאיפה 4 שניות, החזקה 7, נשיפה 8 - חוזרים 4 מחזורים. זה מפעיל את מערכת העצבים הפאראסימפתטית ומרגיע תוך דקה.\n\nמה מהמצב הזה הכי מציף כרגע?`
  }

  // sleep
  if (/שינה|לישון|ער|עייף/.test(text)) {
    const sleepCtx = avgSleep < 6.5 ? `ראיתי שהממוצע השבועי שלך הוא ${avgSleep.toFixed(1)}ש׳ - זה באמת נמוך. ` : ''
    return `${sleepCtx}שינה איכותית היא הכלי המנטלי החזק ביותר.\n\nכמה דברים שעוזרים: לכבות מסכים 30 דק׳ לפני שינה, לישון בחדר קריר וחשוך, ולנסות "brain dump" - לכתוב הכל שעל הראש לפני שינה כדי שהמוח לא ירוץ.\n\nמה מפריע לך להירדם - מחשבות, אי-שקט פיזי, או משהו אחר?`
  }

  // rumination / stuck thought
  if (/מחשבה|לא עוזב|תקוע|חוזר לי|רומינציה/.test(text)) {
    return `זו רומינציה - מחשבה שחוזרת בלולאה. המוח מנסה "לפתור" אבל מסתובב במקום.\n\nכלי CBT שעוזר: שאל את עצמך 3 שאלות על המחשבה:\n1. איזה עדות יש שהיא נכונה?\n2. איזה עדות יש שהיא לא לגמרי מדויקת?\n3. איך היית מייעץ לחבר טוב במצב הזה?\n\nרוצה לנסות עם המחשבה הספציפית שלך?`
  }

  // stuck / not progressing
  if (/לא מתקדם|תקוע|פלטו|לא רואה שינוי/.test(text)) {
    return `התחושה הזו של "לא זז" מתסכלת - במיוחד כשמשקיעים.\n\nכמה דברים חשוב לזכור:\n• פרוגרסיה לא ליניארית - יש רמות\n• הגוף משתפר לעיתים מתחת לפני השטח לפני שרואים\n• יעדים גדולים מדי מרגישים רחוקים - שווה לפרק לצעד השבוע\n\nמה יעד הצעד הזעיר הבא שכן בשליטתך? למשל: להשלים 3 אימונים השבוע, לרשום כל ארוחה יום אחד.`
  }

  // consistency / motivation
  if (/עקבי|מוטיבציה|התמדה|לא מתמיד/.test(text)) {
    return `עקביות > עוצמה. תמיד.\n\nחוכמה: מוטיבציה מגיעה אחרי הפעולה, לא לפניה. כשמחכים ל"תחושה הנכונה" - היא לא מגיעה.\n\nהמלצה: כלל 2 הדקות. תגיד "אני רק אעשה 2 דקות" - ותופתע כמה פעמים תמשיך.\n\nמה ההרגל שהכי קשה לך לשמור עליו?`
  }

  // gratitude
  if (/תודה|אסיר|כרת|טוב לי/.test(text)) {
    return `זה תרגול עוצמתי - הוכח שמעלה רמות אושר תוך שבועיים.\n\nאתגר קטן: כל ערב, רשום 3 דברים ספציפיים שאתה אסיר תודה עליהם היום. לא כלליים ("בריאות") אלא ספציפיים ("השיחה עם דנה בצהריים").\n\nמה 3 הדברים של היום?`
  }

  // sad / down
  if (/עצוב|רע|מדוכא|מבאס|לא טוב/.test(text)) {
    const moodCtx = last && last.mood < 5 ? `ראיתי שגם ב-check-in האחרון סימנת ${last.mood}/10. ` : ''
    return `${moodCtx}תודה שאתה משתף - זה לא פשוט.\n\nיש ימים שהמצב-רוח נמוך פשוט. חשוב לזכור: זה זמני, גם אם עכשיו לא מרגיש כך.\n\n3 דברים שמוכחים לעזור מיידית:\n• תנועה - אפילו 10 דקות של הליכה\n• אור טבעי - 15 דק׳ מחוץ\n• קשר אנושי - שיחה קצרה עם מישהו קרוב\n\nמה מבין השלושה הכי בהישג יד עכשיו?`
  }

  // anger / frustration
  if (/כועס|רוגז|עצבנות|מתעצבן/.test(text)) {
    return `כעס זו אנרגיה - השאלה איך מנתבים אותה.\n\nתרגיל: קח את הכעס ותכתוב במשך 5 דקות בלי לעצור - כל מה שיוצא. אל תסנן. אחרי זה תגלה שלרוב מתחת לכעס יש רגש אחר: פחד, אכזבה, בושה, חוסר-אונים.\n\nמה לדעתך מסתתר מתחת לכעס הזה?`
  }

  // fallback - reflection prompt
  const reflections = [
    'שיתפת דבר חשוב. איך זה מרגיש בגוף כשאתה חושב על זה?',
    'מעניין. מה הצעד הראשון הקטן שהיה מזיז אותך קדימה בנושא?',
    'ספר לי עוד. מה הדבר שהכי היית רוצה שיהיה שונה?',
    'אני שומע. מתי לאחרונה הרגשת אחרת בנושא הזה?',
    'שווה להתעכב על זה. מה מהאמירה שלך מרגיש לך הכי אמיתי?',
  ]
  return reflections[Math.floor(Math.random() * reflections.length)]
}
