// AI Provider - unified interface for intelligence features.
// Today: RulesProvider (deterministic, no network).
// Tomorrow: ClaudeProvider (via backend proxy - never expose API key in browser).
//
// Every provider must implement:
//   chat({ system, messages }): Promise<string>       // free-form conversation
//   coachInsight({ state }): Promise<Insight[]>       // structured insights
//   analyzeBloodTest({ values, profile }): Promise<Interpretation>
//   suggestMealPlan({ profile, targets }): Promise<Plan>

import { runEngine } from '../engine/adaptationEngine'
import { bloodMarkers, statusForValue } from '../data/bloodMarkers'

export class RulesProvider {
  name = 'rules'

  async chat({ system, messages, state }) {
    // rule-based mental chat - delegates to MentalChat's canned responses.
    // The MentalChat module has its own generateReply for now; this returns
    // a generic reflection when called directly.
    const last = messages[messages.length - 1]?.text || ''
    return this._reflect(last)
  }

  async coachInsight({ state }) { return runEngine(state) }

  async analyzeBloodTest({ values, profile }) {
    const flags = []
    const good = []
    for (const marker of bloodMarkers) {
      const v = +values[marker.id]
      if (!v) continue
      const status = statusForValue(marker, v, profile?.sex || 'default')
      const entry = { marker: marker.name, value: v, unit: marker.unit, status }
      if (status === 'normal') good.push(entry)
      else if (status === 'high' || status === 'low') {
        flags.push({ ...entry, recommendation: status === 'high' ? marker.high : marker.low })
      }
    }
    return {
      summary: flags.length
        ? `זוהו ${flags.length} סמנים חורגים מהטווח התקין.`
        : `כל הסמנים בתחום התקין - כל הכבוד.`,
      flags, good,
      urgentCount: flags.filter(f => ['vitD','ferritin','b12','glucose','hba1c'].includes(f.marker)).length,
    }
  }

  async suggestMealPlan({ profile, targets, days = 7 }) {
    // simple template plan - 3 meals + snack per day, calorie-balanced
    const meals = ['בוקר','צהריים','ערב','נשנוש']
    return {
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        meals: meals.map(name => ({
          name,
          idea: this._mealIdea(name, targets),
          kcal: Math.round(targets.kcal * this._share(name)),
        })),
      })),
    }
  }

  _reflect(text) {
    if (!text) return 'ספר לי עוד. מה על הלב היום?'
    if (/כן|יש/.test(text)) return 'מעניין. איך זה מרגיש בגוף כשאתה חושב על זה?'
    return 'שמעתי. מה הצעד הקטן ביותר שיזיז אותך קדימה בנושא?'
  }

  _mealIdea(mealName, targets) {
    const ideas = {
      'בוקר':   ['שיבולת שועל עם יוגורט יווני ופירות יער', 'חביתה עם 3 ביצים, אבוקדו וטוסט מלא', 'פנקייק חלבון עם בננה'],
      'צהריים': ['חזה עוף על אורז מלא עם ירקות מוקפצים', 'סלמון עם בטטה אפויה וסלט', 'קערת קינואה עם קטניות, טחינה וירקות'],
      'ערב':    ['חמין קל עם חזה הודו וירקות שורש', 'סטייק רזה עם ירקות בגריל', 'טופו עם ירקות ואטריות אורז'],
      'נשנוש':  ['תפוח + חמאת בוטנים', 'קוטג׳ עם עגבניות שרי', 'שייק חלבון עם בננה'],
    }
    const list = ideas[mealName] || ['ארוחה מאוזנת']
    return list[Math.floor(Math.random() * list.length)]
  }

  _share(mealName) {
    return { 'בוקר':.25, 'צהריים':.35, 'ערב':.30, 'נשנוש':.10 }[mealName] || .25
  }
}

// ClaudeProvider (future - requires backend proxy for API key security)
export class ClaudeProvider {
  name = 'claude'
  constructor({ backendUrl }) { this.backend = backendUrl }

  async chat({ system, messages }) {
    // TODO: POST to /api/ai/chat with { system, messages }
    // Backend calls Anthropic Claude API with server-held key.
    // Never call Anthropic directly from browser.
    throw new Error('ClaudeProvider not connected - requires backend proxy at ' + this.backend)
  }
  async coachInsight() { throw new Error('ClaudeProvider not connected') }
  async analyzeBloodTest() { throw new Error('ClaudeProvider not connected') }
  async suggestMealPlan() { throw new Error('ClaudeProvider not connected') }
}

// Active provider - swap here when backend is ready.
export const ai = new RulesProvider()

// When ready:
//   export const ai = new ClaudeProvider({ backendUrl: '/api/ai' })
