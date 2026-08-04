// Shared level model for all WOD disciplines.
// Beginner / Intermediate / Advanced / RX — feed into the discipline
// generators so a single template can output four workouts.

export const WOD_LEVELS = [
  { key:'beginner',     he:'מתחיל',   short:'מתחיל'  },
  { key:'intermediate', he:'בינוני',   short:'בינוני'  },
  { key:'advanced',     he:'מתקדם',   short:'מתקדם'  },
  { key:'rx',           he:'RX',      short:'RX'      },
]

// Map free-text profile.experience to a level key.
export function levelFromProfile(experience) {
  const s = (experience || '').toLowerCase().trim()
  if (/מתחיל|beginner|newbie|novice/.test(s)) return 'beginner'
  if (/מתקדם|advanced/.test(s)) return 'advanced'
  if (/אקספרט|elite|expert|competitor|rx/.test(s)) return 'rx'
  return 'intermediate'
}

// Discipline-specific coaching notes appended below the generated workout.
// Each note tells the athlete what "this level" actually means for THAT
// discipline — what to substitute, what weight, how hard to push.
const NOTES = {
  gymnastics: {
    beginner: [
      'סקאלינג: החלף Muscle-Up ב-Jumping Pull-up · Handstand → Wall Walk · Pistol → Assisted Squat',
      'התחל עם חצי מכמות הסטים · טכניקה קודם למספרים',
    ],
    intermediate: [
      'בצע כפי שכתוב · הוסף רבע חזרות אם קל · מנוחה מלאה בין סטים',
    ],
    advanced: [
      'הוסף EMOM נוסף בסוף אם יש כוח · פחות מנוחה בין סטים (30-45 שנ׳)',
    ],
    rx: [
      'ללא סקאלינג · Strict versions בלבד · טכניקה תחרותית מלאה',
    ],
  },
  weightlifting: {
    beginner: [
      'סקאלינג: הורד כל אחוז ב-15% (70% → 55%, 80% → 65%) · טכניקה קודם לכל דבר',
      'עדיף להוסיף סט לחימום ולעצור סטים אם הטכניקה נשברת',
    ],
    intermediate: [
      'בצע את האחוזים כפי שכתוב · אם 3 חזרות הופכות ל-5 קלות, העלה 2.5 ק״ג',
    ],
    advanced: [
      'הוסף סט Max Single בסוף הבלוק העיקרי · מנוחה מלאה 3-4 דק׳ בין סטים כבדים',
    ],
    rx: [
      'RX · אחוזים מדויקים מה-1RM · מיקוד על שיא אישי חדש',
      '─── משקלי תחרות RX ───',
      'Snatch (M/F): לפי 1RM אישי · אלטרנטיבה תחרותית 100/70 ק״ג',
      'Clean & Jerk (M/F): 130/90 ק״ג ממוצע · לפי 1RM',
    ],
  },
  running: {
    beginner: [
      'סקאלינג: הורד את המרחק ב-30% (6×800m → 4×600m) · דלג על הריצה האחרונה אם עייף',
      'מנוחה יכולה להיות הליכה במקום ג׳וג',
    ],
    intermediate: [
      'בצע כפי שכתוב · אם הקצב יציב, נסה להוריד 5 שנ׳/ק״מ בסבב הבא',
    ],
    advanced: [
      'הוסף 2 חזרות לסט העיקרי · הפחת מנוחה ב-15 שנ׳',
    ],
    rx: [
      'RX · קצבי תחרות · שאף לזמן race pace · תעד כל אינטרוול',
    ],
  },
  hyrox: {
    beginner: [
      'סקאלינג: Sled בלי משקל תוסף · Wall Ball 6/4 ק״ג · Sandbag 10 ק״ג',
      'Burpee → Step-back Burpee · פחות סבבים אם עייף',
    ],
    intermediate: [
      'משקלים סקאלינג 70-80% מ-RX · Sled בינוני · Wall Ball 7/5',
    ],
    advanced: [
      'משקלים 90% מ-RX · תרגול קצב תחרות · שים לב לזמני מעבר',
    ],
    rx: [
      'RX · משקלי תחרות מלאים · פורמט המרוץ המקורי',
      '─── משקלי תחרות HYROX RX ───',
      'Sled Push: 152 ק״ג (גבר) / 102 ק״ג (אישה)',
      'Sled Pull: 103 ק״ג (גבר) / 78 ק״ג (אישה)',
      'Wall Ball: 6.5 ק״ג (גבר) · Target 3m / 4 ק״ג (אישה) · Target 2.75m',
      'Sandbag Lunges: 20 ק״ג (גבר) / 10 ק״ג (אישה)',
      'Farmers Carry: 24 ק״ג × 2 (גבר) / 16 ק״ג × 2 (אישה)',
    ],
  },
}

// Compose the final workout: inject a level header, append coaching notes.
export function applyLevelToWod(wod, level) {
  const meta = WOD_LEVELS.find(l => l.key === level) || WOD_LEVELS[1]
  const notes = NOTES[wod.discipline]?.[level] || []
  const lines = [...wod.lines]
  // Level tag right after title (position 1)
  lines.splice(1, 0, `── רמה: ${meta.he} ──`)
  if (notes.length) {
    lines.push('')
    lines.push('─── הערות רמה ───')
    lines.push(...notes)
  }
  return { ...wod, lines, level }
}
