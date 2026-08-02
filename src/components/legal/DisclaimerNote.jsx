import React from 'react'
import { t } from '../../theme/tokens'
import { DISCLAIMERS } from '../../legal/disclaimers'
import { useI18n } from '../../i18n/i18n'

// Compact, always-visible disclaimer for the top of sensitive modules
// (Nutrition, Train, Rehab, Mind, Blood tests). Wine-bordered, muted body
// so it reads as "notice", not "warning".
//
// Usage: <DisclaimerNote kind="training" /> — kind must exist in DISCLAIMERS.

export function DisclaimerNote({ kind = 'general', compact = false }) {
  const { isRTL } = useI18n()
  const text = (DISCLAIMERS[kind] || DISCLAIMERS.general)[isRTL ? 'he' : 'en']

  return (
    <div style={{
      padding: compact ? '10px 12px' : '12px 14px',
      background: 'rgba(199, 64, 80, 0.05)',
      border: `1px solid rgba(199, 64, 80, 0.35)`,
      borderInlineStart: `3px solid ${t.color.wineLight}`,
      borderRadius: t.radius.sm,
      display: 'flex', gap: 10, alignItems: 'flex-start',
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: t.font.family.mono,
        fontSize: 9, letterSpacing: '0.24em',
        color: t.color.wineLight, fontWeight: 700,
        flexShrink: 0, paddingTop: 2,
        textTransform: 'uppercase',
      }}>
        {isRTL ? 'הבהרה' : 'Notice'}
      </div>
      <div style={{
        fontSize: 12, color: t.color.silver1, lineHeight: 1.5,
        letterSpacing: '-0.003em',
      }}>{text}</div>
    </div>
  )
}
