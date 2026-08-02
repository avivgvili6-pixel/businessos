import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { Card, Button } from '../ui/UI'
import { FULL_HEALTH_DISCLAIMER_HE, FULL_HEALTH_DISCLAIMER_EN } from '../../legal/disclaimers'
import { useI18n } from '../../i18n/i18n'

// Required health-acknowledgment gate — shown once during onboarding.
// The user must scroll (or at least see) the full text, tick the box,
// and click confirm. Timestamp + ISO date are stored so we can prove
// consent in a dispute.

const STORAGE_KEY = 'hfos:health_ack'

export function readHealthAck() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function HealthAcknowledgment({ onConfirm }) {
  const { isRTL } = useI18n()
  const [checked, setChecked] = useState(false)
  const fullText = isRTL ? FULL_HEALTH_DISCLAIMER_HE : FULL_HEALTH_DISCLAIMER_EN

  const confirm = () => {
    if (!checked) return
    const record = {
      confirmedAt: new Date().toISOString(),
      lang: isRTL ? 'he' : 'en',
      textVersion: 'v1-2026-08',
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)) } catch {}
    onConfirm?.(record)
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
          marginBottom: 10,
        }}>
          {isRTL ? 'הצהרת בריאות' : 'Health acknowledgment'}
        </div>
        <h2 style={{
          fontSize: 28, fontWeight: 800, marginBottom: 8, lineHeight: 1.15,
          fontFamily: t.font.family.display, letterSpacing: '-0.02em',
        }}>
          {isRTL ? 'לפני שמתחילים — קרא בבקשה' : 'Before we start — please read'}
        </h2>
        <div style={{ color: t.color.silver1, fontSize: 14, lineHeight: 1.55 }}>
          {isRTL
            ? 'זה חובה. השימוש במערכת מותנה בהסכמה להצהרה הזאת.'
            : 'This is required. Use of the system is conditional on accepting this statement.'}
        </div>
      </div>

      <Card style={{ padding: 20 }}>
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
            ? 'קראתי, הבנתי, ואני מסכים/ה להצהרת הבריאות ולתנאי השימוש של Selano.'
            : 'I have read, understood, and I agree to the Selano health statement and terms of use.'}
        </span>
      </label>

      <Button
        size="lg"
        disabled={!checked}
        onClick={confirm}
        style={{ opacity: checked ? 1 : 0.4 }}
      >
        {isRTL ? 'מאשר/ת — המשך' : 'I agree — continue'}
      </Button>
    </div>
  )
}
