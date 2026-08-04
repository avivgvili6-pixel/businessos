import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useAuth } from '../../../auth/AuthContext'
import { submitFeedback } from '../../../services/supabaseSync'
import { Card, Button } from '../../../components/ui/UI'

// דברו איתנו — single unified feedback page.
// Textbox with the framing question "מה הייתם משפרים?" + a WhatsApp CTA
// straight to the business line. Feedback is written to Supabase
// `member_feedback` when enabled, else queued in localStorage so nothing
// is lost. The admin reads it from the same table.

const WA_NUMBER_INTL = '972559579769' // 055-9579769 in international form
const WA_DISPLAY = '055-9579769'

export function Talk() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null) // 'sent' | 'saved' | 'error' | null

  const canSend = text.trim().length >= 3 && !sending

  const submit = async () => {
    if (!canSend) return
    setSending(true)
    setStatus(null)
    const res = await submitFeedback({ user, body: text })
    setSending(false)
    setStatus(res.ok ? 'sent' : 'saved')
    setText('')
    setTimeout(() => setStatus(null), 4200)
  }

  const waHref = `https://wa.me/${WA_NUMBER_INTL}?text=${encodeURIComponent('שלום, יש לי משהו לספר על Selano')}`

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
          color: t.color.wineLight, fontWeight: 700, textTransform: 'uppercase',
          marginBottom: 10,
        }}>דברו איתנו</div>
        <h1 style={{
          fontFamily: t.font.family.display,
          fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em',
          lineHeight: 1.08, color: t.color.white, margin: 0,
        }}>מה הייתם משפרים?</h1>
        <p style={{
          margin: '10px auto 0', maxWidth: 460, fontSize: 14, lineHeight: 1.6,
          color: t.color.silver1,
        }}>
          כל פידבק נקרא באופן אישי. תספרו מה עבד, מה חסר, ומה הייתם רוצים לראות אחרת.
        </p>
      </div>

      {/* Feedback form */}
      <Card style={{
        padding: 20,
        background: `linear-gradient(160deg, rgba(199,64,80,0.05) 0%, ${t.color.bgElevated} 60%)`,
        border: `1px solid ${text ? 'rgba(199,64,80,0.35)' : t.color.border}`,
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="כתבו כאן..."
          rows={7}
          autoFocus
          style={{
            width: '100%', padding: 16,
            background: t.color.bgSoft,
            border: `1px solid ${t.color.border}`,
            borderRadius: t.radius.md,
            color: t.color.text, fontFamily: 'inherit', fontSize: 15,
            lineHeight: 1.6, resize: 'vertical', outline: 'none',
            direction: 'rtl', transition: t.transition,
            boxSizing: 'border-box',
          }}
        />

        <div style={{
          display: 'flex', gap: 10, marginTop: 14,
          justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: t.font.family.mono, fontSize: 10,
            color: t.color.silver2, letterSpacing: '0.14em',
          }}>
            {text.trim().length > 0 && `${text.trim().length} תווים`}
          </div>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!canSend}
            style={{
              background: t.color.wineLight, color: t.color.white,
              border: `1px solid ${t.color.wineLight}`,
              opacity: canSend ? 1 : 0.55,
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            {sending ? 'שולח...' : 'שלח פידבק'}
          </Button>
        </div>

        {status && (
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(74,156,106,0.12)',
            border: '1px solid rgba(74,156,106,0.35)',
            borderRadius: t.radius.sm,
            fontSize: 13, color: '#7fce9a', textAlign: 'center',
          }}>
            {status === 'sent'
              ? 'תודה — הפידבק שלך נשלח.'
              : 'תודה — הפידבק נשמר ויסתנכרן ברגע שיש חיבור.'}
          </div>
        )}
      </Card>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        color: t.color.silver3, fontFamily: t.font.family.mono,
        fontSize: 10, letterSpacing: '0.32em',
      }}>
        <div style={{ flex: 1, height: 1, background: t.color.hairline }} />
        <span>או</span>
        <div style={{ flex: 1, height: 1, background: t.color.hairline }} />
      </div>

      {/* WhatsApp CTA */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px', textDecoration: 'none',
          background: '#25D366',
          borderRadius: t.radius.lg,
          color: '#0d1a12',
          transition: t.transition,
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.18)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 3.4A11.9 11.9 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6a12 12 0 0 0 5.8 1.5c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a10 10 0 1 1 8.3 4.6zm5.5-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7l.5-.6.2-.4c.1-.1 0-.3 0-.5l-.7-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.3-.6-.4z"/>
        </svg>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{
            fontFamily: t.font.family.display, fontSize: 18,
            fontWeight: 700, letterSpacing: '-0.01em',
          }}>וואטסאפ ישיר</div>
          <div style={{
            fontFamily: t.font.family.mono, fontSize: 12,
            fontWeight: 700, letterSpacing: '0.05em', opacity: 0.85,
          }}>{WA_DISPLAY}</div>
        </div>
        <div style={{
          fontSize: 20, opacity: 0.75, transform: 'scaleX(-1)',
        }}>→</div>
      </a>

      <div style={{
        textAlign: 'center', fontSize: 12, color: t.color.silver3,
        lineHeight: 1.6, padding: '4px 20px',
      }}>
        הפידבקים שלכם הם מה שהופך את הפלטפורמה לטובה יותר. תודה שאתם חלק מזה.
      </div>
    </div>
  )
}
