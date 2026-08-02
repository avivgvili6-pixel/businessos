import React from 'react'
import { t } from '../../theme/tokens'
import { Card } from '../ui/UI'
import { useI18n } from '../../i18n/i18n'

// Honest empty state for admin dashboards that depend on data volume.
// Beats fake mockup charts — reads as intentional & professional.

export function LockedUntilData({ title, threshold, currentCount, hint, unit = 'members' }) {
  const { isRTL } = useI18n()
  const ready = currentCount >= threshold

  const unitLabel = {
    members: { he: 'מתאמנים פעילים', en: 'active members' },
    transactions: { he: 'עסקאות', en: 'transactions' },
    days: { he: 'ימי פעילות', en: 'days of activity' },
  }[unit] || { he: unit, en: unit }

  return (
    <Card style={{
      padding: '48px 32px',
      background: `linear-gradient(160deg, rgba(165,42,58,0.05) 0%, ${t.color.bgElevated} 60%)`,
      border: `1px dashed ${t.color.border}`,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
        marginBottom: 14,
      }}>
        {isRTL ? 'נעול בינתיים' : 'Locked for now'}
      </div>

      <h2 style={{
        fontFamily: t.font.family.display,
        fontSize: 26, fontWeight: 800, letterSpacing: '-0.015em',
        lineHeight: 1.15, marginBottom: 12,
      }}>
        {title}
      </h2>

      <div style={{
        maxWidth: 460, margin: '0 auto',
        color: t.color.silver1, fontSize: 14, lineHeight: 1.55,
      }}>
        {isRTL
          ? `הדשבורד הזה נפתח כשיש ${threshold}${unit === 'days' ? ' ימי פעילות' : ` ${unitLabel.he}`} — כדי שהמספרים יהיו אמיתיים, לא מדגם קטן. `
          : `This dashboard unlocks at ${threshold} ${unitLabel.en} — so the numbers reflect a real signal, not a small sample. `}
        {hint}
      </div>

      {/* Progress meter — how close to threshold */}
      <div style={{
        maxWidth: 320, margin: '24px auto 0',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginBottom: 6,
          fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: t.color.silver2,
        }}>
          <span>{isRTL ? 'כרגע' : 'Now'}</span>
          <span>{isRTL ? 'לפתיחה' : 'Unlocks at'}</span>
        </div>
        <div style={{
          height: 8, background: t.color.bgSoft, borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, (currentCount / threshold) * 100)}%`,
            height: '100%',
            background: ready ? '#4a9c6a' : t.color.wineLight,
            transition: t.transition,
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 6,
          fontSize: 12, color: t.color.text, fontWeight: 600,
        }}>
          <span>{currentCount}</span>
          <span>{threshold}</span>
        </div>
      </div>
    </Card>
  )
}
