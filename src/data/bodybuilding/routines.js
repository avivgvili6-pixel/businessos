// System-provided routines — reusable workout templates that programs are composed of.
// Users can copy any of these to their own routines list and customize.
//
// Structure: routine → exercises → sets (each set: type+weight+reps)
// Set types: 'warmup' (W badge), 'working' (numbered 1,2,3...), 'dropset', 'failure'

const rt = (id, name, emoji, exercises) => ({
  id, name, emoji,
  createdBy: 'system',
  exercises,
})

const set = (weight, reps, type = 'working') => ({ type, weight, reps })
const warmup = (weight, reps) => set(weight, reps, 'warmup')

// Compact exercise-in-routine builder
const item = (exerciseId, sets, opts = {}) => ({
  exerciseId,
  equipment: opts.equipment,  // override the exercise's default equipment
  notes: opts.notes || '',
  restSeconds: opts.rest || 90,
  sets,
})

// ─── SYSTEM ROUTINES ───────────────────────────────────────────────

export const ROUTINES = [
  // ═══════════════════ PUSH / PULL / LEGS (Beginner) ═══════════════════
  rt('beg_push', 'Beginner Push', '', [
    item('bench_press_bb', [warmup(20, 10), set(30, 10), set(40, 10), set(40, 10)], { rest: 120, notes: 'שכמות נעולות, נשימה עמוקה' }),
    item('overhead_press_bb', [warmup(15, 10), set(20, 10), set(25, 8), set(25, 8)], { rest: 90 }),
    item('incline_bench_db', [set(12, 12), set(12, 12), set(14, 10)], { rest: 90 }),
    item('lateral_raise_db', [set(6, 15), set(6, 15), set(8, 12)], { rest: 60 }),
    item('triceps_pushdown', [set(20, 12), set(25, 12), set(25, 10)], { rest: 60 }),
  ]),
  rt('beg_pull', 'Beginner Pull', '', [
    item('deadlift_bb', [warmup(40, 5), set(60, 5), set(70, 5), set(70, 5)], { rest: 180, notes: 'גב ישר תמיד' }),
    item('lat_pd_cable', [set(40, 10), set(50, 10), set(50, 10)], { rest: 90 }),
    item('seated_cable_row_v', [set(35, 12), set(40, 10), set(40, 10)], { rest: 90 }),
    item('face_pull', [set(20, 15), set(20, 15), set(25, 12)], { rest: 60 }),
    item('bicep_curl_db', [set(10, 12), set(12, 10), set(12, 10)], { rest: 60 }),
  ]),
  rt('beg_legs', 'Beginner Legs', '', [
    item('squat_bb', [warmup(20, 10), set(40, 8), set(50, 6), set(50, 6)], { rest: 180 }),
    item('rdl_bb', [set(40, 10), set(50, 10), set(50, 10)], { rest: 120 }),
    item('leg_press_m', [set(80, 15), set(100, 12), set(100, 12)], { rest: 90 }),
    item('leg_ext_machine', [set(30, 15), set(35, 12), set(35, 12)], { rest: 60 }),
    item('lying_leg_curl_m', [set(25, 12), set(30, 10), set(30, 10)], { rest: 60 }),
    item('standing_calf_m', [set(40, 20), set(50, 15), set(50, 15)], { rest: 60 }),
  ]),

  // ═══════════════════ PUSH / PULL / LEGS (Intermediate) ═══════════════════
  rt('int_push', 'Intermediate Push', '', [
    item('bench_press_bb', [warmup(40, 5), warmup(60, 3), set(75, 6), set(80, 5), set(80, 5), set(80, 5)], { rest: 180 }),
    item('incline_bench_db', [set(20, 10), set(22, 10), set(22, 10), set(24, 8)], { rest: 120 }),
    item('overhead_press_bb', [set(35, 8), set(40, 6), set(40, 6)], { rest: 120 }),
    item('lateral_raise_db', [set(10, 15), set(10, 15), set(12, 12), set(12, 12)], { rest: 60 }),
    item('cable_fly_cross', [set(15, 15), set(18, 12), set(18, 12)], { rest: 60 }),
    item('triceps_rope_pushdown', [set(25, 12), set(30, 12), set(30, 10), set(35, 8)], { rest: 60 }),
    item('skullcrusher_bb', [set(20, 10), set(25, 10), set(25, 10)], { rest: 60 }),
  ]),
  rt('int_pull', 'Intermediate Pull', '', [
    item('deadlift_bb', [warmup(60, 5), warmup(80, 3), set(100, 5), set(110, 3), set(110, 3)], { rest: 180 }),
    item('pull_up', [set(0, 8), set(0, 8), set(0, 6), set(0, 6)], { rest: 120 }),
    item('bent_over_row_bb', [set(50, 10), set(60, 8), set(60, 8), set(65, 6)], { rest: 120 }),
    item('seated_cable_row_v', [set(45, 12), set(50, 10), set(55, 10)], { rest: 90 }),
    item('face_pull', [set(25, 15), set(30, 15), set(30, 15)], { rest: 60 }),
    item('bicep_curl_bb', [set(25, 10), set(30, 10), set(30, 8), set(32, 6)], { rest: 60 }),
    item('hammer_curl_db', [set(12, 12), set(14, 10), set(14, 10)], { rest: 60 }),
  ]),
  rt('int_legs', 'Intermediate Legs', '', [
    item('squat_bb', [warmup(40, 5), warmup(60, 3), set(80, 6), set(90, 5), set(90, 5), set(95, 4)], { rest: 180 }),
    item('rdl_bb', [set(70, 8), set(80, 8), set(80, 8)], { rest: 120 }),
    item('bulgarian_split_db', [set(15, 10), set(18, 10), set(18, 10)], { rest: 90 }),
    item('leg_press_m', [set(120, 12), set(140, 10), set(140, 10)], { rest: 90 }),
    item('lying_leg_curl_m', [set(35, 12), set(40, 10), set(40, 10), set(45, 8)], { rest: 60 }),
    item('leg_ext_machine', [set(40, 15), set(45, 12), set(45, 12)], { rest: 60 }),
    item('standing_calf_m', [set(60, 15), set(70, 12), set(70, 12), set(80, 10)], { rest: 60 }),
  ]),

  // ═══════════════════ PUSH / PULL / LEGS (Advanced) ═══════════════════
  rt('adv_push', 'Advanced Push', '', [
    item('bench_press_bb', [warmup(60, 5), warmup(80, 3), set(100, 5), set(105, 4), set(110, 3), set(110, 3)], { rest: 180 }),
    item('incline_bench_db', [set(28, 10), set(30, 8), set(30, 8), set(32, 6)], { rest: 120 }),
    item('seated_ohp_bb', [set(50, 6), set(55, 5), set(55, 5)], { rest: 120 }),
    item('dips', [set(0, 12), set(10, 10), set(15, 8), set(15, 8)], { rest: 90 }),
    item('lateral_raise_db', [set(12, 15), set(14, 12), set(14, 12), set(14, 12)], { rest: 60 }),
    item('cable_fly_cross', [set(20, 15), set(22, 12), set(22, 12)], { rest: 60 }),
    item('triceps_rope_pushdown', [set(35, 15), set(40, 12), set(40, 12), set(45, 10)], { rest: 60 }),
    item('overhead_tricep_ext_c', [set(25, 12), set(30, 10), set(30, 10)], { rest: 60 }),
  ]),
  rt('adv_pull', 'Advanced Pull', '', [
    item('deadlift_bb', [warmup(80, 5), warmup(100, 3), set(130, 4), set(140, 3), set(140, 3)], { rest: 240 }),
    item('pull_up_weighted', [set(10, 8), set(15, 6), set(20, 5), set(20, 5)], { rest: 120 }),
    item('pendlay_row', [set(70, 6), set(80, 5), set(80, 5), set(85, 4)], { rest: 120 }),
    item('seated_cable_row_v', [set(60, 10), set(65, 10), set(70, 8)], { rest: 90 }),
    item('rear_delt_fly_db', [set(8, 15), set(10, 12), set(10, 12), set(10, 12)], { rest: 60 }),
    item('bicep_curl_bb', [set(35, 10), set(40, 8), set(40, 8), set(45, 6)], { rest: 60 }),
    item('hammer_curl_db', [set(16, 10), set(18, 10), set(18, 10)], { rest: 60 }),
    item('preacher_curl_bb', [set(25, 10), set(28, 10), set(28, 8)], { rest: 60 }),
  ]),
  rt('adv_legs', 'Advanced Legs', '', [
    item('squat_bb', [warmup(60, 5), warmup(90, 3), set(110, 5), set(120, 4), set(130, 3), set(130, 3)], { rest: 240 }),
    item('rdl_bb', [set(90, 6), set(100, 6), set(100, 6), set(110, 5)], { rest: 180 }),
    item('bulgarian_split_db', [set(22, 10), set(24, 10), set(24, 10), set(26, 8)], { rest: 90 }),
    item('leg_press_m', [set(180, 10), set(200, 8), set(200, 8), set(220, 6)], { rest: 120 }),
    item('lying_leg_curl_m', [set(45, 12), set(50, 10), set(50, 10), set(55, 8)], { rest: 60 }),
    item('leg_ext_machine', [set(55, 12), set(60, 10), set(60, 10), set(65, 8)], { rest: 60 }),
    item('hip_thrust_bb', [set(80, 10), set(100, 8), set(120, 6)], { rest: 90 }),
    item('standing_calf_m', [set(80, 15), set(90, 12), set(100, 10), set(100, 10)], { rest: 60 }),
  ]),

  // ═══════════════════ FULL BODY (Beginner) ═══════════════════
  rt('beg_full_a', 'Beginner Full Body A', '', [
    item('warm_up', [set(0, 1)], { rest: 0, notes: '5 דקות חימום' }),
    item('squat_bb', [warmup(20, 10), set(40, 8), set(40, 8), set(40, 8)], { rest: 120 }),
    item('bench_press_bb', [warmup(20, 10), set(30, 8), set(40, 8), set(40, 8)], { rest: 120 }),
    item('bent_over_row_bb', [set(30, 10), set(40, 8), set(40, 8)], { rest: 90 }),
    item('overhead_press_bb', [set(20, 8), set(25, 8), set(25, 8)], { rest: 90 }),
    item('crunch', [set(0, 15), set(0, 15), set(0, 15)], { rest: 60 }),
  ]),
  rt('beg_full_b', 'Beginner Full Body B', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('deadlift_bb', [warmup(40, 5), set(60, 5), set(70, 5)], { rest: 180 }),
    item('overhead_press_bb', [warmup(15, 10), set(20, 8), set(25, 8), set(25, 8)], { rest: 90 }),
    item('goblet_squat', [set(15, 10), set(20, 10), set(20, 10)], { rest: 90 }),
    item('lat_pd_cable', [set(40, 10), set(45, 10), set(45, 10)], { rest: 90 }),
    item('plank', [set(0, 30), set(0, 30), set(0, 30)], { rest: 60, notes: 'סקנד' }),
  ]),

  // ═══════════════════ FULL BODY (Advanced Gym - reference reference) ═══════════════════
  rt('adv_full_1', 'Advanced Full Body 1', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('bench_press_bb', [set(60, 8), set(70, 6), set(80, 5), set(85, 5), set(85, 5), set(85, 5)], { rest: 150, notes: '6 sets · 5-20 reps' }),
    item('bent_over_row_bb', [set(50, 10), set(60, 8), set(70, 8), set(70, 8)], { rest: 120, notes: '4 sets · 8-10 reps' }),
    item('leg_press_m', [set(120, 12), set(140, 12), set(140, 10), set(160, 10)], { rest: 90, notes: '4 sets · 10-12 reps' }),
    item('shoulder_press_db', [set(20, 12), set(22, 10), set(22, 10), set(24, 10)], { rest: 90, notes: '4 sets · 10-12 reps' }),
    item('bicep_curl_bb', [set(25, 15), set(30, 12), set(30, 12), set(32, 12)], { rest: 60, notes: '4 sets · 12-15 reps' }),
    item('seated_dip_m', [set(50, 15), set(55, 12), set(55, 12)], { rest: 60, notes: '3 sets · 12-15 reps' }),
  ]),
  rt('adv_full_2', 'Advanced Full Body 2', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('squat_bb', [set(60, 8), set(80, 5), set(90, 5), set(100, 5), set(100, 5), set(100, 5)], { rest: 180 }),
    item('incline_bench_db', [set(22, 12), set(24, 10), set(26, 10), set(26, 10)], { rest: 90 }),
    item('lat_pd_cable', [set(50, 12), set(55, 10), set(60, 10), set(60, 10)], { rest: 90 }),
    item('lateral_raise_db', [set(10, 15), set(12, 12), set(12, 12)], { rest: 60 }),
    item('hammer_curl_db', [set(14, 12), set(16, 10), set(16, 10)], { rest: 60 }),
    item('triceps_pushdown', [set(30, 15), set(35, 12), set(35, 12)], { rest: 60 }),
  ]),
  rt('adv_full_3', 'Advanced Full Body 3', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('deadlift_bb', [set(70, 5), set(90, 5), set(110, 3), set(120, 3), set(120, 3)], { rest: 240 }),
    item('overhead_press_bb', [set(30, 10), set(35, 8), set(40, 6), set(40, 6)], { rest: 120 }),
    item('pull_up', [set(0, 8), set(0, 8), set(0, 6), set(0, 6)], { rest: 90 }),
    item('bulgarian_split_db', [set(18, 10), set(20, 10), set(22, 10)], { rest: 90 }),
    item('rear_delt_fly_db', [set(8, 15), set(10, 12), set(10, 12)], { rest: 60 }),
    item('preacher_curl_bb', [set(25, 12), set(30, 10), set(30, 10)], { rest: 60 }),
  ]),
  rt('adv_full_4', 'Advanced Full Body 4', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('bench_press_db', [set(28, 10), set(32, 8), set(34, 8), set(34, 8)], { rest: 120 }),
    item('rdl_bb', [set(70, 8), set(80, 8), set(90, 6), set(90, 6)], { rest: 120 }),
    item('seated_cable_row_v', [set(55, 12), set(60, 10), set(65, 10), set(65, 10)], { rest: 90 }),
    item('leg_ext_machine', [set(50, 15), set(55, 12), set(55, 12)], { rest: 60 }),
    item('face_pull', [set(25, 15), set(30, 15), set(30, 15)], { rest: 60 }),
    item('cable_fly_cross', [set(18, 15), set(20, 12), set(20, 12)], { rest: 60 }),
  ]),
  rt('adv_full_5', 'Advanced Full Body 5', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('front_squat', [set(50, 6), set(60, 5), set(70, 4), set(70, 4)], { rest: 180 }),
    item('incline_bench_bb', [set(50, 8), set(60, 6), set(65, 5), set(65, 5)], { rest: 120 }),
    item('t_bar_row', [set(40, 10), set(50, 8), set(60, 8)], { rest: 90 }),
    item('lying_leg_curl_m', [set(40, 12), set(45, 10), set(50, 10)], { rest: 60 }),
    item('lateral_raise_db', [set(10, 15), set(12, 12), set(12, 12)], { rest: 60 }),
    item('standing_calf_m', [set(80, 15), set(90, 12), set(90, 12), set(100, 10)], { rest: 60 }),
  ]),

  // ═══════════════════ UPPER / LOWER ═══════════════════
  rt('upper_a', 'Upper Body A', '⬆️', [
    item('bench_press_bb', [warmup(40, 5), set(60, 8), set(70, 6), set(75, 5), set(75, 5)], { rest: 150 }),
    item('bent_over_row_bb', [set(50, 8), set(60, 6), set(65, 6)], { rest: 120 }),
    item('overhead_press_db', [set(20, 10), set(24, 8), set(24, 8)], { rest: 90 }),
    item('lat_pd_cable', [set(45, 12), set(50, 10), set(55, 8)], { rest: 90 }),
    item('lateral_raise_db', [set(10, 15), set(10, 15), set(12, 12)], { rest: 60 }),
    item('bicep_curl_db', [set(12, 12), set(14, 10), set(14, 10)], { rest: 60 }),
    item('triceps_pushdown', [set(25, 15), set(30, 12), set(30, 12)], { rest: 60 }),
  ]),
  rt('upper_b', 'Upper Body B', '⬆️', [
    item('incline_bench_db', [set(22, 10), set(26, 8), set(28, 8)], { rest: 120 }),
    item('pull_up', [set(0, 8), set(0, 8), set(0, 6)], { rest: 120 }),
    item('seated_ohp_db', [set(20, 10), set(22, 10), set(22, 10)], { rest: 90 }),
    item('seated_cable_row_v', [set(50, 12), set(55, 10), set(60, 10)], { rest: 90 }),
    item('face_pull', [set(25, 15), set(30, 15), set(30, 15)], { rest: 60 }),
    item('hammer_curl_db', [set(14, 12), set(16, 10), set(16, 10)], { rest: 60 }),
    item('skullcrusher_bb', [set(25, 12), set(30, 10), set(30, 10)], { rest: 60 }),
  ]),
  rt('lower_a', 'Lower Body A', '⬇️', [
    item('squat_bb', [warmup(40, 5), set(60, 8), set(80, 5), set(90, 5), set(90, 5)], { rest: 180 }),
    item('rdl_bb', [set(60, 8), set(70, 6), set(80, 6)], { rest: 120 }),
    item('leg_press_m', [set(100, 12), set(120, 10), set(120, 10)], { rest: 90 }),
    item('lying_leg_curl_m', [set(35, 12), set(40, 10), set(40, 10)], { rest: 60 }),
    item('standing_calf_m', [set(50, 20), set(60, 15), set(60, 15)], { rest: 60 }),
  ]),
  rt('lower_b', 'Lower Body B', '⬇️', [
    item('deadlift_bb', [warmup(60, 5), set(90, 5), set(110, 3), set(120, 3)], { rest: 240 }),
    item('front_squat', [set(50, 6), set(60, 5), set(65, 5)], { rest: 150 }),
    item('bulgarian_split_db', [set(18, 10), set(20, 10), set(22, 10)], { rest: 90 }),
    item('hip_thrust_bb', [set(60, 12), set(80, 10), set(100, 8)], { rest: 90 }),
    item('leg_ext_machine', [set(40, 15), set(45, 12), set(50, 12)], { rest: 60 }),
    item('seated_calf_raise', [set(30, 15), set(40, 12), set(40, 12)], { rest: 60 }),
  ]),

  // ═══════════════════ BRO SPLIT (5-day) ═══════════════════
  rt('bro_chest', 'Chest Day', '', [
    item('bench_press_bb', [warmup(40, 5), set(60, 10), set(70, 8), set(75, 6), set(80, 5)], { rest: 150 }),
    item('incline_bench_db', [set(20, 12), set(24, 10), set(26, 8), set(28, 6)], { rest: 90 }),
    item('decline_bb', [set(50, 10), set(60, 8), set(65, 6)], { rest: 90 }),
    item('cable_fly_cross', [set(18, 15), set(20, 12), set(22, 10), set(22, 10)], { rest: 60 }),
    item('chest_fly_db', [set(12, 15), set(14, 12), set(14, 12)], { rest: 60 }),
    item('push_up', [set(0, 15), set(0, 15), set(0, 15)], { rest: 60 }),
  ]),
  rt('bro_back', 'Back Day', '', [
    item('deadlift_bb', [warmup(60, 5), set(90, 5), set(100, 5), set(110, 3)], { rest: 180 }),
    item('pull_up', [set(0, 10), set(0, 8), set(0, 6), set(0, 6)], { rest: 120 }),
    item('bent_over_row_bb', [set(50, 10), set(60, 8), set(70, 6)], { rest: 120 }),
    item('lat_pd_cable', [set(50, 12), set(55, 10), set(60, 10)], { rest: 90 }),
    item('seated_cable_row_v', [set(50, 12), set(55, 10), set(60, 10)], { rest: 90 }),
    item('face_pull', [set(25, 15), set(30, 15), set(30, 15)], { rest: 60 }),
    item('shrug_db', [set(20, 15), set(24, 12), set(28, 10)], { rest: 60 }),
  ]),
  rt('bro_shoulders', 'Shoulders Day', '', [
    item('overhead_press_bb', [warmup(20, 8), set(30, 8), set(40, 6), set(40, 6), set(45, 5)], { rest: 120 }),
    item('shoulder_press_db', [set(20, 10), set(24, 8), set(26, 8)], { rest: 90 }),
    item('lateral_raise_db', [set(8, 15), set(10, 15), set(12, 12), set(12, 12)], { rest: 60 }),
    item('rear_delt_fly_db', [set(8, 15), set(10, 12), set(10, 12), set(10, 12)], { rest: 60 }),
    item('front_raise_db', [set(8, 15), set(10, 12), set(10, 12)], { rest: 60 }),
    item('upright_row_bb', [set(30, 12), set(35, 10), set(35, 10)], { rest: 60 }),
    item('shrug_bb', [set(50, 12), set(60, 10), set(70, 8)], { rest: 60 }),
  ]),
  rt('bro_legs', 'Legs Day', '', [
    item('squat_bb', [warmup(40, 5), set(60, 8), set(80, 6), set(90, 5), set(100, 4)], { rest: 180 }),
    item('leg_press_m', [set(120, 12), set(140, 10), set(160, 10), set(180, 8)], { rest: 120 }),
    item('rdl_bb', [set(60, 10), set(70, 8), set(80, 6)], { rest: 120 }),
    item('lying_leg_curl_m', [set(35, 12), set(40, 10), set(45, 10)], { rest: 60 }),
    item('leg_ext_machine', [set(45, 12), set(50, 10), set(55, 10)], { rest: 60 }),
    item('standing_calf_m', [set(60, 15), set(70, 12), set(80, 10), set(80, 10)], { rest: 60 }),
    item('seated_calf_raise', [set(30, 15), set(40, 12), set(40, 12)], { rest: 60 }),
  ]),
  rt('bro_arms', 'Arms Day', '', [
    item('bicep_curl_bb', [set(25, 10), set(30, 8), set(35, 6), set(35, 6)], { rest: 90 }),
    item('preacher_curl_bb', [set(20, 10), set(25, 10), set(25, 8)], { rest: 60 }),
    item('hammer_curl_db', [set(14, 12), set(16, 10), set(16, 10)], { rest: 60 }),
    item('concentration_curl', [set(10, 12), set(12, 10), set(12, 10)], { rest: 60 }),
    item('skullcrusher_bb', [set(20, 10), set(25, 8), set(30, 6)], { rest: 90 }),
    item('triceps_pushdown', [set(25, 12), set(30, 10), set(35, 8)], { rest: 60 }),
    item('overhead_tricep_ext_c', [set(20, 12), set(25, 10), set(25, 10)], { rest: 60 }),
    item('bench_dip', [set(0, 15), set(0, 12), set(0, 10)], { rest: 60 }),
  ]),

  // ═══════════════════ HOME / MINIMAL EQUIPMENT ═══════════════════
  rt('home_full_bw', 'Home Full Body (Bodyweight)', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('push_up', [set(0, 15), set(0, 15), set(0, 12), set(0, 10)], { rest: 60 }),
    item('squat_bw', [set(0, 20), set(0, 20), set(0, 20), set(0, 20)], { rest: 60 }),
    item('pull_up', [set(0, 8), set(0, 6), set(0, 6)], { rest: 90 }),
    item('lunge_db', [set(10, 12), set(10, 12), set(12, 10)], { rest: 60 }),
    item('plank', [set(0, 45), set(0, 45), set(0, 45)], { rest: 60 }),
    item('mountain_climber', [set(0, 30), set(0, 30), set(0, 30)], { rest: 60 }),
  ]),
  rt('home_full_db', 'Home Full Body (Dumbbells)', '', [
    item('warm_up', [set(0, 1)], { rest: 0 }),
    item('goblet_squat', [set(20, 12), set(24, 10), set(24, 10), set(28, 8)], { rest: 90 }),
    item('bench_press_db', [set(20, 12), set(24, 10), set(26, 8), set(26, 8)], { rest: 90 }),
    item('dumbbell_row', [set(20, 12), set(24, 10), set(26, 10)], { rest: 90 }),
    item('rdl_db', [set(20, 12), set(24, 10), set(28, 8)], { rest: 90 }),
    item('shoulder_press_db', [set(16, 10), set(18, 10), set(20, 8)], { rest: 60 }),
    item('bicep_curl_db', [set(12, 12), set(14, 10), set(14, 10)], { rest: 60 }),
  ]),

  // ═══════════════════ QUICK / TRAVEL ═══════════════════
  rt('travel_20min', 'Travel 20-min', '', [
    item('burpee', [set(0, 10), set(0, 10), set(0, 10)], { rest: 60 }),
    item('push_up', [set(0, 15), set(0, 15), set(0, 15)], { rest: 45 }),
    item('squat_bw', [set(0, 25), set(0, 25), set(0, 25)], { rest: 45 }),
    item('lunge_db', [set(0, 12), set(0, 12), set(0, 12)], { rest: 45 }),
    item('plank', [set(0, 60), set(0, 45), set(0, 30)], { rest: 60 }),
  ]),
]

export const ROUTINE_BY_ID = Object.fromEntries(ROUTINES.map(r => [r.id, r]))

// Total volume calculation (working sets only)
export function routineVolume(routine) {
  return routine.exercises.reduce((total, ex) => {
    const working = (ex.sets || []).filter(s => s.type !== 'warmup')
    return total + working.reduce((sum, s) => sum + (s.weight * s.reps), 0)
  }, 0)
}

export function estimateDurationMin(routine) {
  const total = routine.exercises.reduce((min, ex) => {
    const sets = ex.sets?.length || 0
    const rest = ex.restSeconds || 90
    // ~40s per set + rest between = roughly (sets * 40 + (sets-1) * rest) seconds
    return min + (sets * 40 + Math.max(0, sets - 1) * rest) / 60
  }, 0)
  // Add 5 min buffer
  return Math.round(total + 5)
}
