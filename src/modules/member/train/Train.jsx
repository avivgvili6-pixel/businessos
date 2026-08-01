import React, { useMemo, useState } from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Input, Select, Badge, SectionHeader, Tabs, Modal, EmptyState, ProgressBar } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { exercises, MUSCLE_GROUPS, EQUIPMENT, CATEGORIES, LEVELS, workoutSplits } from '../../../data/exercises'
import { programs, programCategories, KEY_LIFTS, computeWeight, formatPrescription } from '../../../data/programs'
import { todayKey, DAYS_HE } from '../../../utils/date'
import { PdfImporter } from './PdfImporter'
import { ExerciseGuideButton } from './ExerciseGuide'
import { workoutEvent, googleCalendarUrl, downloadICS } from '../../../utils/calendar'
import { distributeWeek, weekDates, nextSundayOf } from '../../../utils/weekSchedule'
import { WorkoutComplete } from '../../../components/celebration/WorkoutComplete'
import { adjustmentFor, applyDemographicToExercise, adjustmentBadge, RESEARCH_REFS } from '../../../utils/demographicAdjustment'
import { PlanBuilder } from '../goals/PlanBuilder'
import {
  DIFFICULTY_LEVELS, DIFFICULTY_LABELS,
  detectStyle, currentWeekOf, weekCompletion, isPlanCycleComplete,
  applyDifficultyToSession, difficultyProfile,
} from '../../../utils/weekProgression'
import { CrossFitWod } from './crossfit/WodGenerator'
import { useI18n } from '../../../i18n/i18n'

export function Train() {
  const [tab, setTab] = useState('plan')
  const { t: tr } = useI18n()
  return (
    <>
      <Tabs tabs={[
        { key:'plan',     label: tr('train.tab.plan') },
        { key:'crossfit', label: tr('train.tab.crossfit') },
        { key:'programs', label: tr('train.tab.programs') },
        { key:'import',   label: tr('train.tab.import') },
        { key:'library',  label: tr('train.tab.library') },
        { key:'builder',  label: tr('train.tab.builder') },
        { key:'history',  label: tr('train.tab.history') },
      ]} active={tab} onChange={setTab} />
      {tab === 'plan'     && <MyPlan />}
      {tab === 'crossfit' && <CrossFitWod />}
      {tab === 'programs' && <ProgramsLibrary />}
      {tab === 'import'   && <PdfImporter />}
      {tab === 'library'  && <Library />}
      {tab === 'builder'  && <Builder />}
      {tab === 'history'  && <History />}
    </>
  )
}

