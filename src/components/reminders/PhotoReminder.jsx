import React from 'react'
import { t } from '../../theme/tokens'
import { useApp } from '../../store/AppStore'
import { Card, Button, Badge } from '../ui/UI'

// Reminds the user to take a progress photo every 14 days.
// Shows a prominent card until they upload a new photo.

const REMINDER_DAYS = 14
const DISMISSED_KEY = 'hfos:photo_dismissed'

export function PhotoReminder({ go }) {
 const { state } = useApp()
 const [dismissedAt, setDismissedAt] = React.useState(() => localStorage.getItem(DISMISSED_KEY))
 const photos = state.progressPhotos || []
 const last = photos[0] // photos are stored newest-first

 const daysSince = last ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000) : Infinity
 const daysAgo = daysSince === Infinity ? 0 : daysSince

 // Don't show if:
 // - user has photos AND fewer than 14 days passed
 // - user dismissed today
 const dismissedToday = dismissedAt === new Date().toISOString().slice(0, 10)
 if (dismissedToday) return null
 if (last && daysSince < REMINDER_DAYS) return null

 const dismiss = () => {
 const today = new Date().toISOString().slice(0, 10)
 localStorage.setItem(DISMISSED_KEY, today)
 setDismissedAt(today)
 }

 const isFirstTime = photos.length === 0

 return (
 <Card style={{
 padding: 18,
 background: `linear-gradient(135deg, ${t.color.info}22 0%, ${t.color.bgElevated} 100%)`,
 border: `1px solid ${t.color.info}`,
 position:'relative',
 }}>
 <button onClick={dismiss} aria-label="דחה"style={{
 position:'absolute', top: 10, left: 10, background:'transparent',
 border:'none', color: t.color.textDim, cursor:'pointer',
 fontSize: 18, width: 24, height: 24,
 }}> </button>

 <div style={{ display:'flex', gap: 14, alignItems:'flex-start', flexWrap:'wrap'}}>
 <div style={{ fontSize: 44 }}> </div>
 <div style={{ flex: 1, minWidth: 200 }}>
 <Badge color={t.color.info}>{isFirstTime ? 'תמונת התחלה':'תזכורת שבועיים'}</Badge>
 <div style={{ fontWeight: 800, fontSize: t.font.lg, marginTop: 6, marginBottom: 4 }}>
 {isFirstTime
 ? 'צלם/י תמונת התחלה של המסע'
 : `עברו ${daysAgo} יום מהתמונה האחרונה - זמן לחדשה!`}
 </div>
 <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.5 }}>
 {isFirstTime
 ? 'תמונה אחת עכשיו = השוואות מדהימות עוד חודשיים. חזית, צד, גב - במראה טובה, אור טבעי.'
 :'בכל שבועיים תראה שינוי אמיתי בגוף. תמונה אחת - שווה יותר ממאה מדידות משקל.'}
 </div>
 </div>
 </div>

 <div style={{ display:'flex', gap: 8, marginTop: 14, flexWrap:'wrap'}}>
 <Button icon=" "onClick={() => go?.('progress')}>
 {isFirstTime ? 'העלה תמונה ראשונה':'העלה תמונה חדשה'}
 </Button>
 {!isFirstTime && (
 <Button variant="outline" onClick={() => go?.('progress')}> השווה תמונות</Button>
 )}
 </div>
 </Card>
 )
}
