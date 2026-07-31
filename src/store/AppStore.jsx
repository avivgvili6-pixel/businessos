import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { storage } from '../utils/storage'
import { todayKey } from '../utils/date'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const ROLES = ['member','coach','admin']

const initialState = {
  role: 'member',           // active view: member | coach | admin
  onboarded: false,
  profile: {
    name: '', age: 30, sex: 'male', heightCm: 175, weightKg: 75,
    activity: 'moderate', experience: 'בינוני',
    goals: [], goalKey: 'recomp', targetPeriodWeeks: 12,
    dietKey: 'balanced',
    constraints: '',
  },
  plan: null,               // active workout plan
  workoutLogs: [],          // {date, sessionName, exercises:[{id,name,sets:[{w,r,rpe}]}] }
  mealLogs: {},             // { [dateKey]: [{foodId, grams}] }
  moodCheckins: [],         // {date, mood, energy, stress, sleepHours, note}
  habits: [
    { id:'water',   name:'שתיית 3 ליטר מים', icon:'💧', streak:0, doneToday:false },
    { id:'sleep',   name:'8 שעות שינה',      icon:'😴', streak:0, doneToday:false },
    { id:'steps',   name:'10,000 צעדים',     icon:'🚶', streak:0, doneToday:false },
    { id:'stretch', name:'10 דק׳ מתיחות',    icon:'🧘', streak:0, doneToday:false },
  ],
  bloodTests: [],           // {date, values:{markerId: value}}
  wearable: null,           // last synced snapshot
  lastActiveDate: todayKey(),
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':        return { ...state, ...action.payload }
    case 'SET_ROLE':       return { ...state, role: action.role }
    case 'SET_ONBOARDED':  return { ...state, onboarded: true, profile: { ...state.profile, ...action.profile } }
    case 'UPDATE_PROFILE': return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'SET_PLAN':       return { ...state, plan: action.plan }
    case 'LOG_WORKOUT':    return { ...state, workoutLogs: [action.log, ...state.workoutLogs] }
    case 'LOG_MEAL': {
      const key = action.date || todayKey()
      const cur = state.mealLogs[key] || []
      return { ...state, mealLogs: { ...state.mealLogs, [key]: [...cur, action.item] } }
    }
    case 'REMOVE_MEAL': {
      const key = action.date || todayKey()
      const cur = state.mealLogs[key] || []
      return { ...state, mealLogs: { ...state.mealLogs, [key]: cur.filter((_,i)=>i!==action.index) } }
    }
    case 'ADD_CHECKIN':    return { ...state, moodCheckins: [action.checkin, ...state.moodCheckins] }
    case 'TOGGLE_HABIT': {
      const habits = state.habits.map(h => h.id === action.id ? { ...h, doneToday: !h.doneToday, streak: !h.doneToday ? h.streak+1 : Math.max(0,h.streak-1) } : h)
      return { ...state, habits }
    }
    case 'ADD_HABIT':      return { ...state, habits: [...state.habits, action.habit] }
    case 'REMOVE_HABIT':   return { ...state, habits: state.habits.filter(h=>h.id!==action.id) }
    case 'ADD_BLOOD':      return { ...state, bloodTests: [action.test, ...state.bloodTests] }
    case 'SET_WEARABLE':   return { ...state, wearable: action.data }
    case 'RESET':          return initialState
    default: return state
  }
}

function init() {
  const saved = storage.get('state')
  return saved ? { ...initialState, ...saved } : initialState
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // persist on change (skip first render to avoid overwriting a fresh hydrate)
  const firstRender = React.useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    storage.set('state', state)
  }, [state])

  const api = {
    state,
    setRole: (role) => dispatch({ type:'SET_ROLE', role }),
    completeOnboarding: (profile) => dispatch({ type:'SET_ONBOARDED', profile }),
    updateProfile: (patch) => dispatch({ type:'UPDATE_PROFILE', patch }),
    setPlan: (plan) => dispatch({ type:'SET_PLAN', plan }),
    logWorkout: (log) => dispatch({ type:'LOG_WORKOUT', log }),
    logMeal: (item, date) => dispatch({ type:'LOG_MEAL', item, date }),
    removeMeal: (index, date) => dispatch({ type:'REMOVE_MEAL', index, date }),
    addCheckin: (checkin) => dispatch({ type:'ADD_CHECKIN', checkin }),
    toggleHabit: (id) => dispatch({ type:'TOGGLE_HABIT', id }),
    addHabit: (habit) => dispatch({ type:'ADD_HABIT', habit }),
    removeHabit: (id) => dispatch({ type:'REMOVE_HABIT', id }),
    addBlood: (test) => dispatch({ type:'ADD_BLOOD', test }),
    setWearable: (data) => dispatch({ type:'SET_WEARABLE', data }),
    reset: () => dispatch({ type:'RESET' }),
  }

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>
}

export { ROLES }
