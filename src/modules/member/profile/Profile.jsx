import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs } from '../../../components/ui/UI'
import { activityFactors, goalAdjustments, dietTemplates } from '../../../utils/calc'
import { KEY_LIFTS } from '../../../data/programs'
import { useI18n } from '../../../i18n/i18n'
import { ProgressPhotosCard } from './ProgressPhotosCard'
import { LegalCenter } from '../../../components/legal/LegalCenter'

export function Profile({ go }) {
 const { state, updateProfile, setWearable, set1RM, reset } = useApp()
 const { isRTL } = useI18n()
 const [tab, setTab] = useState('info')
 const p = state.profile
 const set = (patch) => updateProfile(patch)

 return (
 <>
 <Tabs tabs={[
 { key:'info', label: isRTL ? 'פרטים' : 'Details'},
 { key:'photos', label: isRTL ? 'תמונות התקדמות' : 'Progress photos'},
 { key:'strength', label: isRTL ? 'יכולת מירבית (1RM)' : 'Max strength (1RM)'},
 { key:'integrations', label: isRTL ? 'אינטגרציות' : 'Integrations'},
 { key:'settings', label: isRTL ? 'הגדרות' : 'Settings'},
 ]} active={tab} onChange={setTab} />

 {tab === 'photos' && <ProgressPhotosCard go={go} />}

 {tab === 'strength'&& <StrengthTab oneRMs={p.oneRMs || {}} set1RM={set1RM} personalRecords={state.personalRecords} />}

 {tab === 'info'&& (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title={isRTL ? 'פרטים אישיים' : 'Personal details'} />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
 <Input label={isRTL ? 'שם' : 'Name'} value={p.name} onChange={e => set({ name: e.target.value })} />
 <Input type="number" label={isRTL ? 'גיל' : 'Age'} value={p.age} onChange={e => set({ age: +e.target.value })} />
 <Select label={isRTL ? 'מין' : 'Sex'} value={p.sex} onChange={e => set({ sex: e.target.value })}>
 <option value="male">{isRTL ? 'גבר' : 'Male'}</option><option value="female">{isRTL ? 'אישה' : 'Female'}</option>
 </Select>
 <Input type="number" label={isRTL ? 'גובה (ס״מ)' : 'Height (cm)'} value={p.heightCm} onChange={e => set({ heightCm: +e.target.value })} />
 <Input type="number" label={isRTL ? 'משקל (ק״ג)' : 'Weight (kg)'} value={p.weightKg} onChange={e => set({ weightKg: +e.target.value })} />
 <Select label={isRTL ? 'רמת פעילות' : 'Activity level'} value={p.activity} onChange={e => set({ activity: e.target.value })}>
 {Object.entries(activityFactors).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
 </Select>
 <Select label={isRTL ? 'מטרה' : 'Goal'} value={p.goalKey} onChange={e => set({ goalKey: e.target.value })}>
 {Object.entries(goalAdjustments).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
 </Select>
 <Select label={isRTL ? 'תזונה' : 'Diet'} value={p.dietKey} onChange={e => set({ dietKey: e.target.value })}>
 {Object.entries(dietTemplates).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
 </Select>
 <Select label={isRTL ? 'ניסיון' : 'Experience'} value={p.experience} onChange={e => set({ experience: e.target.value })}>
 <option value="מתחיל">{isRTL ? 'מתחיל' : 'Beginner'}</option><option value="בינוני">{isRTL ? 'בינוני' : 'Intermediate'}</option><option value="מתקדם">{isRTL ? 'מתקדם' : 'Advanced'}</option>
 </Select>
 </div>
 <div style={{ marginTop: 14 }}>
 <Input label={isRTL ? 'הגבלות/פציעות' : 'Restrictions/injuries'} value={p.constraints} onChange={e => set({ constraints: e.target.value })} />
 </div>
 </Card>
 </div>
 )}

 {tab === 'integrations'&& (
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
 {[
 { name:'Apple Health', icon:'', desc: isRTL ? 'סנכרון צעדים, שינה, HR' : 'Sync steps, sleep, HR'},
 { name:'Google Fit', icon:'', desc: isRTL ? 'סנכרון פעילות ושינה' : 'Sync activity and sleep'},
 { name:'Garmin', icon:'⌚', desc: isRTL ? 'HRV, שינה, אימונים' : 'HRV, sleep, workouts'},
 { name:'Whoop', icon:'', desc:'Recovery, Strain'},
 { name:'Oura Ring', icon:'', desc: isRTL ? 'שינה, HRV, טמפרטורה' : 'Sleep, HRV, temperature'},
 { name:'MyFitnessPal',icon:'', desc: isRTL ? 'ייבוא יומן אכילה' : 'Import food log'},
 ].map(g => (
 <Card key={g.name} hover style={{ padding: 18 }}>
 <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
 <span style={{ fontSize: 24 }}>{g.icon}</span>
 <div style={{ fontWeight: 700 }}>{g.name}</div>
 </div>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 14, minHeight: 40 }}>{g.desc}</div>
 <Button variant="outline"size="sm"onClick={() => setWearable({ source: g.name, sleepHours: 7.2, hrv: 62, steps: 8420, restingHR: 58, syncedAt: new Date().toISOString() })}>
 {isRTL ? 'חבר (Mock)' : 'Connect (Mock)'}
 </Button>
 </Card>
 ))}
 </div>
 )}

 {tab === 'settings'&& (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title={isRTL ? 'נתונים' : 'Data'} />
 <div style={{ display:'flex', gap: 10, flexWrap:'wrap'}}>
 <Button variant="ghost"onClick={() => { const s = JSON.stringify(state, null, 2); navigator.clipboard?.writeText(s); alert(isRTL ? 'הועתק ללוח (JSON)' : 'Copied to clipboard (JSON)') }}>{isRTL ? 'ייצא נתונים' : 'Export data'}</Button>
 <Button variant="danger"onClick={() => { if (confirm(isRTL ? 'לאפס את כל הנתונים?' : 'Reset all data?')) reset() }}>{isRTL ? 'אפס הכל' : 'Reset all'}</Button>
 </div>
 </Card>
 <Card>
 <LegalCenter />
 </Card>
 <Card>
 <SectionHeader title={isRTL ? 'גרסה' : 'Version'} />
 <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>Selano · v0.1</div>
 </Card>
 </div>
 )}
 </>
 )
}

function StrengthTab({ oneRMs, set1RM, personalRecords }) {
 const { isRTL } = useI18n()
 // Auto-estimate from PRs (Epley: 1RM = w * (1 + r/30))
 const estimateFrom = (liftName) => {
 const prs = personalRecords.filter(pr => pr.exercise?.includes(liftName))
 if (!prs.length) return null
 return Math.round(Math.max(...prs.map(pr => pr.weight * (1 + pr.reps/30))))
 }
 const suggestions = {
 squat: estimateFrom('סקוואט'),
 bench: estimateFrom('לחיצת חזה'),
 deadlift: estimateFrom('דדליפט'),
 ohp: estimateFrom('כתפ'),
 }

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader
 title={isRTL ? 'יכולת מירבית (1RM)' : 'Max strength (1RM)'}
 subtitle={isRTL ? 'חשוב לחישוב אחוזים אמיתיים בתכניות אימון. הזן ערכים ידניים או השתמש בהערכה מ-PRs שלך.' : 'Needed for accurate % calculations in training plans. Enter values manually or use the estimate from your PRs.'}
 />
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
 {Object.values(KEY_LIFTS).map(lift => {
 const val = oneRMs[lift.key] || ''
 const suggested = suggestions[lift.key]
 return (
 <Card key={lift.key} style={{ padding: 16, background: t.color.bgSoft }}>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8 }}>{lift.label}</div>
 <div style={{ display:'flex', gap: 8, alignItems:'end'}}>
 <Input type="number" placeholder={isRTL ? 'ק״ג' : 'kg'} value={val} onChange={e => set1RM(lift.key, e.target.value)} />
 <span style={{ color: t.color.textMuted, fontSize: t.font.xs, alignSelf:'center'}}>{isRTL ? 'ק״ג' : 'kg'}</span>
 </div>
 {suggested && (
 <div style={{ marginTop: 8, display:'flex', gap: 8, alignItems:'center'}}>
 <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>{isRTL ? 'הערכה מ-PRs' : 'Estimate from PRs'}: {suggested} {isRTL ? 'ק״ג' : 'kg'}</span>
 {suggested !== +val && <button onClick={() => set1RM(lift.key, suggested)} style={{
 background:'none', border:'none', color: t.color.gold, cursor:'pointer', fontSize: t.font.xs, textDecoration:'underline', fontFamily:'inherit',
 }}>{isRTL ? 'קבל' : 'Accept'}</button>}
 </div>
 )}
 </Card>
 )
 })}
 </div>
 <div style={{ marginTop: 16, padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.6 }}>
 <b style={{ color: t.color.gold }}>{isRTL ? 'איך לקבוע 1RM?' : 'How to set your 1RM?'}</b> {isRTL ? 'עלייה הדרגתית לניסיון אמת, או שימוש בחישוב Epley:' : 'Ramp up gradually to a real attempt, or use the Epley formula:'} <code style={{ background: t.color.bg, padding:'2px 6px', borderRadius: 4 }}>{isRTL ? '1RM = משקל × (1 + חזרות/30)' : '1RM = weight × (1 + reps/30)'}</code>. {isRTL ? 'לדוגמה, אם עשית 100 ק״ג × 5, ה-1RM המוערך שלך: 117 ק״ג.' : 'Example: 100 kg × 5 → estimated 1RM: 117 kg.'}
 </div>
 </Card>

 {Object.keys(oneRMs).length > 0 && (
 <Card>
 <SectionHeader title={isRTL ? 'פירוט אחוזים (למידה מהירה)' : 'Percentage breakdown (quick lookup)'} subtitle={isRTL ? 'המשקלים שתראה בתכניות אימון' : 'The weights you\'ll see in training plans'} />
 <div style={{ overflowX:'auto'}}>
 <table style={{ width:'100%', borderCollapse:'collapse', minWidth: 600 }}>
 <thead>
 <tr style={{ borderBottom:`1px solid ${t.color.border}` }}>
 <th style={{ textAlign:'right', padding:'10px 12px', fontSize: t.font.xs, color: t.color.textDim }}>{isRTL ? 'תרגיל' : 'Exercise'}</th>
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
