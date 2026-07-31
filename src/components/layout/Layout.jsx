import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { useApp } from '../../store/AppStore'
import { useAuth } from '../../auth/AuthContext'

const MEMBER_NAV = [
  { key:'home',      label:'בית',      icon:'🏠' },
  { key:'goals',     label:'מטרה',     icon:'🎯' },
  { key:'insights',  label:'תובנות',   icon:'✨' },
  { key:'progress',  label:'התקדמות',  icon:'📈' },
  { key:'train',     label:'אימונים',  icon:'💪' },
  { key:'rehab',     label:'שיקום',    icon:'🩹' },
  { key:'nutrition', label:'תזונה',    icon:'🥗' },
  { key:'mind',      label:'מנטלי',    icon:'🧠' },
  { key:'habits',    label:'הרגלים',   icon:'🎯' },
  { key:'calendar',  label:'יומן',     icon:'📅' },
  { key:'store',     label:'חנות',     icon:'🛍️' },
  { key:'personal',  label:'אימון אישי', icon:'💼' },
  { key:'profile',   label:'פרופיל',   icon:'👤' },
]

const ADMIN_NAV = [
  { key:'overview',  label:'סקירה',    icon:'📊' },
  { key:'personal',  label:'בקשות אימון אישי', icon:'💼' },
  { key:'requests',  label:'בקשות מאמנים', icon:'📥' },
  { key:'members',   label:'מתאמנים',  icon:'👥' },
  { key:'team',      label:'צוות',     icon:'🧑‍🏫' },
  { key:'schedule',  label:'לו״ז',     icon:'📅' },
  { key:'content',   label:'תוכן',     icon:'📚' },
  { key:'billing',   label:'תשלומים',  icon:'💳' },
  { key:'analytics', label:'אנליטיקה', icon:'📈' },
  { key:'alerts',    label:'התראות',   icon:'🚨' },
  { key:'settings',  label:'הגדרות',   icon:'⚙️' },
]

