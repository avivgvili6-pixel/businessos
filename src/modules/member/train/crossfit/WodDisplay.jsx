import React, { useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Card, Button, Badge } from '../../../../components/ui/UI'
import { FORMATS } from '../../../../data/crossfit/formats'

// WOD Display — the monospace "written prescription"panel, wod-gpt style.
// Includes copy-to-clipboard and video-tips expander.
export function WodDisplay({ wod, onStart, onRegenerate, onShowVideos }) {
 const [copied, setCopied] = useState(false)

 if (wod?.error) {
 return (
 <Card style={{ borderColor: t.color.danger, textAlign:'center'}}>
 <div style={{ fontSize: 40, marginBottom: 8 }}> </div>
 <div style={{ color: t.color.danger, fontWeight: 700 }}>{wod.error}</div>
 </Card>
 )
 }

 if (!wod?.lines?.length) return null

 const fmt = FORMATS[wod.format] || FORMATS.amrap

 async function copyText() {
 const text = wod.lines.join('\n')
 try {
 await navigator.clipboard.writeText(text)
 setCopied(true)
 setTimeout(() => setCopied(false), 2000)
 } catch {}
 }

 return (
 <Card glow style={{ borderColor: t.color.gold }}>
 <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: t.space.md }}>
 <span style={{ fontSize: 22 }}>{fmt.icon}</span>
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: t.font.xl, fontWeight: 800, color: t.color.gold }}>{wod.title}</div>
 <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{fmt.description}</div>
 </div>
 <Badge color={t.color.gold}>{fmt.he}</Badge>
 </div>

 <pre style={{
 background: t.color.bg, border: `1px solid ${t.color.border}`,
 borderRadius: t.radius.sm, padding: t.space.lg,
 fontFamily:'Space Mono, ui-monospace, monospace',
 fontSize: t.font.md, color: t.color.text, lineHeight: 1.7,
 whiteSpace:'pre-wrap', direction:'rtl', textAlign:'right',
 margin: 0, overflowX:'auto',
 }}>
 {wod.lines.join('\n')}
 </pre>

 {wod.movements?.length > 0 && (
 <div style={{ marginTop: t.space.md, display:'flex', flexWrap:'wrap', gap: 6 }}>
 {wod.movements.map(m => (
 <Badge key={m.id} color={t.color.info}>{m.he}</Badge>
 ))}
 </div>
 )}

 <div style={{ display:'flex', gap: 8, marginTop: t.space.lg, flexWrap:'wrap'}}>
 <Button variant="primary"size="lg"onClick={onStart} style={{ flex: 1, minWidth: 140, justifyContent:'center'}}>
 ▶ התחל את ה-WOD
 </Button>
 <Button variant="ghost"onClick={onRegenerate}> מחולל חדש</Button>
 <Button variant="ghost"onClick={copyText}>
 {copied ? ' הועתק':' העתק'}
 </Button>
 {onShowVideos && (
 <Button variant="ghost" onClick={onShowVideos}> דגשי ביצוע</Button>
 )}
 </div>
 </Card>
 )
}
