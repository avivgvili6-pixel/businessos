import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { dataService } from '../services/dataService'
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
    oneRMs: {}, // { squat: 100, bench: 80, deadlift: 140, ohp: 55, ... }
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
  customFoods: [],          // user-created foods {id, name, cat, kcal, p, c, f, barcode?}
  rehabPrograms: [],        // active rehab {id, area, startedAt, painLog:[], sessions:[]}
  measurements: [],         // {date, weight, bodyFat?, waist?, chest?, hips?, arms?, thighs?, note?}
  progressPhotos: [],       // {id, date, dataUrl, angle: 'front'|'side'|'back', note?}
  personalRecords: [],      // {id, exercise, weight, reps, date, note?}
  goals: [],                // {id, title, kind, metric, deadlineWeeks, why, barriers, weeklyActions, checkins, status}
  lastActiveDate: todayKey(),
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':        return { ...state, ...action.payload }
    case 'SET_ROLE':       return { ...state, role: action.role }
    case 'SET_ONBOARDED':  return { ...state, onboarded: true, profile: { ...state.profile, ...action.profile } }
    case 'UPDATE_PROFILE': return { ...state, profile: { ...state.profile, ...action.patch } }
    case 'SET_1RM':        return { ...state, profile: { ...state.profile, oneRMs: { ...(state.profile.oneRMs || {}), [action.lift]: action.value } } }
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
    case 'ADD_CUSTOM_FOOD':return { ...state, customFoods: [action.food, ...state.customFoods] }
    case 'REMOVE_CUSTOM_FOOD': return { ...state, customFoods: state.customFoods.filter(f => f.id !== action.id) }
    case 'START_REHAB':    return { ...state, rehabPrograms: [action.program, ...state.rehabPrograms.filter(p => p.area !== action.program.area)] }
    case 'LOG_REHAB_PAIN': return { ...state, rehabPrograms: state.rehabPrograms.map(p => p.id === action.programId ? { ...p, painLog: [{ date: new Date().toISOString(), pain: action.pain, note: action.note }, ...p.painLog] } : p) }
    case 'LOG_REHAB_SESSION': return { ...state, rehabPrograms: state.rehabPrograms.map(p => p.id === action.programId ? { ...p, sessions: [{ date: new Date().toISOString(), week: action.week }, ...p.sessions] } : p) }
    case 'STOP_REHAB':     return { ...state, rehabPrograms: state.rehabPrograms.filter(p => p.id !== action.id) }
    case 'ADD_MEASUREMENT': return { ...state, measurements: [action.m, ...state.measurements] }
    case 'REMOVE_MEASUREMENT': return { ...state, measurements: state.measurements.filter((_,i) => i !== action.index) }
    case 'ADD_PROGRESS_PHOTO': return { ...state, progressPhotos: [action.photo, ...state.progressPhotos] }
    case 'REMOVE_PROGRESS_PHOTO': return { ...state, progressPhotos: state.progressPhotos.filter(p => p.id !== action.id) }
    case 'ADD_PR':         return { ...state, personalRecords: [action.pr, ...state.personalRecords] }
    case 'REMOVE_PR':      return { ...state, personalRecords: state.personalRecords.filter(p => p.id !== action.id) }
    case 'SET_GOAL':       return { ...state, goals: [action.goal, ...(state.goals || []).filter(g => g.id !== action.goal.id && g.status === 'active').map(g => ({ ...g, status: 'archived' })), ...(state.goals || []).filter(g => g.status !== 'active')] }
    case 'REMOVE_GOAL':    return { ...state, goals: (state.goals || []).filter(g => g.id !== action.id) }
    case 'CHECKIN_GOAL':   return { ...state, goals: (state.goals || []).map(g => g.id === action.goalId ? { ...g, checkins: [{ date: new Date().toISOString(), value: action.value, note: action.note }, ...(g.checkins || [])] } : g) }
    case 'RESET':          return initialState
    default: return state
  }
}

function init() {
  // sync init from local cache - async backend hydration happens in useEffect
  const saved = (typeof window !== 'undefined')
    ? JSON.parse(localStorage.getItem('hfos:state') || 'null')
    : null
  return saved ? { ...initialState, ...saved } : initialState
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  // persist on change (skip first render to avoid overwriting a fresh hydrate)
  const firstRender = React.useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    dataService.setState(state)
  }, [state])

  const api = {
    state,
    setRole: (role) => dispatch({ type:'SET_ROLE', role }),
    completeOnboarding: (profile) => dispatch({ type:'SET_ONBOARDED', profile }),
    updateProfile: (patch) => dispatch({ type:'UPDATE_PROFILE', patch }),
    set1RM: (lift, value) => dispatch({ type:'SET_1RM', lift, value: +value || 0 }),
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
    addCustomFood: (food) => dispatch({ type:'ADD_CUSTOM_FOOD', food }),
    removeCustomFood: (id) => dispatch({ type:'REMOVE_CUSTOM_FOOD', id }),
    startRehab: (program) => dispatch({ type:'START_REHAB', program }),
    logRehabPain: (programId, pain, note) => dispatch({ type:'LOG_REHAB_PAIN', programId, pain, note }),
    logRehabSession: (programId, week) => dispatch({ type:'LOG_REHAB_SESSION', programId, week }),
    stopRehab: (id) => dispatch({ type:'STOP_REHAB', id }),
    addMeasurement: (m) => dispatch({ type:'ADD_MEASUREMENT', m }),
    removeMeasurement: (index) => dispatch({ type:'REMOVE_MEASUREMENT', index }),
    addProgressPhoto: (photo) => dispatch({ type:'ADD_PROGRESS_PHOTO', photo }),
    removeProgressPhoto: (id) => dispatch({ type:'REMOVE_PROGRESS_PHOTO', id }),
    addPR: (pr) => dispatch({ type:'ADD_PR', pr }),
    removePR: (id) => dispatch({ type:'REMOVE_PR', id }),
    setGoal: (goal) => dispatch({ type:'SET_GOAL', goal }),
    removeGoal: (id) => dispatch({ type:'REMOVE_GOAL', id }),
    checkinGoal: (goalId, value, note) => dispatch({ type:'CHECKIN_GOAL', goalId, value, note }),
    reset: () => dispatch({ type:'RESET' }),
  }

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>
}

export { ROLES }
