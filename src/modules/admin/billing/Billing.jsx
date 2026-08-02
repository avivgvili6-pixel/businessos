import React from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button } from '../../../components/ui/UI'
import { useI18n } from '../../../i18n/i18n'

// Billing is not shipped as a native module — connects to Stripe/Grow
// when the operator is ready. Until then, show honest "coming soon"
// state with clear action, not fake revenue numbers.

export function Billing() {
  const { isRTL } = useI18n()

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
        {isRTL ? 'חיוב · Coming soon' : 'Billing · coming soon'}
      </div>

      <h2 style={{
        fontFamily: t.font.family.display,
        fontSize: 30, fontWeight: 800, letterSpacing: '-0.015em',
        lineHeight: 1.15, marginBottom: 14,
      }}>
        {isRTL ? 'מנויים, הכנסות וחיוב' : 'Subscriptions, revenue & billing'}
      </h2>

      <p style={{
        maxWidth: 520, margin: '0 auto 24px',
        color: t.color.silver1, fontSize: 14, lineHeight: 1.6,
      }}>
        {isRTL
          ? 'התשלומים ינוהלו ישירות בסליקה שלך (Stripe / Grow). כשתחבר אותה, הדשבורד הזה יראה MRR, סטטוסי מנויים והכנסות בזמן אמת. עד אז — עדיף לנהל את זה בכלי הסליקה עצמו.'
          : 'Payments will run through your own processor (Stripe / Grow). Once connected, this dashboard will show live MRR, subscription status, and revenue. Until then, run it in the processor itself.'}
      </p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
          variant="ghost"
        >
          Stripe Dashboard →
        </Button>
        <Button
          onClick={() => window.open('https://grow.link', '_blank')}
          variant="ghost"
        >
          Grow (IL) →
        </Button>
      </div>

      <div style={{
        marginTop: 24, fontSize: 11, color: t.color.silver2,
        fontFamily: t.font.family.mono, letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        {isRTL ? 'תכנון: אינטגרציה כשמתחילים לגבות' : 'Roadmap: integration when billing starts'}
      </div>
    </Card>
  )
}
