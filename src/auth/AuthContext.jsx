import React, { createContext, useContext, useEffect, useState } from 'react'
import { storage } from '../utils/storage'

// Admin whitelist - only these emails get admin access. Hardcoded on purpose.
const ADMIN_EMAILS = ['avivgvili6@gmail.com']

// Coach whitelist lives in localStorage. Admin invites a coach by generating
// a link (?coach=email@x.com) that the coach opens once; that saves their
// email to this browser's coach whitelist and to the admin's granted list.
const COACH_LIST_KEY = 'coach-whitelist'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function readCoachList() { return storage.get(COACH_LIST_KEY, []) || [] }
function writeCoachList(list) { storage.set(COACH_LIST_KEY, list) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get('user'))
  // Admin-only "view as" - lets admin preview member/coach experience.
  // Not persisted (session only) so it can't leak to other tabs/sessions.
  const [viewAs, setViewAsState] = useState(null)

  // On mount, check URL for ?coach=email invite param → whitelist locally
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const invitedCoach = params.get('coach')
      if (invitedCoach && invitedCoach.includes('@')) {
        const list = readCoachList()
        const email = invitedCoach.trim().toLowerCase()
        if (!list.includes(email)) {
          writeCoachList([...list, email])
        }
        // Clean URL
        const cleanUrl = window.location.pathname + window.location.hash
        window.history.replaceState({}, '', cleanUrl)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (user) storage.set('user', user)
    else storage.remove('user')
  }, [user])

  const roleFor = (email) => {
    const e = (email || '').trim().toLowerCase()
    if (ADMIN_EMAILS.includes(e)) return 'admin'
    if (readCoachList().includes(e)) return 'coach'
    return 'member'
  }

  const login = async (email, name) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('כתובת מייל לא תקינה')
    }
    const role = roleFor(normalizedEmail)
    const nextUser = {
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      role,
      loginAt: new Date().toISOString(),
    }
    setUser(nextUser)
    return nextUser
  }

  const logout = () => { setUser(null); setViewAsState(null) }

  // Only admin can set viewAs
  const setViewAs = (role) => {
    if (user?.role !== 'admin') return
    setViewAsState(role === 'admin' ? null : role)
  }

  // The role the app should currently render as (respects viewAs)
  const effectiveRole = (user?.role === 'admin' && viewAs) ? viewAs : user?.role

  // Admin-only: whitelist a coach email so they get coach access when they log in
  const inviteCoach = (email) => {
    const e = (email || '').trim().toLowerCase()
    if (!e.includes('@')) return
    const list = readCoachList()
    if (!list.includes(e)) writeCoachList([...list, e])
  }
  const revokeCoach = (email) => {
    const e = (email || '').trim().toLowerCase()
    writeCoachList(readCoachList().filter(x => x !== e))
  }
  const listCoaches = () => readCoachList()

  return (
    <AuthCtx.Provider value={{
      user, login, logout, inviteCoach, revokeCoach, listCoaches,
      viewAs, setViewAs, effectiveRole,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export { ADMIN_EMAILS }
