import React, { useState, useEffect } from 'react'
import { t } from '../../theme/tokens'
import { useAuth, ADMIN_EMAILS } from '../../auth/AuthContext'
import { Button, Card, Input, Badge } from '../../components/ui/UI'
import { storage } from '../../utils/storage'

// Login is 2-mode:
//   1. Enter email + name → login (role auto-detected: admin/coach/member)
//   2. If email is not admin/coach whitelist → member; offer "אני מאמן" flow
//      that submits a request (stored locally as pending) - admin then invites
//      via the admin panel using their real email.

export function LoginScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState('login') // login | coach-request | coach-pending
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Coach request form
  const [specialty, setSpecialty] = useState('')
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')
  const [requestSent, setRequestSent] = useState(false)

  const normalizedEmail = (email || '').trim().toLowerCase()
  const emailIsAdmin = ADMIN_EMAILS.includes(normalizedEmail)
  const emailIsCoach = ((storage.get('coach-whitelist') || []).includes(normalizedEmail))

  const submit = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)
    try { await login(email, name) }
    catch (err) { setError(err.message || 'שגיאה בכניסה') }
    finally { setBusy(false) }
  }

  const submitCoachRequest = () => {
    if (!email || !name || !specialty) {
      setError('שם, מייל, ותחום התמחות חובה')
      return
    }
    const requests = storage.get('coach-requests') || []
    const req = {
      email: normalizedEmail, name, specialty, experience, phone,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    }
    if (!requests.find(r => r.email === normalizedEmail)) {
      storage.set('coach-requests', [req, ...requests])
    }
    setRequestSent(true)
    setStep('coach-pending')
  }

  return (
    <div style={{
      minHeight: '100vh', background: t.color.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: t.space.lg, direction: 'rtl', color: t.color.text,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60%', height: '80%',
        background: `radial-gradient(closest-side, ${t.color.goldGlow} 0%, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <Card style={{ maxWidth: 480, width: '100%', padding: 40, position: 'relative', zIndex: 1 }} glow>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14, background: t.color.gold,
            color: '#0d0d14', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 26, marginBottom: 14, boxShadow: t.shadow.glow,
          }}>H</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: t.color.gold, fontFamily: 'Space Mono, monospace', marginBottom: 6 }}>
            HOLISTIC FITNESS OS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.02 }}>
            {step === 'login' && 'ברוכים הבאים'}
            {step === 'coach-request' && 'הרשמה כמאמן'}
            {step === 'coach-pending' && 'הבקשה נשלחה'}
          </h1>
        </div>

        {step === 'login' && (
          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <Input label="שם" placeholder="ישראל ישראלי" value={name} onChange={e => setName(e.target.value)} autoComplete="name" autoFocus />
            <Input label="מייל" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required error={error} />

            {normalizedEmail && (
              <div style={{
                padding: 12, borderRadius: t.radius.sm, fontSize: t.font.xs, textAlign: 'center',
                background: emailIsAdmin ? t.color.goldGlow : emailIsCoach ? '#5a9be015' : t.color.bgSoft,
                border: `1px solid ${emailIsAdmin ? t.color.gold : emailIsCoach ? t.color.info : t.color.border}`,
                color: emailIsAdmin ? t.color.gold : emailIsCoach ? t.color.info : t.color.textDim,
              }}>
                {emailIsAdmin && '🎯 מייל של מנהל - תיכנס לקונסולת אדמין'}
                {!emailIsAdmin && emailIsCoach && '👨‍🏫 מייל של מאמן מאושר - תיכנס לתצוגת מאמן'}
                {!emailIsAdmin && !emailIsCoach && '👤 תיכנס כמתאמן - חוויית האפליקציה המלאה'}
              </div>
            )}

            <Button type="submit" size="lg" disabled={busy || !email || !name} style={{ marginTop: 4 }}>
              {busy ? 'נכנס...' : 'היכנס לפיילוט'}
            </Button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button type="button" onClick={() => setStep('coach-request')} style={{
                background: 'none', border: 'none', color: t.color.gold, cursor: 'pointer',
                fontSize: t.font.sm, textDecoration: 'underline', fontFamily: 'inherit',
              }}>אני מאמן - רוצה להירשם ולקבל אישור ←</button>
            </div>
          </form>
        )}

        {step === 'coach-request' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, textAlign: 'center', marginBottom: 4 }}>
              מלא/י פרטים - המנהל יבדוק ויאשר בהקדם
            </div>
            <Input label="שם מלא" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="מייל" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="טלפון" value={phone} onChange={e => setPhone(e.target.value)} placeholder="050-1234567" />
            <Input label="תחום התמחות" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="לדוגמה: כוח והיפרטרופיה" required />
            <Input label="שנות ניסיון" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="5" />
            {error && <div style={{ color: t.color.danger, fontSize: t.font.xs, textAlign: 'center' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setStep('login')} style={{ flex: 1 }}>→ חזור</Button>
              <Button onClick={submitCoachRequest} style={{ flex: 2 }}>שלח בקשה</Button>
            </div>
          </div>
        )}

        {step === 'coach-pending' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: t.color.gold, color: '#0d0d14',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              marginBottom: 16, boxShadow: t.shadow.glow,
            }}>✓</div>
            <div style={{ marginBottom: 10, fontSize: t.font.md, color: t.color.text, lineHeight: 1.6 }}>
              בקשתך נשלחה למנהל.<br />
              ברגע שתאושר, תקבל קישור אישי לגשת כמאמן.
            </div>
            <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.xs, color: t.color.textDim, textAlign: 'right', marginBottom: 16 }}>
              📧 <b>{email}</b><br />
              🎯 {specialty}<br />
              {phone && <>📱 {phone}<br /></>}
              המנהל יראה את הבקשה בקונסולת האדמין ויאשר.
            </div>
            <Button variant="outline" onClick={() => setStep('login')}>חזור למסך הכניסה</Button>
          </div>
        )}

        <div style={{
          marginTop: 24, padding: 12, background: t.color.bgSoft,
          borderRadius: t.radius.md, fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.5, textAlign: 'center',
        }}>
          🔒 הפיילוט שומר הכל מקומית במכשיר - אין סיסמאות
        </div>
      </Card>
    </div>
  )
}
