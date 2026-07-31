import React, { useState, useEffect } from 'react'
import { AppProvider, useApp } from './store/AppStore'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Shell } from './components/layout/Layout'
import { InstallPrompt } from './components/layout/InstallPrompt'
import { FloatingAssistant } from './components/assistant/FloatingAssistant'
import { LoginScreen } from './modules/auth/LoginScreen'
import { Onboarding } from './modules/member/onboarding/Onboarding'

// member
import { Home } from './modules/member/home/Home'
import { Insights } from './modules/member/insights/Insights'
import { Goals } from './modules/member/goals/Goals'
import { Progress } from './modules/member/progress/Progress'
import { Train } from './modules/member/train/Train'
import { Rehab } from './modules/member/rehab/Rehab'
import { Nutrition } from './modules/member/nutrition/Nutrition'
import { Mind } from './modules/member/mind/Mind'
import { Habits } from './modules/member/habits/Habits'
import { Calendar } from './modules/member/calendar/Calendar'
import { Store } from './modules/member/store/Store'
import { Personal } from './modules/member/personal/Personal'
import { OnDemand } from './modules/member/ondemand/OnDemand'
import { Profile } from './modules/member/profile/Profile'

// admin
import { Overview } from './modules/admin/overview/Overview'
import { Members } from './modules/admin/members/Members'
import { Team } from './modules/admin/team/Team'
import { Schedule } from './modules/admin/schedule/Schedule'
import { Content } from './modules/admin/content/Content'
import { Billing } from './modules/admin/billing/Billing'
import { Analytics } from './modules/admin/analytics/Analytics'
import { Alerts } from './modules/admin/alerts/Alerts'
import { Settings } from './modules/admin/settings/Settings'
import { CoachRequests } from './modules/admin/coach-requests/CoachRequests'
import { PersonalRequests } from './modules/admin/personal-requests/PersonalRequests'
import { MemberPhotos } from './modules/admin/member-photos/MemberPhotos'

function AppRouter() {
  const { user, effectiveRole } = useAuth()
  const { state, setRole } = useApp()
  const [page, setPage] = useState('home')

  // Sync auth's effective role → app role (must run every render regardless of user)
  useEffect(() => {
    if (effectiveRole && state.role !== effectiveRole) setRole(effectiveRole)
  }, [effectiveRole, state.role])

  // Not logged in → login screen
  if (!user) return <LoginScreen />

  // Member (not admin) that hasn't finished onboarding → run onboarding.
  // Admin using view-as skips onboarding gate.
  if (!state.onboarded && user.role === 'member') return <Onboarding />

  const memberPages = {
    home:      <Home go={setPage} />,
    goals:     <Goals />,
    insights:  <Insights go={setPage} />,
    progress:  <Progress />,
    train:     <Train />,
    rehab:     <Rehab />,
    nutrition: <Nutrition />,
    mind:      <Mind />,
    habits:    <Habits />,
    calendar:  <Calendar />,
    store:     <Store />,
    personal:  <Personal />,
    ondemand:  <OnDemand />,
    profile:   <Profile />,
  }
  const adminPages = {
    overview:  <Overview />,
    personal:  <PersonalRequests />,
    photos:    <MemberPhotos />,
    requests:  <CoachRequests />,
    members:   <Members />,
    team:      <Team />,
    schedule:  <Schedule />,
    content:   <Content />,
    billing:   <Billing />,
    analytics: <Analytics />,
    alerts:    <Alerts />,
    settings:  <Settings />,
  }

  // Which pages to render depends on the effective role (respects view-as)
  const isAdminView = effectiveRole === 'admin'
  const pages = isAdminView ? adminPages : memberPages
  const defaultPage = isAdminView ? 'overview' : 'home'
  const validPage = pages[page] ? page : defaultPage

  return (
    <>
      <Shell page={validPage} setPage={setPage}>
        {pages[validPage]}
      </Shell>
      <InstallPrompt />
      {!isAdminView && (
        <FloatingAssistant onOpenMentalCoach={() => setPage('mind')} />
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  )
}
