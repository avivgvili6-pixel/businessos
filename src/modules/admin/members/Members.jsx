import React, { useState, useEffect, useMemo } from 'react'
import { t } from '../../../theme/tokens'
import { Card, Button, Input, Select, Modal, ProgressBar } from '../../../components/ui/UI'
import { Sparkline } from '../../../components/charts/Charts'
import { Kicker, SectionHead, Label, Button as SButton } from '../../../design/components/primitives'
import { useAuth } from '../../../auth/AuthContext'
import { supabaseEnabled } from '../../../lib/supabase'
import { listAllMembers, memberEngagementSummary, adminSendPasswordRecovery } from '../../../services/supabaseSync'

// Real admin roster — reads live from Supabase profiles table.
// The old mockMembers demo is available behind a toggle for UI preview.

export function Members() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [showDemo, setShowDemo] = useState(false)
  const [demoMembers, setDemoMembers] = useState([])

  // Real data from Supabase
  const [live, setLive] = useState([])
  const [engagement, setEngagement] = useState({ photos: {}, requests: {} })
  const [loading, setLoading] = useState(supabaseEnabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabaseEnabled) { setLoading(false); return }
    let mounted = true
    ;(async () => {
      try {
        const [members, eng] = await Promise.all([
          listAllMembers(),
          memberEngagementSummary(),
        ])
        if (!mounted) return
        setLive(members)
        setEngagement(eng)
      } catch (err) {
        console.error('[Members] load failed:', err)
        if (mounted) setError(err.message || 'שגיאה בטעינת מתאמנים')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (showDemo && !demoMembers.length) {
      import('../../../data/mockUsers').then(m => setDemoMembers(m.mockMembers))
    }
  }, [showDemo])

  const normalized = useMemo(() => {
    if (showDemo) return demoMembers
    return live.map(m => normalizeMember(m, engagement))
  }, [live, engagement, showDemo, demoMembers])

  const filtered = normalized.filter(m =>
    (!q || (m.name || '').toLowerCase().includes(q.toLowerCase()) || (m.email || '').toLowerCase().includes(q.toLowerCase())) &&
    (!statusFilter || m.status === statusFilter) &&
    (!roleFilter || m.role === roleFilter)
  )

  const counts = useMemo(() => ({
    total: normalized.length,
    active: normalized.filter(m => m.status === 'active').length,
    coaches: normalized.filter(m => m.role === 'coach').length,
    admins: normalized.filter(m => m.role === 'admin').length,
  }), [normalized])

  // Copy the trainee signup link — the admin can share it with new members
  const inviteLink = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  const [copied, setCopied] = useState(false)
  const copyInvite = () => {
    navigator.clipboard?.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>

      {/* ─── Sport-Refined header card: real-time counters + invite link ─── */}
      <div style={{
        position: 'relative',
        borderRadius: t.radius.xl,
        overflow: 'hidden',
        border: `1px solid ${t.color.hairline}`,
        background: `linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.7) 100%), linear-gradient(160deg, ${t.color.panel2} 0%, ${t.color.charcoal} 100%)`,
        padding: '24px 24px 24px',
      }}>
        <div style={{
          position: 'absolute', top: '-30%', insetInlineEnd: '-20%',
          width: 340, height: 340,
          background: `radial-gradient(circle, ${t.color.wineGlow} 0%, transparent 55%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, marginBottom: 16 }}>
          <Kicker>קונסולת מנהל</Kicker>
        </div>

        <div style={{ position: 'relative', zIndex: 2, marginBottom: 20 }}>
          <SectionHead size="h2" emphasis={counts.total ? `${counts.total} רשומים` : 'עדיין ריק'}>
            המתאמנים שלך
          </SectionHead>
        </div>

        {/* Live counters */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: t.color.border, borderRadius: t.radius.md, overflow: 'hidden',
          marginBottom: 20,
        }}>
          <CountCell label="סה״כ" value={counts.total} />
          <CountCell label="פעילים" value={counts.active} tone="wine" />
          <CountCell label="מאמנים" value={counts.coaches} />
          <CountCell label="מנהלים" value={counts.admins} />
        </div>

        {/* Invite link */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
          padding: '12px 14px',
          background: t.color.charcoal,
          border: `1px solid ${t.color.border}`,
          borderRadius: t.radius.md,
        }}>
          <Label color={t.color.silver3}>קישור הזמנה</Label>
          <div style={{
            flex: 1, minWidth: 200,
            fontFamily: t.font.family.mono, fontSize: 12,
            color: t.color.silver1, letterSpacing: '-0.005em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            direction: 'ltr',
          }}>{inviteLink}</div>
          <SButton variant={copied ? 'quiet' : 'light'} size="sm" onClick={copyInvite}>
            {copied ? 'הועתק' : 'העתק'}
          </SButton>
        </div>
      </div>

      {/* Setup notice / demo toggle */}
      {!supabaseEnabled && (
        <NoticeBanner tone="warn">
          Supabase לא מוגדר במערכת (VITE_SUPABASE_URL חסר). המתאמנים לא יסונכרנו בין מכשירים. הפעל "תצוגת דמו" כדי לראות את המבנה עם נתונים לדוגמה.
        </NoticeBanner>
      )}
      {supabaseEnabled && error && (
        <NoticeBanner tone="danger">
          שגיאה בטעינה מ-Supabase: {error}
        </NoticeBanner>
      )}
      {supabaseEnabled && !loading && !error && normalized.length === 0 && !showDemo && (
        <NoticeBanner tone="info">
          אין עדיין רשומות של מתאמנים. שלח את קישור ההזמנה, ומיד שהמתאמנים נרשמים הם יופיעו כאן.
        </NoticeBanner>
      )}

      {/* Filters + demo toggle */}
      <div style={{
        background: t.color.panel, border: `1px solid ${t.color.border}`,
        borderRadius: t.radius.lg, padding: 14,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10,
        }} className="hfos-grid-members">
          <Input placeholder="חפש לפי שם או מייל…" value={q} onChange={e => setQ(e.target.value)} />
          <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">כל התפקידים</option>
            <option value="member">מתאמן</option>
            <option value="coach">מאמן</option>
            <option value="admin">מנהל</option>
          </Select>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="onboarding">בתהליך</option>
            <option value="idle">לא פעיל</option>
          </Select>
          <SButton
            variant={showDemo ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowDemo(v => !v)}
          >
            {showDemo ? 'כבה דמו' : 'תצוגת דמו'}
          </SButton>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          padding: 40, textAlign: 'center',
          background: t.color.panel, border: `1px solid ${t.color.border}`,
          borderRadius: t.radius.lg,
        }}>
          <Label color={t.color.silver2}>טוען מתאמנים מ-Supabase…</Label>
        </div>
      )}

      {/* Members table */}
      {!loading && filtered.length > 0 && (
        <div style={{
          background: t.color.panel, border: `1px solid ${t.color.border}`,
          borderRadius: t.radius.lg, overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: `1px solid ${t.color.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          }}>
            <Kicker color="silver" dash={false}>{showDemo ? 'תצוגת דמו' : 'נתונים חיים'}</Kicker>
            <Label color={t.color.silver3}>{filtered.length} מתוך {normalized.length}</Label>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr>
                  {['מתאמן', 'תפקיד', 'מטרה', 'סטטוס', 'תמונות', 'הצטרף'].map(h => (
                    <th key={h} style={{
                      textAlign: 'right', padding: '12px 16px',
                      fontFamily: t.font.family.mono, fontSize: 10,
                      letterSpacing: '0.24em', textTransform: 'uppercase',
                      color: t.color.silver3, fontWeight: 400,
                      borderBottom: `1px solid ${t.color.hairline}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <MemberRow key={m.id} member={m} onOpen={() => setSelected(m)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MemberDrawer member={selected} onClose={() => setSelected(null)} />
      <style>{`@media (max-width: 900px) { .hfos-grid-members { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────

// Turn a raw Supabase profile row into the shape the UI expects.
function normalizeMember(row, engagement) {
  const photos = engagement.photos?.[row.id]?.count || 0
  const lastActivity = engagement.photos?.[row.id]?.last || row.updated_at || row.created_at
  const daysSinceActive = lastActivity ? daysBetween(new Date(lastActivity), new Date()) : null
  const daysSinceJoin = row.created_at ? daysBetween(new Date(row.created_at), new Date()) : 0

  // Simple status heuristic based on activity
  let status = 'onboarding'
  if (row.onboarded) status = 'active'
  if (daysSinceActive !== null && daysSinceActive > 21) status = 'idle'

  return {
    id: row.id,
    name: row.name || (row.email ? row.email.split('@')[0] : 'ללא שם'),
    email: row.email || '',
    role: row.role || 'member',
    status,
    onboarded: !!row.onboarded,
    age: row.age,
    sex: row.sex,
    weightKg: row.weight_kg,
    goal: goalLabel(row.goal_key),
    joinedDays: daysSinceJoin,
    lastActivityDays: daysSinceActive,
    photosCount: photos,
    createdAt: row.created_at,
  }
}

function daysBetween(a, b) {
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / 86400000))
}

function goalLabel(key) {
  const map = {
    build_muscle: 'בניית שריר',
    lose_weight: 'ירידה במשקל',
    get_stronger: 'להתחזק',
    endurance: 'סיבולת',
    health: 'בריאות כללית',
    performance: 'ביצועים',
  }
  return map[key] || (key ? key : '—')
}

// ─── Row component ─────────────────────────────────────────
function MemberRow({ member, onOpen }) {
  const initials = (member.name || '?').trim().slice(0, 1).toUpperCase()

  return (
    <tr
      onClick={onOpen}
      style={{
        cursor: 'pointer',
        borderBottom: `1px solid ${t.color.hairline}`,
        transition: 'background .12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = t.color.panel2}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.color.wineLight}, ${t.color.wine})`,
            color: t.color.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.font.family.display,
            fontWeight: 600, fontSize: 13,
            border: `1px solid rgba(255,255,255,0.08)`,
            flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: t.font.family.display, fontSize: 14,
              fontWeight: 600, color: t.color.white,
              letterSpacing: '-0.01em', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{member.name}</div>
            {member.email && (
              <div style={{
                fontFamily: t.font.family.mono, fontSize: 10,
                letterSpacing: '0.05em', color: t.color.silver3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                direction: 'ltr', textAlign: 'left',
              }}>{member.email}</div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '14px 16px' }}>
        <RoleTag role={member.role} />
      </td>
      <td style={{
        padding: '14px 16px', fontSize: 13, color: t.color.silver1,
        letterSpacing: '-0.005em',
      }}>{member.goal}</td>
      <td style={{ padding: '14px 16px' }}>
        <StatusTag status={member.status} />
      </td>
      <td style={{
        padding: '14px 16px',
        fontFamily: t.font.family.mono, fontSize: 11,
        color: t.color.silver1, fontVariantNumeric: 'tabular-nums',
      }}>{member.photosCount || '—'}</td>
      <td style={{ padding: '14px 16px' }}>
        <Label color={t.color.silver2}>
          {member.joinedDays === 0 ? 'היום'
            : member.joinedDays === 1 ? 'אתמול'
            : `${member.joinedDays} ימים`}
        </Label>
      </td>
    </tr>
  )
}

function RoleTag({ role }) {
  const map = {
    admin: { label: 'מנהל', color: t.color.wineLight },
    coach: { label: 'מאמן', color: t.color.silver1 },
    member: { label: 'מתאמן', color: t.color.silver2 },
  }
  const cfg = map[role] || map.member
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      background: 'transparent',
      border: `1px solid ${cfg.color}`,
      color: cfg.color,
      borderRadius: t.radius.pill,
      fontFamily: t.font.family.mono, fontSize: 9,
      letterSpacing: '0.22em', textTransform: 'uppercase',
    }}>{cfg.label}</span>
  )
}

function StatusTag({ status }) {
  const map = {
    active: { label: 'פעיל', color: t.color.success },
    onboarding: { label: 'בתהליך', color: t.color.silver1 },
    idle: { label: 'לא פעיל', color: t.color.warning },
    paused: { label: 'מושהה', color: t.color.warning },
  }
  const cfg = map[status] || map.onboarding
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: t.font.family.mono, fontSize: 10,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function CountCell({ label, value, tone }) {
  return (
    <div style={{
      padding: '14px 12px',
      background: t.color.panel,
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 9,
        letterSpacing: '0.24em', color: t.color.silver3,
        textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: t.font.family.display,
        fontSize: 26, fontWeight: 600,
        letterSpacing: '-0.03em', lineHeight: 1,
        color: tone === 'wine' ? t.color.wineLight : t.color.white,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
    </div>
  )
}

function NoticeBanner({ tone, children }) {
  const border = tone === 'danger' ? t.color.danger
                : tone === 'warn'  ? t.color.warning
                : tone === 'info'  ? t.color.wineLight
                : t.color.border
  return (
    <div style={{
      padding: '14px 16px',
      background: t.color.panel,
      border: `1px solid ${border}`,
      borderRadius: t.radius.md,
      color: t.color.silver1,
      fontSize: 13, lineHeight: 1.5,
      letterSpacing: '-0.005em',
    }}>{children}</div>
  )
}

// ─── Drawer for member detail ─────────────────────────────
function MemberDrawer({ member, onClose }) {
  if (!member) return null

  // Password recovery action state
  const [resetState, setResetState] = useState({ status: 'idle', message: '' })
  const sendReset = async () => {
    if (!member.email) {
      setResetState({ status: 'error', message: 'למתאמן/ת אין מייל רשום — אי אפשר לשלוח איפוס.' })
      return
    }
    setResetState({ status: 'sending', message: '' })
    const res = await adminSendPasswordRecovery(member.email)
    if (res.ok) {
      setResetState({ status: 'ok', message: `נשלח מייל איפוס ל־${member.email}. הקישור פעיל שעה.` })
    } else {
      const msg = res.error?.message || 'שגיאה בשליחת האיפוס. נסה שוב או פנה לתמיכה.'
      setResetState({ status: 'error', message: msg })
    }
  }
  const copyInvite = async () => {
    const link = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
    await navigator.clipboard?.writeText(link)
    setResetState({ status: 'copied', message: 'קישור ההזמנה הועתק — הדבק בהודעה למתאמן.' })
    setTimeout(() => setResetState({ status: 'idle', message: '' }), 2500)
  }

  // Seed-based synthetic charts for demo members (no real workout log yet)
  const seed = String(member.id).charCodeAt(1) || 3
  const rand = (i) => Math.abs(Math.sin(seed * 12.9898 + i * 78.233)) % 1
  const weight = member.weightKg || 75
  const adherence = member.adherence || (member.status === 'active' ? 78 : 42)
  const mood = member.mood || 7
  const weightSeries = Array.from({ length: 12 }, (_, i) => +(weight + (rand(i)-0.5)*3).toFixed(1))
  const adherenceSeries = Array.from({ length: 8 }, (_, i) => Math.min(100, Math.max(30, adherence + Math.round((rand(i+5)-0.5)*20))))
  const moodSeries = Array.from({ length: 14 }, (_, i) => Math.min(10, Math.max(2, Math.round(mood + (rand(i+10)-0.5)*3))))

  return (
    <Modal open={!!member} onClose={onClose} title={member.name} width={800}>
      <div style={{ display: 'grid', gap: 20 }}>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', paddingBottom: 12,
          borderBottom: `1px solid ${t.color.border}`,
        }}>
          <Kicker>{member.role === 'admin' ? 'מנהל' : member.role === 'coach' ? 'מאמן' : 'מתאמן'}</Kicker>
          <Label color={t.color.silver2}>
            {member.email || `נרשם לפני ${member.joinedDays} ימים`}
          </Label>
        </div>

        {/* Meta stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: t.color.border, borderRadius: t.radius.md, overflow: 'hidden',
        }} className="hfos-member-stats">
          <MiniStat label="גיל" value={member.age || '—'} />
          <MiniStat label="משקל" value={member.weightKg ? `${member.weightKg}` : '—'} unit={member.weightKg ? 'ק״ג' : ''} />
          <MiniStat label="הצטרף" value={member.joinedDays} unit="יום" />
          <MiniStat label="תמונות" value={member.photosCount || 0} />
        </div>

        {/* Trends (mock for now — real data once workout logs sync) */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
        }} className="hfos-member-charts">
          <TrendCard title="משקל" data={weightSeries} unit="ק״ג" sub="12 שבועות" />
          <TrendCard title="דבקות" data={adherenceSeries} unit="%" sub="8 שבועות" />
          <TrendCard title="מצב רוח" data={moodSeries} unit="/10" sub="14 ימים" />
        </div>

        {/* Summary rows */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          <SummaryRow label="מטרה" value={member.goal} />
          <SummaryRow label="סטטוס" value={
            <StatusTag status={member.status} />
          } />
          <SummaryRow label="מייל" value={member.email || '—'} mono />
          <SummaryRow label="פעילות אחרונה" value={
            member.lastActivityDays === null ? '—'
            : member.lastActivityDays === 0 ? 'היום'
            : `לפני ${member.lastActivityDays} ימים`
          } />
        </div>

        {/* Recommendations */}
        <div style={{
          padding: 16, background: t.color.panel,
          border: `1px solid ${t.color.border}`,
          borderRadius: t.radius.lg,
        }}>
          <div style={{ marginBottom: 8 }}>
            <Kicker color="wine">המלצת המנוע</Kicker>
          </div>
          <div style={{
            fontSize: 14, color: t.color.silver1, lineHeight: 1.6,
            letterSpacing: '-0.005em',
          }}>
            {coachRecommendation(member)}
          </div>
        </div>

        {/* Account actions — send recovery / copy invite */}
        <div style={{
          padding: 16, background: t.color.panel,
          border: `1px solid ${t.color.border}`, borderRadius: t.radius.lg,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 12,
          }}>
            <Kicker color="wine">גישה לחשבון</Kicker>
            <Label color={t.color.silver3}>שליחה למייל של המתאמן/ת</Label>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <SButton
              variant="primary"
              onClick={sendReset}
              disabled={resetState.status === 'sending' || !member.email}
            >
              {resetState.status === 'sending' ? 'שולח…' : 'שלח מייל איפוס סיסמה'}
            </SButton>
            <SButton variant="ghost" onClick={copyInvite}>
              העתק קישור הזמנה
            </SButton>
          </div>

          {resetState.message && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              borderRadius: t.radius.sm,
              background: resetState.status === 'error' ? `${t.color.danger}18` : `${t.color.wineGlow}`,
              border: `1px solid ${resetState.status === 'error' ? t.color.danger : t.color.wineLight}`,
              color: resetState.status === 'error' ? t.color.danger : t.color.silver1,
              fontSize: 13, lineHeight: 1.5, letterSpacing: '-0.005em',
            }}>{resetState.message}</div>
          )}

          {!member.email && (
            <div style={{
              marginTop: 10,
              fontFamily: t.font.family.mono, fontSize: 10,
              letterSpacing: '0.14em', color: t.color.silver3,
              textTransform: 'uppercase',
            }}>אין מייל רשום — לא ניתן לשלוח איפוס</div>
          )}
        </div>

        <div style={{
          display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap',
          paddingTop: 8, borderTop: `1px solid ${t.color.border}`,
        }}>
          <SButton variant="ghost">שלח הודעה</SButton>
          <SButton variant="ghost">קבע פגישה</SButton>
          <SButton variant="light">צפה כמתאמן</SButton>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .hfos-member-stats { grid-template-columns: 1fr 1fr !important; }
          .hfos-member-charts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Modal>
  )
}

function TrendCard({ title, data, unit, sub }) {
  const last = data[data.length - 1]
  const first = data[0]
  const delta = last - first
  const pct = first ? Math.round((delta / first) * 100) : 0
  const positive = delta >= 0
  return (
    <div style={{
      padding: 16, background: t.color.panel,
      border: `1px solid ${t.color.border}`,
      borderRadius: t.radius.lg,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 10,
      }}>
        <Label color={t.color.silver2}>{title}</Label>
        <span style={{
          fontFamily: t.font.family.mono, fontSize: 10,
          color: positive ? t.color.success : t.color.warning,
          letterSpacing: '0.14em', fontVariantNumeric: 'tabular-nums',
        }}>{positive ? '↑' : '↓'} {Math.abs(pct)}%</span>
      </div>
      <div style={{
        fontFamily: t.font.family.display,
        fontSize: 26, fontWeight: 500,
        letterSpacing: '-0.03em', color: t.color.white,
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 8, lineHeight: 1,
      }}>
        {last}
        <span style={{
          fontFamily: t.font.family.body, fontSize: 12,
          color: t.color.silver2, marginInlineStart: 4, fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>{unit}</span>
      </div>
      <Sparkline data={data} height={36} color={t.color.wineLight} />
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 9,
        color: t.color.silver3, marginTop: 6,
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>{sub}</div>
    </div>
  )
}

function coachRecommendation(m) {
  if (m.status === 'idle') return `${m.name} לא פעיל ${m.lastActivityDays} ימים. שלח הודעה אישית — לפעמים מספיק "מה נשמע" כדי להחזיר. אם אין תגובה תוך שבוע, קבע פגישת ריענון.`
  if (!m.onboarded) return `${m.name} טרם השלים את תהליך הרישום. שלח לו את הקישור שוב או עזור לו בשלבים הראשונים.`
  if (m.photosCount === 0) return `${m.name} עדיין לא העלה תמונות התקדמות. הזכר לו — תמונות קדם/אחרי הן הכלי החזק ביותר לשמור מוטיבציה.`
  return `${m.name} על מסלול טוב. המשך במה שעובד. פגישה חודשית להערכת התקדמות תספיק.`
}

function MiniStat({ label, value, unit }) {
  return (
    <div style={{
      padding: 14, background: t.color.panel, textAlign: 'center',
    }}>
      <div style={{
        fontFamily: t.font.family.mono, fontSize: 9,
        letterSpacing: '0.24em', color: t.color.silver3,
        textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{
        fontFamily: t.font.family.display,
        fontSize: 20, fontWeight: 600,
        letterSpacing: '-0.025em', color: t.color.white,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>
        {value}
        {unit && <span style={{
          fontFamily: t.font.family.body, fontSize: 11,
          color: t.color.silver2, marginInlineStart: 3,
          fontWeight: 500, letterSpacing: '-0.01em',
        }}>{unit}</span>}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono }) {
  return (
    <div style={{
      padding: '12px 14px',
      background: t.color.panel,
      border: `1px solid ${t.color.border}`,
      borderRadius: t.radius.md,
    }}>
      <div style={{ marginBottom: 4 }}>
        <Label color={t.color.silver3}>{label}</Label>
      </div>
      <div style={{
        fontFamily: mono ? t.font.family.mono : t.font.family.body,
        fontSize: mono ? 12 : 14,
        color: t.color.white,
        fontWeight: mono ? 400 : 500,
        letterSpacing: mono ? '0.02em' : '-0.005em',
        direction: mono ? 'ltr' : 'inherit',
        textAlign: mono ? 'left' : 'inherit',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  )
}
