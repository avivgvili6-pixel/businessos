import React, { useState, useEffect } from 'react'
import { t } from '../../theme/tokens'
import { useAuth, ADMIN_EMAILS } from '../../auth/AuthContext'
import { Button, Card, Input, Badge } from '../../components/ui/UI'
import { storage } from '../../utils/storage'

// 3-step login flow:
//   1. chooser: 'existing' or 'new'
//   2. login-form: email (+ name if new) → send magic link
//   3. link-sent: confirmation
// Also: coach-request / coach-pending side branch.
// Remembers last email in localStorage so returning users get pre-filled.

const LAST_EMAIL_KEY = 'hfos:last_email'
const LAST_NAME_KEY = 'hfos:last_name'

export function LoginScreen() {
  const { login, supabaseEnabled } = useAuth()

  // Auto-pick 'existing' if we have a remembered email
  const rememberedEmail = storage.get(LAST_EMAIL_KEY) || ''
  const rememberedName = storage.get(LAST_NAME_KEY) || ''
  const [step, setStep] = useState(rememberedEmail ? 'existing' : 'chooser')
  const [email, setEmail] = useState(rememberedEmail)
  const [name, setName] = useState(rememberedName)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Coach request state
  const [specialty, setSpecialty] = useState('')
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')

  const normalizedEmail = (email || '').trim().toLowerCase()
  const emailIsAdmin = ADMIN_EMAILS.includes(normalizedEmail)
  const emailIsCoach = ((storage.get('coach-whitelist') || []).includes(normalizedEmail))

  const submit = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)

    // Client-side validation (bypass browser's native to avoid `{}` artifacts)
    const em = (email || '').trim().toLowerCase()
    if (!em || !em.includes('@') || !em.includes('.')) {
      setError('כתובת מייל לא תקינה')
      setBusy(false)
      return
    }

    try {
      const result = await login(em, name || em.split('@')[0])
      if (em) storage.set(LAST_EMAIL_KEY, em)
      if (name) storage.set(LAST_NAME_KEY, name)
      if (result?.magicLinkSent) setStep('link-sent')
    } catch (err) {
      // Normalize any error to a clean Hebrew string. Never trust raw err.message
      // (Supabase / fetch failures can return "{}" or object-like text).
      console.error('[Login] submit failed:', err)
      const raw = err?.message ?? ''
      const msg = raw && typeof raw === 'string' && !raw.match(/^[\{\[\]\}]+$/)
        ? raw
        : 'לא הצלחנו לשלוח את הקישור. נסה שוב או בדוק את החיבור לאינטרנט.'
      setError(msg)
    } finally {
      setBusy(false)
    }
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
    setStep('coach-pending')
  }

  const forgetMe = () => {
    storage.remove(LAST_EMAIL_KEY)
    storage.remove(LAST_NAME_KEY)
    setEmail(''); setName(''); setStep('chooser')
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

      <Card style={{ maxWidth: 480, width: '100%', padding: 'clamp(20px, 5vw, 32px)', position: 'relative', zIndex: 1 }} glow>
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14, background: t.color.gold,
            color: '#0d0d14', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 26, marginBottom: 14, boxShadow: t.shadow.glow,
          }}>H</div>
          <div style={{ fontSize: 11, letterSpacing: 2, color: t.color.gold, fontFamily: 'Space Mono, monospace', marginBottom: 6 }}>
            HOLISTIC FITNESS OS
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.02 }}>
            {step === 'chooser' && 'ברוכים הבאים'}
            {step === 'existing' && 'שמח לראות אותך שוב 👋'}
            {step === 'new' && 'בואי נכיר ✨'}
            {step === 'link-sent' && 'קישור נשלח למייל'}
            {step === 'coach-request' && 'הרשמה כמאמן'}
            {step === 'coach-pending' && 'הבקשה נשלחה'}
          </h1>
        </div>

        {/* CHOOSER: existing vs new */}
        {step === 'chooser' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => setStep('existing')} style={choiceCard(t, false)}>
              <div style={{ fontSize: 40 }}>👋</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 2 }}>משתמש קיים</div>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>יש לי כבר חשבון — שלח קישור למייל</div>
              </div>
            </button>

            <button onClick={() => setStep('new')} style={choiceCard(t, true)}>
              <div style={{ fontSize: 40 }}>✨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 2, color: t.color.gold }}>משתמש חדש</div>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>פעם ראשונה — אני נרשם/ת</div>
              </div>
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={() => setStep('coach-request')} style={{
                background: 'none', border: 'none', color: t.color.gold, cursor: 'pointer',
                fontSize: t.font.sm, textDecoration: 'underline', fontFamily: 'inherit',
              }}>אני מאמן/ת — בקשת הצטרפות ←</button>
            </div>
          </div>
        )}

        {/* EXISTING USER: email only */}
        {step === 'existing' && (
          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
            <Input
              label="מייל"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
              error={error ? String(error) : ''}
            />

            {normalizedEmail && emailIsAdmin && (
              <div style={{
                padding: 10, borderRadius: t.radius.sm, fontSize: t.font.xs, textAlign: 'center',
                background: t.color.goldGlow,
                border: `1px solid ${t.color.gold}`,
                color: t.color.gold,
              }}>
                🎯 מייל של מנהל · קונסולת אדמין
              </div>
            )}

            <Button type="submit" size="lg" disabled={busy || !email} style={{ marginTop: 4 }}>
              {busy ? 'שולח...' : '✉️ שלח לי קישור כניסה'}
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <button type="button" onClick={() => setStep('chooser')} style={ghostBtn(t)}>→ חזור</button>
              {rememberedEmail && (
                <button type="button" onClick={forgetMe} style={ghostBtn(t)}>שכח אותי</button>
              )}
            </div>
          </form>
        )}

        {/* NEW USER: name + email */}
        {step === 'new' && (
          <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
            <Input label="איך קוראים לך?" placeholder="ישראל ישראלי" value={name} onChange={e => setName(e.target.value)} autoComplete="name" autoFocus />
            <Input label="מייל" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" error={error ? String(error) : ''} />

            {normalizedEmail && emailIsAdmin && (
              <div style={{
                padding: 10, borderRadius: t.radius.sm, fontSize: t.font.xs, textAlign: 'center',
                background: t.color.goldGlow, border: `1px solid ${t.color.gold}`,
                color: t.color.gold,
              }}>
                🎯 מייל של מנהל · תיכנס לקונסולת אדמין
              </div>
            )}

            <Button type="submit" size="lg" disabled={busy || !email || !name} style={{ marginTop: 4 }}>
              {busy ? 'שולח...' : '✨ צור לי חשבון'}
            </Button>

            <button type="button" onClick={() => setStep('chooser')} style={{ ...ghostBtn(t), textAlign: 'right', margin: '4px 0 0' }}>→ חזור</button>
          </form>
        )}

        {/* LINK SENT confirmation */}
        {step === 'link-sent' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: t.color.gold, color: '#0d0d14',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              marginBottom: 16, boxShadow: t.shadow.glow,
            }}>✉️</div>
            <div style={{ marginBottom: 16, fontSize: t.font.md, color: t.color.text, lineHeight: 1.6 }}>
              שלחנו קישור כניסה למייל:<br />
              <b style={{ color: t.color.gold }}>{email}</b>
            </div>
            <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.7, marginBottom: 16 }}>
              📧 פתח את המייל ולחץ "כניסה" — יעביר אותך אוטומטית לאפליקציה.
              <br /><br />
              💡 לא רואה? בדוק בספאם/קידום מכירות. הקישור פעיל שעה.
            </div>
            <Button variant="ghost" onClick={() => { setStep('chooser'); setError('') }}>← מייל אחר</Button>
          </div>
        )}

        {/* COACH REQUEST */}
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
              <Button variant="ghost" onClick={() => setStep('chooser')} style={{ flex: 1 }}>→ חזור</Button>
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
            </div>
            <Button variant="outline" onClick={() => setStep('chooser')}>חזור למסך הכניסה</Button>
          </div>
        )}

        <div style={{
          marginTop: 24, padding: 12, background: t.color.bgSoft,
          borderRadius: t.radius.md, fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.5, textAlign: 'center',
        }}>
          {supabaseEnabled
            ? '🔒 כניסה עם קישור למייל · ללא סיסמאות · הנתונים בענן ומסונכרנים בין מכשירים'
            : '🔒 הפיילוט שומר הכל מקומית במכשיר - אין סיסמאות'}
        </div>
      </Card>
    </div>
  )
}

function choiceCard(t, gold) {
  return {
    display: 'flex', gap: 14, alignItems: 'center', textAlign: 'right',
    padding: 20,
    background: gold ? t.color.goldGlow : t.color.bgSoft,
    border: `1px solid ${gold ? t.color.gold : t.color.border}`,
    borderRadius: t.radius.md,
    cursor: 'pointer', fontFamily: 'inherit',
    color: t.color.text, transition: 'transform .15s',
  }
}
function ghostBtn(t) {
  return {
    background: 'none', border: 'none', color: t.color.textDim,
    fontSize: t.font.xs, cursor: 'pointer', fontFamily: 'inherit',
    textDecoration: 'underline',
  }
}
