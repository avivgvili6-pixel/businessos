import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { Card, Button, Input } from '../ui/UI'
import { FULL_HEALTH_DISCLAIMER_HE, FULL_HEALTH_DISCLAIMER_EN } from '../../legal/disclaimers'
import { useI18n } from '../../i18n/i18n'
import { SignaturePad } from './SignaturePad'

// Required health-acknowledgment gate — shown once during onboarding.
// The user reads the full disclaimer, types their name, signs on the
// canvas pad, and submits. The signed record (name + signature PNG +
// timestamp + user-agent + document version) is stored locally as
// proof of consent, and can be synced to Supabase for admin retrieval.

const STORAGE_KEY = 'hfos:health_ack'
const DOC_VERSION = 'v1.2026-08'

export function readHealthAck() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function HealthAcknowledgment({ onConfirm, initialName = '' }) {
  const { isRTL } = useI18n()
  const [checked, setChecked] = useState(false)
  const [name, setName] = useState(initialName)
  const [signatureDataUrl, setSignatureDataUrl] = useState(null)
  const [busy, setBusy] = useState(false)

  const fullText = isRTL ? FULL_HEALTH_DISCLAIMER_HE : FULL_HEALTH_DISCLAIMER_EN
  const canSubmit = checked && name.trim().length >= 2 && !!signatureDataUrl

  const confirm = async () => {
    if (!canSubmit || busy) return
    setBusy(true)
    const record = {
      confirmedAt: new Date().toISOString(),
      lang: isRTL ? 'he' : 'en',
      documentVersion: DOC_VERSION,
      signerName: name.trim(),
      signatureDataUrl,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null,
      // Full text at time of signing — protects against future doc edits
      // making the signed record ambiguous
      signedDocumentText: fullText,
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)) } catch {}

    // Best-effort Supabase sync (silent fail if not configured / offline)
    try {
      const { syncHealthAck } = await import('../../services/supabaseSync')
      if (typeof syncHealthAck === 'function') await syncHealthAck(record)
    } catch {}

    setBusy(false)
    onConfirm?.(record)
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
          marginBottom: 10,
        }}>
          {isRTL ? 'הצהרת בריאות · חתימה דיגיטלית' : 'Health disclaimer · digital signature'}
        </div>
        <h2 style={{
          fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.15,
          fontFamily: t.font.family.display, letterSpacing: '-0.02em',
        }}>
          {isRTL ? 'לפני שמתחילים — הצהרה חתומה' : 'Before we start — signed declaration'}
        </h2>
        <div style={{ color: t.color.silver1, fontSize: 14, lineHeight: 1.55 }}>
          {isRTL
            ? 'המסמך הזה מגן עלינו ועליך משפטית. חובה לקרוא, להזין שם ולחתום כדי להיכנס למערכת.'
            : 'This document protects both of us legally. Read it, type your name, sign, and continue.'}
        </div>
      </div>

      {/* Document */}
      <Card style={{ padding: 20 }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: t.color.silver2, fontWeight: 600,
          marginBottom: 12,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{isRTL ? 'מסמך' : 'Document'}: Selano Health Statement</span>
          <span>{DOC_VERSION}</span>
        </div>
        <div style={{
          maxHeight: 260, overflowY: 'auto',
          padding: '4px 4px 4px 12px',
          borderInlineStart: `2px solid ${t.color.wineLight}`,
          fontSize: 13, color: t.color.bone, lineHeight: 1.7,
          whiteSpace: 'pre-line',
          direction: isRTL ? 'rtl' : 'ltr',
        }}>
          {fullText}
        </div>
      </Card>

      {/* Consent checkbox */}
      <label style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: 14, background: checked ? 'rgba(74,156,106,0.06)' : t.color.bgSoft,
        border: `1px solid ${checked ? 'rgba(74,156,106,0.4)' : t.color.border}`,
        borderRadius: t.radius.md, cursor: 'pointer',
        transition: t.transition,
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => setChecked(e.target.checked)}
          style={{
            width: 20, height: 20, accentColor: t.color.wineLight,
            flexShrink: 0, marginTop: 1, cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: 14, color: t.color.text, lineHeight: 1.55, fontWeight: 500 }}>
          {isRTL
            ? 'קראתי את המסמך במלואו, הבנתי, ואני מסכים/ה לכל תנאיו. אני מודע/ת שחתימתי הדיגיטלית מהווה הסכמה משפטית מחייבת.'
            : 'I have read the full document, understood it, and I agree to all its terms. I acknowledge my digital signature constitutes a legally binding consent.'}
        </span>
      </label>

      {/* Name field */}
      <div>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: t.color.silver1, fontWeight: 600,
          marginBottom: 6,
        }}>
          {isRTL ? 'שם מלא (כפי שיופיע במסמך)' : 'Full name (as it appears on the document)'}
        </div>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={isRTL ? 'לדוגמה: אביב גולן' : 'e.g. Aviv Golan'}
          autoComplete="name"
        />
      </div>

      {/* Signature */}
      <div>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: t.color.silver1, fontWeight: 600,
          marginBottom: 6, display: 'flex', justifyContent: 'space-between',
        }}>
          <span>{isRTL ? 'חתימה דיגיטלית' : 'Digital signature'}</span>
          <span>{new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</span>
        </div>
        <SignaturePad onChange={setSignatureDataUrl} height={180} />
      </div>

      {/* Submit */}
      <Button
        size="lg"
        disabled={!canSubmit || busy}
        onClick={confirm}
        style={{ opacity: canSubmit && !busy ? 1 : 0.5 }}
      >
        {busy
          ? (isRTL ? 'שומר…' : 'Saving…')
          : (isRTL ? 'אני מאשר/ת וחותם/ת — כניסה למערכת' : 'I agree and sign — enter the app')}
      </Button>

      {/* Legal footnote */}
      <div style={{
        fontSize: 11, color: t.color.silver2, lineHeight: 1.55,
        padding: '10px 12px', background: 'rgba(199,64,80,0.05)',
        borderInlineStart: `2px solid ${t.color.wineLight}`,
        borderRadius: t.radius.sm,
      }}>
        {isRTL
          ? 'המסמך החתום נשמר עם חותמת זמן, גרסת הטקסט המלאה כפי שנחתמה, פרטי דפדפן ופרטי חתימה. אתה יכול לצפות בו בכל עת דרך פרופיל אישי → הגדרות → מרכז משפטי.'
          : 'The signed document is stored with a timestamp, the full text as signed, browser details, and signature data. View it any time via Profile → Settings → Legal center.'}
      </div>
    </div>
  )
}
