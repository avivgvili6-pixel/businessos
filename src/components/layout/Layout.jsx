import React, { useState } from 'react'
import { t } from '../../theme/tokens'
import { useApp } from '../../store/AppStore'

const MEMBER_NAV = [
  { key:'home',      label:'בית',      icon:'🏠' },
  { key:'insights',  label:'תובנות',   icon:'✨' },
  { key:'train',     label:'אימונים',  icon:'💪' },
  { key:'nutrition', label:'תזונה',    icon:'🥗' },
  { key:'mind',      label:'מנטלי',    icon:'🧠' },
  { key:'habits',    label:'הרגלים',   icon:'🎯' },
  { key:'profile',   label:'פרופיל',   icon:'👤' },
]

const ADMIN_NAV = [
  { key:'overview',  label:'סקירה',    icon:'📊' },
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
  const { state, setRole } = useApp()
  const isAdmin = state.role === 'admin' || state.role === 'coach'
  const nav = isAdmin ? ADMIN_NAV : MEMBER_NAV
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: t.color.bg, color: t.color.text, direction:'rtl' }}>
      {/* Sidebar - desktop */}
      <aside className="hfos-sidebar" style={{
        width: 240, background: t.color.bgElevated, borderLeft:`1px solid ${t.color.border}`,
        padding: t.space.lg, display:'flex', flexDirection:'column', gap: t.space.md,
        position:'sticky', top: 0, height: '100vh',
      }}>
        <BrandBlock isAdmin={isAdmin} />
        <RoleSwitcher role={state.role} setRole={r => { setRole(r); setPage(r === 'member' ? 'home' : 'overview') }} />
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
            <BrandBlock isAdmin={isAdmin} />
            <RoleSwitcher role={state.role} setRole={r => { setRole(r); setPage(r === 'member' ? 'home' : 'overview'); setMobileOpen(false) }} />
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
        {/* Mobile bottom nav */}
        <nav className="hfos-bottomnav" style={{
          display:'none', position:'sticky', bottom:0, background: t.color.bgElevated,
          borderTop:`1px solid ${t.color.border}`, padding: '8px 4px', gap: 4, justifyContent:'space-around',
        }}>
          {nav.slice(0, 5).map(item => (
            <button key={item.key} onClick={() => setPage(item.key)} style={{
              flex:1, padding:'8px 4px', border:'none', background:'transparent',
              color: page === item.key ? t.color.gold : t.color.textDim, cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap: 2, fontSize: 10,
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
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

function RoleSwitcher({ role, setRole }) {
  return (
    <div style={{ display:'flex', background: t.color.bgSoft, borderRadius: t.radius.md, padding: 3, gap: 2 }}>
      {[
        { key:'member', label:'מתאמן' },
        { key:'coach',  label:'מאמן' },
        { key:'admin',  label:'מנהל' },
      ].map(r => (
        <button key={r.key} onClick={() => setRole(r.key)} style={{
          flex: 1, padding:'6px 8px', border:'none', cursor:'pointer',
          background: role === r.key ? t.color.gold : 'transparent',
          color: role === r.key ? '#0d0d14' : t.color.textDim,
          fontWeight: 600, borderRadius: t.radius.sm, fontFamily:'inherit', fontSize: 11,
          transition: t.transition,
        }}>{r.label}</button>
      ))}
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
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: '18px 24px', borderBottom: `1px solid ${t.color.border}`,
      background: `${t.color.bgElevated}aa`, backdropFilter:'blur(10px)', position:'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <button className="hfos-menu-btn" onClick={onMenu} style={{
          display:'none', background:'transparent', border:`1px solid ${t.color.border}`,
          color: t.color.text, padding:'6px 10px', borderRadius: t.radius.sm, cursor:'pointer', fontFamily:'inherit',
        }}>☰</button>
        <div>
          <div style={{ fontSize: t.font.xl, fontWeight: 700 }}>{page?.label}</div>
          <div style={{ fontSize: t.font.xs, color: t.color.textDim, letterSpacing: 1 }}>{isAdmin ? 'CONSOLE' : 'APP'}</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
        <button style={{
          background: t.color.bgSoft, border:`1px solid ${t.color.border}`, borderRadius: t.radius.pill,
          padding:'6px 14px', color: t.color.text, cursor:'pointer', fontFamily:'inherit', fontSize: t.font.sm,
          display:'flex', alignItems:'center', gap: 6,
        }}>
          <span style={{ width: 8, height: 8, background: t.color.success, borderRadius:'50%' }} />
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
        .hfos-content { padding: 16px !important; padding-bottom: 90px !important; }
      }
    `}</style>
  )
}
