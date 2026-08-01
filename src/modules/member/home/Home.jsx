import React from 'react'
import { t } from '../../../theme/tokens'
import { useApp } from '../../../store/AppStore'
import { Card, Button, Ring, Stat, Badge, SectionHeader, ProgressBar } from '../../../components/ui/UI'
import { Sparkline, BarChart } from '../../../components/charts/Charts'
import { greeting, DAYS_SHORT_HE, todayKey } from '../../../utils/date'
import { bmr, tdee, macros, goalAdjustments, dietTemplates, waterLiters } from '../../../utils/calc'
import { runEngine, severityColor } from '../../../engine/adaptationEngine'
import { DailyBoost } from '../../../components/notifications/DailyBoost'
import { PhotoReminder } from '../../../components/reminders/PhotoReminder'
import { Kicker, SectionHead, Label, Button as SButton } from '../../../design/components/primitives'

export function Home({ go }) {
  const { state } = useApp()
  const { profile, habits, moodCheckins, mealLogs, workoutLogs } = state
  const first = profile.name?.split(' ')[0] || 'אלוף'
  const insights = React.useMemo(() => runEngine(state), [state])
  const topInsight = insights[0]
  const _bmr = bmr(profile)
  const _tdee = tdee(_bmr, profile.activity)
  const goalDelta = goalAdjustments[profile.goalKey]?.kcalDelta || 0
  const kcalTarget = _tdee + goalDelta
  const diet = dietTemplates[profile.dietKey] || dietTemplates.balanced
  const target = macros(kcalTarget, diet.p, diet.c, diet.f)

  const todayMeals = mealLogs[todayKey()] || []
  const todayKcal = Math.round(todayMeals.reduce((s, m) => s + (m.kcal || 0), 0))
  const habitDone = habits.filter(h => h.doneToday).length
  const lastMood = moodCheckins[0]

  const readiness = calcReadiness({ mood: lastMood?.mood ?? 7, sleep: lastMood?.sleepHours ?? 7, stress: lastMood?.stress ?? 4 })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>
      <DailyBoost userName={first} />
      <PhotoReminder go={go} />

      {/* Hero — Sport-Refined */}
      <div className="hfos-hero" style={{
        position: 'relative',
        borderRadius: t.radius.xl,
        overflow: 'hidden',
        border: `1px solid ${t.color.hairline}`,
        background: `linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.7) 100%), linear-gradient(160deg, ${t.color.panel2} 0%, ${t.color.charcoal} 100%)`,
        padding: '24px 24px 26px',
      }}>
        {/* wine radial */}
        <div style={{
          position: 'absolute', top: '-30%', insetInlineEnd: '-20%',
          width: 340, height: 340,
          background: `radial-gradient(circle, ${t.color.wineGlow} 0%, transparent 55%)`,
          pointerEvents: 'none',
        }} />

        <div className="hfos-hero-row" style={{
          position: 'relative', zIndex: 2,
          display:'flex', justifyContent:'space-between', alignItems:'center', gap: 16,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <Kicker>{greeting()}</Kicker>
            </div>
            <SectionHead size="h1" emphasis="מוכן?" style={{ fontSize: 34, marginBottom: 10 }} className="hfos-hero-title">
              {first},
            </SectionHead>
            <div style={{
              color: t.color.silver1, fontSize: t.font.body, lineHeight: 1.5,
              letterSpacing: '-0.005em', maxWidth: 380,
            }}>{focusToday(state)}</div>
          </div>
          <Ring value={readiness} max={100} size={90} stroke={8}
            color={readiness >= 75 ? t.color.success : readiness >= 50 ? t.color.wineLight : t.color.warning}
            label={`${readiness}`} sublabel="READY" />
        </div>
      </div>

      {/* Goal widget - most important thing in the app */}
      <GoalWidget state={state} go={go} />

      {/* Quick stats */}
      <div className="hfos-kpis" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <Card style={{ padding: 16 }}>
          <Stat icon="🔥" label="קלוריות" value={`${todayKcal}/${kcalTarget}`} />
          <ProgressBar value={todayKcal} max={kcalTarget} style={{ marginTop: 8 }} />
        </Card>
        <Card style={{ padding: 16 }}>
          <Stat icon="💪" label="אימונים השבוע" value={weekWorkouts(workoutLogs)} delta={`${workoutLogs.length} סה״כ`} deltaColor={t.color.textDim} />
        </Card>
        <Card style={{ padding: 16 }}>
          <Stat icon="🎯" label="הרגלים היום" value={`${habitDone}/${habits.length}`} />
          <ProgressBar value={habitDone} max={habits.length} color={t.color.success} style={{ marginTop: 8 }} />
        </Card>
        <Card style={{ padding: 16 }}>
          <Stat icon="😊" label="מצב רוח" value={lastMood ? `${lastMood.mood}/10` : '—'} delta={lastMood ? `אנרגיה ${lastMood.energy}/10` : 'טרם נבדק'} deltaColor={t.color.textDim} />
        </Card>
      </div>

      {/* Focus row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 20 }} className="hfos-grid-2">
        <Card>
          <SectionHeader title="השבוע במבט" subtitle="פעילות + מקרו" />
          <BarChart
            labels={DAYS_SHORT_HE}
            data={sampleWeekActivity(state)}
            formatValue={v => `${v}`}
            color={t.color.gold}
          />
        </Card>
        <Card>
          <SectionHeader title="פעולות מהירות" />
          <div style={{ display:'grid', gap: 10 }}>
            <QuickAction icon="💪" text="התחל אימון היום" onClick={() => go('train')} />
            <QuickAction icon="🍽️" text="הוסף ארוחה"      onClick={() => go('nutrition')} />
            <QuickAction icon="🧠" text="Check-in מנטלי"   onClick={() => go('mind')} />
            <QuickAction icon="🎯" text="סמן הרגל"          onClick={() => go('habits')} />
          </div>
        </Card>
      </div>

      {/* Macros ring + AI insight */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap: 20 }} className="hfos-grid-2">
        <Card>
          <SectionHeader title="יעדי מקרו יומיים" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
            <MacroTile label="חלבון" value={target.protein} unit="ג׳" color={t.color.info} />
            <MacroTile label="פחמימות" value={target.carbs} unit="ג׳" color={t.color.gold} />
            <MacroTile label="שומן" value={target.fat} unit="ג׳" color={t.color.warning} />
          </div>
          <div style={{ marginTop: 14, padding: 12, background: t.color.bgSoft, borderRadius: t.radius.sm, fontSize: t.font.sm, color: t.color.textDim }}>
            💧 מים מומלץ: {waterLiters(profile.weightKg, profile.activity)} ליטר · תזונה: {diet.label}
          </div>
        </Card>
        <Card style={{ background:`linear-gradient(135deg, ${t.color.bgCard} 0%, ${t.color.bgSoft} 100%)`, position:'relative', overflow:'hidden', cursor:'pointer' }} onClick={() => go('insights')}>
          <div style={{ position:'absolute', top: -20, left: -20, width: 120, height: 120, background: topInsight ? `${severityColor(topInsight.severity)}22` : t.color.goldGlow, borderRadius:'50%', filter:'blur(30px)' }} />
          <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
            <Badge color={topInsight ? severityColor(topInsight.severity) : t.color.gold}>{topInsight?.icon || '💡'} תובנת המנוע</Badge>
            {insights.length > 1 && <Badge color={t.color.textDim}>+{insights.length - 1} תובנות נוספות</Badge>}
          </div>
          {topInsight ? (
            <>
              <div style={{ marginTop: 12, fontSize: t.font.lg, fontWeight: 700, lineHeight: 1.4 }}>{topInsight.title}</div>
              <div style={{ marginTop: 6, fontSize: t.font.sm, color: t.color.textDim, lineHeight: 1.6 }}>{topInsight.body}</div>
              <div style={{ marginTop: 14, display:'flex', gap: 10, alignItems:'center' }}>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); go(topInsight.action?.target || 'insights') }}>{topInsight.action?.label || 'פתח תובנות'} ←</Button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginTop: 12, fontSize: t.font.lg, fontWeight: 600, lineHeight: 1.5 }}>הכל מסונכרן. המשך במה שאתה עושה - נותן לך תובנות ברגע שמשהו יתפוס תשומת לב.</div>
              <div style={{ marginTop: 14, display:'flex', gap: 10, alignItems:'center' }}>
                <Sparkline data={[62, 64, 63, 66, 68, 71, 72]} height={30} />
                <Badge color={t.color.success}>מגמה חיובית</Badge>
              </div>
            </>
          )}
        </Card>
      </div>
      <style>{`
        @media (max-width: 900px) { .hfos-grid-2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 500px) {
          .hfos-kpis { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function QuickAction({ icon, text, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 12, padding: 14,
      background: t.color.bgSoft, border:`1px solid ${t.color.border}`,
      borderRadius: t.radius.md, cursor:'pointer', color: t.color.text,
      fontFamily:'inherit', fontSize: t.font.md, transition: t.transition, textAlign:'right',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = t.color.gold; e.currentTarget.style.background = t.color.goldGlow }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = t.color.border; e.currentTarget.style.background = t.color.bgSoft }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ flex: 1, fontWeight: 500 }}>{text}</span>
      <span style={{ color: t.color.gold }}>←</span>
    </button>
  )
}

function MacroTile({ label, value, unit, color }) {
  return (
    <div style={{ padding: 14, background: t.color.bgSoft, borderRadius: t.radius.md, textAlign:'center' }}>
      <div style={{ fontSize: t.font.xs, color: t.color.textDim, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: t.font.xl, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: t.font.xs, color: t.color.textMuted }}>{unit}</div>
    </div>
  )
}

function GoalWidget({ state, go }) {
  const goal = (state.goals || []).find(g => g.status === 'active')
  if (!goal) {
    return (
      <Card style={{ padding: 20, background: t.color.goldGlow, border:`1px solid ${t.color.gold}`, cursor:'pointer' }} onClick={() => go('goals')}>
        <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
          <div style={{ fontSize: 38 }}>🎯</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: t.font.lg, color: t.color.gold, marginBottom: 4 }}>
              עדיין אין לך מטרה מדידה
            </div>
            <div style={{ color: t.color.textDim, fontSize: t.font.sm }}>
              בואי נגדיר יחד תוך 3 דקות - נעזור אם לא בטוח.
            </div>
          </div>
          <Button size="sm">בואו נבנה ←</Button>
        </div>
      </Card>
    )
  }
  const daysSince = Math.floor((Date.now() - new Date(goal.startDate)) / (24*3600*1000))
  const totalDays = goal.deadlineWeeks * 7
  const pct = Math.min(100, Math.round((daysSince / totalDays) * 100))
  const daysLeft = Math.max(0, totalDays - daysSince)
  return (
    <Card style={{ padding: 20, cursor:'pointer' }} hover onClick={() => go('goals')}>
      <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
        <div style={{ fontSize: 38 }}>🎯</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', gap: 8, alignItems:'center', marginBottom: 4 }}>
            <Badge>המטרה שלך</Badge>
            <span style={{ fontSize: t.font.xs, color: t.color.textDim }}>{daysLeft} ימים · {Math.ceil(daysLeft/7)} שב׳</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: t.font.md, marginBottom: 8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{goal.title}</div>
          <ProgressBar value={pct} max={100} color={pct >= 66 ? t.color.success : t.color.gold} />
        </div>
      </div>
    </Card>
  )
}

function calcReadiness({ mood, sleep, stress }) {
  const sleepScore = Math.min(100, (sleep/8) * 100)
  const moodScore = mood * 10
  const stressScore = 100 - (stress * 10)
  return Math.round((sleepScore * 0.4) + (moodScore * 0.35) + (stressScore * 0.25))
}

function focusToday(state) {
  if (!state.plan) return 'צור תכנית אימון כדי להתחיל'
  const wk = weekWorkouts(state.workoutLogs)
  if (wk === 0) return 'התחל את השבוע - אימון קליל היום'
  if (wk < 3) return 'להמשיך במומנטום - עוד אימון היום'
  return 'שמור על עקביות + פוקוס על שינה איכותית'
}

function weekWorkouts(logs) {
  const d = new Date(); d.setDate(d.getDate() - 7)
  return logs.filter(l => new Date(l.date) >= d).length
}

function sampleWeekActivity() {
  return [45, 60, 30, 70, 55, 20, 65]
}

function aiInsight(state) {
  const wk = weekWorkouts(state.workoutLogs)
  if (wk >= 4) return 'עקביות מדהימה השבוע. המנוע מזהה שיפור עקבי בנפח - שקול להוסיף יום מנוחה פעילה.'
  if (state.moodCheckins[0]?.sleepHours < 6) return 'השינה שלך נמוכה. הביצועים באימון עלולים לרדת - תן עדיפות לשינה הלילה.'
  return 'התחל שבוע חדש עם check-in מנטלי - זה יעזור לנו להתאים את המערכת עבורך.'
}
