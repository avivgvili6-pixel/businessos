import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './store/AppStore'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { I18nProvider } from './i18n/i18n'
import { Shell } from './components/layout/Layout'
import { FloatingAssistant } from './components/assistant/FloatingAssistant'
import { NotificationScheduler } from './components/notifications/NotificationScheduler'
import { LoginScreen } from './modules/auth/LoginScreen'
import { Onboarding } from './modules/member/onboarding/Onboarding'

// member
import { Home } from './modules/member/home/Home'
import { Goals } from './modules/member/goals/Goals'
import { Progress } from './modules/member/progress/Progress'
import { Train } from './modules/member/train/Train'
import { Rehab } from './modules/member/rehab/Rehab'
import { Nutrition } from './modules/member/nutrition/Nutrition'
import { Mind } from './modules/member/mind/Mind'
import { Calendar } from './modules/member/calendar/Calendar'
import { Store } from './modules/member/store/Store'
import { Personal } from './modules/member/personal/Personal'
import { OnDemand } from './modules/member/ondemand/OnDemand'
import { Profile } from './modules/member/profile/Profile'
import { Reminders } from './modules/member/reminders/Reminders'
import { Talk } from './modules/member/talk/Talk'
import { SLoader } from './components/ui/SLoader'
import { HealthAcknowledgment, readHealthAck } from './components/legal/HealthAcknowledgment'
import { fetchHealthAck } from './services/supabaseSync'
import { fetchMyPilotStatus } from './services/pilot'
import { WaitlistScreen } from './modules/member/waitlist/WaitlistScreen'
import { AdminPilot } from './modules/admin/pilot/AdminPilot'
import { t as tokens } from './theme/tokens'

// admin
import { Overview } from './modules/admin/overview/Overview'
import { Members } from './modules/admin/members/Members'
import { Team } from './modules/admin/team/Team'
import { Billing } from './modules/admin/billing/Billing'
import { Analytics } from './modules/admin/analytics/Analytics'
import { Alerts } from './modules/admin/alerts/Alerts'
import { Settings } from './modules/admin/settings/Settings'
import { CoachRequests } from './modules/admin/coach-requests/CoachRequests'
import { PersonalRequests } from './modules/admin/personal-requests/PersonalRequests'
import { MemberPhotos } from './modules/admin/member-photos/MemberPhotos'
import { AdminFeedback } from './modules/admin/feedback/AdminFeedback'

