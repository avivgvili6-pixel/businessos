import React from 'react'
import { t } from '../../theme/tokens'

// Selano's S mark cycling through the brand palette.
// Same visual language as the boot loader — used everywhere we
// used to render the hourglass emoji.

export function SLoader({ size = 96, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      padding: '20px 0',
    }}>
      <div
        aria-label="טוען"
        role="status"
        style={{
          fontFamily: t.font.family.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: '-0.05em',
          animation: 'selano-s-cycle 1.6s ease-in-out infinite',
          textShadow: '0 0 40px currentColor',
        }}
      >S</div>
      {label && (
        <div style={{
          fontFamily: t.font.family.mono, fontSize: 10,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: t.color.silver2, fontWeight: 700,
        }}>{label}</div>
      )}
      <style>{`
        @keyframes selano-s-cycle {
          0%   { color: #c74050; transform: scale(1); }
          33%  { color: #c9c1b1; transform: scale(1.04); }
          66%  { color: #14120f; transform: scale(1); text-shadow: 0 0 40px #a52a3a; }
          100% { color: #c74050; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
