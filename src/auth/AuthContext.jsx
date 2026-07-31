import React, { createContext, useContext, useEffect, useState } from 'react'
import { storage } from '../utils/storage'
import { supabase, supabaseEnabled } from '../lib/supabase'

// Admin whitelist - only these emails get admin access
const ADMIN_EMAILS = ['avivgvili6@gmail.com', 'israelgrip@gmail.com']

// Coach whitelist lives in localStorage (kept for backwards compat with
// legacy invite links). With Supabase we prefer role in profiles table.
const COACH_LIST_KEY = 'coach-whitelist'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

function readCoachList() { return storage.get(COACH_LIST_KEY, []) || [] }
function writeCoachList(list) { storage.set(COACH_LIST_KEY, list) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => supabaseEnabled ? null : storage.get('user'))
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseEnabled)
  const [viewAs, setViewAsState] = useState(null)

  // Handle URL invite param (?coach=email) - still works
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const invitedCoach = params.get('coach')
      if (invitedCoach && invitedCoach.includes('@')) {
        const list = readCoachList()
        const email = invitedCoach.trim().toLowerCase()
        if (!list.includes(email)) writeCoachList([...list, email])
        const cleanUrl = window.location.pathname + window.location.hash
        window.history.replaceState({}, '', cleanUrl)
      }
    } catch {}
  }, [])

  // Supabase auth session listener
  useEffect(() => {
    if (!supabaseEnabled) return

    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        const u = await hydrateUser(session.user)
        setUser(u)
      }
      setLoading(false)
    })

    // Listen to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        const u = await hydrateUser(session.user)
        setUser(u)
      } else {
        setUser(null)
      }
    })

    return () => { mounted = false; sub?.subscription?.unsubscribe() }
  }, [])

  // Load profile row and merge with auth user
  async function hydrateUser(authUser) {
    const email = authUser.email?.toLowerCase() || ''
    const fallbackRole = ADMIN_EMAILS.includes(email) ? 'admin' : (readCoachList().includes(email) ? 'coach' : 'member')
    if (!supabaseEnabled) {
      return { id: authUser.id, email, name: authUser.user_metadata?.name || email.split('@')[0], role: fallbackRole }
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, role, onboarded')
      .eq('id', authUser.id)
      .maybeSingle()
    return {
      id: authUser.id,
      email,
      name: profile?.name || authUser.user_metadata?.name || email.split('@')[0],
      role: profile?.role || fallbackRole,
      onboarded: profile?.onboarded ?? false,
    }
  }

  // Persist legacy user object for non-Supabase mode
  useEffect(() => {
    if (supabaseEnabled) return
    if (user) storage.set('user', user)
    else storage.remove('user')
  }, [user])

  const roleFor = (email) => {
    const e = (email || '').trim().toLowerCase()
    if (ADMIN_EMAILS.includes(e)) return 'admin'
    if (readCoachList().includes(e)) return 'coach'
    return 'member'
  }

  // Magic-link login: sends email with sign-in URL. No passwords.
  // Falls back to legacy local-only login when Supabase isn't configured.
  const login = async (email, name) => {
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('כתובת מייל לא תקינה')
    }

    if (!supabaseEnabled) {
      // Legacy local-only flow
      const role = roleFor(normalizedEmail)
      const nextUser = { email: normalizedEmail, name: name || normalizedEmail.split('@')[0], role, loginAt: new Date().toISOString() }
      setUser(nextUser)
      return { user: nextUser, magicLinkSent: false }
    }

    // Real Supabase magic-link
    let response
    try {
      response = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin + window.location.pathname,
          data: { name: name || normalizedEmail.split('@')[0] },
        },
      })
    } catch (networkErr) {
      // Fetch/CORS failures land here. Preserve details so caller can surface them.
      const w = new Error(networkErr?.message || 'בעיית רשת - נסה שוב')
      w.code = networkErr?.code || 'NETWORK'
      w.name = networkErr?.name || 'NetworkError'
      w.cause = networkErr
      console.error('[supabase.signInWithOtp] network error:', networkErr)
      throw w
    }

    const { error } = response
    if (error) {
      // Preserve Supabase's rich AuthApiError metadata (code, status, name)
      // so LoginScreen can show the actual reason - not a generic message.
      const w = new Error(error.message || error.name || 'שגיאה בשליחת קישור הכניסה')
      w.code = error.code
      w.status = error.status
      w.name = error.name || 'AuthApiError'
      w.cause = error
      console.error('[supabase.signInWithOtp] auth error:', {
        message: error.message, code: error.code, status: error.status, name: error.name,
      })
      throw w
    }
    return { user: null, magicLinkSent: true, email: normalizedEmail }
  }

  const logout = async () => {
    if (supabaseEnabled) await supabase.auth.signOut()
    setUser(null); setViewAsState(null)
  }

  const setViewAs = (role) => {
    if (user?.role !== 'admin') return
    setViewAsState(role === 'admin' ? null : role)
  }

  const effectiveRole = (user?.role === 'admin' && viewAs) ? viewAs : user?.role

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
      user, session, loading, login, logout,
      inviteCoach, revokeCoach, listCoaches,
      viewAs, setViewAs, effectiveRole,
      supabaseEnabled,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export { ADMIN_EMAILS }
