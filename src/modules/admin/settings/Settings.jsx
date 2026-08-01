import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Badge, SectionHeader, Button, Input, Tabs, Select } from '../../../components/ui/UI'

export function Settings() {
 const [tab, setTab] = useState('gym')
 return (
 <>
 <Tabs tabs={[
 { key:'gym', label:'פרטי מתחם'},
 { key:'brand', label:'מיתוג'},
 { key:'policies', label:'מדיניות'},
 { key:'ai', label:'הגדרות AI'},
 ]} active={tab} onChange={setTab} />

 {tab === 'gym'&& <GymSettings />}
 {tab === 'brand'&& <BrandSettings />}
 {tab === 'policies'&& <Policies />}
 {tab === 'ai'&& <AiSettings />}
 </>
 )
}

function GymSettings() {
 return (
 <Card>
 <SectionHeader title="פרטי המתחם"/>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
 <Input label="שם המתחם"defaultValue="Holistic FIT Studio"/>
 <Input label="ח.פ / ע.מ"defaultValue="514200365"/>
 <Input label="כתובת"defaultValue="הברזל 12, תל אביב"/>
 <Input label="טלפון"defaultValue="03-1234567"/>
 <Input label="אימייל"defaultValue="info@holisticfit.co.il"/>
 <Input label="שעות פעילות"defaultValue="6:00-23:00"/>
 </div>
 <div style={{ marginTop: 20, textAlign:'left'}}>
 <Button>שמור שינויים</Button>
 </div>
 </Card>
 )
}

function BrandSettings() {
 return (
 <div style={{ display:'grid', gap: 16 }}>
 <Card>
 <SectionHeader title="לוגו ומיתוג"/>
 <div style={{ display:'flex', alignItems:'center', gap: 16, marginBottom: 20 }}>
 <div style={{ width: 80, height: 80, borderRadius: 20, background: t.color.gold, color:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 900, fontSize: 36 }}>H</div>
 <div>
 <Button variant="outline"size="sm">העלה לוגו חדש</Button>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 6 }}>PNG/SVG · מומלץ 512×512</div>
 </div>
 </div>
 </Card>
 <Card>
 <SectionHeader title="פלטת צבעים"subtitle="White label - יופיע גם באפליקציית המתאמנים"/>
 <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
 {[
 { label:'צבע ראשי', color: t.color.gold },
 { label:'צבע רקע', color: t.color.bg },
 { label:'טקסט', color: t.color.text },
 { label:'הדגשה', color: t.color.success },
 ].map((c, i) => (
 <div key={i} style={{ padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md }}>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 8 }}>{c.label}</div>
 <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
 <div style={{ width: 32, height: 32, background: c.color, borderRadius: 6, border: `1px solid ${t.color.border}` }} />
 <div style={{ fontFamily:'Space Mono, monospace', fontSize: t.font.xs }}>{c.color}</div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )
}

function Policies() {
 return (
 <div style={{ display:'grid', gap: 12 }}>
 <Card>
 <SectionHeader title="מדיניות ביטולים"/>
 <div style={{ display:'grid', gap: 12 }}>
 <Input label="ביטול שיעור עד"defaultValue="4 שעות מראש"/>
 <Input label="עמלת no-show"defaultValue="₪50"/>
 <Input label="הקפאת מנוי"defaultValue="עד חודשיים בשנה"/>
 </div>
 </Card>
 <Card>
 <SectionHeader title="טפסים חובה"/>
 <div style={{ display:'grid', gap: 8 }}>
 {['הצהרת בריאות','ויתור אחריות','מדיניות פרטיות','תקנון'].map(f => (
 <div key={f} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
 <span>{f}</span>
 <div style={{ display:'flex', gap: 8 }}>
 <Badge color={t.color.success}>פעיל</Badge>
 <Button variant="ghost"size="sm">ערוך</Button>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </div>
 )
}

function AiSettings() {
 return (
 <div style={{ display:'grid', gap: 12 }}>
 <Card>
 <SectionHeader title="מנוע התאמות אוטומטיות"subtitle="הגדרות רגישות של Adaptation Engine"/>
 <div style={{ display:'grid', gap: 14 }}>
 <div>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
 <span style={{ fontSize: t.font.sm }}>סף התראת סיכון נטישה</span>
 <span style={{ color: t.color.gold, fontWeight: 700 }}>7 ימים ללא פעילות</span>
 </div>
 <input type="range"min="3"max="21"defaultValue="7"style={{ width:'100%'}} />
 </div>
 <div>
 <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
 <span style={{ fontSize: t.font.sm }}>סף ירידת ביצועים להתראה</span>
 <span style={{ color: t.color.gold, fontWeight: 700 }}>15% ב-3 שבועות</span>
 </div>
 <input type="range"min="5"max="30"defaultValue="15"style={{ width:'100%' }} />
 </div>
 <Select label="מודל AI לתובנות">
 <option>Claude Opus (מומלץ)</option>
 <option>Rule-based בלבד</option>
 <option>היברידי</option>
 </Select>
 </div>
 </Card>
 <Card>
 <SectionHeader title="שלב AI" />
 <div style={{ padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.7 }}>
 במצב MVP - מנוע חוקים בלבד. חיבור לספק LLM (Claude API) יתאפשר בגרסה הבאה עם ניתוח דפוסים עמוק, שיחות טבעיות ותובנות אישיות.
 </div>
 </Card>
 </div>
 )
}
