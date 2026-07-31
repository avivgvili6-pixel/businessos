import React, { useState } from 'react'
import { AppProvider, useApp } from './store/AppStore'
import { Shell } from './components/layout/Layout'
import { Onboarding } from './modules/member/onboarding/Onboarding'

// member
import { Home } from './modules/member/home/Home'
import { Insights } from './modules/member/insights/Insights'
import { Train } from './modules/member/train/Train'
import { Nutrition } from './modules/member/nutrition/Nutrition'
import { Mind } from './modules/member/mind/Mind'
import { Habits } from './modules/member/habits/Habits'
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

function AppRouter() {
  const { state } = useApp()
  const [page, setPage] = useState('home')

  if (!state.onboarded && state.role === 'member') return <Onboarding />

  const memberPages = {
    home:      <Home go={setPage} />,
    insights:  <Insights go={setPage} />,
    train:     <Train />,
    nutrition: <Nutrition />,
    mind:      <Mind />,
    habits:    <Habits />,
    profile:   <Profile />,
  }
  const adminPages = {
    overview:  <Overview />,
    members:   <Members />,
    team:      <Team />,
    schedule:  <Schedule />,
    content:   <Content />,
    billing:   <Billing />,
    analytics: <Analytics />,
    alerts:    <Alerts />,
    settings:  <Settings />,
  }
  const isAdmin = state.role === 'admin' || state.role === 'coach'
  const pages = isAdmin ? adminPages : memberPages
  const validPage = pages[page] ? page : (isAdmin ? 'overview' : 'home')

  return (
    <Shell page={validPage} setPage={setPage}>
      {pages[validPage]}
    </Shell>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}
