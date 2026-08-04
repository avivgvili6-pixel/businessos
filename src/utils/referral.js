// Referral capture — when a new visitor lands via an invite link
// (?ref=<inviterUserId>), we stash the inviter's id in localStorage
// so it survives navigation + signup and is available when the
// profile is first written to Supabase.

const REF_KEY = 'selano:ref'
const REF_AT_KEY = 'selano:ref_at'
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000 // 90 days

// Call once at app boot (before React renders is fine).
export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (!ref) return
    localStorage.setItem(REF_KEY, ref)
    localStorage.setItem(REF_AT_KEY, String(Date.now()))
    // Clean the URL so the ref isn't accidentally re-shared / bookmarked
    params.delete('ref')
    const search = params.toString()
    const clean = window.location.pathname + (search ? '?' + search : '') + window.location.hash
    window.history.replaceState({}, '', clean)
  } catch { /* noop */ }
}

export function getStoredRef() {
  try {
    const ref = localStorage.getItem(REF_KEY)
    if (!ref) return null
    const ts = parseInt(localStorage.getItem(REF_AT_KEY) || '0', 10)
    if (Date.now() - ts > MAX_AGE_MS) {
      clearStoredRef()
      return null
    }
    return ref
  } catch { return null }
}

export function clearStoredRef() {
  try {
    localStorage.removeItem(REF_KEY)
    localStorage.removeItem(REF_AT_KEY)
  } catch { /* noop */ }
}
