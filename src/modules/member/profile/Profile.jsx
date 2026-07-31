import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs } from '../../../components/ui/UI'
import { activityFactors, goalAdjustments, dietTemplates } from '../../../utils/calc'

export function Profile() {
  const { state, updateProfile, setWearable, reset } = useApp()
  const [tab, setTab] = useState('info')
  const p = state.profile
  const set = (patch) => updateProfile(patch)

  return (
    <>
      <Tabs tabs={[
        { key:'info',       label:'פרטים' },
        { key:'integrations',label:'אינטגרציות' },
        { key:'settings',   label:'הגדרות' },
      ]} active={tab} onChange={setTab} />

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
