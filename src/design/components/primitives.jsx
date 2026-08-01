// Sport-Refined primitives — Kicker, SectionHead, StatTile, Card, Button, WeightDisplay.
// Small, composable, no external deps. Every screen in the pilot uses these.

import React from 'react'
import { t } from '../../theme/tokens'

// ─── Kicker ──────────────────────────────────────────────
// Mono uppercase caption with optional wine dash before it.
// Use above a display title to name the section without shouting.
export function Kicker({ children, dash = true, color = 'wine', style }) {
  const c = color === 'wine' ? t.color.wineLight
          : color === 'silver' ? t.color.silver2
          : color === 'bone' ? t.color.silver1
          : color
  return (
    <div style={{
      fontFamily: t.font.family.mono,
      fontSize: t.font.label,
      letterSpacing: t.font.track.wide,
      textTransform: 'uppercase',
      color: c,
      fontWeight: t.font.weight.body,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      ...style,
    }}>
      {dash && <span style={{ width: 18, height: 1, background: c, display: 'inline-block' }} />}
      {children}
    </div>
  )
}

// ─── SectionHead ─────────────────────────────────────────
// Display-tier title in the sport grotesque. Pass emphasis via <em>.
// Renders in the user-facing font family (display) at semibold weight.
export function SectionHead({ children, size = 'h2', emphasis, style }) {
  const px = size === 'h1' ? 44 : size === 'h3' ? 26 : size === 'h4' ? 20 : 34
  return (
    <h2 style={{
      fontFamily: t.font.family.display,
      fontSize: px,
      fontWeight: t.font.weight.semi,
      letterSpacing: t.font.track.display,
      lineHeight: 1,
      color: t.color.white,
      margin: 0,
      ...style,
    }}>
      {children}
      {emphasis && (
        <> <span style={{
          color: t.color.silver1,
          fontWeight: t.font.weight.med,
        }}>{emphasis}</span></>
      )}
    </h2>
  )
}

// ─── Card ────────────────────────────────────────────────
// Panel with hairline border, correct radius, warm surface.
export function Card({ children, tone = 'panel', pad = 20, radius = 20, glow, style, onClick }) {
  const bg = tone === 'panel2' ? t.color.panel2
           : tone === 'wine' ? `linear-gradient(160deg, ${t.color.wineGlow}, transparent 60%), linear-gradient(160deg, ${t.color.panel}, ${t.color.charcoal})`
           : t.color.panel
  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: `1px solid ${t.color.border}`,
        borderRadius: radius,
        padding: pad,
        boxShadow: glow ? t.shadow.wine : 'none',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >{children}</div>
  )
}

// ─── StatTile ────────────────────────────────────────────
// Number + label. The number is always the largest thing.
export function StatTile({ label, value, unit, delta, style }) {
  return (
    <div style={{ padding: '14px 14px 16px', textAlign: 'center', ...style }}>
      <div style={{
        fontFamily: t.font.family.mono,
        fontSize: 9,
        letterSpacing: t.font.track.label,
        color: t.color.silver3,
        textTransform: 'uppercase',
        marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: t.font.family.display,
        fontSize: 22,
        fontWeight: t.font.weight.semi,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        color: t.color.white,
      }}>
        {value}
        {unit && <span style={{
          fontFamily: t.font.family.body,
          fontSize: 10,
          fontWeight: t.font.weight.med,
          color: t.color.silver2,
          letterSpacing: '-0.01em',
          marginInlineStart: 2,
        }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{
          fontFamily: t.font.family.mono,
          fontSize: 9,
          letterSpacing: '0.14em',
          color: t.color.wineLight,
          marginTop: 6,
          fontVariantNumeric: 'tabular-nums',
        }}>{delta}</div>
      )}
    </div>
  )
}

// ─── StatRow ─────────────────────────────────────────────
// A row of stat tiles inside a hairline-divided card.
export function StatRow({ items, style }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 1,
      background: t.color.border,
      borderRadius: 14,
      overflow: 'hidden',
      ...style,
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: t.color.panel }}>
          <StatTile {...it} />
        </div>
      ))}
    </div>
  )
}

// ─── Button ──────────────────────────────────────────────
// Primary (wine), light (white on charcoal), ghost, quiet.
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  icon,
  type,
  style,
  full,
}) {
  const isPrimary = variant === 'primary'
  const isLight   = variant === 'light'
  const isGhost   = variant === 'ghost'
  const isQuiet   = variant === 'quiet'

  const padY = size === 'sm' ? 10 : size === 'lg' ? 16 : 14
  const padX = size === 'sm' ? 14 : size === 'lg' ? 26 : 20
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 13 : 12

  const bg = isPrimary ? t.color.wine
           : isLight   ? t.color.white
           : isGhost   ? 'transparent'
           : t.color.panel
  const color = isPrimary ? t.color.white
              : isLight   ? t.color.charcoal
              : isGhost   ? t.color.silver1
              : t.color.bone
  const border = isPrimary ? `1px solid ${t.color.wineLight}`
               : isLight   ? 'none'
               : isGhost   ? `1px solid ${t.color.border}`
               : `1px solid ${t.color.border}`

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color,
        border,
        padding: `${padY}px ${padX}px`,
        borderRadius: 999,
        fontFamily: t.font.family.display,
        fontSize,
        fontWeight: t.font.weight.semi,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        boxShadow: isPrimary ? t.shadow.wine : 'none',
        width: full ? '100%' : 'auto',
        transition: t.transition,
        ...style,
      }}
    >
      {children}
      {icon}
    </button>
  )
}

// ─── WeightDisplay ───────────────────────────────────────
// The hero number. Used in Session Runner focus mode.
export function WeightDisplay({ value, unit = 'kg', size = 'lg', style }) {
  const px = size === 'sm' ? 40 : size === 'md' ? 52 : 68
  return (
    <div style={{
      fontFamily: t.font.family.display,
      fontSize: px,
      fontWeight: t.font.weight.med,
      lineHeight: 0.9,
      letterSpacing: '-0.05em',
      color: t.color.white,
      fontVariantNumeric: 'tabular-nums',
      display: 'inline-block',
      ...style,
    }}>
      {value}
      {unit && <span style={{
        fontFamily: t.font.family.body,
        fontSize: Math.round(px * 0.22),
        color: t.color.silver2,
        fontWeight: t.font.weight.med,
        marginInlineStart: 6,
        letterSpacing: '-0.02em',
      }}>{unit}</span>}
    </div>
  )
}

// ─── Label ───────────────────────────────────────────────
// Mono wide-tracked caps label. For "Set 03 · RPE 8" pattern.
export function Label({ children, color, style }) {
  return (
    <span style={{
      fontFamily: t.font.family.mono,
      fontSize: 10,
      letterSpacing: t.font.track.label,
      textTransform: 'uppercase',
      color: color || t.color.silver2,
      fontWeight: t.font.weight.body,
      ...style,
    }}>{children}</span>
  )
}

// ─── HairlineDivider ─────────────────────────────────────
export function Hairline({ style }) {
  return <div style={{ height: 1, background: t.color.border, ...style }} />
}
