import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Badge, SectionHeader, Modal } from '../../../components/ui/UI'
import { Heatmap } from '../../../components/charts/Charts'
import { useI18n } from '../../../i18n/i18n'

export function Habits() {
 const { state, toggleHabit, addHabit, removeHabit } = useApp()
 const { isRTL } = useI18n()
 const [open, setOpen] = useState(false)
 const [name, setName] = useState('')
 const [icon, setIcon] = useState('')

 const doneToday = state.habits.filter(h => h.doneToday).length
 const totalStreak = state.habits.reduce((s, h) => s + h.streak, 0)

 return (
 <div style={{ display:'grid', gap: 16 }}>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
 <Card style={{ padding: 20 }}>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>{isRTL ? 'הרגלים היום' : 'Habits today'}</div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold }}>{doneToday}/{state.habits.length}</div>
 </Card>
 <Card style={{ padding: 20 }}>
 <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 6 }}>{isRTL ? 'סה״כ streaks' : 'Total streaks'}</div>
 <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.success }}>{totalStreak} </div>
 </Card>
 </div>

 <Card>
 <SectionHeader
   title={isRTL ? 'ההרגלים שלי' : 'My habits'}
   action={<Button onClick={() => setOpen(true)}>+ {isRTL ? 'הרגל חדש' : 'New habit'}</Button>}
 />
 <div style={{ display:'grid', gap: 10 }}>
 {state.habits.map(h => (
 <div key={h.id} style={{
 display:'flex', alignItems:'center', gap: 12, padding: 14,
 background: h.doneToday ? t.color.goldGlow : t.color.bgSoft,
 borderRadius: t.radius.md, border: `1px solid ${h.doneToday ? t.color.gold : t.color.border}`,
 transition: t.transition,
 }}>
 <button onClick={() => toggleHabit(h.id)} style={{
 width: 32, height: 32, borderRadius: 8, cursor:'pointer',
 background: h.doneToday ? t.color.gold :'transparent',
 border:`2px solid ${h.doneToday ? t.color.gold : t.color.border}`,
 color:'#0d0d14', fontWeight: 900,
 }}>{h.doneToday ? '' :''}</button>
 <span style={{ fontSize: 24 }}>{h.icon}</span>
 <div style={{ flex: 1 }}>
 <div style={{ fontWeight: 600, color: h.doneToday ? t.color.gold : t.color.text }}>{h.name}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
   {h.streak} {isRTL ? 'ימים ברצף' : 'day streak'}
 </div>
 </div>
 <Button variant="ghost" size="sm" onClick={() => removeHabit(h.id)}>{isRTL ? 'הסר' : 'Remove'}</Button>
 </div>
 ))}
 </div>
 </Card>

 <Card>
 <SectionHeader
   title={isRTL ? 'עקביות ב-8 שבועות אחרונים' : 'Consistency · last 8 weeks'}
   subtitle={isRTL ? 'דמו · יתמלא לפי ההרגלים שלך' : 'Demo · fills in with your actual habits'}
 />
 <Heatmap weeks={8} seed={state.habits.length} />
 <div style={{ display:'flex', gap: 4, alignItems:'center', justifyContent:'flex-end', marginTop: 12, fontSize: t.font.xs, color: t.color.textDim }}>
 {isRTL ? 'פחות' : 'Less'}
 <div style={{ display:'flex', gap: 3 }}>
 {[0,1,2,3,4].map(v => <div key={v} style={{ width:10, height:10, borderRadius:2, background: [t.color.bgSoft, `${t.color.gold}33`, `${t.color.gold}66`, `${t.color.gold}aa`, t.color.gold][v] }} />)}
 </div>
 {isRTL ? 'יותר' : 'More'}
 </div>
 </Card>

 <Modal open={open} onClose={() => setOpen(false)} title={isRTL ? 'הרגל חדש' : 'New habit'}>
 <div style={{ display:'grid', gap: 12 }}>
 <Input
   label={isRTL ? 'שם ההרגל' : 'Habit name'}
   placeholder={isRTL ? 'לדוגמה: מדיטציה 10 דק׳' : 'e.g. Meditation 10 min'}
   value={name} onChange={e => setName(e.target.value)}
 />
 <Input
   label={isRTL ? 'אייקון' : 'Icon'}
   placeholder=" "
   value={icon} onChange={e => setIcon(e.target.value)}
 />
 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end'}}>
 <Button variant="ghost" onClick={() => setOpen(false)}>{isRTL ? 'בטל' : 'Cancel'}</Button>
 <Button onClick={() => { if (name) { addHabit({ id:'h_'+Date.now(), name, icon, streak:0, doneToday:false }); setName(''); setIcon(''); setOpen(false) } }}>{isRTL ? 'הוסף' : 'Add'}</Button>
 </div>
 </div>
 </Modal>
 </div>
 )
}