function AppRouter() {
 const { user, effectiveRole, loading, passwordRecovery } = useAuth()
 const { state, setRole } = useApp()
 const [page, setPage] = useState('home')

 // Sync auth's effective role → app role (must run every render regardless of user)
 useEffect(() => {
 if (effectiveRole && state.role !== effectiveRole) setRole(effectiveRole)
 }, [effectiveRole, state.role])

 // Wait for Supabase session hydration before deciding login/app view
 if (loading) return (
 <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'#0f0d0b'}}>
 <SLoader size={200} />
 </div>
 )

 // Password recovery: user landed from reset-email link. Even though a session
 // exists (that's how Supabase authenticates the recovery), we MUST show the
 // LoginScreen so they can set a new password before entering the app.
 if (passwordRecovery) return <LoginScreen />

 // Not logged in → login screen
 if (!user) return <LoginScreen />

 // Wrap the whole member flow in PilotGate — if status='waitlisted',
 // the entire app (including onboarding) is replaced by WaitlistScreen.
 // Admins always bypass the cap.
 const isMemberView = user.role === 'member' && effectiveRole !== 'admin'
 if (isMemberView) {
   return <PilotGate user={user}><MemberFlow /></PilotGate>
 }
 return <MemberFlow />

 function MemberFlow() {
   // Onboarding gate for members only
   if (!state.onboarded && user.role === 'member') return <Onboarding />
   return <AppShellRouter />
 }

 function AppShellRouter() {

 const memberPages = {
 home: <Home go={setPage} />,
 goals: <Goals go={setPage} />,
 progress: <Progress />,
 train: <Train />,
 rehab: <Rehab />,
 nutrition: <Nutrition />,
 mind: <Mind />,
 calendar: <Calendar />,
 store: <Store />,
 personal: <Personal />,
 ondemand: <OnDemand />,
 reminders: <Reminders />,
 talk: <Talk />,
 profile: <Profile go={setPage} />,
 }
 const adminPages = {
 overview: <Overview />,
 pilot: <AdminPilot />,
 personal: <PersonalRequests />,
 photos: <MemberPhotos />,
 requests: <CoachRequests />,
 members: <Members />,
 team: <Team />,
 billing: <Billing />,
 analytics: <Analytics />,
 alerts: <Alerts />,
 feedback: <AdminFeedback />,
 settings: <Settings />,
 }

 // Which pages to render depends on the effective role (respects view-as)
 const isAdminView = effectiveRole === 'admin'
 const pages = isAdminView ? adminPages : memberPages
 const defaultPage = isAdminView ? 'overview':'home'
 const validPage = pages[page] ? page : defaultPage

 const shellUI = (
 <>
 <Shell page={validPage} setPage={setPage}>
 {pages[validPage]}
 </Shell>
 <NotificationScheduler />
 {!isAdminView && (
 <FloatingAssistant onOpenMentalCoach={() => setPage('mind')} />
 )}
 </>
 )

 // Hard legal gate — members MUST have a signed health/terms/privacy
 // ack on file before they can use the app. Prevents bypass on a fresh
 // device by verifying against Supabase, not just localStorage.
 // Admin view bypasses (admin has their own consent flow).
 if (user.role === 'member' && !isAdminView) {
   return <HealthAckGate user={user}>{shellUI}</HealthAckGate>
 }

 return shellUI
 } // end AppShellRouter
} // end AppRouter

// Pilot cap gate — resolves the user's pilot status, then either shows
// the waitlist blocker or renders children (rest of the app).
function PilotGate({ user, children }) {
 const [pilot, setPilot] = useState(null)
 useEffect(() => {
   let alive = true
   fetchMyPilotStatus(user.id).then(res => {
     if (alive) setPilot(res)
   })
   return () => { alive = false }
 }, [user?.id])
 if (!pilot) return (
   <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'#0f0d0b' }}>
     <SLoader size={200} />
   </div>
 )
 if (pilot.status === 'waitlisted') {
   return <WaitlistScreen position={pilot.waitlist_position} />
 }
 return children
}

// Verifies the member has signed the health/terms/privacy bundle.
// Checks localStorage first (fast path). If missing, checks Supabase.
// If both empty → renders <HealthAcknowledgment /> as a full-screen block.
function HealthAckGate({ user, children }) {
 const [state, setStateVal] = useState(() => readHealthAck() ? 'ok' : 'checking')

 useEffect(() => {
 if (state !== 'checking') return
 let alive = true
 ;(async () => {
 try {
 const remote = await fetchHealthAck(user.id)
 if (!alive) return
 if (remote) {
 // Mirror to local so future checks are instant
 try { localStorage.setItem('hfos:health_ack', JSON.stringify(remote)) } catch {}
 setStateVal('ok')
 } else {
 setStateVal('missing')
 }
 } catch {
 if (alive) setStateVal('missing')
 }
 })()
 return () => { alive = false }
 }, [state, user?.id])

 if (state === 'checking') return (
 <div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'#0f0d0b' }}>
 <SLoader size={200} />
 </div>
 )

 if (state === 'missing') return (
 <div style={{ minHeight:'100vh', background: tokens.color.bg, padding: tokens.space.lg, direction:'rtl', color: tokens.color.text, display:'flex', alignItems:'center' }}>
 <div style={{ maxWidth: 900, margin:'0 auto', width:'100%' }}>
 <HealthAcknowledgment
 initialName={user?.name || ''}
 onConfirm={() => setStateVal('ok')}
 />
 </div>
 </div>
 )

 return children
}

export default function App() {
 return (
 <I18nProvider>
 <AuthProvider>
 <AppProvider>
 <AppRouter />
 </AppProvider>
 </AuthProvider>
 </I18nProvider>
 )
}
