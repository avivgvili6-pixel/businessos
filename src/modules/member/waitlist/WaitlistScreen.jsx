import React, { useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { useAuth } from '../../../auth/AuthContext'
import { Button, Card } from '../../../components/ui/UI'

// Full-screen block for members whose profile.status = 'waitlisted'.
// Instead of a position number (which can feel discouraging), we show
// a rotating motivational line — one per day per user.

const MOTIVATIONAL_QUOTES = [
  'המשמעת מנצחת את המוטיבציה — כל יום, כל פעם.',
  'הגוף שלך יכול להשיג כמעט הכל. זה המוח שצריך שכנוע.',
  'הצעד הראשון הוא תמיד הכי כבד. אתה כבר עברת אותו.',
  'התקדמות היא לא לינארית — אבל היא בלתי־נמנעת אם לא עוצרים.',
  'שנת אחת של אימונים עקביים משנה חיים. שלוש שנים משנה זהות.',
  'אין קיצורי דרך למקום ששווה להגיע אליו.',
  'המתחרה היחיד שלך הוא זה שהיית אתמול.',
  'החוזק לא מגיע ממה שאתה יכול לעשות. הוא מגיע מלהתגבר על מה שחשבת שאתה לא יכול.',
  'כל אימון שאתה עושה זה הצבעה בעד האדם שאתה רוצה להיות.',
  'עקביות > עוצמה. תמיד.',
  'לא צריך להיות מושלם — צריך רק להיות עקבי.',
  'הכאב של המשמעת כואב פעם. הכאב של החרטה כואב לנצח.',
  'תתחיל איפה שאתה. תשתמש במה שיש לך. תעשה מה שאתה יכול.',
  'הכי חשוב זה לא לפחד ליפול, אלא לקום כל פעם מחדש.',
]

// Pick a stable-per-day quote so the message doesn't flicker on refresh.
function useDailyQuote(seed) {
  return useMemo(() => {
    const day = Math.floor(Date.now() / 86400000)
    const key = (String(seed || '') + day)
      .split('')
      .reduce((sum, c) => sum + c.charCodeAt(0), 0)
    return MOTIVATIONAL_QUOTES[key % MOTIVATIONAL_QUOTES.length]
  }, [seed])
}

export function WaitlistScreen() {
  const { logout, user } = useAuth()
  const quote = useDailyQuote(user?.email)

  return (
    <div style={{
      minHeight: '100vh', background: t.color.bg,
      display: 'grid', placeItems: 'center', padding: 20,
      direction: 'rtl', color: t.color.text,
    }}>
      <Card style={{
        maxWidth: 560, width: '100%', padding: '40px 32px',
        background: `linear-gradient(160deg, rgba(199,64,80,0.06), ${t.color.bgElevated} 60%)`,
        border: `1px solid ${t.color.border}`,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.32em',
          textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
          marginBottom: 20,
        }}>Selano · פיילוט סגור</div>

        {/* Motivational quote as the hero */}
        <blockquote style={{
          fontFamily: t.font.family.display,
          fontSize: 26, fontWeight: 700, lineHeight: 1.3,
          color: t.color.white, letterSpacing: '-0.015em',
          margin: '20px 0 24px', padding: '0 8px',
          textWrap: 'balance',
        }}>
          "{quote}"
        </blockquote>

        <div style={{
          width: 40, height: 2, background: t.color.wineLight,
          margin: '0 auto 24px', borderRadius: 2,
        }} />

        <h2 style={{
          fontFamily: t.font.family.display, fontSize: 20, fontWeight: 700,
          margin: '0 0 10px', color: t.color.white,
        }}>שלום {user?.name || ''}</h2>

        <p style={{
          fontSize: 14, lineHeight: 1.7, color: t.color.silver1,
          maxWidth: 420, margin: '0 auto 24px',
        }}>
          הפיילוט של Selano מוגבל למספר משתתפים ראשונים.
          <br />
          <b style={{ color: t.color.white }}>ברגע שיתפנה מקום — את/ה הבא/ה בתור.</b>
          <br />
          נשלח לך אימייל ל־<span style={{ color: t.color.white }}>{user?.email}</span>.
        </p>

        <div style={{
          padding: 14, background: t.color.bgSoft,
          borderRadius: t.radius.md, marginBottom: 22,
          fontSize: 13, color: t.color.silver1, lineHeight: 1.6,
        }}>
          <b style={{ color: t.color.wineLight }}>אין צורך לעשות דבר</b> —
          כשמשוחרר מקום נשלח לך אימייל עם לינק להיכנס.
        </div>

        <Button
          variant="ghost"
          onClick={logout}
          style={{ width: '100%' }}
        >התנתקות</Button>
      </Card>
    </div>
  )
}
