import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { Card, Button, Modal } from '../ui/UI'
import {
  TERMS_HE, TERMS_EN,
  PRIVACY_HE, PRIVACY_EN,
  FULL_HEALTH_DISCLAIMER_HE, FULL_HEALTH_DISCLAIMER_EN,
} from '../../legal/disclaimers'
import { useI18n } from '../../i18n/i18n'
import { readHealthAck } from './HealthAcknowledgment'

// The full legal center — mounted in Profile → Settings. Three documents
// (terms, privacy, health) each openable in a modal. Also shows the
// stored consent record so the user can prove/see when they accepted.

const DOCS = [
  { key: 'terms',   he: 'תנאי שימוש',       en: 'Terms of Use' },
  { key: 'privacy', he: 'מדיניות פרטיות',   en: 'Privacy Policy' },
  { key: 'health',  he: 'הצהרת בריאות',     en: 'Health disclaimer' },
]

const TEXT = {
  terms:   { he: TERMS_HE,                   en: TERMS_EN },
  privacy: { he: PRIVACY_HE,                 en: PRIVACY_EN },
  health:  { he: FULL_HEALTH_DISCLAIMER_HE,  en: FULL_HEALTH_DISCLAIMER_EN },
}

export function LegalCenter() {
  const { isRTL } = useI18n()
  const [open, setOpen] = useState(null)
  const ack = readHealthAck()

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
        textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
      }}>
        {isRTL ? 'מרכז משפטי' : 'Legal center'}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {DOCS.map(d => (
          <button
            key={d.key}
            onClick={() => setOpen(d.key)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
              background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
              borderRadius: t.radius.md, cursor: 'pointer', fontFamily: 'inherit',
              color: t.color.text, textAlign: isRTL ? 'right' : 'left',
              transition: t.transition,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.color.wineLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.color.border}
          >
            <span style={{ fontWeight: 600, fontSize: 14 }}>{isRTL ? d.he : d.en}</span>
            <span style={{ color: t.color.wineLight, fontSize: 18 }}>{isRTL ? '←' : '→'}</span>
          </button>
        ))}
      </div>

      {ack && (
        <div style={{
          marginTop: 6, padding: 12,
          background: 'rgba(74,156,106,0.06)',
          border: '1px solid rgba(74,156,106,0.3)',
          borderRadius: t.radius.sm,
          fontSize: 12, color: t.color.silver1, lineHeight: 1.5,
        }}>
          <div style={{
            fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#4a9c6a', fontWeight: 700, marginBottom: 4,
          }}>
            {isRTL ? 'הצהרה אושרה' : 'Consent recorded'}
          </div>
          {isRTL
            ? `אישרת/ת את הצהרת הבריאות ב-${new Date(ack.confirmedAt).toLocaleString('he-IL')} (גרסה ${ack.textVersion}, שפה: ${ack.lang}).`
            : `You accepted the health statement on ${new Date(ack.confirmedAt).toLocaleString('en-US')} (version ${ack.textVersion}, language: ${ack.lang}).`}
        </div>
      )}

      <div style={{ marginTop: 6, fontSize: 11, color: t.color.silver2, lineHeight: 1.5 }}>
        {isRTL
          ? 'המסמכים כאן הם טיוטה מקצועית ומחייבים בדיקה של עורך דין לפני מסחור.'
          : 'These documents are professional drafts and require attorney review before commercial launch.'}
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? (isRTL ? DOCS.find(d => d.key === open).he : DOCS.find(d => d.key === open).en) : ''}
        width={640}
      >
        {open && (
          <div style={{
            padding: '10px 14px',
            fontSize: 13, color: t.color.bone, lineHeight: 1.75,
            whiteSpace: 'pre-line',
            borderInlineStart: `2px solid ${t.color.wineLight}`,
            maxHeight: 480, overflowY: 'auto',
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            {TEXT[open][isRTL ? 'he' : 'en']}
          </div>
        )}
      </Modal>
    </div>
  )
}

// Compact single-line link — mount anywhere (login, footer).
export function LegalFooter() {
  const { isRTL } = useI18n()
  const [open, setOpen] = useState(null)
  return (
    <>
      <div style={{
        fontSize: 11, color: t.color.silver2, textAlign: 'center', padding: '6px 0',
      }}>
        <button onClick={() => setOpen('terms')} style={linkStyle}>{isRTL ? 'תנאי שימוש' : 'Terms'}</button>
        <span style={{ margin: '0 8px' }}>·</span>
        <button onClick={() => setOpen('privacy')} style={linkStyle}>{isRTL ? 'פרטיות' : 'Privacy'}</button>
        <span style={{ margin: '0 8px' }}>·</span>
        <button onClick={() => setOpen('health')} style={linkStyle}>{isRTL ? 'הצהרת בריאות' : 'Health'}</button>
      </div>
      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? (isRTL ? DOCS.find(d => d.key === open).he : DOCS.find(d => d.key === open).en) : ''}
        width={640}
      >
        {open && (
          <div style={{
            padding: '10px 14px', fontSize: 13, color: t.color.bone, lineHeight: 1.75,
            whiteSpace: 'pre-line', borderInlineStart: `2px solid ${t.color.wineLight}`,
            maxHeight: 480, overflowY: 'auto',
            direction: isRTL ? 'rtl' : 'ltr',
          }}>
            {TEXT[open][isRTL ? 'he' : 'en']}
          </div>
        )}
      </Modal>
    </>
  )
}

const linkStyle = {
  background: 'none', border: 'none', color: '#948d7f',
  fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
  textDecoration: 'underline',
}
