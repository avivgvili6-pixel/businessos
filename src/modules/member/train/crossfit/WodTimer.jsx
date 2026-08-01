import React, { useEffect, useRef, useState } from 'react'
import { t } from '../../../../theme/tokens'
import { Card, Button, Modal, Badge } from '../../../../components/ui/UI'
import { FORMATS } from '../../../../data/crossfit/formats'

// Universal WOD timer — different UI per format.
// Handles: emom, amrap, for_time, intervals, chipper (as for_time), strength_metcon (as for_time).
export function WodTimer({ wod, open, onClose, onComplete }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [rounds, setRounds] = useState(0)   // AMRAP rounds
  const [finalTime, setFinalTime] = useState(null)
  const startedAt = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!open) {
      // Reset when closed
      setRunning(false); setElapsed(0); setRounds(0); setFinalTime(null)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
  }, [open])

  useEffect(() => {
    if (running) {
      startedAt.current = Date.now() - elapsed * 1000
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000))
      }, 250)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  if (!wod) return null

  const timeCap = wod.timeCap || 0
  const remaining = Math.max(0, timeCap - elapsed)
  const isTimeUp = timeCap > 0 && elapsed >= timeCap

  // Auto-stop when time cap reached (AMRAP/EMOM/Intervals)
  useEffect(() => {
    if (isTimeUp && running && ['amrap', 'emom', 'intervals'].includes(wod.format)) {
      setRunning(false)
      setFinalTime(elapsed)
    }
  }, [isTimeUp, running, wod.format])

  function handleStart() { setRunning(true) }
  function handlePause() { setRunning(false) }
  function handleReset() { setRunning(false); setElapsed(0); setRounds(0); setFinalTime(null) }
  function handleFinishForTime() {
    setRunning(false)
    setFinalTime(elapsed)
  }
  function handleSave() {
    if (onComplete) {
      onComplete({
        wod, elapsed, rounds,
        finalTime: finalTime ?? elapsed,
        completedAt: new Date().toISOString(),
      })
    }
    onClose()
  }

  const currentMinute = Math.floor(elapsed / 60)
  const secondsInMinute = elapsed % 60
  const isEMOM = wod.format === 'emom'
  const isAMRAP = wod.format === 'amrap'
  const isForTime = wod.format === 'for_time' || wod.format === 'chipper' || wod.format === 'strength_metcon'
  const isIntervals = wod.format === 'intervals'

  // Intervals: figure out current phase (work/rest)
  let intervalPhase = null
  if (isIntervals && wod.meta) {
    const cycle = wod.meta.workSec + wod.meta.restSec
    const inCycle = elapsed % cycle
    intervalPhase = inCycle < wod.meta.workSec ? 'work' : 'rest'
  }

  return (
    <Modal open={open} onClose={onClose} title={wod.title} width={520}>
      {/* Big timer display */}
      <Card style={{
        background: isEMOM ? `${t.color.purple}22` : isAMRAP ? `${t.color.gold}22` : t.color.bgSoft,
        borderColor: isTimeUp ? t.color.danger : (isIntervals && intervalPhase === 'rest' ? t.color.info : t.color.gold),
        textAlign: 'center', marginBottom: t.space.md,
      }}>
        <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: 4 }}>
          {isForTime && finalTime == null && 'זמן שחלף'}
          {isForTime && finalTime != null && '🏆 זמן סופי'}
          {isAMRAP && (isTimeUp ? '⏱️ הזמן נגמר' : 'זמן שנותר')}
          {isEMOM && (isTimeUp ? '⏱️ סיימת' : `דקה ${currentMinute + 1} מתוך ${Math.floor(timeCap / 60)}`)}
          {isIntervals && (
            <span style={{ color: intervalPhase === 'work' ? t.color.gold : t.color.info, fontWeight: 700 }}>
              {intervalPhase === 'work' ? '💪 עבודה' : '😌 מנוחה'}
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'Space Mono, ui-monospace, monospace',
          fontSize: 72, fontWeight: 900,
          color: isTimeUp ? t.color.danger :
                 (isIntervals && intervalPhase === 'rest') ? t.color.info : t.color.gold,
          lineHeight: 1, letterSpacing: '-2px',
        }}>
          {isAMRAP && !isTimeUp ? formatMS(remaining) :
           isEMOM && !isTimeUp ? `:${String(60 - secondsInMinute).padStart(2, '0')}` :
           formatMS(elapsed)}
        </div>
        {isEMOM && !isTimeUp && (
          <div style={{ color: t.color.textDim, fontSize: t.font.xs, marginTop: 8 }}>
            סה"כ שחלף: {formatMS(elapsed)} / {formatMS(timeCap)}
          </div>
        )}
      </Card>

      {/* AMRAP rounds counter */}
      {isAMRAP && (
        <Card style={{ textAlign: 'center', marginBottom: t.space.md }}>
          <div style={{ color: t.color.textDim, fontSize: t.font.sm, marginBottom: 6 }}>סיבובים שהושלמו</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setRounds(r => Math.max(0, r - 1))} disabled={!running}
              style={btnCircle(t.color.danger, !running)}>−</button>
            <div style={{ fontSize: 48, fontWeight: 900, color: t.color.text, minWidth: 60 }}>{rounds}</div>
            <button onClick={() => setRounds(r => r + 1)} disabled={!running}
              style={btnCircle(t.color.success, !running)}>+</button>
          </div>
        </Card>
      )}

      {/* WOD prescription reminder */}
      <Card style={{ marginBottom: t.space.md }}>
        <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 8 }}>ה-WOD:</div>
        <pre style={{
          fontFamily: 'Space Mono, ui-monospace, monospace',
          fontSize: t.font.sm, color: t.color.text, lineHeight: 1.6,
          whiteSpace: 'pre-wrap', direction: 'rtl', textAlign: 'right', margin: 0,
        }}>{wod.lines.join('\n')}</pre>
      </Card>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!running && finalTime == null && !isTimeUp && (
          <Button variant="primary" size="lg" onClick={handleStart} style={{ flex: 1, justifyContent: 'center' }}>▶ התחל</Button>
        )}
        {running && (
          <Button variant="ghost" size="lg" onClick={handlePause} style={{ flex: 1, justifyContent: 'center' }}>⏸ עצור</Button>
        )}
        {isForTime && running && (
          <Button variant="primary" size="lg" onClick={handleFinishForTime} style={{ flex: 1, justifyContent: 'center' }}>✓ סיימתי</Button>
        )}
        {(finalTime != null || isTimeUp) && (
          <Button variant="primary" size="lg" onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>💾 שמור לחשבון</Button>
        )}
        <Button variant="ghost" onClick={handleReset}>↻ אפס</Button>
      </div>

      {finalTime != null && (
        <div style={{ marginTop: t.space.md, textAlign: 'center', color: t.color.success, fontSize: t.font.md, fontWeight: 700 }}>
          🎉 סיימת ב-{formatMS(finalTime)}! נשמר להיסטוריה שלך.
        </div>
      )}
    </Modal>
  )
}

function formatMS(sec) {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function btnCircle(color, disabled) {
  return {
    width: 44, height: 44, borderRadius: '50%',
    border: `2px solid ${disabled ? t.color.border : color}`,
    background: disabled ? t.color.bgSoft : `${color}22`,
    color: disabled ? t.color.textMuted : color,
    fontSize: 24, fontWeight: 900,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit',
  }
}