export function Shell({ page, setPage, children }) {
  const { state } = useApp()
  const { user, logout, viewAs, setViewAs, effectiveRole } = useAuth()
  const isAdmin = user?.role === 'admin' // real admin
  const isAdminView = effectiveRole === 'admin' // currently viewing admin console
  const nav = isAdminView ? ADMIN_NAV : MEMBER_NAV
  const [mobileOpen, setMobileOpen] = useState(false)

  const switchView = (role) => {
    setViewAs(role)
    // Reset to the default page for the new view
    setPage(role === 'admin' ? 'overview' : 'home')
    setMobileOpen(false)
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: t.color.bg, color: t.color.text, direction:'rtl' }}>
      {/* Sidebar - desktop */}
      <aside className="hfos-sidebar" style={{
        width: 240, background: t.color.bgElevated, borderLeft:`1px solid ${t.color.border}`,
        padding: t.space.lg, display:'flex', flexDirection:'column', gap: t.space.md,
        position:'sticky', top: 0, height: '100vh',
      }}>
        <BrandBlock isAdmin={isAdminView} />
        <UserBlock user={user} onLogout={logout} />
        {isAdmin && <ViewAsSwitcher effectiveRole={effectiveRole} onSwitch={switchView} />}
        <nav style={{ display:'flex', flexDirection:'column', gap: 4, marginTop: 12 }}>
          {nav.map(item => (
            <NavItem key={item.key} item={item} active={page === item.key} onClick={() => setPage(item.key)} />
          ))}
        </nav>
        <div style={{ marginTop:'auto', padding: 12, background: t.color.bgSoft, borderRadius: t.radius.md, fontSize: t.font.xs, color: t.color.textDim }}>
          <div style={{ color:t.color.gold, fontWeight:700, marginBottom:4 }}>Holistic Fitness OS</div>
          <div>גרסת שלד • v0.1</div>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex: 900, display:'none',
        }} className="hfos-mobile-overlay">
          <aside onClick={e=>e.stopPropagation()} style={{
            width: 260, background: t.color.bgElevated, height:'100%', padding: t.space.lg,
            display:'flex', flexDirection:'column', gap: t.space.md,
          }}>
            <BrandBlock isAdmin={isAdminView} />
            <UserBlock user={user} onLogout={() => { logout(); setMobileOpen(false) }} />
            {isAdmin && <ViewAsSwitcher effectiveRole={effectiveRole} onSwitch={switchView} />}
            {nav.map(item => (
              <NavItem key={item.key} item={item} active={page === item.key} onClick={() => { setPage(item.key); setMobileOpen(false) }} />
            ))}
          </aside>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display:'flex', flexDirection:'column' }}>
        <TopBar page={nav.find(n => n.key === page)} isAdmin={isAdmin} onMenu={() => setMobileOpen(true)} />
        <div className="hfos-content" style={{ padding: t.space.xl, maxWidth: 1400, width: '100%', margin: '0 auto', flex: 1 }}>
          {children}
        </div>
        {/* Mobile bottom nav - primary 4 tabs + "עוד" opens drawer */}
        <nav className="hfos-bottomnav" style={{
          display:'none', position:'fixed', bottom:0, left:0, right:0, background: t.color.bgElevated,
          borderTop:`1px solid ${t.color.border}`, padding: '6px 4px', gap: 2, justifyContent:'space-around',
          zIndex: 100, boxShadow: '0 -4px 16px rgba(0,0,0,.3)',
        }}>
          {getPrimaryNav(nav, page).map(item => (
            <button key={item.key} onClick={() => setPage(item.key)} style={{
              flex:1, padding:'6px 2px', border:'none', background:'transparent',
              color: page === item.key ? t.color.gold : t.color.textDim, cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap: 2, fontSize: 9,
              fontFamily:'inherit',
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setMobileOpen(true)} style={{
            flex:1, padding:'6px 2px', border:'none', background:'transparent',
            color: t.color.textDim, cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', gap: 2, fontSize: 9,
            fontFamily:'inherit',
          }}>
            <span style={{ fontSize: 20 }}>⋯</span>
            <span>עוד</span>
          </button>
        </nav>
      </main>
      <ResponsiveStyle />
    </div>
  )
}

function BrandBlock({ isAdmin }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap: 10, padding: '6px 4px 12px', borderBottom: `1px solid ${t.color.border}` }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: t.color.gold, color:'#0d0d14',
        display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 900, fontSize: 20, boxShadow: t.shadow.glow,
      }}>H</div>
      <div>
        <div style={{ fontWeight: 800, letterSpacing: .5 }}>Holistic FIT</div>
        <div style={{ fontSize: 10, color: t.color.textDim, letterSpacing: 1 }}>{isAdmin ? 'ADMIN CONSOLE' : 'MEMBER APP'}</div>
      </div>
    </div>
  )
}

