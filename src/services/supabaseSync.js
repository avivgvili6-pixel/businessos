import { supabase, supabaseEnabled } from '../lib/supabase'

// Focused Supabase sync helpers.
// Progressive enhancement: if backend not configured, all methods are no-ops
// and callers keep working with localStorage-only paths.
//
// Not a full state mirror - we sync only the writes that need to be
// cross-device / cross-user (profile, personal training requests,
// progress photos). Everything else stays in local state for now.

// ─── PROFILE ────────────────────────────────────────────────────────
export async function upsertProfile(userId, profilePatch) {
  if (!supabaseEnabled || !userId) return { skipped: true }
  const row = {
    id: userId,
    name: profilePatch.name,
    age: profilePatch.age,
    sex: profilePatch.sex,
    height_cm: profilePatch.heightCm,
    weight_kg: profilePatch.weightKg,
    activity: profilePatch.activity,
    experience: profilePatch.experience,
    goal_key: profilePatch.goalKey,
    diet_key: profilePatch.dietKey,
    constraints: profilePatch.constraints,
    one_rms: profilePatch.oneRMs || {},
    onboarded: profilePatch.onboarded ?? undefined,
    updated_at: new Date().toISOString(),
  }
  // Only send non-undefined fields to preserve existing values
  const cleaned = Object.fromEntries(Object.entries(row).filter(([_, v]) => v !== undefined))
  const { data, error } = await supabase.from('profiles').upsert(cleaned, { onConflict: 'id' }).select().single()
  if (error) console.warn('[supabaseSync] profile upsert failed:', error.message)
  return { data, error }
}

export async function fetchProfile(userId) {
  if (!supabaseEnabled || !userId) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) { console.warn('[supabaseSync] profile fetch failed:', error.message); return null }
  return data
}

// Marks user as onboarded and stores profile fields set during onboarding.
export async function markOnboarded(userId, profile) {
  return upsertProfile(userId, { ...profile, onboarded: true })
}

// ─── PERSONAL TRAINING REQUESTS ─────────────────────────────────────
// Public form insert: works even when user isn't logged in (RLS allows).
export async function submitTrainingRequest(request) {
  if (!supabaseEnabled) return { skipped: true }
  const row = {
    user_id: request.userId || null,
    name: request.name,
    phone: request.phone,
    email: request.email,
    age: request.age ? Number(request.age) : null,
    level: request.level,
    goals: request.goals || [],
    injuries: request.injuries || null,
    current_activity: request.currentActivity || null,
    format: request.format,
    frequency: request.frequency,
    time_pref: request.timePref || [],
    why_now: request.whyNow,
    notes: request.notes || null,
    status: 'new',
  }
  const { data, error } = await supabase.from('personal_training_requests').insert(row).select().single()
  if (error) console.warn('[supabaseSync] training request insert failed:', error.message)
  return { data, error }
}

export async function listTrainingRequests() {
  if (!supabaseEnabled) return []
  const { data, error } = await supabase
    .from('personal_training_requests')
    .select('*')
    .order('submitted_at', { ascending: false })
  if (error) { console.warn('[supabaseSync] list requests failed:', error.message); return [] }
  // Convert snake_case back to camelCase for existing UI
  return (data || []).map(r => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    age: r.age,
    level: r.level,
    goals: r.goals || [],
    injuries: r.injuries,
    currentActivity: r.current_activity,
    format: r.format,
    frequency: r.frequency,
    timePref: r.time_pref || [],
    whyNow: r.why_now,
    notes: r.notes,
    status: r.status,
    submittedAt: r.submitted_at,
  }))
}

export async function updateTrainingRequestStatus(id, patch) {
  if (!supabaseEnabled) return { skipped: true }
  const { error } = await supabase.from('personal_training_requests').update(patch).eq('id', id)
  if (error) console.warn('[supabaseSync] update request failed:', error.message)
  return { error }
}

