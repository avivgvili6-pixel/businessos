import React, { useEffect, useMemo } from 'react'
import { t } from '../../theme/tokens'
import { Button } from '../ui/UI'
import { randomCompletionMessage } from '../../data/motivation'

// Celebratory modal shown after finishing a workout.
// Includes confetti (pure CSS), streak, week progress unlock hint,
// motivation phrase, and share actions.

export function WorkoutComplete({ open, onClose, weekCompletion, currentWeek, streak = 0, sessionName = '' }) {
  const message = useMemo(() => open ? randomCompletionMessage() : '', [open])
  const needMore = weekCompletion ? Math.max(0, Math.ceil(0.75 * weekCompletion.total) - weekCompletion.done) : 0

  useEffect(() => {
    if (!open) return
    // Light haptic on mobile
    if (navigator.vibrate) navigator.vibrate([80, 30, 80])
  }, [open])

  if (!open) return null

  const shareText = `סיימתי אימון! 💪\n"${message}"\n\nאני משתמש/ת ב-Selano Holistic Fitness OS`

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  const copyText = () => {
    try {
      navigator.clipboard?.writeText(shareText)
      alert('הועתק! 📋')
    } catch (e) { alert('לא הצליח להעתיק - נסה שוב') }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 2000,
      display: 'grid', placeItems: 'center', padding: 20,
      animation: 'hfos-fade 0.3s ease',
    }}>
      {/* Confetti - pure CSS */}
      <Confetti />

      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', maxWidth: 460, width: '100%',
        background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`,
        border: `2px solid ${t.color.gold}`,
        borderRadius: t.radius.lg, padding: 32, textAlign: 'center',
        direction: 'rtl', boxShadow: `0 20px 60px rgba(200,168,75,.4)`,
        animation: 'hfos-pop 0.5s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Trophy */}
        <div style={{ fontSize: 84, marginBottom: 12, filter: 'drop-shadow(0 0 20px rgba(200,168,75,.6))' }}>🏆</div>

        <h1 style={{
          fontSize: 34, fontWeight: 900, marginBottom: 8,
          background: `linear-gradient(135deg, ${t.color.gold} 0%, #ffd782 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>כל הכבוד! ✨</h1>

        {sessionName && (
          <div style={{ fontSize: t.font.md, color: t.color.text, marginBottom: 16, opacity: 0.85 }}>
            סיימת: <b>{sessionName}</b>
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20,
        }}>
          {streak > 0 && (
            <div style={{ padding: 12, background: `${t.color.warning}20`, borderRadius: t.radius.md, border: `1px solid ${t.color.warning}` }}>
              <div style={{ fontSize: 28 }}>🔥</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>סטריק</div>
              <div style={{ fontSize: t.font.xl, fontWeight: 900, color: t.color.warning }}>{streak} ימים</div>
            </div>
          )}
          {weekCompletion && (
            <div style={{ padding: 12, background: `${t.color.gold}15`, borderRadius: t.radius.md, border: `1px solid ${t.color.gold}` }}>
              <div style={{ fontSize: 28 }}>📅</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>שבוע {currentWeek}</div>
              <div style={{ fontSize: t.font.xl, fontWeight: 900, color: t.color.gold }}>{weekCompletion.done}/{weekCompletion.total}</div>
            </div>
          )}
        </div>

        {/* Message */}
        <div style={{
          padding: 16, background: t.color.bgSoft, borderRadius: t.radius.md,
          fontSize: t.font.md, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16,
          border: `1px solid ${t.color.border}`, minHeight: 60,
        }}>
          "{message}"
        </div>

        {/* Progress unlock hint */}
        {weekCompletion && !weekCompletion.complete && needMore > 0 && (
          <div style={{
            padding: 12, background: `${t.color.info}15`, borderRadius: t.radius.md,
            border: `1px solid ${t.color.info}`, marginBottom: 16, fontSize: t.font.sm,
            color: t.color.info, fontWeight: 700,
          }}>
            עוד {needMore} ותפתח שבוע {currentWeek + 1} 🔓
          </div>
        )}

        {weekCompletion?.complete && (
          <div style={{
            padding: 12, background: `${t.color.success}15`, borderRadius: t.radius.md,
            border: `1px solid ${t.color.success}`, marginBottom: 16, fontSize: t.font.sm,
            color: t.color.success, fontWeight: 700,
          }}>
            ✓ סיימת 75%+ - שבוע הבא נפתח!
          </div>
        )}

        {/* Share */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <Button variant="outline" size="sm" icon="📱" onClick={shareWhatsApp}>שתף ב-WhatsApp</Button>
          <Button variant="outline" size="sm" icon="📋" onClick={copyText}>העתק</Button>
        </div>

        <Button size="lg" onClick={onClose} style={{ width: '100%' }}>המשך 🚀</Button>
      </div>

      <style>{`
        @keyframes hfos-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes hfos-pop {
          0% { transform: scale(.6); opacity: 0 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes hfos-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1 }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0.6 }
        }
      `}</style>
    </div>
  )
}

function Confetti() {
  const colors = ['#c8a84b', '#ffd782', '#3fbf5c', '#5aa0ff', '#ff6666', '#e0a05a']
  const pieces = Array.from({ length: 40 })
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 1
        const duration = 2.5 + Math.random() * 2
        const color = colors[i % colors.length]
        const size = 8 + Math.random() * 8
        return (
          <div key={i} style={{
            position: 'absolute', top: -20, left: `${left}%`,
            width: size, height: size, background: color,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            animation: `hfos-fall ${duration}s ${delay}s linear forwards`,
          }} />
        )
      })}
    </div>
  )
}
