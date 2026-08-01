import React, { useEffect, useState } from 'react'
import { t } from '../../theme/tokens'
import { storage } from '../../utils/storage'

// Listens for the browser's `beforeinstallprompt` event (Chrome/Edge/Android)
// and shows a subtle button that triggers the native install dialog.
// On iOS, shows a short "add to home screen"hint instead.
export function InstallPrompt() {
 const [deferredPrompt, setDeferredPrompt] = useState(null)
 const [dismissed, setDismissed] = useState(() => !!storage.get('install-dismissed'))
 const [showIosHint, setShowIosHint] = useState(false)

 useEffect(() => {
 const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
 window.addEventListener('beforeinstallprompt', handler)
 // iOS Safari doesn't fire beforeinstallprompt - detect it
 const ua = navigator.userAgent
 const isIos = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS/i.test(ua)
 const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
 if (isIos && !isStandalone && !storage.get('install-dismissed')) {
 setTimeout(() => setShowIosHint(true), 2500)
 }
 return () => window.removeEventListener('beforeinstallprompt', handler)
 }, [])

 if (dismissed) return null

 const install = async () => {
 if (!deferredPrompt) return
 deferredPrompt.prompt()
 const choice = await deferredPrompt.userChoice
 setDeferredPrompt(null)
 if (choice.outcome === 'accepted') dismiss()
 }

 const dismiss = () => {
 setDismissed(true); setShowIosHint(false)
 storage.set('install-dismissed', true)
 }

 if (deferredPrompt) return (
 <PromptBanner onDismiss={dismiss}>
 <span style={{ fontSize: 20 }}> </span>
 <div style={{ flex: 1, fontSize: t.font.sm }}>
 <b>התקן את האפליקציה</b> - גישה מהירה מהמסך הראשי
 </div>
 <button onClick={install} style={{
 padding:'6px 14px', background: t.color.gold, color:'#0d0d14',
 border:'none', borderRadius: t.radius.pill, fontFamily:'inherit', fontWeight: 700, cursor:'pointer',
 }}>התקן</button>
 </PromptBanner>
 )

 if (showIosHint) return (
 <PromptBanner onDismiss={dismiss}>
 <span style={{ fontSize: 20 }}> </span>
 <div style={{ flex: 1, fontSize: t.font.sm, lineHeight: 1.5 }}>
 <b>התקן לאייפון:</b> Safari ← <span style={{ fontSize: 16 }}>⬆️</span> ← "הוסף למסך הבית"
 </div>
 </PromptBanner>
 )

 return null
}

function PromptBanner({ children, onDismiss }) {
 return (
 <div style={{
 position:'fixed', bottom: 76, left: 12, right: 12, zIndex: 950,
 background: t.color.bgElevated, border:`1px solid ${t.color.gold}`,
 borderRadius: t.radius.lg, padding: 12, display:'flex', alignItems:'center', gap: 12,
 boxShadow: t.shadow.lg, maxWidth: 500, margin:'0 auto',
 }}>
 {children}
 <button onClick={onDismiss} style={{
 background:'none', border:'none', color: t.color.textDim, cursor:'pointer', fontSize: 18, padding: 4,
 }}> </button>
 </div>
 )
}
