// Legendary bodybuilder programs — public-domain reconstructions.
//
// LEGAL NOTE: Each program below is a working reconstruction based on
// PUBLIC sources (interviews, autobiographies, magazine articles,
// podcasts). We do NOT reproduce any copyrighted program verbatim.
// Every entry ships with an explicit `attribution` string and a
// `sources` array so the reader can verify origin.
//
// UPDATE CADENCE: We aim to add 2–4 new programs every ~2 months.
// The `addedOn` field tracks when each entry landed; sort by that
// in the UI to surface "recently added" cleanly.
//
// EXERCISE IDs reference src/data/bodybuilding/exercises.js. If an
// exercise doesn't exist yet, the entry keeps a plain-text name so
// nothing breaks; the picker can fall back to text-only display.

export const LEGEND_PROGRAMS = [
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'arnold_golden_six',
    name: 'Golden Six של ארנולד',
    athlete: 'Arnold Schwarzenegger',
    era: '1960s · Munich era',
    split: '3 ימים בשבוע · גוף מלא',
    frequency: 3,
    duration: '60-75 דק׳',
    level: 'beginner',
    goal: 'hypertrophy',
    philosophy: 'שש תרגילים בסיסיים, שלוש פעמים בשבוע, נפח בינוני. התכנית שארנולד השתמש בה בגיל 17 בגרמניה ובנה עליה את הבסיס לפני שעבר לתכניות הנפחות המפורצות שלו.',
    attribution: 'שחזור מבוסס ראיונות ואוטוביוגרפיה — "The Education of a Bodybuilder"',
    sources: ['Arnold: The Education of a Bodybuilder (1977)', 'Muscle Builder magazine, 1966'],
    addedOn: '2026-08-02',
    tags: ['קלאסי', 'מתחיל', 'גוף מלא'],
    accent: '#c78f3a',
    sessions: [
      {
        name: 'Golden Six A',
        exercises: [
          { name: 'סקוואט', sets: 4, reps: 10, rest: 90 },
          { name: 'לחיצת חזה בשיפוע', sets: 3, reps: 10, rest: 90 },
          { name: 'מתח רחב', sets: 3, reps: 'למקסימום', rest: 90 },
          { name: 'לחיצת כתפיים מאחור', sets: 4, reps: 10, rest: 90 },
          { name: 'כפיפת מרפקים במוט', sets: 3, reps: 10, rest: 60 },
          { name: 'סיטאפ', sets: 3, reps: 'למקסימום', rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Golden Six A', 'מנוחה', 'Golden Six A', 'מנוחה', 'Golden Six A', 'מנוחה', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'dorian_blood_and_guts',
    name: 'Blood & Guts',
    athlete: 'Dorian Yates',
    era: '1990s · 6× Mr. Olympia',
    split: '4 ימים בשבוע · Push/Pull/Legs + חזה',
    frequency: 4,
    duration: '45-60 דק׳',
    level: 'advanced',
    goal: 'hypertrophy',
    philosophy: 'HIT מזוקק — סט אחד עד כישלון מוחלט לכל תרגיל, אחרי 1-2 סטי חימום. תדירות נמוכה, עצימות מקסימלית, מנוחה של 4-7 ימים בין שרירים. פחות זמן בחדר, יותר החלמה.',
    attribution: 'שחזור מבוסס הספר Blood and Guts (Yates 2007) וסרטי אימון מהתקופה',
    sources: ['Blood and Guts training video (1996)', 'A Warrior\'s Story documentary (2011)'],
    addedOn: '2026-08-02',
    tags: ['HIT', 'מתקדם', 'עצימות גבוהה'],
    accent: '#a52a3a',
    sessions: [
      {
        name: 'Chest & Biceps',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במכונה', sets: 2, warmup: 1, workingSets: 1, reps: '8-10', note: 'סט אחד עד כישלון + rest-pause' },
          { name: 'לחיצת חזה שטוחה במשקולות', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'פליי במכונת פק־דק', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'כפיפת מרפקים ב-EZ בר', sets: 2, warmup: 1, workingSets: 1, reps: '6-8' },
          { name: 'כפיפת ריכוז', sets: 2, warmup: 1, workingSets: 1, reps: '6-8' },
        ],
      },
      {
        name: 'Back & Rear Delts',
        exercises: [
          { name: 'הורדת פולי מוט קדימה', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'חתירה במוט', sets: 2, warmup: 1, workingSets: 1, reps: '6-8' },
          { name: 'פלאיס אחוריים במכונת פק־דק', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
        ],
      },
      {
        name: 'Shoulders & Triceps',
        exercises: [
          { name: 'לחיצת כתפיים במכונה', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'הרמות צד במכונה', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'פשיטת מרפקים בכבל', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'סקאל קראשר', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
        ],
      },
      {
        name: 'Legs',
        exercises: [
          { name: 'הארכת ברכיים', sets: 2, warmup: 1, workingSets: 1, reps: '10-12' },
          { name: 'לג פרס', sets: 2, warmup: 1, workingSets: 1, reps: '10-12' },
          { name: 'כפיפת ברכיים בשכיבה', sets: 2, warmup: 1, workingSets: 1, reps: '8-10' },
          { name: 'עליות עקבים בעמידה', sets: 2, warmup: 1, workingSets: 1, reps: '10-12' },
        ],
      },
    ],
    weeklyPlan: ['Chest & Biceps', 'Back & Rear Delts', 'מנוחה', 'Shoulders & Triceps', 'מנוחה', 'Legs', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ronnie_high_volume',
    name: 'Iron Deep — נפח גבוה',
    athlete: 'Ronnie Coleman',
    era: '1998–2005 · 8× Mr. Olympia',
    split: '6 ימים · PPL כפול',
    frequency: 6,
    duration: '90-120 דק׳',
    level: 'advanced',
    goal: 'hypertrophy',
    philosophy: 'נפח גבוה מאוד, משקלים כבדים על תרגילי הבסיס (סקוואט 360 ק״ג, דדליפט 360 ק״ג במחזורים כבדים). PPL 6 פעמים בשבוע, יומיים לכל דחיפה/משיכה/רגליים. פילוסופיה: "everybody wanna be a bodybuilder, but nobody wanna lift no heavy-ass weights."',
    attribution: 'שחזור מבוסס דוקומנטרי Netflix "Ronnie Coleman: The King" וראיונות',
    sources: ['Ronnie Coleman: The King (Netflix, 2018)', 'The Cost of Redemption DVD (2003)'],
    addedOn: '2026-08-02',
    tags: ['נפח גבוה', 'מתקדם', 'PPL'],
    accent: '#a52a3a',
    sessions: [
      {
        name: 'Push A',
        exercises: [
          { name: 'לחיצת חזה שטוחה', sets: 4, reps: '12,10,8,6', rest: 120, note: 'פירמידה עולה' },
          { name: 'לחיצת חזה בשיפוע במשקולות', sets: 4, reps: 12, rest: 90 },
          { name: 'פליי במשקולות', sets: 3, reps: 12, rest: 60 },
          { name: 'לחיצת כתפיים במוט', sets: 4, reps: '12,10,8,6', rest: 120 },
          { name: 'הרמות צד', sets: 4, reps: 12, rest: 60 },
          { name: 'פשיטת מרפקים בכבל', sets: 4, reps: 12, rest: 60 },
        ],
      },
      {
        name: 'Pull A',
        exercises: [
          { name: 'דדליפט', sets: 4, reps: '12,10,8,6', rest: 180 },
          { name: 'חתירה במוט', sets: 4, reps: 12, rest: 90 },
          { name: 'הורדת פולי מוט', sets: 4, reps: 12, rest: 90 },
          { name: 'כפיפת מרפקים ב-EZ בר', sets: 4, reps: 12, rest: 60 },
          { name: 'כפיפת פטיש במשקולות', sets: 3, reps: 12, rest: 60 },
        ],
      },
      {
        name: 'Legs A',
        exercises: [
          { name: 'סקוואט', sets: 5, reps: '12,10,8,6,4', rest: 180 },
          { name: 'לג פרס', sets: 4, reps: '20,15,12,10', rest: 120 },
          { name: 'הארכת ברכיים', sets: 4, reps: 15, rest: 60 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 4, reps: 12, rest: 60 },
          { name: 'עליות עקבים בישיבה', sets: 5, reps: 20, rest: 60 },
        ],
      },
      {
        name: 'Push B (variations)',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במוט', sets: 4, reps: 10, rest: 90 },
          { name: 'לחיצת חזה במכונה', sets: 4, reps: 12, rest: 60 },
          { name: 'לחיצת כתפיים במשקולות', sets: 4, reps: 10, rest: 90 },
          { name: 'סקאל קראשר', sets: 4, reps: 12, rest: 60 },
        ],
      },
      {
        name: 'Pull B (variations)',
        exercises: [
          { name: 'חתירה בכבל תחתון', sets: 4, reps: 12, rest: 90 },
          { name: 'חתירה במכונה', sets: 4, reps: 12, rest: 60 },
          { name: 'הורדת פולי צר', sets: 4, reps: 12, rest: 60 },
          { name: 'כפיפת מרפקים בכבל', sets: 4, reps: 15, rest: 60 },
        ],
      },
      {
        name: 'Legs B (higher volume, less weight)',
        exercises: [
          { name: 'סקוואט חזיתי', sets: 4, reps: 10, rest: 120 },
          { name: 'לאנג׳ הליכה במשקולות', sets: 3, reps: '20 צעדים', rest: 90 },
          { name: 'רומני דדליפט', sets: 4, reps: 12, rest: 90 },
          { name: 'הארכת ברכיים', sets: 4, reps: 20, rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Push A', 'Pull A', 'Legs A', 'Push B (variations)', 'Pull B (variations)', 'Legs B (higher volume, less weight)', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cutler_fst7',
    name: 'FST-7',
    athlete: 'Jay Cutler (מאמן: Hany Rambod)',
    era: '2006–2013 · 4× Mr. Olympia',
    split: '5 ימים · שריר לפי יום',
    frequency: 5,
    duration: '75-90 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    philosophy: 'Fascia Stretch Training. אחרי תרגילים כבדים סטנדרטיים, סוגרים את השריר עם 7 סטים של 8-12 חזרות עם 30-45 שניות מנוחה בלבד. הרעיון: מתיחת ה־fascia (הרקמה שמקיפה את השריר) כדי לאפשר גדילה גדולה יותר.',
    attribution: 'שחזור מבוסס Hany Rambod\'s FST-7 training system (public methodology)',
    sources: ['fst7.com official methodology', 'Jay Cutler ראיונות עם Muscle & Fitness'],
    addedOn: '2026-08-02',
    tags: ['FST-7', 'בינוני', 'שריר ליום'],
    accent: '#c74050',
    sessions: [
      {
        name: 'Chest Day',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במוט', sets: 4, reps: '8-12', rest: 90 },
          { name: 'לחיצת חזה שטוחה במשקולות', sets: 4, reps: '8-12', rest: 90 },
          { name: 'פליי במכונה', sets: 4, reps: '8-12', rest: 60 },
          { name: 'פליי בכבלים — FST-7', sets: 7, reps: '8-12', rest: 40, note: '7 סטים, 30-45 ש׳ מנוחה בלבד' },
        ],
      },
      {
        name: 'Back Day',
        exercises: [
          { name: 'הורדת פולי מוט קדימה', sets: 4, reps: '8-12', rest: 90 },
          { name: 'חתירה במוט', sets: 4, reps: '8-12', rest: 90 },
          { name: 'חתירה בכבל תחתון', sets: 4, reps: '8-12', rest: 60 },
          { name: 'פולאובר בכבל — FST-7', sets: 7, reps: '8-12', rest: 40 },
        ],
      },
      {
        name: 'Legs Day',
        exercises: [
          { name: 'סקוואט', sets: 4, reps: '8-12', rest: 120 },
          { name: 'לג פרס', sets: 4, reps: '10-15', rest: 90 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 4, reps: '10-12', rest: 60 },
          { name: 'הארכת ברכיים — FST-7', sets: 7, reps: '10-12', rest: 40 },
        ],
      },
      {
        name: 'Shoulders Day',
        exercises: [
          { name: 'לחיצת כתפיים במשקולות', sets: 4, reps: '8-12', rest: 90 },
          { name: 'הרמות צד במשקולות', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פייס פול', sets: 4, reps: '12-15', rest: 60 },
          { name: 'הרמות צד בכבל — FST-7', sets: 7, reps: '12-15', rest: 40 },
        ],
      },
      {
        name: 'Arms Day',
        exercises: [
          { name: 'כפיפת מרפקים ב-EZ בר', sets: 4, reps: '8-12', rest: 60 },
          { name: 'סקאל קראשר', sets: 4, reps: '8-12', rest: 60 },
          { name: 'כפיפת פטיש', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פשיטת מרפקים בכבל — FST-7', sets: 7, reps: '10-12', rest: 40 },
        ],
      },
    ],
    weeklyPlan: ['Chest Day', 'Back Day', 'Legs Day', 'Shoulders Day', 'Arms Day', 'מנוחה', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'zane_three_way',
    name: 'The Zane 3-Way Split',
    athlete: 'Frank Zane',
    era: '1977–1979 · 3× Mr. Olympia',
    split: '3 ימים · חזרה כל 4 ימים',
    frequency: 4,
    duration: '75-90 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    philosophy: 'שני שרירים ליום, תדירות של פעם ב-4 ימים לכל שריר. פוקוס על אסתטיקה, פרופורציות וסימטריה במקום נפח מקסימלי. Zane היה הבודיבילדר הקל ביותר שזכה במר. אולימפיה — גישה שהחזירה את הפיזיק הקלאסי.',
    attribution: 'שחזור מבוסס הספר "The Zane Way" ותרגילי הבסיס מ-Franks Zone official',
    sources: ['Zane: Fabulously Fit Forever (Frank Zane, 1998)', 'frankzane.com Classic Bodybuilding'],
    addedOn: '2026-08-02',
    tags: ['אסתטיקה', 'קלאסי', 'סימטריה'],
    accent: '#c78f3a',
    sessions: [
      {
        name: 'Day 1 — Chest, Back & Abs',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במשקולות', sets: 4, reps: '10-8-6-4', rest: 90 },
          { name: 'פליי במשקולות בשיפוע', sets: 3, reps: '10-8-6', rest: 60 },
          { name: 'מקבילים', sets: 3, reps: 'למקסימום', rest: 60 },
          { name: 'מתח רחב', sets: 4, reps: 'למקסימום', rest: 90 },
          { name: 'חתירה במוט', sets: 3, reps: '10-8-6', rest: 90 },
          { name: 'פולאובר במשקולת יחידה', sets: 3, reps: 15, rest: 60, note: 'להרחבת כלוב הצלעות' },
          { name: 'סיטאפ בשיפוע', sets: 3, reps: 30, rest: 45 },
          { name: 'הרמות רגליים בתלייה', sets: 3, reps: 20, rest: 45 },
        ],
      },
      {
        name: 'Day 2 — Shoulders, Arms & Abs',
        exercises: [
          { name: 'לחיצת כתפיים בישיבה במשקולות', sets: 4, reps: '10-8-6-4', rest: 90 },
          { name: 'הרמות צד', sets: 3, reps: '10-8-6', rest: 60 },
          { name: 'פלאיס אחוריים בהתכופפות', sets: 3, reps: 12, rest: 60 },
          { name: 'כפיפת מרפקים בעמידה', sets: 4, reps: '10-8-6-4', rest: 60 },
          { name: 'כפיפת פטיש', sets: 3, reps: 10, rest: 60 },
          { name: 'פשיטת מרפקים מעל הראש בכבל', sets: 4, reps: '10-8-6', rest: 60 },
          { name: 'כפיפות בטן בכבל', sets: 3, reps: 20, rest: 45 },
        ],
      },
      {
        name: 'Day 3 — Legs & Calves',
        exercises: [
          { name: 'סקוואט', sets: 5, reps: '12-10-8-6-4', rest: 120 },
          { name: 'הארכת ברכיים', sets: 4, reps: '15-12-10-8', rest: 60 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 4, reps: '12-10-8-8', rest: 60 },
          { name: 'לאנג׳ במשקולות', sets: 3, reps: 12, rest: 60 },
          { name: 'עליות עקבים בעמידה', sets: 5, reps: '15-12-10-10-8', rest: 45 },
          { name: 'עליות עקבים בישיבה', sets: 4, reps: 15, rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Day 1 — Chest, Back & Abs', 'Day 2 — Shoulders, Arms & Abs', 'Day 3 — Legs & Calves', 'מנוחה', 'Day 1', 'Day 2', 'Day 3'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'platz_legs',
    name: 'The Quad Father — Leg Routine',
    athlete: 'Tom Platz',
    era: '1978–1987 · הרגליים המפורסמות בהיסטוריה',
    split: 'יום רגליים בודד (משתלב באימוני פלג עליון בשאר השבוע)',
    frequency: 1,
    duration: '90 דק׳ (יום רגליים בלבד)',
    level: 'expert',
    goal: 'hypertrophy',
    philosophy: 'עצימות טהורה על רגליים. סקוואט לחזרות גבוהות (עד 50!) עם משקלים כבדים. Platz האמין שהמוח הוא הגורם המגביל — לא השריר. אימון אחד לרגליים בשבוע, אבל אימון שנטבע בהיסטוריה.',
    attribution: 'שחזור מבוסס Golden Era of Bodybuilding וראיונות Platz מ-Muscle & Fitness',
    sources: ['Muscle & Fitness — Tom Platz Interview (1982)', 'The Legendary Quads seminar footage'],
    addedOn: '2026-08-02',
    tags: ['רגליים', 'אקספרט', 'עצימות מקסימלית'],
    accent: '#a52a3a',
    sessions: [
      {
        name: 'Leg Day — Platz Style',
        exercises: [
          { name: 'סקוואט', sets: 8, reps: '5,5,5,5,10,10,15,20', rest: 180, note: 'פירמידה: 5 סטים כבדים, ואז חזרות גבוהות עולות' },
          { name: 'לג פרס', sets: 5, reps: '10-15', rest: 120 },
          { name: 'הארכת ברכיים', sets: 5, reps: '10-15', rest: 90 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 6, reps: '10-15', rest: 90 },
          { name: 'עליות עקבים בעמידה', sets: 8, reps: '10-15', rest: 60 },
          { name: 'סקוואט 20-rep — סופי', sets: 1, reps: 20, rest: 0, note: 'המשקל שאתה משתמש בו לסט 10 — עכשיו 20 חזרות, נשימה עמוקה בין חזרות' },
        ],
      },
    ],
    weeklyPlan: ['Leg Day — Platz Style', 'מנוחה', 'פלג עליון', 'מנוחה', 'פלג עליון', 'פלג עליון', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'nubret_pump',
    name: 'Pump Training של Serge Nubret',
    athlete: 'Serge Nubret',
    era: '1970s · "The Black Panther"',
    split: '6 ימים · שריר ליום, ללא כישלון',
    frequency: 6,
    duration: '60-75 דק׳',
    level: 'advanced',
    goal: 'hypertrophy',
    philosophy: 'נפח גבוה של סטים וחזרות במשקל בינוני, מנוחה קצרה מאוד (30-60 ש׳), אף פעם לא לכישלון. פילוסופיה: השריר הופך למקסימלי דרך פאמפ תמידי, לא דרך שבירה עמוקה. Nubret לא אכל מוצקים ביום, רק בשר וקפה — ובכל זאת בנה את אחד הפיזיקים היפים בהיסטוריה.',
    attribution: 'שחזור מבוסס Golden Era interviews and Serge Nubret official material',
    sources: ['Muscle Guru — Serge Nubret documentary', 'Iron Man Magazine features (1975)'],
    addedOn: '2026-08-02',
    tags: ['פאמפ', 'מתקדם', 'נפח גבוה'],
    accent: '#c74050',
    sessions: [
      {
        name: 'Chest Day',
        exercises: [
          { name: 'לחיצת חזה שטוחה במוט', sets: 8, reps: 12, rest: 45 },
          { name: 'לחיצת חזה בשיפוע במוט', sets: 8, reps: 12, rest: 45 },
          { name: 'לחיצת חזה בשיפוע יורד', sets: 6, reps: 12, rest: 45 },
          { name: 'פליי במשקולות', sets: 6, reps: 15, rest: 45 },
          { name: 'פולאובר', sets: 6, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Back Day',
        exercises: [
          { name: 'הורדת פולי מוט', sets: 8, reps: 12, rest: 45 },
          { name: 'חתירה בכבל תחתון', sets: 8, reps: 12, rest: 45 },
          { name: 'חתירה במשקולת יחידה', sets: 6, reps: 12, rest: 45 },
          { name: 'מתח רחב', sets: 6, reps: 10, rest: 60 },
          { name: 'הייפראקסטנשן', sets: 4, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Legs Day',
        exercises: [
          { name: 'סקוואט', sets: 10, reps: 15, rest: 60 },
          { name: 'הארכת ברכיים', sets: 6, reps: 15, rest: 45 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 6, reps: 15, rest: 45 },
          { name: 'עליות עקבים', sets: 8, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Shoulders Day',
        exercises: [
          { name: 'לחיצת כתפיים מאחור', sets: 8, reps: 12, rest: 45 },
          { name: 'הרמות צד', sets: 6, reps: 15, rest: 45 },
          { name: 'הרמות קדמיות', sets: 6, reps: 15, rest: 45 },
          { name: 'פלאיס אחוריים', sets: 6, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Arms Day',
        exercises: [
          { name: 'כפיפת מרפקים במוט', sets: 8, reps: 12, rest: 45 },
          { name: 'כפיפת ריכוז', sets: 6, reps: 12, rest: 45 },
          { name: 'סקאל קראשר', sets: 8, reps: 12, rest: 45 },
          { name: 'פשיטת מרפקים בכבל', sets: 6, reps: 15, rest: 45 },
        ],
      },
      {
        name: 'Abs & Cardio',
        exercises: [
          { name: 'סיטאפ', sets: 5, reps: 30, rest: 30 },
          { name: 'הרמות רגליים בתלייה', sets: 5, reps: 20, rest: 30 },
          { name: 'קרנצ׳ בכבל', sets: 5, reps: 20, rest: 30 },
        ],
      },
    ],
    weeklyPlan: ['Chest Day', 'Back Day', 'Legs Day', 'Shoulders Day', 'Arms Day', 'Abs & Cardio', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cbum_classic',
    name: 'Classic Physique — Cbum Style',
    athlete: 'Chris Bumstead',
    era: '2019–present · 5× Classic Physique Olympia',
    split: '5 ימים · שריר ליום מודרני',
    frequency: 5,
    duration: '75-90 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    philosophy: 'קלאסי מודרני. שילוב של תרגילי בסיס כבדים בטווח 6-8 חזרות + עבודת מבודדים ב-10-15 חזרות. פוקוס על טכניקה, מתיחה מלאה בבטן העמוקה של השריר, ובקרה איטית בירידה. הכל בשירות פרופורציות נוסח Zane/Steve Reeves.',
    attribution: 'שחזור מבוסס וידאו של Cbum על YouTube וראיונות עם המאמן Iain Valliere',
    sources: ['Chris Bumstead YouTube channel', 'Muscle & Strength Cbum profile'],
    addedOn: '2026-08-02',
    tags: ['קלאסי מודרני', 'בינוני', 'אסתטיקה'],
    accent: '#c78f3a',
    sessions: [
      {
        name: 'Chest Day',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במשקולות', sets: 4, reps: '8-10', rest: 90 },
          { name: 'לחיצת חזה שטוחה במוט', sets: 4, reps: '6-8', rest: 90 },
          { name: 'פליי במכונה', sets: 3, reps: '12-15', rest: 60 },
          { name: 'מקבילים משוקללים', sets: 3, reps: '8-10', rest: 90 },
          { name: 'פליי בכבלים', sets: 3, reps: '15-20', rest: 45 },
        ],
      },
      {
        name: 'Back Day',
        exercises: [
          { name: 'מתח רחב', sets: 4, reps: '8-10', rest: 90 },
          { name: 'חתירה במוט T-Bar', sets: 4, reps: '8-10', rest: 90 },
          { name: 'הורדת פולי מוט צר', sets: 3, reps: '10-12', rest: 60 },
          { name: 'חתירה בכבל תחתון', sets: 3, reps: '10-12', rest: 60 },
          { name: 'פולאובר בכבל עומד', sets: 3, reps: '12-15', rest: 45 },
        ],
      },
      {
        name: 'Legs Day',
        exercises: [
          { name: 'סקוואט חזיתי', sets: 4, reps: '8-10', rest: 120 },
          { name: 'לג פרס', sets: 4, reps: '10-15', rest: 90 },
          { name: 'רומני דדליפט', sets: 4, reps: '8-10', rest: 90 },
          { name: 'הארכת ברכיים', sets: 4, reps: '12-15', rest: 60 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 4, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: 'Shoulders Day',
        exercises: [
          { name: 'לחיצת כתפיים במשקולות בישיבה', sets: 4, reps: '8-10', rest: 90 },
          { name: 'הרמות צד במכונה', sets: 4, reps: '12-15', rest: 45 },
          { name: 'פלאיס אחוריים בכבל', sets: 4, reps: '12-15', rest: 45 },
          { name: 'הרמות צד במשקולות סופרסט + הרמות קדמיות', sets: 3, reps: 12, rest: 60 },
        ],
      },
      {
        name: 'Arms Day',
        exercises: [
          { name: 'כפיפת מרפקים במוט', sets: 4, reps: '8-10', rest: 60 },
          { name: 'כפיפת פטיש', sets: 3, reps: '10-12', rest: 60 },
          { name: 'סקאל קראשר', sets: 4, reps: '8-10', rest: 60 },
          { name: 'פשיטת מרפקים בכבל', sets: 4, reps: '12-15', rest: 45 },
          { name: 'כפיפת ריכוז — סופרסט + פשיטת מרפקים מעל הראש', sets: 3, reps: 12, rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Chest Day', 'Back Day', 'Legs Day', 'Shoulders Day', 'Arms Day', 'מנוחה', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'heath_gift',
    name: 'The Gift — Phil Heath',
    athlete: 'Phil Heath',
    era: '2011–2017 · 7× Mr. Olympia',
    split: '5 ימים · שריר ליום עם נפח גבוה',
    frequency: 5,
    duration: '90-105 דק׳',
    level: 'advanced',
    goal: 'hypertrophy',
    philosophy: 'נפח גבוה של תרגילים מבודדים למקסום זרימת דם. שני תרגילי דחיפה כבדים ואז מספר תרגילי מכונה בזוויות שונות. Heath מיוחד ביכולת שלו למקד סופר-מדויק על שריר בודד.',
    attribution: 'שחזור מבוסס ראיונות של Heath עם Generation Iron ותצפיות מהאימונים',
    sources: ['Generation Iron 2 documentary (2017)', 'Phil Heath training videos on YouTube'],
    addedOn: '2026-08-02',
    tags: ['נפח גבוה', 'מתקדם', 'שריר ליום'],
    accent: '#a52a3a',
    sessions: [
      {
        name: 'Chest',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במוט', sets: 5, reps: '10-12', rest: 90 },
          { name: 'לחיצת חזה במשקולות בשיפוע יורד', sets: 4, reps: '10-12', rest: 60 },
          { name: 'לחיצת חזה במכונה שטוחה', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פליי בכבלים בשיפוע', sets: 4, reps: '12-15', rest: 45 },
          { name: 'פליי במכונה', sets: 3, reps: '15-20', rest: 45 },
        ],
      },
      {
        name: 'Back',
        exercises: [
          { name: 'מתח רחב + משקל', sets: 4, reps: '8-10', rest: 90 },
          { name: 'חתירה במוט', sets: 4, reps: '10-12', rest: 90 },
          { name: 'הורדת פולי מוט', sets: 4, reps: '10-12', rest: 60 },
          { name: 'חתירה במכונה', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פולאובר במכונה', sets: 3, reps: '12-15', rest: 45 },
        ],
      },
      {
        name: 'Legs',
        exercises: [
          { name: 'הארכת ברכיים חימום', sets: 4, reps: 15, rest: 45 },
          { name: 'סקוואט', sets: 5, reps: '8-10', rest: 120 },
          { name: 'לג פרס', sets: 5, reps: '10-12', rest: 90 },
          { name: 'הק סקוואט', sets: 4, reps: '10-12', rest: 90 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 5, reps: '10-12', rest: 60 },
          { name: 'רומני דדליפט', sets: 4, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: 'Shoulders',
        exercises: [
          { name: 'לחיצת כתפיים במשקולות', sets: 5, reps: '10-12', rest: 90 },
          { name: 'הרמות צד', sets: 5, reps: '12-15', rest: 45 },
          { name: 'הרמות צד בכבל', sets: 4, reps: '15-20', rest: 45 },
          { name: 'פלאיס אחוריים', sets: 5, reps: '12-15', rest: 45 },
          { name: 'שראגים', sets: 4, reps: '12-15', rest: 45 },
        ],
      },
      {
        name: 'Arms',
        exercises: [
          { name: 'כפיפת מרפקים במוט', sets: 4, reps: '10-12', rest: 60 },
          { name: 'כפיפת מרפקים בכבל', sets: 4, reps: '12-15', rest: 45 },
          { name: 'כפיפת פטיש', sets: 4, reps: '10-12', rest: 45 },
          { name: 'פשיטת מרפקים בכבל', sets: 4, reps: '12-15', rest: 45 },
          { name: 'סקאל קראשר', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פשיטת מרפקים מעל הראש בכבל', sets: 3, reps: '12-15', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'מנוחה', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'kai_back',
    name: 'Predator Back Attack',
    athlete: 'Kai Greene',
    era: '2010s · Mr. Olympia contender',
    split: 'יום גב אחד בשבוע במסגרת ספליט שריר-ליום (5 ימים)',
    frequency: 1,
    duration: '90 דק׳ (יום גב)',
    level: 'expert',
    goal: 'hypertrophy',
    philosophy: 'החיבור מוח-שריר כתורה. Kai מבצע כל חזרה כאילו זו החזרה הראשונה שהוא עושה בחייו, עם התכווצות מקסימלית ומודעות מלאה לזווית ולזרימת הדם. סטים מרובים על אותו שריר מזוויות שונות כדי לפתח עומק ורוחב יחד.',
    attribution: 'שחזור מבוסס Kai Greene training videos and interviews',
    sources: ['Kai Greene: The Redemption (2015)', 'Overtraining podcast interviews'],
    addedOn: '2026-08-02',
    tags: ['גב', 'אקספרט', 'מוח-שריר'],
    accent: '#c74050',
    sessions: [
      {
        name: 'Back Attack — Kai Style',
        exercises: [
          { name: 'מתח רחב חימום', sets: 3, reps: 10, rest: 45 },
          { name: 'הורדת פולי מוט קדימה', sets: 5, reps: '10-12', rest: 90, note: 'עצור בשיא ההתכווצות 2 שניות' },
          { name: 'חתירה במוט T-Bar', sets: 5, reps: '8-10', rest: 90 },
          { name: 'חתירה במשקולת יחידה', sets: 4, reps: '10-12', rest: 60, note: 'ריכוז מלא בלטיסימוס' },
          { name: 'חתירה במכונה סימולטור', sets: 4, reps: '10-12', rest: 60 },
          { name: 'פולאובר בכבל עומד', sets: 4, reps: '12-15', rest: 60 },
          { name: 'הורדת פולי צר', sets: 4, reps: '12-15', rest: 60 },
          { name: 'הייפראקסטנשן', sets: 3, reps: 20, rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Back Attack — Kai Style', 'חזה', 'כתפיים', 'רגליים', 'ידיים', 'מנוחה', 'מנוחה'],
  },

  // ═══════════════════════════════════════════════════════════════
  {
    id: 'derek_natural',
    name: 'More Plates More Dates — Natural Split',
    athlete: 'Derek (More Plates More Dates)',
    era: '2020s · Natural science-based training',
    split: '4 ימים · Upper/Lower כפול',
    frequency: 4,
    duration: '75 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    philosophy: 'בסיס מדעי לפי מטה-אנליזות של Brad Schoenfeld. 10-20 סטים אפקטיביים לשריר בשבוע, פאלר-דיפריסיאשן (2-4 חזרות מהכישלון), פרוגרסיה שבועית קטנה על משקל/חזרות. מיועד למי שמאמן טבעי — לא צריך את הנפח של הבודיבילדרים המקצועיים.',
    attribution: 'שחזור מבוסס ערוץ YouTube של Derek + מחקרי Schoenfeld על נפח והיפרטרופיה',
    sources: ['More Plates More Dates YouTube channel', 'Brad Schoenfeld — Science and Development of Muscle Hypertrophy'],
    addedOn: '2026-08-02',
    tags: ['טבעי', 'בינוני', 'מבוסס מחקר'],
    accent: '#c78f3a',
    sessions: [
      {
        name: 'Upper A (Strength focus)',
        exercises: [
          { name: 'לחיצת חזה שטוחה במוט', sets: 4, reps: '5-6', rest: 180, note: 'RIR 2' },
          { name: 'חתירה במוט', sets: 4, reps: '5-6', rest: 180 },
          { name: 'לחיצת כתפיים במוט בעמידה', sets: 3, reps: '6-8', rest: 120 },
          { name: 'מתח רחב + משקל', sets: 3, reps: '6-8', rest: 120 },
          { name: 'כפיפת מרפקים במוט', sets: 3, reps: '8-10', rest: 90 },
          { name: 'סקאל קראשר', sets: 3, reps: '8-10', rest: 90 },
        ],
      },
      {
        name: 'Lower A (Strength focus)',
        exercises: [
          { name: 'סקוואט', sets: 4, reps: '5-6', rest: 210 },
          { name: 'רומני דדליפט', sets: 4, reps: '6-8', rest: 180 },
          { name: 'לג פרס', sets: 3, reps: '10-12', rest: 120 },
          { name: 'כפיפת ברכיים בשכיבה', sets: 3, reps: '10-12', rest: 90 },
          { name: 'עליות עקבים בעמידה', sets: 4, reps: '10-15', rest: 90 },
          { name: 'פלאנק', sets: 3, reps: '45-60 שניות', rest: 60 },
        ],
      },
      {
        name: 'Upper B (Volume focus)',
        exercises: [
          { name: 'לחיצת חזה בשיפוע במשקולות', sets: 4, reps: '10-12', rest: 120 },
          { name: 'חתירה בכבל תחתון', sets: 4, reps: '10-12', rest: 120 },
          { name: 'הורדת פולי מוט', sets: 4, reps: '10-12', rest: 90 },
          { name: 'הרמות צד', sets: 4, reps: '12-15', rest: 60 },
          { name: 'פלאיס אחוריים', sets: 3, reps: '12-15', rest: 60 },
          { name: 'כפיפת מרפקים בכבל', sets: 3, reps: '12-15', rest: 60 },
          { name: 'פשיטת מרפקים בכבל', sets: 3, reps: '12-15', rest: 60 },
        ],
      },
      {
        name: 'Lower B (Volume focus)',
        exercises: [
          { name: 'סקוואט חזיתי', sets: 3, reps: '8-10', rest: 150 },
          { name: 'לג פרס', sets: 4, reps: '15-20', rest: 90 },
          { name: 'הארכת ברכיים', sets: 4, reps: '12-15', rest: 60 },
          { name: 'רומני דדליפט במשקולות', sets: 3, reps: '10-12', rest: 90 },
          { name: 'לאנג׳ הליכה', sets: 3, reps: '12 צעדים', rest: 90 },
          { name: 'עליות עקבים בישיבה', sets: 4, reps: '15-20', rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Upper A (Strength focus)', 'Lower A (Strength focus)', 'מנוחה', 'Upper B (Volume focus)', 'Lower B (Volume focus)', 'מנוחה', 'מנוחה'],
  },
]

export const LEGEND_BY_ID = Object.fromEntries(LEGEND_PROGRAMS.map(p => [p.id, p]))

// Filter helpers used by the browsing UI
export const LEGEND_TAGS = [...new Set(LEGEND_PROGRAMS.flatMap(p => p.tags))].sort()
export const LEGEND_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

// The next scheduled batch — used to nudge the maintainer / show
// upcoming programs to the user. Update this string when a new
// batch lands.
export const NEXT_UPDATE_TARGET = '2026-10-01'
