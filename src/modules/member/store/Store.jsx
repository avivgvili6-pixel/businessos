import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button, Badge, SectionHeader } from '../../../components/ui/UI'

const CONTACT_EMAIL = 'israelgrip@gmail.com'
const CONTACT_WHATSAPP = '' // add international format when available, e.g. '972501234567'

const PRODUCTS = [
  {
    id: 'shirt-black', emoji: '👕', category: 'ביגוד',
    name: 'חולצת סלנו שחורה', price: 89,
    subtitle: 'נושמת · Dri-Fit · לוגו זהב מוטבע',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'shirt-white', emoji: '👕', category: 'ביגוד',
    name: 'חולצת סלנו לבנה', price: 89,
    subtitle: 'נושמת · Dri-Fit · לוגו שחור מוטבע',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'hoodie', emoji: '🧥', category: 'ביגוד',
    name: 'קפוצ׳ון סלנו', price: 189,
    subtitle: 'כותנה איכותית · חורף · יוניסקס',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'shaker', emoji: '🥤', category: 'אביזרים',
    name: 'שייקר סלנו 700 מ״ל', price: 39,
    subtitle: 'BPA-Free · כדור מיקסר · לוגו',
  },
  {
    id: 'straps', emoji: '🎗️', category: 'אביזרים',
    name: 'רצועות דדליפט', price: 59,
    subtitle: 'עור מלא · תפירה כפולה · אחיזה חזקה',
  },
  {
    id: 'belt', emoji: '🥋', category: 'אביזרים',
    name: 'חגורת כוח מקצועית', price: 249,
    subtitle: '10mm · IPF Approved · עור פרה',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'wraps', emoji: '💪', category: 'אביזרים',
    name: 'רצועות ברכיים', price: 79,
    subtitle: 'זוג · יציבות בסקוואטים כבדים',
  },
  {
    id: 'bag', emoji: '🎒', category: 'אביזרים',
    name: 'תיק אימון סלנו', price: 149,
    subtitle: 'תא לנעליים · 45 ליטר · מותג',
  },
]

const CATEGORIES = ['הכל', 'ביגוד', 'אביזרים']

export function Store() {
  const [cat, setCat] = useState('הכל')
  const [selected, setSelected] = useState(null)
  const [size, setSize] = useState(null)

  const filtered = cat === 'הכל' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat)

  const order = (product, chosenSize) => {
    const body = `שלום, אשמח להזמין:\n\n📦 מוצר: ${product.name}${chosenSize ? `\n📏 מידה: ${chosenSize}` : ''}\n💰 מחיר: ₪${product.price}\n\nשם:\nכתובת למשלוח:\nטלפון:\n`
    const subject = `הזמנת מוצר: ${product.name}`
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Hero */}
      <Card style={{ padding: 24, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 180, height: 180, background: t.color.goldGlow, borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Badge color={t.color.gold}>🛍️ חנות סלנו</Badge>
          <h1 style={{ fontSize: t.font.hero, fontWeight: 900, marginTop: 10, marginBottom: 6 }}>הציוד המקורי שלנו</h1>
          <p style={{ color: t.color.textDim, fontSize: t.font.md, maxWidth: 500, lineHeight: 1.5 }}>
            חולצות, ביגוד ואביזרי אימון עם המותג של סלנו. איכות מקצועית, לוגו מוטבע.
          </p>
        </div>
      </Card>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '8px 16px', borderRadius: 999,
            background: cat === c ? t.color.gold : t.color.bgSoft,
            color: cat === c ? '#0d0d14' : t.color.text,
            border: `1px solid ${cat === c ? t.color.gold : t.color.border}`,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: t.font.sm,
            whiteSpace: 'nowrap',
          }}>{c}</button>
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {filtered.map(p => (
          <Card key={p.id} hover style={{ padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => { setSelected(p); setSize(null) }}>
            <div style={{ fontSize: 56, textAlign: 'center', padding: '10px 0' }}>{p.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 4 }}>{p.name}</div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.4, marginBottom: 12, flex: 1 }}>{p.subtitle}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: t.font.xxl, fontWeight: 900, color: t.color.gold }}>₪{p.price}</div>
              <Badge>{p.category}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Order modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000,
          display: 'grid', placeItems: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: t.color.bgElevated, borderRadius: t.radius.lg, padding: 24,
            maxWidth: 400, width: '100%', border: `1px solid ${t.color.gold}`,
            direction: 'rtl',
          }}>
            <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>{selected.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: t.font.xl, textAlign: 'center', marginBottom: 4 }}>{selected.name}</div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, textAlign: 'center', marginBottom: 16 }}>{selected.subtitle}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: t.color.gold, textAlign: 'center', marginBottom: 20 }}>₪{selected.price}</div>

            {selected.sizes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>בחר מידה:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selected.sizes.map(sz => (
                    <button key={sz} onClick={() => setSize(sz)} style={{
                      padding: '10px 14px', minWidth: 50,
                      background: size === sz ? t.color.gold : t.color.bgSoft,
                      color: size === sz ? '#0d0d14' : t.color.text,
                      border: `1px solid ${size === sz ? t.color.gold : t.color.border}`,
                      borderRadius: t.radius.md, cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: 700,
                    }}>{sz}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.xs, color: t.color.textDim, marginBottom: 16, lineHeight: 1.6 }}>
              💡 בלחיצה על "הזמן עכשיו" יפתח מייל מוכן ל-{CONTACT_EMAIL}. השלם את הפרטים ושלח - נחזור אליך תוך יום עסקים.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" onClick={() => setSelected(null)}>סגור</Button>
              <Button
                onClick={() => order(selected, size)}
                icon="✉️"
                style={{ flex: 1 }}
                disabled={selected.sizes && !size}
              >
                {selected.sizes && !size ? 'בחר מידה' : 'הזמן עכשיו'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact card */}
      <Card style={{ padding: 20 }}>
        <SectionHeader title="שאלות על המוצרים?" subtitle="פנה אלינו ישירות ונחזור אליך" />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <Button
            variant="outline"
            icon="✉️"
            onClick={() => { window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('שאלה על מוצר בחנות סלנו')}` }}
          >שלח מייל</Button>
          {CONTACT_WHATSAPP && (
            <Button
              variant="outline"
              icon="📱"
              onClick={() => window.open(`https://wa.me/${CONTACT_WHATSAPP}`, '_blank')}
            >WhatsApp</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