// ─── PROGRESS PHOTOS ────────────────────────────────────────────────
// Upload photo file to Storage then insert metadata row.
export async function uploadProgressPhoto({ userId, file, angle, note, dataUrl }) {
  if (!supabaseEnabled || !userId) return { skipped: true }

  // Convert dataUrl to blob if we don't have a File object
  let uploadFile = file
  if (!uploadFile && dataUrl) {
    const res = await fetch(dataUrl)
    uploadFile = await res.blob()
  }
  if (!uploadFile) return { error: new Error('No file/dataUrl to upload') }

  const ext = (uploadFile.type?.split('/')[1] || 'jpg').replace('jpeg', 'jpg')
  const path = `${userId}/${Date.now()}-${angle || 'front'}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('progress-photos')
    .upload(path, uploadFile, { cacheControl: '3600', upsert: false, contentType: uploadFile.type || 'image/jpeg' })
  if (upErr) { console.warn('[supabaseSync] photo upload failed:', upErr.message); return { error: upErr } }

  const { data: row, error: rowErr } = await supabase
    .from('progress_photos')
    .insert({ user_id: userId, angle, note, storage_path: path })
    .select().single()
  if (rowErr) console.warn('[supabaseSync] photo row insert failed:', rowErr.message)
  return { data: row, path, error: rowErr }
}

// Get a short-lived signed URL to display a private photo
export async function signedPhotoUrl(storagePath, expiresSec = 3600) {
  if (!supabaseEnabled) return null
  const { data, error } = await supabase.storage
    .from('progress-photos')
    .createSignedUrl(storagePath, expiresSec)
  if (error) { console.warn('[supabaseSync] signed url failed:', error.message); return null }
  return data?.signedUrl
}

// ─── HEALTH DISCLAIMER SIGNATURE ────────────────────────────────────
// Sync the signed health declaration to the user's profile row.
// Requires a `health_ack` jsonb column on the profiles table:
//    alter table profiles add column if not exists health_ack jsonb;
// If the column doesn't exist yet, this silently fails — the record
// still lives in localStorage so the app keeps working.
export async function syncHealthAck(record) {
  if (!supabaseEnabled || !record) return { skipped: true }
  const { data: session } = await supabase.auth.getUser()
  const userId = session?.user?.id
  if (!userId) return { skipped: true }
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ health_ack: record })
      .eq('id', userId)
    if (error) console.warn('[supabaseSync] health_ack sync failed:', error.message)
    return { error }
  } catch (err) {
    console.warn('[supabaseSync] health_ack sync exception:', err?.message || err)
    return { error: err }
  }
}

// Admin — read a specific member's signed declaration
export async function fetchHealthAck(userId) {
  if (!supabaseEnabled || !userId) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('health_ack')
      .eq('id', userId)
      .maybeSingle()
    if (error) { console.warn('[supabaseSync] fetch health_ack:', error.message); return null }
    return data?.health_ack || null
  } catch (err) {
    console.warn('[supabaseSync] fetch health_ack exception:', err?.message || err)
    return null
  }
}

// List photos (own for members, all for admin thanks to RLS policy)
export async function listProgressPhotos(userId = null) {
  if (!supabaseEnabled) return []
  let q = supabase.from('progress_photos').select('*').order('date', { ascending: false })
  if (userId) q = q.eq('user_id', userId)
  const { data, error } = await q
  if (error) { console.warn('[supabaseSync] list photos failed:', error.message); return [] }
  return data || []
}

// ─── ADMIN: MEMBERS LIST ────────────────────────────────────────────
// Fetches all profiles. Tries to include email; if the `email` column is
// missing (older schema), retries with just the core fields.
export async function listAllMembers() {
  if (!supabaseEnabled) return []
  const attemptSelect = async (cols) => {
    return supabase.from('profiles').select(cols).order('created_at', { ascending: false })
  }
  let { data, error } = await attemptSelect('id, email, name, phone, role, onboarded, age, sex, weight_kg, goal_key, created_at, updated_at')
  if (error && /column.*does not exist/i.test(error.message || '')) {
    // Retry without phone (older schema)
    ;({ data, error } = await attemptSelect('id, email, name, role, onboarded, age, sex, weight_kg, goal_key, created_at, updated_at'))
    if (error && /column.*does not exist/i.test(error.message || '')) {
      ;({ data, error } = await attemptSelect('id, name, role, onboarded, age, sex, weight_kg, goal_key, created_at, updated_at'))
    }
  }
  if (error) { console.warn('[supabaseSync] list members failed:', error.message); return [] }
  return data || []
}

// Admin action: trigger a password-recovery email for a specific member.
// Uses the same public endpoint the user would hit via "forgot password" —
// no admin privilege required, but the caller UI should be admin-only.
// Returns { ok, email, message } — a plain string message the UI can show
// (never a raw error object, so no more '{}' banners).
export async function adminSendPasswordRecovery(email) {
  if (!supabaseEnabled) {
    return { ok: false, message: 'Supabase לא מוגדר — הגדר VITE_SUPABASE_URL / VITE_SUPABASE_KEY בסודות של GitHub Pages.' }
  }
  const normalized = (email || '').trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) {
    return { ok: false, message: 'כתובת מייל לא תקינה.' }
  }
  const redirectTo = typeof window !== 'undefined'
    ? window.location.origin + window.location.pathname
    : undefined
  try {
    const response = await supabase.auth.resetPasswordForEmail(normalized, { redirectTo })
    const { error } = response
    console.info('[supabaseSync] resetPasswordForEmail response:', {
      email: normalized, redirectTo, error, hasError: !!error,
    })
    if (!error) return { ok: true, email: normalized, message: `נשלח מייל איפוס ל־${normalized}. הקישור פעיל שעה.` }
    // Build a message even when Supabase's error object is empty/opaque
    return { ok: false, email: normalized, message: describeAuthError(error, redirectTo) }
  } catch (err) {
    console.error('[supabaseSync] adminSendPasswordRecovery threw:', err)
    return { ok: false, email: normalized, message: `שגיאת רשת: ${err?.message || 'לא ניתן להגיע ל-Supabase. בדוק חיבור אינטרנט.'}` }
  }
}

function describeAuthError(err, redirectTo) {
  const msg = (err?.message || '').trim()
  const status = err?.status
  const code = err?.code || err?.name

  // Content-based matches first (most specific)
  if (/rate.?limit|too.?many|for security purposes/i.test(msg)) return 'בקשות רבות מדי בזמן קצר. המתן דקה ונסה שוב.'
  if (/redirect.?url|redirect_uri|not.?allowed/i.test(msg)) return `Redirect URL לא מאושר ב-Supabase. הוסף בפאנל Auth → URL Configuration: ${redirectTo}`
  if (/user.?not.?found|no.?user.?found/i.test(msg)) return 'לא נמצא משתמש עם המייל הזה ב-Supabase.'
  if (/invalid.?email/i.test(msg)) return 'כתובת מייל לא תקינה מבחינת Supabase.'
  if (/smtp|email.?send|send.?email|delivery|mailer/i.test(msg)) return 'Supabase לא הצליח לשלוח את המייל. בדוק Authentication → Emails → SMTP Settings (המפתח של Resend/SendGrid תקף?).'
  if (msg && msg !== '{}' && !/^[{}\[\]\s]+$/.test(msg)) {
    return code ? `${msg} (${code})` : msg
  }

  // Status-based matches next — 500 is almost always SMTP/email delivery failure,
  // NOT a redirect URL issue. Common causes: Resend/SendGrid key expired,
  // rate limit hit on the SMTP provider, or the default Supabase mailer
  // (3/hour limit) blocked the send.
  if (status === 500) {
    return 'שגיאת שרת (500). כמעט תמיד זו בעיית שליחת מייל — פתח Supabase → Authentication → Emails ובדוק: (1) יש SMTP Settings תקינים (Resend / SendGrid מפתח פעיל)? (2) אולי חצית את המכסה היומית של ספק המייל?'
  }
  if (status === 429) return 'הגעת למגבלת שליחה. המתן דקה ונסה שוב.'
  if (status === 422) return 'המייל לא עבר ולידציה של Supabase.'
  if (status === 400) return `שגיאה בבקשה (400) — בדוק שה־Redirect URL מוגדר ב-Supabase Auth → URL Configuration: ${redirectTo}`
  if (status) return `שגיאה מהשרת (סטטוס ${status}). פתח את הקונסול בדפדפן (F12) לפרטים נוספים.`
  return 'Supabase החזיר שגיאה ריקה. פתח את הקונסול בדפדפן (F12) → Console — יש שם פרטים.'
}

// Aggregate — how many progress photos each member uploaded (proxy for engagement)
export async function memberEngagementSummary() {
  if (!supabaseEnabled) return { photos: {}, requests: {} }
  const [photosRes, reqRes] = await Promise.all([
    supabase.from('progress_photos').select('user_id, date'),
    supabase.from('personal_training_requests').select('user_id, submitted_at, status'),
  ])
  const photos = {}
  ;(photosRes.data || []).forEach(p => {
    if (!p.user_id) return
    if (!photos[p.user_id]) photos[p.user_id] = { count: 0, last: null }
    photos[p.user_id].count += 1
    if (!photos[p.user_id].last || new Date(p.date) > new Date(photos[p.user_id].last)) {
      photos[p.user_id].last = p.date
    }
  })
  const requests = {}
  ;(reqRes.data || []).forEach(r => {
    if (!r.user_id) return
    if (!requests[r.user_id]) requests[r.user_id] = { count: 0, latestStatus: null, submittedAt: null }
    requests[r.user_id].count += 1
    if (!requests[r.user_id].submittedAt || new Date(r.submitted_at) > new Date(requests[r.user_id].submittedAt)) {
      requests[r.user_id].submittedAt = r.submitted_at
      requests[r.user_id].latestStatus = r.status
    }
  })
  return { photos, requests }
}
