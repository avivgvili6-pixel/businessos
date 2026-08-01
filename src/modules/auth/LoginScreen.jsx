import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { useAuth, ADMIN_EMAILS } from '../../auth/AuthContext'
import { Button, Card, Input } from '../../components/ui/UI'
import { storage } from '../../utils/storage'
import { useI18n } from '../../i18n/i18n'

// Password-based login flow (magic-link removed for a faster experience):
//   1. chooser: 'existing' or 'new' or coach-request
//   2. existing: email + password → sign in
//   3. new: name + email + password → sign up
// Remembers last email so returning users get pre-filled.

const LAST_EMAIL_KEY = 'hfos:last_email'
const LAST_NAME_KEY = 'hfos:last_name'

export function LoginScreen() {
  const {
    loginWithPassword, signupWithPassword, sendPasswordReset,
    updatePassword, passwordRecovery, supabaseEnabled,
  } = useAuth()
  const { lang, setLang, t: tr, isRTL } = useI18n()

  const rememberedEmail = storage.get(LAST_EMAIL_KEY) || ''
  const rememberedName = storage.get(LAST_NAME_KEY) || ''
  // If landed from a reset-password email, jump straight to the reset form.
  const initialStep = passwordRecovery ? 'reset-password' : (rememberedEmail ? 'existing' : 'chooser')
  const [step, setStep] = useState(initialStep)
  const [email, setEmail] = useState(rememberedEmail)
  const [name, setName] = useState(rememberedName)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // If passwordRecovery arrives late (event fires after mount), switch view.
  React.useEffect(() => {
    if (passwordRecovery) setStep('reset-password')
  }, [passwordRecovery])

  // Coach request state
  const [specialty, setSpecialty] = useState('')
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')

  const normalizedEmail = (email || '').trim().toLowerCase()
  const emailIsAdmin = ADMIN_EMAILS.includes(normalizedEmail)

  const humanizeError = (err) => {
    console.error('[Login] error:', {
      message: err?.message, code: err?.code, status: err?.status, name: err?.name,
    })
    const raw = typeof err?.message === 'string' ? err.message : ''
    const status = err?.status
    const code = err?.code || err?.name

    if (/invalid.?login|invalid.?credentials|invalid_grant/i.test(raw) || code === 'invalid_credentials') {
      return '🔐 מייל או סיסמה שגויים. נסה שוב.'
    }
    if (/user.?not.?found|no.?user.?found/i.test(raw)) {
      return '👤 לא נמצא משתמש עם המייל הזה. אולי צריך להירשם קודם?'
    }
    if (/user.?already.?registered|already.?exists/i.test(raw) || code === 'user_already_exists') {
      return '👋 המייל הזה כבר רשום. תנסה להיכנס במקום.'
    }
    if (/password.?should.?be.?at.?least|weak.?password/i.test(raw)) {
      return '🔒 סיסמה חלשה מדי. לפחות 6 תווים, עדיף עם ספרות ואותיות.'
    }
    if (/email.?not.?confirmed/i.test(raw)) {
      return '✉️ המייל שלך לא אושר. פנה למנהל לכיבוי אישור מייל בהגדרות.'
    }
    if (status === 429 || /rate.?limit|too many/i.test(raw)) {
      return '⏱️ יותר מדי ניסיונות. המתן דקה ונסה שוב.'
    }
    if (/failed to fetch|networkerror|connection/i.test(raw) || code === 'NETWORK') {
      return '📶 בעיית חיבור לאינטרנט. בדוק חיבור ונסה שוב.'
    }
    if (raw && !/^[\{\[\]\}]+$/.test(raw.trim())) {
      return code ? `${raw} (${code})` : raw
    }
    return 'משהו השתבש. נסה שוב עוד רגע.'
  }

  const submitLogin = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)
    try {
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setError('כתובת מייל לא תקינה'); setBusy(false); return
      }
      if (!password || password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים'); setBusy(false); return
      }
      await loginWithPassword(normalizedEmail, password)
      storage.set(LAST_EMAIL_KEY, normalizedEmail)
      // AuthProvider's onAuthStateChange will set user + trigger app render
    } catch (err) {
      setError(humanizeError(err))
    } finally { setBusy(false) }
  }

  const submitSignup = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)
    try {
      if (!name?.trim()) { setError('חסר שם'); setBusy(false); return }
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setError('כתובת מייל לא תקינה'); setBusy(false); return
      }
      if (!password || password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים'); setBusy(false); return
      }
      const result = await signupWithPassword(normalizedEmail, password, name)
      storage.set(LAST_EMAIL_KEY, normalizedEmail)
      storage.set(LAST_NAME_KEY, name)
      if (result?.needsConfirmation) {
        // Supabase created the account but requires email confirmation before session.
        // Tell the user + offer to try immediate login (works if admin later disables confirmation).
        setError('נרשמת בהצלחה! מנהל המערכת צריך לאשר את חשבונך. פנה: israelgrip@gmail.com')
      }
      // Otherwise onAuthStateChange handles the transition.
    } catch (err) {
      setError(humanizeError(err))
    } finally { setBusy(false) }
  }

  const submitForgot = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)
    try {
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setError('כתובת מייל לא תקינה'); setBusy(false); return
      }
      await sendPasswordReset(normalizedEmail)
      storage.set(LAST_EMAIL_KEY, normalizedEmail)
      setStep('forgot-sent')
    } catch (err) {
      setError(humanizeError(err))
    } finally { setBusy(false) }
  }

  const submitNewPassword = async (e) => {
    e?.preventDefault?.()
    setError(''); setBusy(true)
    try {
      if (!password || password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים'); setBusy(false); return
      }
      await updatePassword(password)
      // updatePassword clears passwordRecovery → App will detect logged-in user
      // and auto-navigate to the home screen. Nothing else to do here.
    } catch (err) {
      setError(humanizeError(err))
    } finally { setBusy(false) }
  }

  const submitCoachRequest = () => {
    if (!email || !name || !specialty) { setError('שם, מייל, ותחום התמחות חובה'); return }
    const requests = storage.get('coach-requests') || []
    const req = {
      email: normalizedEmail, name, specialty, experience, phone,
      requestedAt: new Date().toISOString(), status: 'pending',
    }
    if (!requests.find(r => r.email === normalizedEmail)) {
      storage.set('coach-requests', [req, ...requests])
    }
    setStep('coach-pending')
  }

  const forgetMe = () => {
    storage.remove(LAST_EMAIL_KEY); storage.remove(LAST_NAME_KEY)
    setEmail(''); setName(''); setPassword(''); setStep('chooser')
  }

  return (
    <div style={{
      minHeight: '100vh', background: t.color.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: t.space.lg, direction: isRTL ? 'rtl' : 'ltr', color: t.color.text,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '60%', height: '80%',
        background: `radial-gradient(closest-side, ${t.color.goldGlow} 0%, transparent 70%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Language switcher — pinned top-right (in RTL: left side visually) */}
      <div style={{
        position: 'absolute', top: 16,
        [isRTL ? 'left' : 'right']: 16,
        zIndex: 2, display: 'flex', background: t.color.bgSoft,
        borderRadius: t.radius.pill, padding: 3, gap: 2,
        border: `1px solid ${t.color.border}`,
      }}>
        {['he', 'en'].map(l => {
          const active = lang === l
          return (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '6px 14px', borderRadius: t.radius.pill,
              background: active ? t.color.gold : 'transparent',
              color: active ? '#0d0d14' : t.color.textDim,
              border: 'none', fontFamily: 'inherit', fontWeight: 700, fontSize: t.font.xs,
              cursor: 'pointer', letterSpacing: 0.5,
            }}>{l === 'he' ? '🇮🇱 עברית' : '🇺🇸 English'}</button>
          )
        })}
      </div>

      <Card style={{ maxWidth: 480, width: '100%', padding: 'clamp(20px, 5vw, 32px)', position: 'relative', zIndex: 1 }} glow>
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
            {step === 'chooser' && tr('login.welcome')}
            {step === 'existing' && tr('login.welcome_back')}
            {step === 'new' && tr('login.new_user_title')}
            {step === 'forgot' && tr('login.forgot_title')}
            {step === 'forgot-sent' && tr('login.forgot_sent_title')}
            {step === 'reset-password' && tr('login.reset_title')}
            {step === 'coach-request' && (isRTL ? 'הרשמה כמאמן' : 'Coach signup')}
            {step === 'coach-pending' && (isRTL ? 'הבקשה נשלחה' : 'Request sent')}
          </h1>
        </div>

        {/* CHOOSER */}
        {step === 'chooser' && (
          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => setStep('existing')} style={choiceCard(t, false)}>
              <div style={{ fontSize: 40 }}>👋</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 2 }}>{tr('login.existing_user')}</div>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>{tr('login.existing_desc')}</div>
              </div>
            </button>

            <button onClick={() => setStep('new')} style={choiceCard(t, true)}>
              <div style={{ fontSize: 40 }}>✨</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 2, color: t.color.gold }}>{tr('login.new_user')}</div>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>{tr('login.new_desc')}</div>
              </div>
            </button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={() => setStep('coach-request')} style={{
                background: 'none', border: 'none', color: t.color.gold, cursor: 'pointer',
                fontSize: t.font.sm, textDecoration: 'underline', fontFamily: 'inherit',
              }}>{tr('login.coach_link')}</button>
            </div>
          </div>
        )}

        {/* EXISTING USER: email + password */}
        {step === 'existing' && (
          <form onSubmit={submitLogin} noValidate style={{ display: 'grid', gap: 14 }}>
            <Input
              label={tr('login.email')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus={!rememberedEmail}
              required
            />
            <div>
              <Input
                label={tr('login.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={tr('login.password_placeholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus={!!rememberedEmail}
                required
                error={error ? String(error) : ''}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={showPwBtn(t)}>
                {showPassword ? tr('login.hide_password') : tr('login.show_password')}
              </button>
            </div>

            {normalizedEmail && emailIsAdmin && (
              <div style={adminBadge(t)}>{tr('login.admin_badge')}</div>
            )}

            <Button type="submit" size="lg" disabled={busy || !email || !password} style={{ marginTop: 4 }}>
              {busy ? tr('login.entering') : tr('login.enter')}
            </Button>

            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <button type="button" onClick={() => { setError(''); setPassword(''); setStep('forgot') }}
                style={{ ...ghostBtn(t), color: t.color.gold, fontSize: t.font.sm }}>
                {tr('login.forgot_link')}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <button type="button" onClick={() => setStep('chooser')} style={ghostBtn(t)}>{tr('login.back')}</button>
              {rememberedEmail && (
                <button type="button" onClick={forgetMe} style={ghostBtn(t)}>{tr('login.forget_me')}</button>
              )}
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD: email only → send reset link */}
        {step === 'forgot' && (
          <form onSubmit={submitForgot} noValidate style={{ display: 'grid', gap: 14 }}>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, textAlign: 'center', marginBottom: 4, lineHeight: 1.6 }}>
              נשלח למייל שלך קישור לאיפוס.<br />
              <b style={{ color: t.color.text }}>גם אם עוד לא יצרת סיסמה</b> — זה יאפשר לך לקבוע אחת עכשיו.
            </div>
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
            <Button type="submit" size="lg" disabled={busy || !email} style={{ marginTop: 4 }}>
              {busy ? 'שולח...' : '✉️ שלח לי קישור איפוס'}
            </Button>
            <button type="button" onClick={() => { setError(''); setStep('existing') }} style={{ ...ghostBtn(t), textAlign: 'center' }}>
              → חזור לכניסה
            </button>
          </form>
        )}

        {/* FORGOT SENT confirmation */}
        {step === 'forgot-sent' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: t.color.gold, color: '#0d0d14',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              marginBottom: 16, boxShadow: t.shadow.glow,
            }}>✉️</div>
            <div style={{ marginBottom: 16, fontSize: t.font.md, color: t.color.text, lineHeight: 1.6 }}>
              שלחנו קישור איפוס למייל:<br />
              <b style={{ color: t.color.gold }}>{email}</b>
            </div>
            <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.7, marginBottom: 16 }}>
              📧 פתח את המייל ולחץ על הקישור — תועבר לאפליקציה לקבוע סיסמה חדשה.
              <br /><br />
              💡 לא רואה? בדוק בספאם. הקישור פעיל שעה.
            </div>
            <Button variant="ghost" onClick={() => { setStep('existing'); setError('') }}>← חזור לכניסה</Button>
          </div>
        )}

        {/* RESET PASSWORD: user landed from email reset link */}
        {step === 'reset-password' && (
          <form onSubmit={submitNewPassword} noValidate style={{ display: 'grid', gap: 14 }}>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, textAlign: 'center', marginBottom: 4, lineHeight: 1.6 }}>
              קבעת/י סיסמה חדשה לחשבון שלך.<br />
              <b style={{ color: t.color.text }}>שמור/י אותה — היא תשמש לכניסות הבאות.</b>
            </div>
            <div>
              <Input
                label="סיסמה חדשה"
                type={showPassword ? 'text' : 'password'}
                placeholder="לפחות 6 תווים"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                error={error ? String(error) : ''}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={showPwBtn(t)}>
                {showPassword ? '🙈 הסתר' : '👁 הצג סיסמה'}
              </button>
            </div>
            <Button type="submit" size="lg" disabled={busy || !password} style={{ marginTop: 4 }}>
              {busy ? 'שומר...' : '✓ קבע סיסמה והיכנס'}
            </Button>
          </form>
        )}

        {/* NEW USER: name + email + password */}
        {step === 'new' && (
          <form onSubmit={submitSignup} noValidate style={{ display: 'grid', gap: 14 }}>
            <Input label={tr('login.name')} placeholder={tr('login.name_placeholder')} value={name} onChange={e => setName(e.target.value)} autoComplete="name" autoFocus />
            <Input label={tr('login.email')} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <div>
              <Input
                label={tr('login.new_password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={tr('login.new_password_placeholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                error={error ? String(error) : ''}
                hint={tr('login.password_hint')}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={showPwBtn(t)}>
                {showPassword ? tr('login.hide_password') : tr('login.show_password')}
              </button>
            </div>

            {normalizedEmail && emailIsAdmin && (
              <div style={adminBadge(t)}>{tr('login.admin_badge')}</div>
            )}

            <Button type="submit" size="lg" disabled={busy || !email || !name || !password} style={{ marginTop: 4 }}>
              {busy ? tr('login.creating') : tr('login.create_account')}
            </Button>

            <button type="button" onClick={() => setStep('chooser')} style={{ ...ghostBtn(t), textAlign: isRTL ? 'right' : 'left', margin: '4px 0 0' }}>{tr('login.back')}</button>
          </form>
        )}

        {/* COACH REQUEST (unchanged) */}
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
          {supabaseEnabled ? tr('login.footer_supabase') : tr('login.footer_local')}
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
function showPwBtn(t) {
  return {
    background: 'none', border: 'none', color: t.color.textDim,
    fontSize: t.font.xs, cursor: 'pointer', fontFamily: 'inherit',
    padding: '6px 2px 0', textDecoration: 'underline',
  }
}
function adminBadge(t) {
  return {
    padding: 10, borderRadius: t.radius.sm, fontSize: t.font.xs, textAlign: 'center',
    background: t.color.goldGlow, border: `1px solid ${t.color.gold}`, color: t.color.gold,
  }
}
