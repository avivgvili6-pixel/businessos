import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { Modal, Input, Button, Badge } from '../../../components/ui/UI'
import { foods } from '../../../data/foods'
import { useI18n } from '../../../i18n/i18n'

// Compose multiple ingredients into a single dish. Live totals update as
// you add / edit grams. When you tap "Save as meal" it logs one meal to
// today's log with the dish name + summed macros.

export function DishBuilder({ open, onClose, onLog }) {
  const { isRTL } = useI18n()
  const [dishName, setDishName] = useState('')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([]) // [{id, name, grams, per100:{kcal,p,c,f}}]

  const results = useMemo(() => {
    if (!q.trim()) return []
    const needle = q.trim().toLowerCase()
    return foods
      .filter(f => f.name.toLowerCase().includes(needle))
      .slice(0, 8)
  }, [q])

  const totals = useMemo(() => items.reduce((acc, it) => {
    const f = it.grams / 100
    return {
      kcal: acc.kcal + it.per100.kcal * f,
      p: acc.p + it.per100.p * f,
      c: acc.c + it.per100.c * f,
      f: acc.f + it.per100.f * f,
      grams: acc.grams + it.grams,
    }
  }, { kcal: 0, p: 0, c: 0, f: 0, grams: 0 }), [items])

  const addFood = (food) => {
    setItems(prev => [...prev, {
      id: food.id + '_' + prev.length,
      name: food.name,
      grams: 100,
      per100: { kcal: food.kcal, p: food.p, c: food.c, f: food.f },
    }])
    setQ('')
  }

  const setGrams = (idx, grams) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, grams: Math.max(0, +grams || 0) } : it))
  }

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const reset = () => { setItems([]); setDishName(''); setQ('') }

  const saveAsMeal = () => {
    if (!items.length) return
    const name = dishName.trim() || (isRTL ? 'מנה מותאמת' : 'Custom dish')
    onLog({
      name,
      grams: Math.round(totals.grams),
      kcal: Math.round(totals.kcal),
      p: Math.round(totals.p * 10) / 10,
      c: Math.round(totals.c * 10) / 10,
      f: Math.round(totals.f * 10) / 10,
      composedOf: items.map(it => ({ name: it.name, grams: it.grams })),
    })
    reset()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title={isRTL ? 'בניית מנה מרוכבת' : 'Build a composed dish'} width={620}>
      <div style={{ display: 'grid', gap: 14 }}>
        <Input
          label={isRTL ? 'שם המנה' : 'Dish name'}
          value={dishName}
          onChange={e => setDishName(e.target.value)}
          placeholder={isRTL ? 'למשל: קערת בוקר עם שיבולת שועל' : 'e.g. Overnight oats bowl'}
        />

        <div>
          <Input
            label={isRTL ? 'הוסף מרכיב' : 'Add ingredient'}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={isRTL ? 'חפש מהמאגר…' : 'Search the food library…'}
          />
          {results.length > 0 && (
            <div style={{
              marginTop: 6, background: t.color.bgSoft, border: `1px solid ${t.color.border}`,
              borderRadius: t.radius.sm, maxHeight: 200, overflowY: 'auto',
            }}>
              {results.map(f => (
                <button key={f.id} onClick={() => addFood(f)} style={{
                  width: '100%', textAlign: isRTL ? 'right' : 'left',
                  padding: '10px 12px', background: 'transparent', border: 'none',
                  color: t.color.text, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${t.color.hairline || t.color.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: t.font.sm, fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
                      {f.kcal} {isRTL ? 'קק״ל' : 'kcal'} · {f.p}P · {f.c}C · {f.f}F / 100{isRTL ? 'ג׳' : 'g'}
                    </div>
                  </div>
                  <Badge color={t.color.textDim}>{f.cat}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{
              fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: t.color.silver2,
            }}>
              {isRTL ? 'מרכיבי המנה' : 'Dish ingredients'} ({items.length})
            </div>
            {items.map((it, idx) => {
              const factor = it.grams / 100
              return (
                <div key={it.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 60px auto',
                  gap: 8, alignItems: 'center',
                  padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm,
                }} className="hfos-dish-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: t.font.sm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                    <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
                      {Math.round(it.per100.kcal * factor)} {isRTL ? 'קק״ל' : 'kcal'} · {(it.per100.p * factor).toFixed(1)}P · {(it.per100.c * factor).toFixed(1)}C · {(it.per100.f * factor).toFixed(1)}F
                    </div>
                  </div>
                  <input
                    type="number" min="0" inputMode="numeric"
                    value={it.grams}
                    onChange={e => setGrams(idx, e.target.value)}
                    style={{
                      padding: '8px 10px', background: 'rgba(0,0,0,.2)',
                      border: `1px solid ${t.color.border}`, borderRadius: 6,
                      color: t.color.text, fontFamily: 'inherit', fontSize: 13,
                      outline: 'none', width: '100%', textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>{isRTL ? 'גרם' : 'g'}</span>
                  <button
                    onClick={() => removeItem(idx)}
                    title={isRTL ? 'הסר' : 'Remove'}
                    aria-label={isRTL ? 'הסר' : 'Remove'}
                    style={{
                      background: 'transparent', border: 'none', color: t.color.textMuted,
                      cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 8px',
                    }}
                  >×</button>
                </div>
              )
            })}
          </div>
        )}

        {items.length > 0 && (
          <div style={{
            padding: 14, background: `${t.color.wineLight}12`,
            border: `1px solid ${t.color.wineLight}66`, borderRadius: t.radius.md,
          }}>
            <div style={{
              fontFamily: t.font.family.mono, fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: t.color.silver2, marginBottom: 10,
            }}>{isRTL ? 'סה״כ המנה' : 'Dish totals'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <TotalCell label={isRTL ? 'קק״ל' : 'kcal'} value={Math.round(totals.kcal)} highlight />
              <TotalCell label={isRTL ? 'חלבון' : 'Protein'} value={totals.p.toFixed(1)} />
              <TotalCell label={isRTL ? 'פחמימות' : 'Carbs'} value={totals.c.toFixed(1)} />
              <TotalCell label={isRTL ? 'שומן' : 'Fat'} value={totals.f.toFixed(1)} />
            </div>
            <div style={{ marginTop: 10, fontSize: t.font.xs, color: t.color.textDim, textAlign: 'center' }}>
              {isRTL ? 'משקל כולל' : 'Total weight'}: {Math.round(totals.grams)} {isRTL ? 'ג׳' : 'g'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={reset} disabled={!items.length && !dishName}>
            {isRTL ? 'נקה' : 'Clear'}
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>{isRTL ? 'סגור' : 'Close'}</Button>
            <Button onClick={saveAsMeal} disabled={!items.length}>
              {isRTL ? 'שמור כארוחה של היום' : `Log to today${totals.kcal ? ` · ${Math.round(totals.kcal)} kcal` : ''}`}
            </Button>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 500px) {
        .hfos-dish-row {
          grid-template-columns: 1fr 70px 40px auto !important;
          gap: 6px !important;
        }
      }`}</style>
    </Modal>
  )
}

function TotalCell({ label, value, highlight }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: highlight ? 22 : 18, fontWeight: 800,
        color: highlight ? t.color.wineLight : t.color.text, lineHeight: 1.1,
      }}>{value}</div>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 9, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: t.color.silver2, marginTop: 4,
      }}>{label}</div>
    </div>
  )
}
