import React, { useState } from 'react'
import { t } from '../../../theme/tokens'
import { Modal, Badge } from '../../../components/ui/UI'
import { cuesForExercise } from '../../../data/exerciseCues'

// Prominent, always-visible cue button. Uses cuesForExercise() which falls
// back to a generic template if the exercise isn't in the DB - so every
// exercise in every plan has *something* useful.

export function ExerciseGuideButton({ exerciseId, exerciseName, style, big }) {
 const [open, setOpen] = useState(false)

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 title="דגשי ביצוע וסרטון הסבר"
 style={{
 background: big ? t.color.gold :'transparent',
 color: big ? '#0d0d14': t.color.gold,
 border: `1px solid ${t.color.gold}`,
 borderRadius: t.radius.pill,
 padding: big ? '8px 16px':'4px 12px',
 cursor:'pointer', fontFamily:'inherit',
 fontSize: big ? t.font.sm : 11,
 fontWeight: 700,
 display:'inline-flex', alignItems:'center', gap: 6,
 transition: t.transition,
 ...style,
 }}
 onMouseEnter={e => e.currentTarget.style.background = big ? '#ffd782': t.color.goldGlow}
 onMouseLeave={e => e.currentTarget.style.background = big ? t.color.gold :'transparent'}
 >
 {big ? 'הסבר + סרטון':'דגשים'}
 </button>
 <ExerciseGuideModal open={open} onClose={() => setOpen(false)} exerciseId={exerciseId} exerciseName={exerciseName} />
 </>
 )
}

export function ExerciseGuideModal({ open, onClose, exerciseId, exerciseName }) {
 const cues = cuesForExercise(exerciseName, exerciseId)
 if (!cues) return null

 const title = cues.nameHe || cues.name || exerciseName
 const isFallback = cues._matched === 'fallback'

 return (
 <Modal open={open} onClose={onClose} title={title} width={640}>
 {/* Header - target + source */}
 <div style={{ display:'flex', gap: 8, marginBottom: 16, flexWrap:'wrap', alignItems:'center'}}>
 {cues.target && <Badge color={t.color.gold}> {cues.target}</Badge>}
 {isFallback && <Badge color={t.color.textDim}>הדרכה גנרית</Badge>}
 </div>

 {/* YouTube video */}
 {cues.ytId && (
 <div style={{ marginBottom: 20 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.md, display:'flex', alignItems:'center', gap: 8 }}>
 <span style={{ color:'#ff0000'}}>▶</span> סרטון הסבר
 </div>
 {cues.ytBy && <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>ע״י {cues.ytBy}</div>}
 </div>
 <div style={{ position:'relative', paddingBottom:'56.25%', height: 0, borderRadius: t.radius.md, overflow:'hidden', background:'#000'}}>
 <iframe
 src={`https://www.youtube-nocookie.com/embed/${cues.ytId}?rel=0`}
 title={title}
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 style={{ position:'absolute', top: 0, left: 0, width:'100%', height:'100%', border: 0 }}
 />
 </div>
 </div>
 )}

 {/* Form cues - numbered steps */}
 {cues.cues && cues.cues.length > 0 && (
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.md, marginBottom: 10, color: t.color.gold }}>
 דגשי ביצוע
 </div>
 <div style={{ display:'grid', gap: 8 }}>
 {cues.cues.map((cue, i) => (
 <div key={i} style={{ display:'flex', gap: 12, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
 <div style={{
 width: 28, height: 28, borderRadius: 8, background: t.color.gold, color:'#0d0d14',
 display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
 fontWeight: 900, fontSize: 13,
 }}>{i + 1}</div>
 <div style={{ flex: 1, fontSize: t.font.sm, lineHeight: 1.5 }}>
 {cue.title && <b style={{ color: t.color.gold, marginLeft: 6 }}>{cue.title}:</b>}
 {cue.text || cue}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Common mistakes */}
 {cues.mistakes && cues.mistakes.length > 0 && (
 <div style={{ marginBottom: 16 }}>
 <div style={{ fontWeight: 700, fontSize: t.font.md, marginBottom: 10, color: t.color.warning }}>
 שגיאות נפוצות
 </div>
 <div style={{ display:'grid', gap: 8 }}>
 {cues.mistakes.map((mk, i) => (
 <div key={i} style={{ padding: 12, background: `${t.color.warning}12`, border: `1px solid ${t.color.warning}30`, borderRadius: t.radius.sm }}>
 <div style={{ fontSize: t.font.sm, fontWeight: 700, color: t.color.warning, marginBottom: 4 }}> {mk.m}</div>
 <div style={{ fontSize: t.font.sm, color: t.color.text, lineHeight: 1.5 }}> {mk.fix}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Advanced tip */}
 {cues.advanced && (
 <div style={{ padding: 14, background: t.color.goldGlow, borderRadius: t.radius.md, border: `1px solid ${t.color.gold}`, marginBottom: 12 }}>
 <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 6, fontSize: t.font.sm }}> טיפ מתקדם</div>
 <div style={{ fontSize: t.font.sm, lineHeight: 1.5 }}>{cues.advanced}</div>
 </div>
 )}

 {/* Variations */}
 {(cues.easier || cues.harder) && (
 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
 {cues.easier && (
 <div style={{ padding: 12, background: `${t.color.info}12`, border: `1px solid ${t.color.info}30`, borderRadius: t.radius.sm }}>
 <div style={{ fontSize: t.font.xs, fontWeight: 700, color: t.color.info, marginBottom: 4 }}> קל יותר</div>
 <div style={{ fontSize: t.font.xs, lineHeight: 1.5 }}>{cues.easier}</div>
 </div>
 )}
 {cues.harder && (
 <div style={{ padding: 12, background: `${t.color.danger}12`, border: `1px solid ${t.color.danger}30`, borderRadius: t.radius.sm }}>
 <div style={{ fontSize: t.font.xs, fontWeight: 700, color: t.color.danger, marginBottom: 4 }}> קשה יותר</div>
 <div style={{ fontSize: t.font.xs, lineHeight: 1.5 }}>{cues.harder}</div>
 </div>
 )}
 </div>
 )}
 </Modal>
 )
}
