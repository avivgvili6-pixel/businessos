import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs } from '../../../components/ui/UI'
import { activityFactors, goalAdjustments, dietTemplates } from '../../../utils/calc'
import { KEY_LIFTS } from '../../../data/programs'

export function Profile() {
  const { state, updateProfile, setWearable, set1RM, reset } = useApp()
  const [tab, setTab] = useState('info')
  const p = state.profile
  const set = (patch) => updateProfile(patch)

  return (
    <>
      <Tabs tabs={[
        { key:'info',       label:'פרטים' },
        { key:'strength',   label:'💪 יכולת מירבית (1RM)' },
        { key:'integrations',label:'אינטגרציות' },
        { key:'settings',   label:'הגדרות' },
      ]} active={tab} onChange={setTab} />

      {tab === 'strength' && <StrengthTab oneRMs={p.oneRMs || {}} set1RM={set1RM} personalRecords={state.personalRecords} />}

      {tab === 'info' && (
        <div style={{ display:'grid', gap: 16 }}>
          <Card>
            <SectionHeader title="פרטים אישיים" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <Input label="שם" value={p.name} onChange={e => set({ name: e.target.value })} />
              <Input type="number" label="גיל" value={p.age} onChange={e => set({ age: +e.target.value })} />
              <Select label="מין" value={p.sex} onChange={e => set({ sex: e.target.value })}>
                <option value="male">גבר</option><option value="female">אישה</option>
              </Select>
              <Input type="number" label="גובה (ס״מ)" value={p.heightCm} onChange={e => set({ heightCm: +e.target.value })} />
              <Input type="number" label="משקל (ק״ג)" value={p.weightKg} onChange={e => set({ weightKg: +e.target.value })} />
              <Select label="רמת פעילות" value={p.activity} onChange={e => set({ activity: e.target.value })}>
                {Object.entries(activityFactors).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select label="מטרה" value={p.goalKey} onChange={e => set({ goalKey: e.target.value })}>
                {Object.entries(goalAdjustments).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select label="תזונה" value={p.dietKey} onChange={e => set({ dietKey: e.target.value })}>
                {Object.entries(dietTemplates).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select label="ניסיון" value={p.experience} onChange={e => set({ experience: e.target.value })}>
                <option value="מתחיל">מתחיל</option><option value="בינוני">בינוני</option><option value="מתקדם">מתקדם</option>
              </Select>
            </div>
            <div style={{ marginTop: 14 }}>
              <Input label="הגבלות/פציעות" value={p.constraints} onChange={e => set({ constraints: e.target.value })} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'integrations' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {[
            { name:'Apple Health', icon:'', desc:'סנכרון צעדים, שינה, HR' },
            { name:'Google Fit',  icon:'🟢', desc:'סנכרון פעילות ושינה' },
            { name:'Garmin',      icon:'⌚', desc:'HRV, שינה, אימונים' },
            { name:'Whoop',       icon:'💪', desc:'Recovery, Strain' },
            { name:'Oura Ring',   icon:'💍', desc:'שינה, HRV, טמפרטורה' },
            { name:'MyFitnessPal',icon:'📱', desc:'ייבוא יומן אכילה' },
          ].map(g => (
            <Card key={g.name} hover style={{ padding: 18 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{g.icon}</span>
                <div style={{ fontWeight: 700 }}>{g.name}</div>
              </div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 14, minHeight: 40 }}>{g.desc}</div>
              <Button variant="outline" size="sm" onClick={() => setWearable({ source: g.name, sleepHours: 7.2, hrv: 62, steps: 8420, restingHR: 58, syncedAt: new Date().toISOString() })}>
                חבר (Mock)
              </Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ display:'grid', gap: 16 }}>
          <Card>
            <SectionHeader title="נתונים" />
            <div style={{ display:'flex', gap: 10, flexWrap:'wrap' }}>
              <Button variant="ghost" onClick={() => { const s = JSON.stringify(state, null, 2); navigator.clipboard?.writeText(s); alert('הועתק ללוח (JSON)') }}>ייצא נתונים</Button>
              <Button variant="danger" onClick={() => { if (confirm('לאפס את כל הנתונים?')) reset() }}>אפס הכל</Button>
            </div>
          </Card>
          <Card>
            <SectionHeader title="גרסה" />
            <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>Holistic Fitness OS · שלד ראשוני · v0.1</div>
          </Card>
        </div>
      )}
    </>
  )
}

function StrengthTab({ oneRMs, set1RM, personalRecords }) {
  // Auto-estimate from PRs (Epley: 1RM = w * (1 + r/30))
  const estimateFrom = (liftName) => {
    const prs = personalRecords.filter(pr => pr.exercise?.includes(liftName))
    if (!prs.length) return null
    return Math.round(Math.max(...prs.map(pr => pr.weight * (1 + pr.reps/30))))
  }
  const suggestions = {
    squat:    estimateFrom('סקוואט'),
    bench:    estimateFrom('לחיצת חזה'),
    deadlift: estimateFrom('דדליפט'),
    ohp:      estimateFrom('כתפ'),
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader
          title="יכולת מירבית (1RM)"
          subtitle="חשוב לחישוב אחוזים אמיתיים בתכניות אימון. הזן ערכים ידניים או השתמש בהערכה מ-PRs שלך."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {Object.values(KEY_LIFTS).map(lift => {
            const val = oneRMs[lift.key] || ''
            const suggested = suggestions[lift.key]
            return (
              <Card key={lift.key} style={{ padding: 16, background: t.color.bgSoft }}>
                <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>{lift.label}</div>
                <div style={{ display:'flex', gap: 8, alignItems:'end' }}>
                  <Input type="number" placeholder="ק״ג" value={val} onChange={e => set1RM(lift.key, e.target.value)} />
                  <span style={{ color: t.color.textMuted, fontSize: t.font.xs, alignSelf:'center' }}>ק״ג</span>
                </div>
                {suggested && (
                  <div style={{ marginTop: 8, display:'flex', gap: 8, alignItems:'center' }}>
                    <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>הערכה מ-PRs: {suggested} ק״ג</span>
                    {suggested !== +val && <button onClick={() => set1RM(lift.key, suggested)} style={{
                      background:'none', border:'none', color: t.color.gold, cursor:'pointer', fontSize: t.font.xs, textDecoration:'underline', fontFamily:'inherit',
                    }}>קבל</button>}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
        <div style={{ marginTop: 16, padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.6 }}>
          💡 <b style={{ color: t.color.gold }}>איך לקבוע 1RM?</b> עלייה הדרגתית לניסיון אמת, או שימוש בחישוב Epley: <code style={{ background: t.color.bg, padding:'2px 6px', borderRadius: 4 }}>1RM = משקל × (1 + חזרות/30)</code>. לדוגמה, אם עשית 100 ק״ג × 5, ה-1RM המוערך שלך: 117 ק״ג.
        </div>
      </Card>

      {Object.keys(oneRMs).length > 0 && (
        <Card>
          <SectionHeader title="פירוט אחוזים (למידה מהירה)" subtitle="המשקלים שתראה בתכניות אימון" />
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
                  <th style={{ textAlign:'right', padding:'10px 12px', fontSize: t.font.xs, color: t.color.textDim }}>תרגיל</th>
                  {[60, 70, 75, 80, 85, 90, 95].map(pct => (
                    <th key={pct} style={{ textAlign:'right', padding:'10px 12px', fontSize: t.font.xs, color: t.color.textDim }}>{pct}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(KEY_LIFTS).filter(l => oneRMs[l.key]).map(lift => (
                  <tr key={lift.key} style={{ borderBottom:`1px solid ${t.color.border}` }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{lift.label}</td>
                    {[60, 70, 75, 80, 85, 90, 95].map(pct => (
                      <td key={pct} style={{ padding: 12, color: t.color.gold, fontWeight: 700 }}>
                        {Math.round((oneRMs[lift.key] * pct/100) / 2.5) * 2.5}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
