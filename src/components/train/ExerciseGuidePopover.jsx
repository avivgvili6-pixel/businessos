import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { Modal } from '../ui/UI'
import { resolveGuide, youtubeSearchUrl, youtubeEmbedUrl } from '../../data/bodybuilding/exerciseGuides'
import { useI18n } from '../../i18n/i18n'

// Compact "דגשים + סרטון" button that opens a modal with cues and
// an embedded YouTube video (or a search link when no ID is known).
//
// Usage:
//   <ExerciseGuideButton exercise={exObj} />
//   <ExerciseGuideButton exerciseName="סקוואט חזיתי" />

export function ExerciseGuideButton({ exercise, exerciseName, compact = false }) {
  const [open, setOpen] = useState(false)
  const { isRTL } = useI18n()
  const guide = resolveGuide(exercise || exerciseName)

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        style={{
          background: 'transparent',
          border: `1px solid ${t.color.wineLight}66`,
          color: t.color.wineLight,
          fontFamily: 'inherit',
          fontSize: compact ? 10 : 11,
          fontWeight: 600,
          padding: compact ? '3px 8px' : '5px 12px',
          borderRadius: t.radius.pill,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
          transition: t.transition,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = t.color.wineLight
          e.currentTarget.style.color = t.color.white
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = t.color.wineLight
        }}
      >
        {/* Play triangle */}
        <svg width={compact ? 8 : 10} height={compact ? 8 : 10} viewBox="0 0 10 10" fill="currentColor">
          <path d="M1 0.5v9l8-4.5z" />
        </svg>
        {isRTL ? 'דגשים + סרטון' : 'Cues + video'}
      </button>

      {open && (
        <Modal open onClose={() => setOpen(false)} title={guide.name} width={640}>
          <ExerciseGuideContent guide={guide} />
        </Modal>
      )}
    </>
  )
}

export function ExerciseGuideContent({ guide }) {
  const { isRTL } = useI18n()
  const hasVideo = !!guide.video.id

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Video block */}
      <div>
        <SectionLabel>{isRTL ? 'סרטון דוגמה' : 'Reference video'}</SectionLabel>

        {hasVideo ? (
          <>
            <div style={{
              position: 'relative', width: '100%',
              paddingBottom: '56.25%', borderRadius: t.radius.md,
              overflow: 'hidden', background: '#000', marginTop: 8,
              border: `1px solid ${t.color.border}`,
            }}>
              <iframe
                src={youtubeEmbedUrl(guide.video.id)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%', border: 0,
                }}
                loading="lazy"
              />
            </div>
            {guide.video.by && (
              <div style={{
                marginTop: 6, fontSize: 11, color: t.color.silver2,
                fontFamily: t.font.family.mono, letterSpacing: '0.14em',
              }}>
                Video: {guide.video.by} · YouTube
              </div>
            )}
          </>
        ) : (
          <a
            href={youtubeSearchUrl(guide.video.searchQuery || guide.name)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 14, marginTop: 8,
              background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
              borderRadius: t.radius.md, textDecoration: 'none', color: t.color.ink,
              transition: t.transition,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.color.wineLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.color.border}
          >
            <div style={{
              width: 40, height: 40, borderRadius: t.radius.sm,
              background: t.color.wineLight, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width={16} height={16} viewBox="0 0 10 10" fill="currentColor">
                <path d="M1 0.5v9l8-4.5z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {isRTL ? 'חפש ב־YouTube' : 'Search on YouTube'}
              </div>
              <div style={{ fontSize: 11, color: t.color.silver2 }}>
                {isRTL ? 'תרגיל ייחודי — פותח חיפוש עם הדגמות מקצועיות' : 'Custom exercise — opens a search for reference clips'}
              </div>
            </div>
            <span style={{ color: t.color.wineLight, fontSize: 18 }}>{isRTL ? '←' : '→'}</span>
          </a>
        )}
      </div>

      {/* Cues block */}
      <div>
        <SectionLabel>{isRTL ? 'דגשי ביצוע' : 'Form cues'}</SectionLabel>
        <ol style={{
          margin: '10px 0 0', padding: 0, listStyle: 'none',
          display: 'grid', gap: 6,
        }}>
          {guide.cues.map((c, i) => (
            <li key={i} style={{
              display: 'flex', gap: 10, alignItems: 'baseline',
              padding: '10px 12px',
              background: t.color.bgSoft,
              border: `1px solid ${t.color.border}`,
              borderRadius: t.radius.sm,
            }}>
              <span style={{
                fontFamily: t.font.family.mono, fontSize: 11, fontWeight: 700,
                color: t.color.wineLight, minWidth: 20,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 13, color: t.color.bone, lineHeight: 1.55 }}>{c}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer note */}
      <div style={{
        fontSize: 11, color: t.color.silver2, lineHeight: 1.5,
        padding: '10px 12px', background: 'rgba(199,64,80,0.05)',
        borderInlineStart: `2px solid ${t.color.wineLight}`,
        borderRadius: t.radius.sm,
      }}>
        {isRTL
          ? 'הדגשים מכוונים לביצוע נכון — לא תחליף לליווי מאמן מוסמך. עצור אם מרגיש כאב או תנועה לא נכונה.'
          : 'Cues are guidance for correct execution — not a replacement for a certified coach. Stop if you feel pain or bad movement patterns.'}
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.28em',
      textTransform: 'uppercase', color: t.color.wineLight, fontWeight: 700,
    }}>{children}</div>
  )
}
