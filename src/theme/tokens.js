// Sport-Refined design tokens — warm charcoal ground, silver metal, wine accent.
// Values chosen to match Selano Direction 05 (Draft 03).
//
// Legacy keys (bg, gold, etc.) are preserved so existing modules continue to
// render — the values behind them are the new sport palette, so every module
// that reads through `t.color.gold` (the primary accent) now gets wine.

export const theme = {
  color: {
    // Ground surfaces — warm charcoal instead of cold navy.
    bg:          '#14120f', // was #0d0d14 — the page ground
    bgElevated:  '#1c1917', // was #151520 — first elevation
    bgCard:      '#22201d', // was #1a1a26 — cards
    bgSoft:      '#2a2723', // was #22222f — soft surfaces / hover
    border:      '#2d2925', // was #2a2a3a — visible dividers
    borderSoft:  'rgba(238,236,229,0.08)', // hairline

    // Type — warm bone instead of cool grey.
    text:        '#eeece5', // primary readable text
    textDim:     '#c8c4ba', // secondary / silver-1
    textMuted:   '#928e83', // tertiary / silver-2

    // Primary brand accent — wine replaces gold across the platform.
    // (Legacy `gold` key kept for compatibility.)
    gold:        '#a52a3a', // wine light — headers, active state
    goldSoft:    '#6f1622', // wine deep — pressed / gradients
    goldGlow:    'rgba(165,42,58,0.18)',

    // Semantic states — kept close to before but harmonized with the wine.
    danger:      '#e05a5a',
    warning:     '#e0a05a',
    success:     '#6fbf85',
    info:        '#7ab0d6',
    purple:      '#a878e0',

    // NEW · granular sport-refined tokens for new components.
    charcoal:    '#14120f',
    panel:       '#1c1917',
    panel2:      '#22201d',
    hairline:    'rgba(238,236,229,0.08)',
    silver1:     '#c8c4ba', // primary metal — dividers with weight, secondary type
    silver2:     '#928e83', // muted metal — labels, footnotes
    silver3:     '#5c584f', // deep metal — disabled / very quiet
    bone:        '#eeece5', // page text, off-white
    white:       '#fafaf8', // display type, CTA labels
    wine:        '#6f1622', // deep wine — the pressed accent
    wineMid:     '#8a1e2c', // mid wine
    wineLight:   '#a52a3a', // primary wine — active accent
    wineGlow:    'rgba(165,42,58,0.35)',
  },
  radius: { xs: 6, sm: 10, md: 14, lg: 20, xl: 24, xxl: 32, pill: 999 },
  space:  { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },
  font: {
    // Legacy sizes
    xs: 11, sm: 13, md: 14, lg: 16, xl: 20, xxl: 26, xxxl: 34, hero: 44,
    // NEW · sport-refined display scale
    label: 10,     // mono uppercase labels
    body: 14,      // body copy
    lead: 15,      // lede paragraph
    h4: 20,        // small heading
    h3: 26,        // section title
    h2: 34,        // page title
    h1: 44,        // hero title
    display: 68,   // the number
    // Family stacks
    family: {
      display: '"Barlow", "SF Pro Display", -apple-system, "Inter", "Helvetica Neue", Arial, sans-serif',
      body:    '"Heebo", "Inter", -apple-system, "Segoe UI", Arial, sans-serif',
      mono:    '"Space Mono", ui-monospace, "SF Mono", Menlo, monospace',
    },
    // Letter-spacing
    track: {
      display: '-0.03em',
      body:    '-0.005em',
      label:   '0.24em',   // wide-tracked caps
      wide:    '0.32em',   // extra wide caps for section heads
    },
    // Weight
    weight: {
      body: 400,
      med:  500,
      semi: 600,
      bold: 700,
    },
  },
  shadow: {
    sm:   '0 2px 8px rgba(0,0,0,.35)',
    md:   '0 8px 24px rgba(0,0,0,.4)',
    lg:   '0 20px 50px rgba(0,0,0,.5)',
    glow: '0 0 30px rgba(165,42,58,.25)',
    wine: '0 8px 24px -8px rgba(165,42,58,0.45)',
  },
  transition: '.2s cubic-bezier(.4,0,.2,1)',
}

export const t = theme
