// Canonical training modes — one taxonomy shared by:
//   • Onboarding SimpleGoal categories
//   • TrainerGenerator (chooses a pre-built BB program)
//   • RoutineBuilder auto-mode (drives reps + rest for one routine)
//
// Before this file existed each surface had its own words for the
// same 3 concepts (gain_muscle vs hypertrophy vs לבנות שריר), which
// made the app ask "what's your goal?" 3× in ways that felt redundant.
// Now: user picks once at onboarding → everything downstream inherits
// with a one-tap override.

export const TRAINING_MODES = {
  hypertrophy: {
    he: 'היפרטרופיה',
    en: 'Hypertrophy',
    subtitle: { he: 'מסה, מראה חטוב', en: 'Mass, aesthetic build' },
    repRange: [8, 12],
    restSeconds: 75,
    // Alias for the BB program filter (existing filter uses this key)
    bbGoalKey: 'gain_muscle',
  },
  strength: {
    he: 'כוח מירבי',
    en: 'Max strength',
    subtitle: { he: 'שיאים חדשים במורכבים', en: 'New PRs on compounds' },
    repRange: [3, 5],
    restSeconds: 210,
    bbGoalKey: 'strength',
  },
  endurance: {
    he: 'סיבולת שריר',
    en: 'Muscle endurance',
    subtitle: { he: 'סטמינה, ניפוח קצוב, ירידה במשקל', en: 'Stamina, cutting, weight loss' },
    repRange: [15, 20],
    restSeconds: 40,
    // Weight-loss traffic goes here for the program filter too (higher
    // rep + shorter rest = better for caloric expenditure)
    bbGoalKey: 'lose_weight',
  },
}

export const TRAINING_MODE_KEYS = Object.keys(TRAINING_MODES)

// Given the active user goal (from state.goals[]), derive the best
// canonical training mode. Never returns null — falls back to
// hypertrophy, which fits ~80% of members.
export function modeFromGoal(goal) {
  if (!goal) return 'hypertrophy'

  // Explicit hint set by SimpleGoal category
  if (goal.trainingMode && TRAINING_MODES[goal.trainingMode]) return goal.trainingMode

  // Infer from kind / lift / direction
  const kind = goal.kind || goal.metric?.kind
  const direction = goal.direction

  if (kind === 'lift_pr') return 'strength'
  if (kind === 'weight_change' && (goal.delta || goal.metric?.delta) > 0) return 'hypertrophy'
  if (kind === 'weight_change' && (goal.delta || goal.metric?.delta) < 0) return 'endurance'
  if (kind === 'body_fat') return 'endurance'
  if (kind === 'endurance') return 'endurance'

  if (direction === 'performance') return 'strength'
  if (direction === 'aesthetics') return 'hypertrophy'
  if (direction === 'energy') return 'endurance'

  return 'hypertrophy'
}

// Convenience — pull active goal out of app state
export function activeGoal(state) {
  return (state?.goals || []).find(g => g.status === 'active') || null
}

export function modeFromState(state) {
  return modeFromGoal(activeGoal(state))
}

// Human-readable "why we picked this mode" for the inherited banner
export function inheritedFromLabel(goal) {
  if (!goal) return null
  const mode = modeFromGoal(goal)
  return {
    mode,
    goalTitle: goal.title || goal.label || null,
    modeLabel: TRAINING_MODES[mode].he,
  }
}