function MyPlan() {
  const { state, logWorkout, setWeekDifficulty, startNewCycle, resumePlan, removeArchivedPlan } = useApp()
  const [session, setSession] = useState(null)
  const [celebration, setCelebration] = useState(null)
  const [buildingPlan, setBuildingPlan] = useState(false)
  const [showResearch, setShowResearch] = useState(false)
  const plan = state.plan
  const archive = state.plansArchive || []
  const demo = adjustmentFor({ sex: state.profile?.sex, age: state.profile?.age })

  // Empty state with CTA + archive if exists
  if (!plan) return <EmptyPlanScreen archive={archive} onBuildPlan={() => setBuildingPlan(true)} onResume={resumePlan} onRemove={removeArchivedPlan} building={buildingPlan} setBuilding={setBuildingPlan} />

  const style = detectStyle(plan)
  const currentWeek = currentWeekOf(plan, state.workoutLogs)
  const completion = weekCompletion(plan, state.workoutLogs, currentWeek)
  const cycleDone = isPlanCycleComplete(plan, state.workoutLogs)
  const difficulty = plan.difficultyByWeek?.[currentWeek] || 'medium'
  const profile = difficultyProfile(style, difficulty)

  // Apply BOTH difficulty AND demographic adjustment
  const displaySessions = plan.sessions.map(s => {
    const withDiff = applyDifficultyToSession(s, style, difficulty, currentWeek)
    return {
      ...withDiff,
      exercises: (withDiff.exercises || []).map(e => applyDemographicToExercise(e, demo)),
    }
  })

  // Inline plan builder replaces the whole view while active
  if (buildingPlan) {
    return <PlanBuilder onDone={() => setBuildingPlan(false)} onCancel={() => setBuildingPlan(false)} />
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <WeekBanner
        plan={plan} currentWeek={currentWeek} completion={completion}
        difficulty={difficulty} style={style} profile={profile}
        onSetDifficulty={(d) => setWeekDifficulty(currentWeek, d)}
      />

      {cycleDone && (
        <Card style={{ padding: 20, background: `linear-gradient(135deg, ${t.color.success}22 0%, ${t.color.gold}22 100%)`, border: `1px solid ${t.color.gold}` }}>
          <div style={{ display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 800, fontSize: t.font.lg, marginBottom: 4 }}>
                כל הכבוד! סיימת מחזור של {plan.weeks} שבועות{plan.cycle ? ` (מחזור ${plan.cycle})` : ''}
              </div>
              <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>
                עדכן את היכולת המירבית שלך (פרופיל → 1RM) והתחל מחזור חדש עם משקלים חדשים
              </div>
            </div>
            <Button icon="🔄" onClick={() => { if (confirm('להתחיל מחזור חדש?')) startNewCycle() }}>
              התחל מחזור חדש
            </Button>
          </div>
        </Card>
      )}

      {/* Demographic adjustment badge */}
      {demo && (state.profile?.sex || state.profile?.age) && (
        <Card style={{ padding: 12, background: `${t.color.info}12`, border: `1px solid ${t.color.info}` }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22 }}>🧬</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: t.font.sm, fontWeight: 700, color: t.color.info }}>מותאם לך: {adjustmentBadge(demo)}</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>{demo.focusHint}</div>
              {demo.caution && <div style={{ fontSize: t.font.xs, color: t.color.warning, marginTop: 4 }}>⚠️ {demo.caution}</div>}
              {demo.specialNotes.map((n, i) => <div key={i} style={{ fontSize: t.font.xs, color: t.color.gold, marginTop: 4 }}>{n.note}</div>)}
            </div>
            <button onClick={() => setShowResearch(true)} style={{
              background: 'transparent', border: `1px solid ${t.color.info}`, color: t.color.info,
              padding: '4px 10px', borderRadius: 12, cursor: 'pointer', fontSize: t.font.xs, fontFamily: 'inherit',
            }}>❓ מקורות</button>
          </div>
        </Card>
      )}

      <WeeklySchedule plan={{ ...plan, sessions: displaySessions }} onOpenSession={setSession} />

      <UpcomingWeeks
        plan={plan}
        currentWeek={currentWeek}
        style={style}
        difficultyByWeek={plan.difficultyByWeek || {}}
        onSetDifficulty={setWeekDifficulty}
      />

      {/* Plans archive */}
      {archive.length > 0 && (
        <Card>
          <SectionHeader title="התכניות הקודמות שלך" subtitle={`${archive.length} תכניות בארכיון`} />
          <div style={{ display: 'grid', gap: 8 }}>
            {archive.map(p => (
              <div key={p.id} style={{
                display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
                padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md,
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>
                    {p.sessionsDone}/{p.sessionsExpected} אימונים · <b style={{ color: p.completionPct >= 75 ? t.color.success : p.completionPct >= 40 ? t.color.gold : t.color.warning }}>{p.completionPct}%</b> · הסתיים {new Date(p.archivedAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { if (confirm('להחזיר את התכנית הזאת? התכנית הנוכחית תעבור לארכיון')) resumePlan(p.id) }}>🔄 חזור לתכנית</Button>
                <button onClick={() => { if (confirm('למחוק לצמיתות?')) removeArchivedPlan(p.id) }} style={{
                  background: 'transparent', border: 'none', color: t.color.textDim, cursor: 'pointer', fontSize: 18,
                }}>🗑️</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Build another plan */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="outline" onClick={() => setBuildingPlan(true)}>✨ בנה תכנית חדשה (הנוכחית תעבור לארכיון)</Button>
      </div>

      {/* Research modal */}
      {showResearch && (
        <div onClick={() => setShowResearch(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000,
          display: 'grid', placeItems: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto',
            background: t.color.bgElevated, borderRadius: t.radius.lg, padding: 24, direction: 'rtl',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: t.font.xl, fontWeight: 800 }}>🔬 מחקרים שההתאמה מבוססת עליהם</h2>
              <button onClick={() => setShowResearch(false)} style={{
                background: t.color.bgSoft, border: 'none', color: t.color.text,
                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
              }}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {RESEARCH_REFS.map(r => (
                <div key={r.id} style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, lineHeight: 1.5 }}>
                  📄 {r.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <SessionRunner session={session} onClose={() => setSession(null)} onFinish={(log) => {
        logWorkout({ ...log, date: new Date().toISOString() })
        // Compute a rough streak (consecutive days with a workout)
        const dates = new Set([todayKey(), ...state.workoutLogs.map(l => l.date?.slice(0, 10))])
        let streak = 0
        const d = new Date()
        while (dates.has(d.toISOString().slice(0, 10))) {
          streak++
          d.setDate(d.getDate() - 1)
        }
        // Refresh week completion using the new log
        const nextCompletion = { done: completion.done + 1, total: completion.total, pct: Math.min(100, Math.round(((completion.done + 1) / completion.total) * 100)) }
        nextCompletion.complete = nextCompletion.pct >= 75
        setCelebration({
          sessionName: log.sessionName,
          weekCompletion: nextCompletion,
          currentWeek,
          streak,
        })
        setSession(null)
      }} />

      <WorkoutComplete
        open={!!celebration}
        onClose={() => setCelebration(null)}
        sessionName={celebration?.sessionName}
        weekCompletion={celebration?.weekCompletion}
        currentWeek={celebration?.currentWeek}
        streak={celebration?.streak || 0}
      />
    </div>
  )
}

// ─── Weekly schedule with rest days + one-click ICS export ─────────
function WeeklySchedule({ plan, onOpenSession }) {
  const week = distributeWeek(plan)
  const workoutDays = week.filter(d => d.type === 'workout').length

  // Export the whole week to a downloadable .ics file (all workouts,
  // one file, imports into any calendar app)
  const exportWeek = () => {
    const start = nextSundayOf()
    const dates = weekDates(start)
    const events = week
      .filter(d => d.type === 'workout')
      .map(d => {
        const dt = new Date(dates[d.dayIdx])
        dt.setHours(18, 0, 0, 0) // default 18:00
        return workoutEvent({ session: d.session, date: dt, plan })
      })
    downloadICS(events, `שבוע-${plan.name}.ics`)
  }

  const exportGoogleWeek = () => {
    const start = nextSundayOf()
    const dates = weekDates(start)
    week.filter(d => d.type === 'workout').forEach((d, idx) => {
      const dt = new Date(dates[d.dayIdx])
      dt.setHours(18, 0, 0, 0)
      // Stagger window opens so browsers don't block
      setTimeout(() => window.open(googleCalendarUrl(workoutEvent({ session: d.session, date: dt, plan })), '_blank'), idx * 300)
    })
  }

  return (
    <Card>
      <SectionHeader
        title={plan.name}
        subtitle={`${plan.split || plan.days + ' ימים'} · ${plan.weeks} שבועות · חלוקה מומלצת עם ימי מנוחה`}
      />

      {/* One-click week-to-calendar export */}
      <div style={{
        padding: 14, background: t.color.goldGlow, borderRadius: t.radius.md,
        border: `1px solid ${t.color.gold}`, marginBottom: 14,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 28 }}>📅</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, color: t.color.gold, marginBottom: 2 }}>
            הוסף את כל השבוע ליומן בקליק אחד
          </div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
            {workoutDays} אימונים · שבוע קרוב · ברירת מחדל 18:00
          </div>
        </div>
        <Button icon="📥" onClick={exportWeek}>הורד ICS</Button>
        <Button variant="outline" icon="G" onClick={exportGoogleWeek}>Google Calendar</Button>
      </div>

      {/* Weekly day-by-day grid */}
      <div style={{ display: 'grid', gap: 8 }}>
        {week.map((day, i) => (
          <DayRow key={i} day={day} plan={plan} onOpen={onOpenSession} />
        ))}
      </div>
    </Card>
  )
}

function DayRow({ day, plan, onOpen }) {
  const isWorkout = day.type === 'workout'
  const s = day.session

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'stretch',
      padding: 12,
      background: isWorkout ? t.color.bgCard : t.color.bgSoft,
      border: `1px solid ${isWorkout ? t.color.border : 'transparent'}`,
      borderRadius: t.radius.md,
      cursor: isWorkout ? 'pointer' : 'default',
      opacity: isWorkout ? 1 : 0.7,
    }} onClick={() => isWorkout && onOpen(s)}>
      {/* Day label vertical */}
      <div style={{
        width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: isWorkout ? t.color.goldGlow : 'transparent',
        borderRadius: t.radius.sm, padding: '8px 4px',
        border: `1px solid ${isWorkout ? t.color.gold : t.color.border}`,
      }}>
        <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>יום</div>
        <div style={{ fontSize: t.font.lg, fontWeight: 900, color: isWorkout ? t.color.gold : t.color.textDim }}>{day.dayShort}</div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gap: 4, alignSelf: 'center' }}>
        {isWorkout ? (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: t.font.md }}>{s.name}</div>
              {s.wodType && <Badge color={t.color.danger}>{s.wodType}</Badge>}
              {s.exercises.some(e => e.supersetWith) && <Badge color={t.color.info}>🔗 סופרסט</Badge>}
              {s.exercises.some(e => e.dropSetOnLast) && <Badge color={t.color.danger}>🔻 דרופסט</Badge>}
              {s.exercises.some(e => e.amrap) && <Badge color={t.color.warning}>🔥 AMRAP</Badge>}
            </div>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>
              {s.exercises.length} תרגילים · לחץ להתחלה
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: t.font.md, color: t.color.textDim }}>😴 מנוחה</div>
            <div style={{ fontSize: t.font.xs, color: t.color.textMuted }}>{day.reason}</div>
          </>
        )}
      </div>

      {/* Icon */}
      <div style={{ alignSelf: 'center', fontSize: 22 }}>
        {isWorkout ? '💪' : ''}
      </div>
    </div>
  )
}

