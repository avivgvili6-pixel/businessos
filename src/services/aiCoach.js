// AI Coach service - calls Google Gemini API from the client.
// Falls back to old keyword matching if the API key isn't configured
// or if a request fails.
//
// The user's API key comes from VITE_GEMINI_KEY env var.
// Free tier: 15 requests/min, 1500/day per project (plenty for pilot).

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const GEMINI_MODEL = 'gemini-2.0-flash-exp' // fast + free tier
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export const aiEnabled = !!GEMINI_KEY

// System prompt: makes Gemini act as a Selano fitness expert
const SYSTEM_PROMPT = `אתה מומחה כושר, תזונה ובריאות של אפליקציית Selano Holistic Fitness OS.

התמחות:
- כושר ואימונים (בודיבילדינג, כוח, קרוספיט, פונקציונאלי, יוגה, ריצה)
- תזונה, מקרו, קלוריות, בדיקות דם
- הורמונים (טסטו, אסטרוגן, קורטיזול, אינסולין, GH)
- שינה, התאוששות, מחזורי REM
- פציעות ושיקום (מתי לנוח, מתי לחזור לרופא)
- ניווט באפליקציה - אתה יודע איפה כל דבר בפלטפורמה

אישיות:
- מקצועי אבל חם
- ישיר, לא מפוצץ מילים
- אתה עונה בעברית (אלא אם המשתמש כתב באנגלית)
- אם אין לך מידע ודאי - תגיד את זה בפירוש
- אם השאלה חורגת מהתחום שלך (למשל תשלומים) - הפנה למאמן/מנהל האפליקציה

מבנה תשובה:
- קצר וישיר (2-4 משפטים אלא אם השאלה דורשת יותר)
- אם רלוונטי - הצע פעולה קונקרטית ("עבור ל־תזונה → הוסף")
- אם השאלה אישית/רגשית - הפנה למאמן המנטלי בפלטפורמה

מבנה הפלטפורמה:
-  בית ·  מטרה ·  תובנות ·  התקדמות ·  אימונים ·  שיקום ·  תזונה ·  מנטלי
-  הרגלים ·  יומן ·  On-Demand (סרטוני אימון בבית) ·  חנות ·  אימון אישי ·  פרופיל

אזהרה מקצועית: הצע ראייה מקצועית לרופא/פיזיוטרפיסט לפני שינויים משמעותיים בתזונה או אימון אם יש מצב רפואי.`

// Build message history for Gemini's format
function buildMessages(conversationHistory, userQuestion, userContext = {}) {
  const contextParts = []
  if (userContext.name) contextParts.push(`שם: ${userContext.name}`)
  if (userContext.sex) contextParts.push(`מין: ${userContext.sex === 'female' ? 'אישה' : 'גבר'}`)
  if (userContext.age) contextParts.push(`גיל: ${userContext.age}`)
  if (userContext.goal) contextParts.push(`מטרה נוכחית: ${userContext.goal}`)
  if (userContext.plan) contextParts.push(`תכנית פעילה: ${userContext.plan}`)
  const contextLine = contextParts.length ? `\n\nמידע על המשתמש: ${contextParts.join(', ')}` : ''

  // Gemini uses parts + role: 'user' | 'model' format
  const contents = []
  // Recent conversation history (last 5 exchanges)
  for (const m of (conversationHistory || []).slice(-10)) {
    contents.push({
      role: m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })
  }
  contents.push({ role: 'user', parts: [{ text: userQuestion + contextLine }] })

  return contents
}

// Main API call - returns the assistant reply text, or null on failure
export async function askAiCoach({ question, history = [], userContext = {} }) {
  if (!aiEnabled) return null

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: buildMessages(history, question, userContext),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    })

    if (!response.ok) {
      console.warn('[aiCoach] Gemini API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    return text.trim()
  } catch (err) {
    console.warn('[aiCoach] request failed:', err.message)
    return null
  }
}

// Detect if a question is emotional/personal - should route to mental coach
export function isMentalQuestion(text) {
  const mentalKeywords = [
    'מרגיש', 'לחוץ', 'עצוב', 'חרד', 'מפחד', 'כועס', 'מדוכא', 'עייף נפשית',
    'שחוק', 'לא רוצה', 'מוותר', 'קשה לי נפשית', 'ריקנות', 'בודד',
    'מבולבל רגשית', 'רוצה לבכות', 'אני לא מסוגל נפשית', 'שנאה', 'תסכול',
  ]
  const lower = (text || '').toLowerCase()
  return mentalKeywords.some(kw => lower.includes(kw))
}
