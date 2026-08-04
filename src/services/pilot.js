// Pilot mode — 30-user cap with waitlist + admin release.
// All calls fail-open when Supabase isn't configured (local-only dev).

import { supabase, supabaseEnabled } from '../lib/supabase'

// Fetch this member's pilot status (from their own profile row)
export async function fetchMyPilotStatus(userId) {
  if (!supabaseEnabled || !userId) {
    return { status: 'active', waitlist_position: null } // fail-open
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('status, waitlist_position, waitlisted_at, released_at')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return { status: 'active', waitlist_position: null }
  return data
}

// Cap + counts for the admin dashboard.
export async function fetchPilotStats() {
  if (!supabaseEnabled) return { active_cap: 30, active_count: 0, waitlist_count: 0 }
  const { data, error } = await supabase.from('pilot_stats').select('*').single()
  if (error || !data) return { active_cap: 30, active_count: 0, waitlist_count: 0 }
  return data
}

// The list of waitlisted members, ordered by their position.
// Tries wide columns first, falls back for older schemas that don't
// have email/phone (mirrors the pattern in listAllMembers).
export async function listWaitlist() {
  if (!supabaseEnabled) return []
  const attempt = async (cols) => supabase
    .from('profiles')
    .select(cols)
    .eq('status', 'waitlisted')
    .order('waitlist_position', { ascending: true })

  let { data, error } = await attempt('id, name, email, phone, waitlist_position, waitlisted_at, created_at')
  if (error && /column.*does not exist/i.test(error.message || '')) {
    ;({ data, error } = await attempt('id, name, email, waitlist_position, waitlisted_at, created_at'))
    if (error && /column.*does not exist/i.test(error.message || '')) {
      ;({ data, error } = await attempt('id, name, waitlist_position, waitlisted_at, created_at'))
    }
  }
  if (error) {
    console.error('[pilot] listWaitlist failed:', error)
    return []
  }
  return data || []
}

// Flip a waitlisted user to active. Returns { ok, error }.
// .select() after update verifies rows were actually changed —
// otherwise RLS blocking looks like silent success from the client.
export async function releaseWaitlistedUser(userId) {
  if (!supabaseEnabled) return { ok: false, error: 'Supabase לא מחובר' }
  const { data: user } = await supabase
    .from('profiles').select('email, name').eq('id', userId).maybeSingle()
  const { data, error } = await supabase
    .from('profiles')
    .update({
      status: 'active',
      waitlist_position: null,
      released_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
  if (error) {
    console.error('[pilot] release error:', error)
    return { ok: false, error: error.message }
  }
  if (!data || data.length === 0) {
    console.error('[pilot] release: 0 rows updated — likely RLS blocking. Run the admin update policy SQL.')
    return {
      ok: false,
      error: 'לא עודכן אף שורה (RLS חוסם עדכון פרופילים ע"י אדמין). הרץ בסופאבייס:\n\ncreate policy "admins update all profiles" on profiles for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = \'admin\')) with check (true);',
    }
  }
  return { ok: true, email: user?.email, name: user?.name }
}

// Update the pilot cap (admin only — enforced by RLS)
export async function updatePilotCap(newCap) {
  if (!supabaseEnabled) return { ok: false }
  const { error } = await supabase
    .from('pilot_settings')
    .update({ active_cap: newCap, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) { console.warn('[pilot] updateCap:', error.message); return { ok: false, error: error.message } }
  return { ok: true }
}

// Build a mailto: URL for the admin to send the "released" notification
// (until we wire an automated email endpoint).
export function buildReleaseEmail(email, name) {
  if (!email) return null
  const subject = 'המקום שלך ב־Selano התפנה'
  const body = [
    `שלום ${name || ''},`,
    '',
    'שמח לבשר לך שהמקום שלך במערכת Selano התפנה.',
    'תוכל להיכנס עכשיו ולהמשיך בתהליך:',
    '',
    typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://avivgvili6-pixel.github.io/businessos/',
    '',
    'בהצלחה!',
    'צוות Selano',
  ].join('\n')
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