function SessionRunner({ session, onClose, onFinish }) {
  const { state } = useApp()
  const [log, setLog] = useState(() => buildInitialLog(session, state.workoutLogs))
  const [restRemaining, setRestRemaining] = useState(0)
  const [restTotal, setRestTotal] = useState(90)
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    if (session) setLog(buildInitialLog(session, state.workoutLogs))
  }, [session])

  React.useEffect(() => {
    if (restRemaining <= 0) return
    timerRef.current = setInterval(() => setRestRemaining(r => r - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [restRemaining])

  const startRest = (seconds = 90) => { setRestTotal(seconds); setRestRemaining(seconds) }
  const skipRest = () => setRestRemaining(0)

  if (!session) return null

  return (
    <Modal open={!!session} onClose={onClose} title={`אימון: ${session.name}`} width={720}>
      {restRemaining > 0 && (
        <div style={{
          position:'sticky', top: 0, zIndex: 10, marginBottom: 12, padding: 14,
          background:`linear-gradient(90deg, ${t.color.gold}22 0%, ${t.color.gold}44 ${100 - (restRemaining/restTotal)*100}%, ${t.color.bgSoft} ${100 - (restRemaining/restTotal)*100}%)`,
          border:`1px solid ${t.color.gold}`, borderRadius: t.radius.md,
          display:'flex', alignItems:'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>⏱️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>מנוחה</div>
            <div style={{ fontSize: t.font.xxl, fontWeight: 800, color: t.color.gold, fontFamily:'Space Mono, monospace' }}>
              {Math.floor(restRemaining/60)}:{String(restRemaining%60).padStart(2,'0')}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={skipRest}>דלג</Button>
        </div>
      )}
      <div style={{ display:'grid', gap: 14 }}>
        {log.map((ex, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{ex.name}</div>
                  {ex.format && <Badge color={ex.format === 'strength' ? t.color.gold : ex.format === 'metcon' ? t.color.danger : t.color.textDim} style={{ marginTop: 4 }}>{ex.format}</Badge>}
                </div>
                <ExerciseGuideButton exerciseId={ex.id} exerciseName={ex.name} />
              </div>
              <div style={{ textAlign:'left' }}>
                <Badge>{ex.sets.length}×{ex.reps || 8}</Badge>
                {ex.intensity && (
                  <div style={{ fontSize: t.font.xs, color: t.color.gold, marginTop: 4, fontFamily:'Space Mono, monospace' }}>
                    @ {Math.round((Array.isArray(ex.intensity) ? ex.intensity[0] : ex.intensity) * 100)}%
                    {ex.suggestedWeight ? ` = ${ex.suggestedWeight} ק״ג` : ''}
                  </div>
                )}
              </div>
            </div>
            {ex.prescription && !ex.sets.some(s => s.w) && (
              <div style={{ padding: 8, background: t.color.bgSoft, borderRadius: t.radius.sm, marginBottom: 10, fontSize: t.font.xs, color: t.color.textDim, fontFamily:'Space Mono, monospace' }}>
                📋 {ex.prescription}
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr', gap: 8, alignItems:'center' }}>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>סט</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>משקל</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>חזרות</div>
              <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>RPE</div>
              {ex.sets.map((s, j) => (
                <React.Fragment key={j}>
                  <div style={{ color: t.color.gold, fontWeight: 700 }}>{j+1}</div>
                  <Input value={s.w} onChange={e => updateSet(i, j, 'w', e.target.value)} placeholder={ex.suggestedWeight ? `${ex.suggestedWeight}` : 'ק״ג'} />
                  <Input value={s.r} onChange={e => updateSet(i, j, 'r', e.target.value)} placeholder={String(ex.reps || 8)} />
                  <div style={{ display:'flex', gap: 4 }}>
                    <Input value={s.rpe} onChange={e => updateSet(i, j, 'rpe', e.target.value)} placeholder="1-10" />
                    <button type="button" onClick={() => startRest(90)} title="התחל מנוחה 90ש׳" style={{
                      background: t.color.bgSoft, border:`1px solid ${t.color.border}`, color: t.color.gold,
                      borderRadius: t.radius.sm, cursor:'pointer', padding:'0 10px', fontSize: 16,
                    }}>⏱</button>
                  </div>
                </React.Fragment>
              ))}
              {ex.suggestedWeight && !ex.sets.some(s => s.w) && (
                <div style={{ gridColumn: '1 / -1', fontSize: t.font.xs, color: t.color.textDim, marginTop: 4 }}>
                  💡 באימון האחרון: <b style={{ color: t.color.gold }}>{ex.suggestedWeight} ק״ג</b> · המלצה להעלות 2.5 ק״ג אם ה-RPE היה מתחת ל-8
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display:'flex', gap: 10, justifyContent:'flex-end', marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose}>בטל</Button>
        <Button onClick={() => onFinish({ sessionName: session.name, exercises: log })}>סיים ורשום ✓</Button>
      </div>
    </Modal>
  )

  function updateSet(i, j, key, val) {
    setLog(l => l.map((ex, ii) => ii !== i ? ex : { ...ex, sets: ex.sets.map((s, jj) => jj !== j ? s : { ...s, [key]: val }) }))
  }
}

function Library() {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('')
  const [cat, setCat] = useState('')
  const [lvl, setLvl] = useState('')
  const [eq, setEq] = useState('')

  const filtered = useMemo(() => exercises.filter(e =>
    (!q || e.name.includes(q)) &&
    (!muscle || e.muscle === muscle) &&
    (!cat || e.category === cat) &&
    (!lvl || e.level === lvl) &&
    (!eq || e.equipment === eq)
  ), [q, muscle, cat, lvl, eq])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ padding: 16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap: 10 }} className="hfos-grid-5">
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 חיפוש תרגיל..." />
          <Select value={muscle} onChange={e => setMuscle(e.target.value)}>
            <option value="">שריר</option>{MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">קטגוריה</option>{CATEGORIES.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={lvl} onChange={e => setLvl(e.target.value)}>
            <option value="">רמה</option>{LEVELS.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select value={eq} onChange={e => setEq(e.target.value)}>
            <option value="">ציוד</option>{EQUIPMENT.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(ex => (
          <Card key={ex.id} hover style={{ padding: 18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 8, gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: t.font.lg }}>{ex.name}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {ex.yt && <Badge color="#ff0000">▶</Badge>}
                <Badge>{ex.level}</Badge>
              </div>
            </div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 12 }}>
              <Badge color={t.color.gold}>{ex.muscle}</Badge>
              <Badge color={t.color.textDim}>{ex.category}</Badge>
              <Badge color={t.color.textDim}>{ex.equipment}</Badge>
            </div>
            <div style={{ fontSize: t.font.sm, color: t.color.textDim, borderTop:`1px solid ${t.color.border}`, paddingTop: 10, marginBottom: 10 }}>💡 {ex.tips}</div>
            <ExerciseGuideButton exerciseId={ex.id} exerciseName={ex.name} />
          </Card>
        ))}
        {!filtered.length && <EmptyState icon="🔍" title="לא נמצאו תרגילים" subtitle="נסה לשנות את הפילטרים" />}
      </div>
      <style>{`@media (max-width: 900px) { .hfos-grid-5 { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  )
}

function Builder() {
  const { state, setPlan } = useApp()
  const [splitKey, setSplitKey] = useState('upper_lower')
  const [weeks, setWeeks] = useState(state.profile.targetPeriodWeeks || 8)
  const [level, setLevel] = useState(state.profile.experience || 'בינוני')

  const preview = useMemo(() => buildPlan({ splitKey, weeks, level, goalKey: state.profile.goalKey }), [splitKey, weeks, level, state.profile.goalKey])

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader title="מחולל תכניות חכם" subtitle="בונה תכנית מותאמת לפי מטרה, רמה ותקופה" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Select label="פיצול" value={splitKey} onChange={e => setSplitKey(e.target.value)}>
            {Object.entries(workoutSplits).map(([k,v]) => <option key={k} value={k}>{v.label} ({v.days} ימים)</option>)}
          </Select>
          <Select label="רמה" value={level} onChange={e => setLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
          <Input type="number" label="שבועות" value={weeks} onChange={e => setWeeks(+e.target.value)} min={4} max={52} />
        </div>
      </Card>

      <Card>
        <SectionHeader title="תצוגה מקדימה" subtitle={`${preview.days} ימי אימון בשבוע · ${preview.weeks} שבועות`}
          action={<Button onClick={() => setPlan(preview)}>אמץ תכנית ✓</Button>} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {preview.sessions.map((s, i) => (
            <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, border:`1px solid ${t.color.border}` }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: t.color.gold }}>יום {i+1} · {s.name}</div>
              <div style={{ display:'grid', gap: 4 }}>
                {s.exercises.map((e, j) => (
                  <div key={j} style={{ fontSize: t.font.sm, display:'flex', justifyContent:'space-between' }}>
                    <span>{e.name}</span>
                    <span style={{ color: t.color.textDim }}>{e.sets}×{e.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function buildPlan({ splitKey, weeks, level, goalKey }) {
  const split = workoutSplits[splitKey]
  const goalRepMap = { cut:12, recomp:8, maintain:10, lean_bulk:8, bulk:6 }
  const baseReps = goalRepMap[goalKey] || 8
  const setsByLevel = { 'מתחיל':3, 'בינוני':4, 'מתקדם':5 }
  const sets = setsByLevel[level] || 3

  const sessions = split.sessions.map(name => {
    const focus = name.toLowerCase()
    let picks
    if (focus.includes('דחיפה')) picks = ['bench','ohp','dip','pushup','triceps_pd','lateral']
    else if (focus.includes('משיכה')) picks = ['pullup','row','curl','face_pull','rdl']
    else if (focus.includes('רגליים') || focus.includes('תחתון')) picks = ['squat','rdl','leg_press','lunge','hip_thrust','plank']
    else if (focus.includes('חזה')) picks = ['bench','dip','pushup','lateral']
    else if (focus.includes('גב')) picks = ['pullup','row','face_pull','curl']
    else if (focus.includes('כתפ')) picks = ['ohp','lateral','face_pull']
    else if (focus.includes('ידיים')) picks = ['curl','triceps_pd','dip']
    else if (focus.includes('אינטרוול') || focus.includes('hiit')) picks = ['kb_swing','burpee','row_erg','pushup']
    else if (focus.includes('liss') || focus.includes('אירובי')) picks = ['bike','run','row_erg']
    else if (focus.includes('עליון')) picks = ['bench','row','ohp','pullup','curl','triceps_pd']
    else picks = ['squat','bench','row','ohp','plank','lunge']
    const exs = picks.map(id => {
      const e = exercises.find(x => x.id === id)
      return e ? { id: e.id, name: e.name, sets, reps: baseReps } : null
    }).filter(Boolean)
    return { name, exercises: exs }
  })

  return {
    name: `${split.label} · ${weeks} שבועות`,
    split: split.label,
    days: split.days,
    weeks,
    currentWeek: 1,
    sessions,
    createdAt: new Date().toISOString(),
  }
}

function ProgramsLibrary() {
  const { state, setPlan } = useApp()
  const [selected, setSelected] = useState(null)
  const [cat, setCat] = useState('all')
  const oneRMs = state.profile.oneRMs || {}
  const hasOneRMs = Object.keys(oneRMs).length > 0

  const shown = cat === 'all'
    ? Object.values(programs)
    : programCategories.find(c => c.id === cat)?.programs.map(id => programs[id]) || []

  const adopt = (prog) => {
    // Materialize the program into a plan format that MyPlan can render.
    const plan = {
      name: prog.label,
      programId: prog.id,
      split: prog.schema,
      days: prog.daysPerWeek,
      weeks: prog.duration,
      currentWeek: 1,
      sessions: prog.sessions.map(s => ({
        name: s.name,
        wodType: s.wodType,
        prescription: s.prescription,
        exercises: (s.blocks || []).map(b => ({
          id: b.lift || b.name,
          name: b.lift ? KEY_LIFTS[b.lift]?.label : b.name,
          sets: b.sets || 1,
          reps: b.reps || 8,
          intensity: b.intensity,
          format: b.format,
          prescription: b.prescription,
          wodType: b.wodType,
          suggestedWeight: b.lift ? computeWeight(b, oneRMs) : null,
        })),
      })),
      createdAt: new Date().toISOString(),
    }
    setPlan(plan)
    setSelected(null)
    alert(`התכנית ${prog.label} אומצה. עבור לטאב "התכנית שלי"`)
  }

  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, padding: 24 }}>
        <Badge>🌍 מאגר תכניות מהעולם</Badge>
        <h2 style={{ marginTop: 10, fontSize: t.font.xxl, fontWeight: 800 }}>תכניות אמיתיות שעובדות</h2>
        <div style={{ color: t.color.textDim, marginTop: 6 }}>
          מ-Starting Strength ל-Wendler 5/3/1 ועד CrossFit ו-GVT - כל תכנית בנויה על אחוזים מ-1RM שלך.
        </div>
        {!hasOneRMs && (
          <div style={{ marginTop: 14, padding: 12, background:`${t.color.warning}15`, borderRadius: t.radius.sm, border:`1px solid ${t.color.warning}` }}>
            <div style={{ fontSize: t.font.sm, color: t.color.warning, fontWeight: 700 }}>⚠ עדיין לא הגדרת 1RM</div>
            <div style={{ fontSize: t.font.sm, color: t.color.text, marginTop: 4 }}>
              בלי 1RM נראה רק אחוזים ולא ק״ג. עבור ל-<b>פרופיל → יכולת מירבית</b> להזין ערכים.
            </div>
          </div>
        )}
      </Card>

      <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
        <CatChip label="הכל" active={cat === 'all'} onClick={() => setCat('all')} />
        {programCategories.map(c => (
          <CatChip key={c.id} label={c.label} active={cat === c.id} onClick={() => setCat(c.id)} />
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
        {shown.map(p => (
          <Card key={p.id} hover style={{ padding: 20, cursor:'pointer' }} onClick={() => setSelected(p)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: t.font.lg }}>{p.label}</div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>{p.author} · {p.origin}</div>
              </div>
              <Badge color={t.color.gold}>{p.daysPerWeek}×/שב׳</Badge>
            </div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 10 }}>
              <Badge color={t.color.textDim}>{p.level}</Badge>
              <Badge color={t.color.info}>{p.duration} שבועות</Badge>
            </div>
            <div style={{ fontSize: t.font.sm, color: t.color.gold, fontWeight: 600, marginBottom: 6 }}>{p.goal}</div>
            <div style={{ fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.5 }}>{p.schema}</div>
          </Card>
        ))}
      </div>

      <ProgramModal open={!!selected} onClose={() => setSelected(null)} program={selected} onAdopt={adopt} oneRMs={oneRMs} />
    </div>
  )
}

function CatChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'8px 16px', borderRadius: t.radius.pill,
      background: active ? t.color.gold : t.color.bgSoft,
      color: active ? '#0d0d14' : t.color.textDim,
      border:`1px solid ${active ? t.color.gold : t.color.border}`,
      fontFamily:'inherit', cursor:'pointer', fontWeight: 600, fontSize: t.font.sm,
    }}>{label}</button>
  )
}

function ProgramModal({ open, onClose, program, onAdopt, oneRMs }) {
  if (!program) return null
  return (
    <Modal open={open} onClose={onClose} title={program.label} width={760}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 10 }}>
          <Badge color={t.color.gold}>{program.author}</Badge>
          <Badge color={t.color.textDim}>{program.origin}</Badge>
          <Badge color={t.color.info}>{program.level}</Badge>
          <Badge color={t.color.success}>{program.daysPerWeek} ימים/שבוע · {program.duration} שבועות</Badge>
        </div>
        <div style={{ color: t.color.gold, fontWeight: 600, marginBottom: 6 }}>{program.goal}</div>
        <div style={{ color: t.color.text, lineHeight: 1.6, marginBottom: 8 }}>{program.description}</div>
        <div style={{ padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, color: t.color.textDim }}>
          <b style={{ color: t.color.text }}>סכימה:</b> {program.schema}
        </div>
      </div>

      <div style={{ display:'grid', gap: 12 }}>
        {program.sessions.map((s, i) => (
          <div key={i} style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: t.color.gold, fontSize: t.font.lg }}>{s.name}</div>
              {s.wodType && <Badge color={t.color.danger}>{s.wodType}{s.timeCap ? ` · ${s.timeCap} דק׳` : ''}</Badge>}
            </div>
            {s.prescription && (
              <div style={{ padding: 10, background: t.color.bg, borderRadius: t.radius.sm, marginBottom: 10, fontFamily:'Space Mono, monospace', fontSize: t.font.sm, whiteSpace:'pre-wrap' }}>
                {s.prescription}
              </div>
            )}
            {s.description && <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 10, fontStyle:'italic' }}>{s.description}</div>}
            {(s.rxTime || s.rxRounds) && (
              <div style={{ fontSize: t.font.xs, color: t.color.gold, marginBottom: 10 }}>
                יעד ברמת RX: {s.rxTime || s.rxRounds}
              </div>
            )}
            {s.blocks && s.blocks.length > 0 && (
              <div style={{ display:'grid', gap: 6 }}>
                {s.blocks.map((b, j) => (
                  <div key={j} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding: 8, background: t.color.bg, borderRadius: t.radius.sm }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: t.font.sm }}>
                        {b.lift ? KEY_LIFTS[b.lift]?.label : b.name}
                      </div>
                      {b.format && <Badge color={b.format === 'strength' ? t.color.gold : b.format === 'metcon' ? t.color.danger : t.color.textDim} style={{ marginTop: 4 }}>{b.format}</Badge>}
                    </div>
                    <div style={{ textAlign:'left', fontFamily:'Space Mono, monospace', fontSize: t.font.sm, color: t.color.gold }}>
                      {formatPrescription(b, oneRMs)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {program.notes && program.notes.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: t.color.goldGlow, borderRadius: t.radius.sm, border:`1px solid ${t.color.gold}` }}>
          <div style={{ fontWeight: 700, color: t.color.gold, marginBottom: 8 }}>📌 הוראות מנחות</div>
          <div style={{ display:'grid', gap: 4 }}>
            {program.notes.map((n, i) => <div key={i} style={{ fontSize: t.font.sm }}>• {n}</div>)}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap: 10, justifyContent:'flex-end', marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose}>סגור</Button>
        <Button onClick={() => onAdopt(program)}>אמץ תכנית זו ✓</Button>
      </div>
    </Modal>
  )
}

function buildInitialLog(session, priorLogs) {
  if (!session) return []
  return session.exercises.map(e => {
    const lastEntry = findLastEntry(priorLogs, e.id || e.name)
    const suggestedWeight = lastEntry ? topWeight(lastEntry) : null
    return {
      ...e,
      suggestedWeight,
      sets: Array.from({ length: e.sets || 3 }, () => ({ w: '', r: '', rpe: '' })),
    }
  })
}

function findLastEntry(logs, exId) {
  for (const log of logs) {
    for (const ex of log.exercises || []) {
      if (ex.id === exId || ex.name === exId) return ex
    }
  }
  return null
}

function topWeight(ex) {
  const w = (ex.sets || []).map(s => +s.w).filter(x => !isNaN(x) && x > 0)
  return w.length ? Math.max(...w) : null
}

function History() {
  const { state } = useApp()
  const { workoutLogs } = state
  if (!workoutLogs.length) return <EmptyState icon="📖" title="עדיין אין היסטוריה" subtitle="אימונים שתסיים ירשמו כאן אוטומטית" />
  const weekVolume = [4, 6, 5, 8, 7, 9, 8, 10]
  return (
    <div style={{ display:'grid', gap: 16 }}>
      <Card>
        <SectionHeader title="נפח שבועי (סטים)" />
        <Sparkline data={weekVolume} height={80} />
      </Card>
      <Card>
        <SectionHeader title="אימונים אחרונים" />
        <div style={{ display:'grid', gap: 8 }}>
          {workoutLogs.slice(0, 10).map((log, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm }}>
              <div>
                <div style={{ fontWeight: 600 }}>{log.sessionName}</div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim }}>{new Date(log.date).toLocaleDateString('he-IL')}</div>
              </div>
              <Badge>{log.exercises.length} תרגילים</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Empty plan screen with CTA + archive display ────────────
function EmptyPlanScreen({ archive, onBuildPlan, onResume, onRemove, building, setBuilding }) {
  if (building) return <PlanBuilder onDone={() => setBuilding(false)} onCancel={() => setBuilding(false)} />
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card style={{ padding: 32, textAlign: 'center', background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 200, height: 200, background: t.color.goldGlow, borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🏋️</div>
          <h1 style={{ fontSize: t.font.xxl, fontWeight: 800, marginBottom: 8 }}>
            עדיין אין לך תכנית פעילה
          </h1>
          <p style={{ color: t.color.textDim, fontSize: t.font.md, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 24px' }}>
            בחר סגנון (או משלב), כמות ימים, וקבל תכנית מדעית מותאמת אליך תוך 2 דקות.
          </p>
          <Button size="lg" onClick={onBuildPlan} icon="✨">בנה לי תכנית עכשיו</Button>
        </div>
      </Card>

      {archive.length > 0 && (
        <Card>
          <SectionHeader
            title="התכניות הקודמות שלך"
            subtitle="לחץ 'חזור לתכנית' כדי להמשיך מאחת מהן"
          />
          <div style={{ display: 'grid', gap: 8 }}>
            {archive.map(p => (
              <div key={p.id} style={{
                display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
                padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md,
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>
                    {p.sessionsDone}/{p.sessionsExpected} אימונים · <b style={{ color: p.completionPct >= 75 ? t.color.success : p.completionPct >= 40 ? t.color.gold : t.color.warning }}>{p.completionPct}%</b>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onResume(p.id)}>🔄 חזור</Button>
                <button onClick={() => { if (confirm('למחוק לצמיתות?')) onRemove(p.id) }} style={{
                  background: 'transparent', border: 'none', color: t.color.textDim, cursor: 'pointer', fontSize: 18,
                }}>🗑️</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Week banner - shown at top of MyPlan tab ────────────────
function WeekBanner({ plan, currentWeek, completion, difficulty, style, profile, onSetDifficulty }) {
  const styleLabel = ({ bodybuilding:'בודיבילדינג', powerlifting:'כוח מירבי', crossfit:'CrossFit', bodyweight:'משקל גוף' })[style] || style
  const needMore = Math.max(0, Math.ceil(0.75 * (plan.days || 3)) - completion.done)

  return (
    <Card style={{ padding: 20, background: `linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgElevated} 100%)` }}>
      <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap', marginBottom: 12 }}>
        <Badge color={t.color.gold}>📅 שבוע {currentWeek} מתוך {plan.weeks}</Badge>
        <Badge color={t.color.textDim}>{styleLabel}</Badge>
        {plan.cycle && plan.cycle > 1 && <Badge color={t.color.info}>מחזור {plan.cycle}</Badge>}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6, flexWrap:'wrap', gap: 6 }}>
          <div style={{ fontSize: t.font.sm, color: t.color.textDim }}>
            השלמת השבוע: <b style={{ color: completion.complete ? t.color.success : t.color.gold }}>
              {completion.done}/{completion.total} ({completion.pct}%)
            </b>
          </div>
          {completion.complete
            ? <Badge color={t.color.success}>✓ שער 75% נפתח</Badge>
            : needMore > 0
              ? <Badge color={t.color.warning}>עוד {needMore} ותפתח שבוע {currentWeek + 1} 🔓</Badge>
              : null}
        </div>
        <ProgressBar value={completion.done} max={completion.total} />
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: t.font.sm, color: t.color.textDim, marginBottom: 8, fontWeight: 600 }}>
          רמת הקושי לשבוע {currentWeek}:
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 6 }} className="hfos-diff-grid">
          {DIFFICULTY_LEVELS.map(d => {
            const meta = DIFFICULTY_LABELS[d]
            const active = difficulty === d
            return (
              <button key={d} onClick={() => onSetDifficulty(d)} style={{
                padding:'10px 6px', border:`1px solid ${active ? t.color.gold : t.color.border}`,
                background: active ? t.color.goldGlow : t.color.bgSoft,
                color: active ? t.color.gold : t.color.text,
                borderRadius: t.radius.md, cursor:'pointer', fontFamily:'inherit',
                display:'flex', flexDirection:'column', gap: 2, alignItems:'center',
              }}>
                <span style={{ fontSize: 20 }}>{meta.icon}</span>
                <span style={{ fontSize: t.font.xs, fontWeight: 700 }}>{meta.label}</span>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 10, padding: 10, background: t.color.bgSoft, borderRadius: t.radius.sm,
          fontSize: t.font.xs, color: t.color.textDim, lineHeight: 1.5 }}>
          💡 {profile.note}
        </div>
      </div>
      <style>{`@media (max-width: 500px) { .hfos-diff-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </Card>
  )
}

// ─── Upcoming weeks preview - shows next 3 weeks with locked/unlocked state
function UpcomingWeeks({ plan, currentWeek, style, difficultyByWeek, onSetDifficulty }) {
  const totalWeeks = plan.weeks || 12
  const upcoming = []
  for (let w = currentWeek; w <= Math.min(currentWeek + 3, totalWeeks); w++) upcoming.push(w)
  if (upcoming.length < 2) return null

  const styleLabel = ({ bodybuilding:'בודיבילדינג', powerlifting:'כוח מירבי', crossfit:'CrossFit', bodyweight:'משקל גוף' })[style] || style
  const suggestedDiff = (w) => {
    if (w === totalWeeks) return 'easy'
    if (w % 4 === 0) return 'easy'
    if (w >= totalWeeks - 2) return 'elite'
    if (w >= totalWeeks - 4) return 'hard'
    return 'medium'
  }

  return (
    <Card>
      <SectionHeader
        title="📅 שבועות קדימה"
        subtitle="תצוגה מקדימה - הרמה נעולה מוצעת אוטומטית, ניתן לשנות"
      />
      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        {upcoming.map((w, idx) => {
          const isCurrent = w === currentWeek
          const isLocked = idx > 0
          const diff = difficultyByWeek[w] || (isCurrent ? 'medium' : suggestedDiff(w))
          const meta = DIFFICULTY_LABELS[diff]
          return (
            <div key={w} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
              padding: 12, borderRadius: t.radius.md,
              background: isCurrent ? t.color.goldGlow : t.color.bgSoft,
              border: `1px solid ${isCurrent ? t.color.gold : t.color.border}`,
              opacity: isLocked ? 0.75 : 1,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: isCurrent ? t.color.gold : t.color.bg,
                color: isCurrent ? '#0d0d14' : t.color.text,
                display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16,
                border: `1px solid ${isCurrent ? t.color.gold : t.color.border}`,
              }}>{w}</div>
              <div>
                <div style={{ fontSize: t.font.sm, fontWeight: 700 }}>
                  שבוע {w}
                  {isCurrent && <span style={{ color: t.color.gold, marginRight: 6 }}> ★ נוכחי</span>}
                  {isLocked && <span style={{ color: t.color.textDim, marginRight: 6, fontSize: t.font.xs }}> 🔒 נעול</span>}
                </div>
                <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginTop: 2 }}>
                  {styleLabel} · <span style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
                  {isLocked && <span> · נפתח כשתסיים 75% משבוע {w - 1}</span>}
                  {w % 4 === 0 && !isCurrent && <span style={{ color: t.color.info }}> · דלוד מומלץ</span>}
                </div>
              </div>
              {!isLocked && (
                <select
                  value={diff}
                  onChange={e => onSetDifficulty(w, e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: t.radius.sm,
                    background: t.color.bg, color: t.color.text,
                    border: `1px solid ${t.color.border}`,
                    fontFamily: 'inherit', fontSize: t.font.xs,
                  }}
                >
                  {DIFFICULTY_LEVELS.map(d => (
                    <option key={d} value={d}>{DIFFICULTY_LABELS[d].icon} {DIFFICULTY_LABELS[d].label}</option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
        {currentWeek + 3 < totalWeeks && (
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, textAlign: 'center', padding: 8 }}>
            + עוד {totalWeeks - currentWeek - 3} שבועות בהמשך המחזור
          </div>
        )}
      </div>
    </Card>
  )
}
