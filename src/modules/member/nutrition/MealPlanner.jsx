import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader, EmptyState } from '../../../components/ui/UI'
import { ai } from '../../../ai/aiProvider'
import { bmr, tdee, macros, goalAdjustments, dietTemplates } from '../../../utils/calc'
import { DAYS_HE } from '../../../utils/date'

export function MealPlanner() {
  const { state } = useApp()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const targets = useMemo(() => {
    const _bmr = bmr(state.profile)
    const _tdee = tdee(_bmr, state.profile.activity)
    const kcal = _tdee + (goalAdjustments[state.profile.goalKey]?.kcalDelta || 0)
    const diet = dietTemplates[state.profile.dietKey] || dietTemplates.balanced
    return { kcal, ...macros(kcal, diet.p, diet.c, diet.f), diet: diet.label }
  }, [state.profile])

  const generate = async () => {
    setLoading(true)
    const p = await ai.suggestMealPlan({ profile: state.profile, targets, days: 7 })
    setPlan(p); setLoading(false)
  }

  const shopping = useMemo(() => plan ? buildShoppingList(plan) : [], [plan])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader
          title="מתכנן תזונה שבועי"
          subtitle={`יעד: ${targets.kcal} קק״ל · ${targets.protein}/${targets.carbs}/${targets.fat} · ${targets.diet}`}
          action={<Button onClick={generate} disabled={loading}>{loading ? 'בונה...' : plan ? '↻ בנה מחדש' : '✨ בנה תכנית שבועית'}</Button>}
        />
        {!plan && (
          <EmptyState
            icon="🍽️"
            title="עדיין אין תכנית"
            subtitle="לחץ 'בנה תכנית שבועית' - נבנה 4 ארוחות ליום מותאמות ליעדי מקרו + נחשב רשימת קניות אוטומטית"
          />
        )}
      </Card>

      {plan && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap: 8 }} className="hfos-week">
            {plan.days.map((d, i) => (
              <Card key={d.day} style={{ padding: 12 }}>
                <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 8, fontSize: t.font.sm, textAlign:'center', paddingBottom: 8, borderBottom:`1px solid ${t.color.border}` }}>
                  {DAYS_HE[i]}
                </div>
                <div style={{ display:'grid', gap: 8 }}>
                  {d.meals.map((m, j) => (
                    <div key={j} style={{ padding: 8, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 4 }}>
                        <div style={{ fontSize: t.font.xs, color: t.color.gold, fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: t.color.textDim }}>{m.kcal}</div>
                      </div>
                      <div style={{ fontSize: t.font.xs, color: t.color.text, lineHeight: 1.5 }}>{m.idea}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionHeader title="🛒 רשימת קניות" subtitle={`${shopping.length} פריטים לשבוע`} action={
              <Button variant="outline" size="sm" onClick={() => copyList(shopping)}>העתק רשימה</Button>
            } />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {groupByCategory(shopping).map(([cat, items]) => (
                <div key={cat} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
                  <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 10, fontSize: t.font.sm }}>{cat}</div>
                  <div style={{ display:'grid', gap: 6 }}>
                    {items.map((item, i) => (
                      <label key={i} style={{ display:'flex', alignItems:'center', gap: 8, fontSize: t.font.sm, cursor:'pointer' }}>
                        <input type="checkbox" style={{ accentColor: t.color.gold }} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
      <style>{`
        @media (max-width: 900px) { .hfos-week { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  )
}

function buildShoppingList(plan) {
  const items = new Set()
  const keywords = {
    'חלבון': ['חזה עוף','חזה הודו','סטייק','סלמון','טופו','ביצים','יוגורט יווני','קוטג׳','אבקת חלבון'],
    'פחמימות': ['אורז מלא','אורז','שיבולת שועל','בטטה','אטריות אורז','טוסט מלא','קינואה'],
    'ירקות': ['ירקות מוקפצים','סלט','ירקות בגריל','ירקות שורש','עגבניות שרי','אבוקדו'],
    'קטניות': ['קטניות','חומוס','עדשים'],
    'פירות': ['פירות יער','בננה','תפוח'],
    'שומנים': ['שמן זית','טחינה','חמאת בוטנים','אבוקדו'],
  }
  for (const day of plan.days) for (const m of day.meals) {
    for (const [cat, list] of Object.entries(keywords)) {
      for (const kw of list) if (m.idea.includes(kw)) items.add(`${cat}::${kw}`)
    }
  }
  return [...items].map(x => { const [cat, name] = x.split('::'); return { cat, name } })
}

function groupByCategory(items) {
  const map = {}
  for (const it of items) (map[it.cat] ||= []).push(it.name)
  return Object.entries(map)
}

function copyList(shopping) {
  const text = groupByCategory(shopping).map(([cat, items]) => `▸ ${cat}:\n${items.map(i => `  ○ ${i}`).join('\n')}`).join('\n\n')
  navigator.clipboard?.writeText(text)
  alert('הרשימה הועתקה ללוח')
}
