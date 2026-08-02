import React from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Badge, SectionHeader } from '../../../components/ui/UI'
import { useI18n } from '../../../i18n/i18n'

// Progress photos onboarding + reminder — lives in the Profile module
// so the user opts in from their own settings, instead of getting a
// permanent banner on the home dashboard.

export function ProgressPhotosCard({ go }) {
  const { state } = useApp()
  const { isRTL } = useI18n()
  const photos = state.progressPhotos || []
  const last = photos[0]
  const daysSince = last
    ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000)
    : null
  const isFirstTime = photos.length === 0

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card style={{
        padding: 20,
        background: `linear-gradient(135deg, ${t.color.wineLight}15 0%, ${t.color.bgElevated} 100%)`,
        border: `1px solid ${t.color.wineLight}66`,
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Badge color={t.color.wineLight}>
              {isFirstTime
                ? (isRTL ? 'תחילת מסע' : 'Start of the journey')
                : (isRTL ? 'התקדמות חזותית' : 'Visual progress')}
            </Badge>
            <div style={{ fontWeight: 800, fontSize: t.font.lg, marginTop: 8, marginBottom: 6 }}>
              {isFirstTime
                ? (isRTL ? 'צלם תמונת התחלה של המסע' : 'Take a start-of-journey photo')
                : (isRTL ? `עברו ${daysSince} ימים מהתמונה האחרונה` : `${daysSince} days since your last photo`)}
            </div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm, lineHeight: 1.55, maxWidth: 520 }}>
              {isFirstTime
                ? (isRTL
                  ? 'תמונה אחת עכשיו — השוואה מדהימה עוד חודשיים. חזית, צד וגב, אור טבעי, בגדים אחידים כל פעם.'
                  : 'One photo now = a striking comparison in two months. Front, side, back — natural light, same clothes each time.')
                : (isRTL
                  ? 'תמונה אחת כל שבועיים שווה יותר ממאה שקילות. אחריות תזכורות עוברת אליך בכל זמן שבו תשוב לטאב הזה.'
                  : 'One photo every two weeks tells you more than a hundred weigh-ins. This tab is the reminder — check in here whenever you want.')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <Button onClick={() => go?.('progress')}>
            {isFirstTime
              ? (isRTL ? 'העלה תמונה ראשונה' : 'Upload the first photo')
              : (isRTL ? 'העלה תמונה חדשה' : 'Upload a new photo')}
          </Button>
          {!isFirstTime && (
            <Button variant="outline" onClick={() => go?.('progress')}>
              {isRTL ? 'השווה תמונות' : 'Compare photos'}
            </Button>
          )}
        </div>
      </Card>

      {photos.length > 0 && (
        <Card>
          <SectionHeader
            title={isRTL ? 'התמונות שלי' : 'My photos'}
            subtitle={isRTL ? `${photos.length} תמונות במסע שלך` : `${photos.length} photos in your journey`}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10,
          }}>
            {photos.slice(0, 12).map((p, i) => (
              <div key={i} style={{
                aspectRatio: '3 / 4',
                background: t.color.bgSoft,
                border: `1px solid ${t.color.border}`,
                borderRadius: t.radius.md,
                overflow: 'hidden', position: 'relative',
              }}>
                {p.dataUrl && (
                  <img
                    src={p.dataUrl}
                    alt={p.date}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '4px 8px', fontSize: 10,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: t.color.bone, fontFamily: t.font.family.mono,
                  letterSpacing: '0.1em',
                }}>
                  {new Date(p.date).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
                </div>
              </div>
            ))}
          </div>
          {photos.length > 12 && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <Button variant="ghost" size="sm" onClick={() => go?.('progress')}>
                {isRTL ? `צפה בכל ${photos.length} התמונות` : `See all ${photos.length} photos`}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