function ViewAsSwitcher({ effectiveRole, onSwitch }) {
  const roles = [
    { key: 'admin',  label: 'מנהל',   icon: '⚙️',  color: t.color.gold,    disabled: false },
    { key: 'coach',  label: 'בבנייה', icon: '🧑‍🏫', color: t.color.info,    disabled: true, subtitle: 'מאמן' },
    { key: 'member', label: 'מתאמן',  icon: '👤',  color: t.color.success, disabled: false },
  ]
  const isViewingOther = effectiveRole !== 'admin'
  return (
    <div>
      <div style={{
        fontSize: 9, letterSpacing: 1.5, color: t.color.textDim,
        fontFamily: 'Space Mono, monospace', marginBottom: 6, paddingRight: 4,
      }}>
        {isViewingOther ? '👁 צפייה כ־' : 'VIEW AS'}
      </div>
      <div style={{ display: 'flex', background: t.color.bgSoft, borderRadius: t.radius.md, padding: 3, gap: 2 }}>
        {roles.map(r => {
          const active = effectiveRole === r.key
          const handleClick = () => {
            if (r.disabled) {
              alert(`תצוגת ${r.subtitle || r.label} עדיין בבנייה - יגיע בקרוב.\n\nכרגע הפוקוס על תצוגת המתאמן.`)
              return
            }
            onSwitch(r.key)
          }
          return (
            <button
              key={r.key}
              onClick={handleClick}
              title={r.disabled ? `${r.subtitle} - בבנייה` : `צפה כ־${r.label}`}
              style={{
                flex: 1, padding: '6px 4px', border: 'none',
                cursor: r.disabled ? 'not-allowed' : 'pointer',
                background: active ? r.color : 'transparent',
                color: r.disabled ? t.color.textMuted : active ? '#0d0d14' : t.color.textDim,
                fontWeight: 700, borderRadius: t.radius.sm, fontFamily: 'inherit', fontSize: 11,
                transition: t.transition, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                opacity: r.disabled ? 0.5 : 1,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              <span style={{ fontSize: r.disabled ? 9 : 11 }}>{r.label}</span>
            </button>
          )
        })}
      </div>
      {isViewingOther && (
        <div style={{
          marginTop: 6, padding: '4px 8px', background: t.color.goldGlow,
          border: `1px solid ${t.color.gold}`, borderRadius: t.radius.sm,
          fontSize: 10, color: t.color.gold, textAlign: 'center',
        }}>
          חזור למנהל ל-view רגיל
        </div>
      )}
    </div>
  )
}

function UserBlock({ user, onLogout }) {
  if (!user) return null
  const roleLabel = { admin: 'מנהל', coach: 'מאמן', member: 'מתאמן' }[user.role] || 'משתמש'
  const roleColor = { admin: t.color.gold, coach: t.color.info, member: t.color.success }[user.role]
  return (
    <div style={{ background: t.color.bgSoft, borderRadius: t.radius.md, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: roleColor, color: '#0d0d14',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>{(user.name || user.email)[0]?.toUpperCase() || '?'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
        <div style={{ fontSize: 10, color: roleColor, fontWeight: 600 }}>{roleLabel}</div>
      </div>
      <button onClick={onLogout} title="יציאה" style={{
        background: 'transparent', border: `1px solid ${t.color.border}`, color: t.color.textDim,
        borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
      }}>יציאה</button>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap: 10, padding:'10px 12px', width:'100%', textAlign:'right',
      background: active ? t.color.bgSoft : 'transparent',
      border: `1px solid ${active ? t.color.border : 'transparent'}`,
      color: active ? t.color.gold : t.color.text,
      cursor:'pointer', borderRadius: t.radius.md, fontFamily:'inherit', fontSize: t.font.md,
      transition: t.transition, fontWeight: active ? 600 : 400,
    }}>
      <span style={{ fontSize: 18 }}>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  )
}

function TopBar({ page, isAdmin, onMenu }) {
  return (
    <header className="hfos-topbar" style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: '14px 20px', borderBottom: `1px solid ${t.color.border}`,
      background: `${t.color.bgElevated}aa`, backdropFilter:'blur(10px)', position:'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <button className="hfos-menu-btn" onClick={onMenu} style={{
          display:'none', background:'transparent', border:`1px solid ${t.color.border}`,
          color: t.color.text, padding:'6px 10px', borderRadius: t.radius.sm, cursor:'pointer', fontFamily:'inherit',
        }}>☰</button>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          {page?.icon && <span style={{ fontSize: 20 }}>{page.icon}</span>}
          <div>
            <div style={{ fontSize: t.font.lg, fontWeight: 700 }}>{page?.label}</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <button style={{
          background: t.color.bgSoft, border:`1px solid ${t.color.border}`, borderRadius: t.radius.pill,
          padding:'5px 12px', color: t.color.text, cursor:'pointer', fontFamily:'inherit', fontSize: t.font.xs,
          display:'flex', alignItems:'center', gap: 6,
        }}>
          <span style={{ width: 7, height: 7, background: t.color.success, borderRadius:'50%' }} />
          מחובר
        </button>
      </div>
    </header>
  )
}

function ResponsiveStyle() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .hfos-sidebar { display: none !important; }
        .hfos-bottomnav { display: flex !important; }
        .hfos-mobile-overlay { display: block !important; }
        .hfos-menu-btn { display: inline-block !important; }
        .hfos-content { padding: 14px !important; padding-bottom: 100px !important; }
      }
    `}</style>
  )
}

// Choose 4 primary items for the mobile bottom nav.
// Always includes the current page so the user sees where they are.
function getPrimaryNav(nav, currentPage) {
  // For member app, prioritize daily-use pages
  const priorityMember = ['home', 'goals', 'train', 'nutrition']
  const priorityAdmin  = ['overview', 'members', 'schedule', 'alerts']
  const isAdmin = nav[0]?.key === 'overview'
  const priority = isAdmin ? priorityAdmin : priorityMember
  const primary = nav.filter(n => priority.includes(n.key))
  // Ensure current page is visible even if not in priority list
  if (!primary.find(n => n.key === currentPage)) {
    const curr = nav.find(n => n.key === currentPage)
    if (curr) primary[3] = curr
  }
  return primary.slice(0, 4)
}
