import React from 'react'
import { t } from '../../../theme/tokens'
import { useAuth } from '../../../auth/AuthContext'
import { Button, Card } from '../../../components/ui/UI'

// Full-screen block for members whose profile.status = 'waitlisted'.
// The app is gated behind this screen until an admin releases them.

export function WaitlistScreen({ position }) {
  const { logout, user } = useAuth()
  return (
    <div style={{
      minHeight: '100vh', background: t.color.bg,
      display: 'grid', placeItems: 'center', padding: 20,
      direction: 'rtl', color: t.color.text,
    }}>
      <Card style={{
        maxWidth: 520, width: '100%', padding: 32,
        background: `linear-gradient(160deg, rgba(199,64,80,0.06), ${t.color.bgElevated} 60%)`,
        border: `1px solid ${t.color.border}`,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.32em',
          textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
          marginBottom: 14,
        }}>Selano · פיילוט סגור</div>

        <div style={{
          fontFamily: t.font.family.display,
          fontSize: 84, fontWeight: 800, lineHeight: 1,
          color: t.color.wineLight, letterSpacing: '-0.03em',
          textShadow: '0 0 40px rgba(199,64,80,0.35)',
          margin: '10px 0 6px',
        }}>#{position || '—'}</div>

        <div style={{
          fontSize: 12, color: t.color.silver2, letterSpacing: '0.14em',
          fontFamily: t.font.family.mono, marginBottom: 18,
          textTransform: 'uppercase',
        }}>ברשימת ההמתנה</div>

        <h1 style={{
          fontFamily: t.font.family.display, fontSize: 26, fontWeight: 700,
          margin: '0 0 12px', color: t.color.white, letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>שלום {user?.name || ''} — כרגע המקומות תפוסים</h1>

        <p style={{
          fontSize: 14, lineHeight: 1.7, color: t.color.silver1,
          maxWidth: 400, margin: '0 auto 20px',
        }}>
          הפיילוט של Selano מוגבל למספר משתתפים ראשונים.
          נשלח לך אימייל ל־<b style={{ color: t.color.white }}>{user?.email}</b> ברגע שהמקום שלך יתפנה — בדרך כלל תוך כמה ימים.
        </p>

        <div style={{
          padding: 14, background: t.color.bgSoft,
          borderRadius: t.radius.md, marginBottom: 18,
          fontSize: 13, color: t.color.silver1, lineHeight: 1.6,
        }}>
          <b style={{ color: t.color.wineLight }}>אין צורך לעשות דבר</b> —
          כשמשוחרר מקום נקבל לך אימייל עם לינק להיכנס.
          לא תאבד את מקומך ברשימה.
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
