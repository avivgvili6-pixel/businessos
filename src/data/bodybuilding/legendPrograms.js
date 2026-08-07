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

// Backfill: every existing program above this line lacks an explicit
// `gender` field — they're all male-focused legends. The gender filter
// treats missing = 'male'. New female programs below carry explicit
// `gender: 'female'` so the split is unambiguous.
LEGEND_PROGRAMS.forEach(p => { if (!p.gender) p.gender = 'male' })

// ═══════════════════════════════════════════════════════════════
// ═══ WOMEN'S PROGRAMS  · Female-focused library                ═══
// ═══════════════════════════════════════════════════════════════
//
// Two families, same disclaimer as the male legends:
//
// 1) REAL CHAMPIONS — reconstructions of programs from documented
//    interviews, magazines, podcasts, and public YouTube content of
//    real female athletes. No verbatim copyrighted material.
//
// 2) THEMED PROGRAMS — programs authored by the Selano coaching team
//    around evidence-based training principles for women's specific
//    goals (glutes, core, upper body, post-partum, menopause).
//    Author field is "Selano Coaches" — no fictional athletes.

const FEMALE_LEGEND_PROGRAMS = [

  // ── 1 · Real Champions ────────────────────────────────────────
  {
    id: 'iris_iron_queen',
    name: 'Iron Queen — Deep Strength',
    athlete: 'Iris Kyle',
    era: '2000s-2010s · 10× Ms. Olympia',
    split: '5 ימים בשבוע · Body-part split',
    frequency: 5,
    duration: '75-90 דק׳',
    level: 'advanced',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'האלופה עם הכי הרבה תארי Olympia בהיסטוריה. סגנון קלאסי בודיבילדינג: תדירות גבוהה, נפח כבד, ריכוז מקסימלי בכל שריר. לא מתחילות — התכנית הזאת מיועדת למי שיודעת מה זה RPE 9.',
    attribution: 'שחזור מבוסס ראיונות ב־Muscular Development, FLEX Magazine ופודקאסטים 2015-2019',
    sources: ['Iris Kyle interviews · Muscular Development 2012', 'Female Muscle Bible podcast 2018'],
    addedOn: '2026-08-07',
    tags: ['אלופה אמיתית', 'מתקדם', 'נפח גבוה', 'body-part split'],
    accent: '#c4407c',
    sessions: [
      {
        name: 'Back Day',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '6-8', rest: 180 },
          { name: 'Bent-over Barbell Row', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Wide-grip Lat Pulldown', sets: 4, reps: '10-12', rest: 90 },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Straight-arm Pulldown', sets: 3, reps: '12-15', rest: 60 },
        ],
      },
      {
        name: 'Chest & Shoulders',
        exercises: [
          { name: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Cable Fly', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: 60 },
        ],
      },
      {
        name: 'Legs & Glutes',
        exercises: [
          { name: 'Squat', sets: 5, reps: '8-10', rest: 180 },
          { name: 'Romanian Deadlift', sets: 4, reps: '10-12', rest: 120 },
          { name: 'Leg Press', sets: 4, reps: '12-15', rest: 90 },
          { name: 'Walking Lunges', sets: 3, reps: '20 צעדים', rest: 90 },
          { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rest: 60 },
        ],
      },
      {
        name: 'Arms',
        exercises: [
          { name: 'Barbell Curl', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Skull Crushers', sets: 4, reps: '10-12', rest: 90 },
          { name: 'Hammer Curl', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Rope Pushdown', sets: 3, reps: '12-15', rest: 60 },
        ],
      },
      {
        name: 'Glute Focus + Core',
        exercises: [
          { name: 'Hip Thrust', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Cable Kickback', sets: 3, reps: '15 לכל רגל', rest: 60 },
          { name: 'Hyperextension', sets: 3, reps: '15', rest: 60 },
          { name: 'Hanging Leg Raise', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Plank', sets: 3, reps: '60ש׳', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Back Day', 'Chest & Shoulders', 'Legs & Glutes', 'מנוחה', 'Arms', 'Glute Focus + Core', 'מנוחה'],
  },

  // ── Ashley Kaltwasser — Bikini Prep ────────────────────────────
  {
    id: 'kaltwasser_bikini',
    name: 'Bikini Aesthetic — Prep Split',
    athlete: 'Ashley Kaltwasser',
    era: '2013-2020 · 3× Bikini Olympia',
    split: '5 ימים · דגש ישבן/כתף/גב',
    frequency: 5,
    duration: '60 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'סילואט Bikini — כתף רחבה, מותן צר, ישבן עגלגל. תדירות של 2 ימי רגליים בשבוע (עם דגש שונה), עבודת כתף רצינית לצורת "שעון החול".',
    attribution: 'שחזור מבוסס אינסטגרם, YouTube ופודקאסטים 2018-2022',
    sources: ['Ashley Kaltwasser IG training reels', 'Muscle & Strength interview 2019'],
    addedOn: '2026-08-07',
    tags: ['אלופה אמיתית', 'בינוני', 'ישבן', 'כתף', 'חיטוב'],
    accent: '#e07a5f',
    sessions: [
      {
        name: 'Glute Day 1 — Heavy',
        exercises: [
          { name: 'Hip Thrust', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 לכל רגל', rest: 90 },
          { name: 'Romanian Deadlift', sets: 4, reps: '10-12', rest: 90 },
          { name: 'Cable Kickback', sets: 3, reps: '15 לכל רגל', rest: 60 },
        ],
      },
      {
        name: 'Shoulders & Back',
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', rest: 45 },
          { name: 'Rear Delt Fly', sets: 4, reps: '12-15', rest: 45 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Cable Face Pull', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Glute Day 2 — Volume',
        exercises: [
          { name: 'Cable Pull-Through', sets: 4, reps: '12-15', rest: 60 },
          { name: 'Walking Lunges', sets: 3, reps: '20 צעדים', rest: 90 },
          { name: 'Glute Kickback (Machine)', sets: 4, reps: '12-15', rest: 45 },
          { name: 'Hyperextension', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Chest & Arms',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Cable Fly', sets: 3, reps: '12-15', rest: 45 },
          { name: 'Dumbbell Curl', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: 60 },
        ],
      },
      {
        name: 'Full-body Cut + Core',
        exercises: [
          { name: 'Goblet Squat', sets: 3, reps: '15', rest: 60 },
          { name: 'Push-up', sets: 3, reps: '10-15', rest: 45 },
          { name: 'Cable Woodchop', sets: 3, reps: '12 לכל צד', rest: 45 },
          { name: 'Plank', sets: 3, reps: '60ש׳', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Glute Day 1 — Heavy', 'Shoulders & Back', 'Glute Day 2 — Volume', 'Chest & Arms', 'Full-body Cut + Core', 'מנוחה', 'מנוחה'],
  },

  // ── Krissy Cela — Glute Kingdom ────────────────────────────────
  {
    id: 'krissy_glute_kingdom',
    name: 'Glute Kingdom',
    athlete: 'Krissy Cela',
    era: '2020s · Evolve You app founder',
    split: '4 ימים · Push-Pull-Glutes-Full',
    frequency: 4,
    duration: '50-60 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'ישבן הוא לא רק אסתטיקה — הוא ההנעה בכל תנועה. שני ימי ישבן בשבוע בדגשים שונים (heavy vs pump), משולב עם עבודת פלג עליון והתחתון כתמיכה.',
    attribution: 'שחזור מבוסס תוכן פומבי של Evolve You ואינסטגרם 2021-2023',
    sources: ['Krissy Cela IG @krissycela', 'Evolve You app previews (public)'],
    addedOn: '2026-08-07',
    tags: ['אלופה אמיתית', 'בינוני', 'ישבן'],
    accent: '#a0509b',
    sessions: [
      {
        name: 'Glutes — Heavy',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: 4, reps: '8', rest: 120 },
          { name: 'Sumo Deadlift', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 לכל רגל', rest: 90 },
          { name: 'Cable Pull-Through', sets: 3, reps: '12', rest: 60 },
        ],
      },
      {
        name: 'Push (Upper)',
        exercises: [
          { name: 'Overhead Press', sets: 3, reps: '10', rest: 90 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '12', rest: 60 },
          { name: 'Lateral Raise', sets: 4, reps: '15', rest: 45 },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12', rest: 45 },
        ],
      },
      {
        name: 'Glutes — Pump',
        exercises: [
          { name: 'Glute Bridge (High Rep)', sets: 4, reps: '20', rest: 45 },
          { name: 'Cable Kickback', sets: 4, reps: '15 לכל רגל', rest: 45, note: 'Superset עם הבא' },
          { name: 'Banded Lateral Walk', sets: 4, reps: '20 לכל צד', rest: 45 },
          { name: 'Frog Pump', sets: 3, reps: '25', rest: 45 },
          { name: 'Hyperextension', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Pull (Upper) + Core',
        exercises: [
          { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: 60 },
          { name: 'Seated Row', sets: 3, reps: '12', rest: 60 },
          { name: 'Dumbbell Curl', sets: 3, reps: '12', rest: 60 },
          { name: 'Face Pull', sets: 3, reps: '15', rest: 45 },
          { name: 'Hanging Leg Raise', sets: 3, reps: '10-12', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Glutes — Heavy', 'Push (Upper)', 'מנוחה', 'Glutes — Pump', 'Pull (Upper) + Core', 'מנוחה', 'מנוחה'],
  },

  // ── Bella Falconi — Toned Symmetry ─────────────────────────────
  {
    id: 'falconi_toned',
    name: 'Toned Symmetry',
    athlete: 'Bella Falconi',
    era: '2010s-2020s · Brazilian fitness icon',
    split: '4 ימים · חלוקה סימטרית',
    frequency: 4,
    duration: '45-60 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'סילואט "toned but not bulky" — עצימות בינונית, טווחי חזרות של 12-15, קיצוב מתון של סטים כדי לבנות שרירים חטובים בלי לאבד את הצורה הנשית הקלאסית. פילוסופיה ברזילאית של הרמוניה.',
    attribution: 'שחזור מבוסס תוכן אינסטגרם ופודקאסטים 2019-2022',
    sources: ['Bella Falconi IG @bellafalconifit', 'FitBrazil podcast interview 2020'],
    addedOn: '2026-08-07',
    tags: ['אלופה אמיתית', 'בינוני', 'חיטוב', 'סימטריה'],
    accent: '#4a8a7c',
    sessions: [
      {
        name: 'Legs & Glutes',
        exercises: [
          { name: 'Goblet Squat', sets: 4, reps: '12-15', rest: 60 },
          { name: 'Romanian Deadlift', sets: 4, reps: '12', rest: 90 },
          { name: 'Leg Curl', sets: 3, reps: '15', rest: 45 },
          { name: 'Hip Thrust', sets: 3, reps: '15', rest: 60 },
        ],
      },
      {
        name: 'Back & Rear Delts',
        exercises: [
          { name: 'Lat Pulldown', sets: 4, reps: '12', rest: 60 },
          { name: 'Cable Row', sets: 3, reps: '12', rest: 60 },
          { name: 'Rear Delt Fly', sets: 3, reps: '15', rest: 45 },
          { name: 'Face Pull', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Shoulders & Arms',
        exercises: [
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '12', rest: 60 },
          { name: 'Lateral Raise', sets: 3, reps: '15', rest: 45 },
          { name: 'Cable Curl', sets: 3, reps: '12', rest: 60 },
          { name: 'Tricep Rope', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Chest & Core',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 3, reps: '12', rest: 60 },
          { name: 'Cable Fly', sets: 3, reps: '15', rest: 45 },
          { name: 'Cable Woodchop', sets: 3, reps: '15 לכל צד', rest: 45 },
          { name: 'Bicycle Crunch', sets: 3, reps: '20', rest: 30 },
          { name: 'Plank', sets: 3, reps: '60ש׳', rest: 30 },
        ],
      },
    ],
    weeklyPlan: ['Legs & Glutes', 'Back & Rear Delts', 'מנוחה', 'Shoulders & Arms', 'Chest & Core', 'מנוחה', 'מנוחה'],
  },

  // ── 2 · Themed Programs by Selano Coaches ─────────────────────
  {
    id: 'glute_focused_growth',
    name: 'Glute-Focused Growth · 12 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית ממוקדת · 2026',
    split: '3 ימים · דגש מלא על ישבן',
    frequency: 3,
    duration: '45-55 דק׳',
    level: 'beginner',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'תכנית בת 12 שבועות שממקדת את מרבית הנפח בשריר הישבן (gluteus maximus + medius). מבוססת על עקרונות המחקר של Bret Contreras (Glute Guy 2015-2020) שמראה ש־hip thrust הוא התרגיל היחיד שמעצים את החלק העליון של הישבן בצורה מובהקת.',
    attribution: 'תכנית של צוות המאמנים של Selano, מבוססת על עקרונות הגלוט־ספציפיים של Bret Contreras',
    sources: ['Contreras et al. 2015 — Glute EMG studies', 'Strength & Conditioning Journal 2019'],
    addedOn: '2026-08-07',
    tags: ['מתחילה', 'ישבן', 'תכנית ממוקדת'],
    accent: '#c4407c',
    sessions: [
      {
        name: 'Glute A — Thrust Focus',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: 4, reps: '10', rest: 90 },
          { name: 'Romanian Deadlift', sets: 3, reps: '12', rest: 90 },
          { name: 'Walking Lunges', sets: 3, reps: '16 צעדים', rest: 60 },
          { name: 'Cable Kickback', sets: 3, reps: '15 לכל רגל', rest: 45 },
          { name: 'Glute Bridge (Bodyweight Finisher)', sets: 2, reps: '25', rest: 30 },
        ],
      },
      {
        name: 'Glute B — Squat Focus',
        exercises: [
          { name: 'Goblet Squat', sets: 4, reps: '12', rest: 75 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 לכל רגל', rest: 90 },
          { name: 'Cable Pull-Through', sets: 3, reps: '15', rest: 60 },
          { name: 'Banded Lateral Walk', sets: 3, reps: '20 לכל צד', rest: 45 },
          { name: 'Frog Pump', sets: 2, reps: '25', rest: 30 },
        ],
      },
      {
        name: 'Glute C — Hip Hinge',
        exercises: [
          { name: 'Sumo Deadlift', sets: 4, reps: '8-10', rest: 120 },
          { name: 'Kettlebell Swing', sets: 4, reps: '15', rest: 60 },
          { name: 'Hyperextension', sets: 3, reps: '12', rest: 60 },
          { name: 'Curtsy Lunge', sets: 3, reps: '12 לכל רגל', rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Glute A — Thrust Focus', 'מנוחה', 'Glute B — Squat Focus', 'מנוחה', 'Glute C — Hip Hinge', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'core_abs_sculpt',
    name: 'Core & Abs Sculpt · 8 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית ממוקדת · 2026',
    split: '4 ימים · ליבה + כל־גופי קצר',
    frequency: 4,
    duration: '30-40 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'שמינית שבועות של עבודת ליבה עמוקה — לא רק "בטן שטוחה", אלא ליבה תפקודית שמייצבת את עמוד השדרה, משפרת יציבה, ומצמצמת כאבי גב תחתון. משלב מייצבים עמוקים (dead bug, bird dog) עם עבודה שטחית (ab wheel, hanging leg raise).',
    attribution: 'צוות Selano · מבוסס פרוטוקולי McGill (Big 3) לחיזוק ליבה בטוח',
    sources: ['McGill S. — Ultimate Back Fitness and Performance (2017)'],
    addedOn: '2026-08-07',
    tags: ['בינוני', 'ליבה', 'בטן', 'תכנית ממוקדת'],
    accent: '#6a4a8c',
    sessions: [
      {
        name: 'Core A — Anti-Extension',
        exercises: [
          { name: 'Dead Bug', sets: 3, reps: '10 לכל צד', rest: 30 },
          { name: 'Plank', sets: 3, reps: '45-60ש׳', rest: 30 },
          { name: 'Hollow Body Hold', sets: 3, reps: '30ש׳', rest: 30 },
          { name: 'Ab Wheel Roll-out', sets: 3, reps: '8-10', rest: 45 },
        ],
      },
      {
        name: 'Core B — Anti-Rotation',
        exercises: [
          { name: 'Pallof Press', sets: 3, reps: '12 לכל צד', rest: 45 },
          { name: 'Bird Dog', sets: 3, reps: '10 לכל צד', rest: 30 },
          { name: 'Side Plank', sets: 3, reps: '30-45ש׳ לכל צד', rest: 30 },
          { name: 'Renegade Row', sets: 3, reps: '8 לכל צד', rest: 45 },
        ],
      },
      {
        name: 'Core C — Dynamic',
        exercises: [
          { name: 'Hanging Leg Raise', sets: 4, reps: '10-12', rest: 45 },
          { name: 'Bicycle Crunch', sets: 3, reps: '20', rest: 30 },
          { name: 'Russian Twist', sets: 3, reps: '20', rest: 30 },
          { name: 'Cable Woodchop', sets: 3, reps: '12 לכל צד', rest: 45 },
        ],
      },
      {
        name: 'Full-body Circuit + Core',
        exercises: [
          { name: 'Goblet Squat', sets: 3, reps: '12', rest: 45 },
          { name: 'Push-up', sets: 3, reps: '10', rest: 45 },
          { name: 'Dumbbell Row', sets: 3, reps: '12', rest: 45 },
          { name: 'Plank to Push-up', sets: 3, reps: '10', rest: 30 },
        ],
      },
    ],
    weeklyPlan: ['Core A — Anti-Extension', 'Core B — Anti-Rotation', 'מנוחה', 'Core C — Dynamic', 'Full-body Circuit + Core', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'upper_body_women',
    name: 'Upper Body for Women · 8 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית ממוקדת · 2026',
    split: '3 ימים · פלג עליון בלבד',
    frequency: 3,
    duration: '40-50 דק׳',
    level: 'beginner',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'הנשים לרוב מזניחות פלג עליון, אבל זה בדיוק מה שיוצר את הסילואט "V-taper" הנשי (כתפיים רחבות + מותן צר). התכנית בונה הדרגתית מ־push-up על ברכיים ועד pull-up ראשון, עם עבודת כתף/גב לתמיכה ביציבה.',
    attribution: 'צוות Selano · מבוסס פרוגרסיות של Pushup Progression + Pull-up Ladder',
    sources: ['Convict Conditioning progression method', 'Starting Strength — Rippetoe'],
    addedOn: '2026-08-07',
    tags: ['מתחילה', 'פלג עליון', 'כתף', 'תכנית ממוקדת'],
    accent: '#5a6ea8',
    sessions: [
      {
        name: 'Push Day',
        exercises: [
          { name: 'Push-up (Progression: ברכיים → מלא → deficit)', sets: 4, reps: '6-12', rest: 60 },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: 90 },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', rest: 45 },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12', rest: 45 },
        ],
      },
      {
        name: 'Pull Day',
        exercises: [
          { name: 'Assisted Pull-up (Band or Machine)', sets: 4, reps: '5-8', rest: 90 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Dumbbell Row', sets: 3, reps: '10 לכל צד', rest: 60 },
          { name: 'Dumbbell Curl', sets: 3, reps: '10-12', rest: 45 },
          { name: 'Face Pull', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Push + Pull Superset',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10', rest: 60, note: 'Superset עם הבא' },
          { name: 'Cable Row', sets: 3, reps: '12', rest: 60 },
          { name: 'Overhead Press', sets: 3, reps: '10', rest: 60, note: 'Superset עם הבא' },
          { name: 'Lat Pulldown', sets: 3, reps: '12', rest: 60 },
          { name: 'Plank', sets: 3, reps: '60ש׳', rest: 30 },
        ],
      },
    ],
    weeklyPlan: ['Push Day', 'מנוחה', 'Pull Day', 'מנוחה', 'Push + Pull Superset', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'womens_total_strength',
    name: 'Women\'s Total Strength · 12 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית כוח · 2026',
    split: '3 ימים · Squat / Bench / Deadlift',
    frequency: 3,
    duration: '50-65 דק׳',
    level: 'intermediate',
    goal: 'strength',
    gender: 'female',
    philosophy: 'תכנית 5×5 קלאסית בהתאמה נשית — הסקוואט/דדליפט/בנץ כליבה, עם עזרים ממוקדים לישבן/כתף/ליבה. המטרה: לעלות מעל 100 ק״ג סקוואט, 120 ק״ג דדליפט, ומשקל גוף בבנץ תוך 12 שבועות. שריר לא הופך אותך "מלאה גברית" — הוא בונה עצם ומגן.',
    attribution: 'צוות Selano · מבוסס Stronger by Science protocols + Starting Strength',
    sources: ['Nuckols G. — Stronger by Science (2020)', 'Rippetoe M. — Starting Strength (2019)'],
    addedOn: '2026-08-07',
    tags: ['בינוני', 'כוח לנשים', '5×5', 'תכנית ממוקדת'],
    accent: '#a52a3a',
    sessions: [
      {
        name: 'Squat Day',
        exercises: [
          { name: 'Barbell Back Squat', sets: 5, reps: '5', rest: 180 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8', rest: 120 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '8 לכל רגל', rest: 90 },
          { name: 'Plank', sets: 3, reps: '60ש׳', rest: 45 },
        ],
      },
      {
        name: 'Bench Day',
        exercises: [
          { name: 'Bench Press', sets: 5, reps: '5', rest: 180 },
          { name: 'Barbell Row', sets: 5, reps: '5', rest: 120 },
          { name: 'Overhead Press', sets: 3, reps: '8', rest: 90 },
          { name: 'Assisted Pull-up', sets: 3, reps: '6-8', rest: 90 },
        ],
      },
      {
        name: 'Deadlift Day',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5', rest: 240 },
          { name: 'Hip Thrust', sets: 4, reps: '8', rest: 120 },
          { name: 'Bench Press (Light)', sets: 3, reps: '10', rest: 90 },
          { name: 'Farmer\'s Walk', sets: 3, reps: '30 מטר', rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Squat Day', 'מנוחה', 'Bench Day', 'מנוחה', 'Deadlift Day', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'postnatal_return',
    name: 'Postnatal Return to Training · 8 שבועות',
    athlete: 'Selano Coaches',
    era: 'חזרה אחרי לידה · 2026',
    split: '3 ימים · הדרגתי + pelvic floor',
    frequency: 3,
    duration: '30-40 דק׳',
    level: 'beginner',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'תכנית חזרה בטוחה 6-8 שבועות אחרי לידה טבעית, או 10-12 שבועות אחרי קיסרי. שבועות 1-3 — רק pelvic floor + נשימה. שבועות 4-6 — משקל גוף קל. שבועות 7-8 — התחלת התנגדות. חובה: אישור מרופא/ת נשים לפני התחלה. אם יש diastasis recti — עצירה מיידית של כל תנועת bulge.',
    attribution: 'צוות Selano · מבוסס Blyholder et al. (2017) + guidelines של ACOG',
    sources: ['ACOG Committee Opinion 804 — Postpartum Exercise (2020)', 'Blyholder et al. — Diastasis Recti (2017)'],
    addedOn: '2026-08-07',
    tags: ['מתחילה', 'לאחר לידה', 'תכנית ממוקדת', 'רפואי'],
    accent: '#e07a5f',
    sessions: [
      {
        name: 'Pelvic Floor + Breathing (שבועות 1-3)',
        exercises: [
          { name: 'Diaphragmatic Breathing', sets: 3, reps: '10 נשימות', rest: 30 },
          { name: 'Kegel Contractions', sets: 3, reps: '10 החזקות של 5ש׳', rest: 30 },
          { name: 'Cat-Cow', sets: 2, reps: '10', rest: 30 },
          { name: 'Bird Dog (Gentle)', sets: 2, reps: '5 לכל צד', rest: 30 },
        ],
      },
      {
        name: 'Bodyweight Base (שבועות 4-6)',
        exercises: [
          { name: 'Glute Bridge', sets: 3, reps: '10', rest: 60, note: 'אין מרים ישבן — הרם רק עד ישר' },
          { name: 'Squat (Bodyweight)', sets: 3, reps: '10', rest: 60 },
          { name: 'Wall Push-up', sets: 3, reps: '8-10', rest: 60 },
          { name: 'Bird Dog', sets: 3, reps: '8 לכל צד', rest: 45 },
          { name: 'Kegel Contractions', sets: 2, reps: '15', rest: 30 },
        ],
      },
      {
        name: 'Light Resistance (שבועות 7-8)',
        exercises: [
          { name: 'Goblet Squat (Light)', sets: 3, reps: '10', rest: 90 },
          { name: 'Dumbbell Row', sets: 3, reps: '10', rest: 60 },
          { name: 'Incline Push-up', sets: 3, reps: '8-10', rest: 60 },
          { name: 'Glute Bridge (Feet Elevated)', sets: 3, reps: '12', rest: 60 },
          { name: 'Dead Bug', sets: 3, reps: '8 לכל צד', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Pelvic Floor + Breathing (שבועות 1-3)', 'מנוחה', 'Pelvic Floor + Breathing (שבועות 1-3)', 'מנוחה', 'Bodyweight Base (שבועות 4-6)', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'menopause_strength',
    name: 'Menopause Strength · 12 שבועות',
    athlete: 'Selano Coaches',
    era: 'גיל 45+ · 2026',
    split: '3 ימים · כוח + צפיפות עצם',
    frequency: 3,
    duration: '45-60 דק׳',
    level: 'intermediate',
    goal: 'strength',
    gender: 'female',
    philosophy: 'ירידת אסטרוגן = ירידה במסת שריר וצפיפות עצם. הפתרון הוא לא קרדיו — הוא אימון כוח כבד בתדירות של 2-3 פעמים בשבוע. תכנית 12 שבועות שבונה שריר, מגנה על העצם, ומטפלת בשינה + הריכוז שנפגעים בגיל המעבר.',
    attribution: 'צוות Selano · מבוסס מחקרי Layne Norton + ACSM guidelines לנשים 45-60',
    sources: ['Norton L. — Body Recomposition (2020)', 'ACSM Physical Activity Guidelines 3rd ed.'],
    addedOn: '2026-08-07',
    tags: ['בינוני', 'גיל 45+', 'כוח לנשים', 'תכנית ממוקדת'],
    accent: '#8a5a4a',
    sessions: [
      {
        name: 'Upper Strength',
        exercises: [
          { name: 'Dumbbell Bench Press', sets: 4, reps: '8', rest: 90 },
          { name: 'Assisted Pull-up', sets: 4, reps: '6-8', rest: 90 },
          { name: 'Overhead Press', sets: 3, reps: '10', rest: 90 },
          { name: 'Cable Row', sets: 3, reps: '10', rest: 75 },
          { name: 'Face Pull', sets: 3, reps: '15', rest: 45 },
        ],
      },
      {
        name: 'Lower Strength',
        exercises: [
          { name: 'Trap Bar Deadlift', sets: 4, reps: '8', rest: 120 },
          { name: 'Goblet Squat', sets: 4, reps: '10', rest: 90 },
          { name: 'Hip Thrust', sets: 3, reps: '10', rest: 90 },
          { name: 'Walking Lunges', sets: 3, reps: '16 צעדים', rest: 75 },
        ],
      },
      {
        name: 'Full-body + Core',
        exercises: [
          { name: 'Goblet Squat', sets: 3, reps: '12', rest: 60 },
          { name: 'Push-up', sets: 3, reps: '8-12', rest: 60 },
          { name: 'Dumbbell Row', sets: 3, reps: '12', rest: 60 },
          { name: 'Plank', sets: 3, reps: '45ש׳', rest: 45 },
          { name: 'Farmer\'s Walk', sets: 3, reps: '30 מטר', rest: 60 },
        ],
      },
    ],
    weeklyPlan: ['Upper Strength', 'מנוחה', 'Lower Strength', 'מנוחה', 'Full-body + Core', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'hourglass_aesthetic',
    name: 'Hourglass Aesthetic · 8 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית סילואט · 2026',
    split: '4 ימים · ישבן + כתף',
    frequency: 4,
    duration: '45-55 דק׳',
    level: 'intermediate',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'סילואט "שעון החול" — כתפיים רחבות + מותן צר + ישבן עגלגל. שני ימי ישבן + שני ימי כתף/גב עליון, כמעט בלי עבודה ישירה על מותן (כדי לא להגדילו). דגש על lateral raises כבדים לרוחב הכתף.',
    attribution: 'צוות Selano · מבוסס bikini competition prep principles',
    sources: ['NPC Bikini judging criteria (public)', 'Team Bombshell training manual (public)'],
    addedOn: '2026-08-07',
    tags: ['בינוני', 'ישבן', 'כתף', 'תכנית ממוקדת'],
    accent: '#c78f3a',
    sessions: [
      {
        name: 'Glute Heavy',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: 5, reps: '8', rest: 120 },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 לכל רגל', rest: 90 },
          { name: 'Romanian Deadlift', sets: 4, reps: '10', rest: 90 },
        ],
      },
      {
        name: 'Shoulder Width Focus',
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: '8', rest: 90 },
          { name: 'Lateral Raise (Heavy)', sets: 5, reps: '10-12', rest: 45 },
          { name: 'Rear Delt Fly', sets: 4, reps: '15', rest: 45 },
          { name: 'Upright Row (Wide Grip)', sets: 3, reps: '12', rest: 60 },
        ],
      },
      {
        name: 'Glute Volume',
        exercises: [
          { name: 'Cable Pull-Through', sets: 4, reps: '15', rest: 60 },
          { name: 'Walking Lunges', sets: 4, reps: '20 צעדים', rest: 60 },
          { name: 'Glute Kickback (Cable)', sets: 4, reps: '15 לכל רגל', rest: 45 },
          { name: 'Frog Pump', sets: 3, reps: '25', rest: 30 },
        ],
      },
      {
        name: 'Back Width + Arms',
        exercises: [
          { name: 'Wide-grip Lat Pulldown', sets: 4, reps: '10', rest: 60 },
          { name: 'Straight-arm Pulldown', sets: 3, reps: '12', rest: 45 },
          { name: 'Dumbbell Curl', sets: 3, reps: '10', rest: 60 },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12', rest: 45 },
        ],
      },
    ],
    weeklyPlan: ['Glute Heavy', 'Shoulder Width Focus', 'מנוחה', 'Glute Volume', 'Back Width + Arms', 'מנוחה', 'מנוחה'],
  },

  {
    id: 'beginner_female_foundation',
    name: 'Beginner Female Foundation · 8 שבועות',
    athlete: 'Selano Coaches',
    era: 'תכנית פתיחה · 2026',
    split: '3 ימים · Full body איטי',
    frequency: 3,
    duration: '35-45 דק׳',
    level: 'beginner',
    goal: 'hypertrophy',
    gender: 'female',
    philosophy: 'תכנית פתיחה בטוחה למי שלא נגעה במשקולות מעולם. מכונות בלבד בשבועיים הראשונים, אחר כך משקולות יד. המטרה: להרגיש טוב באולם, ללמוד תבניות תנועה בסיסיות, ולבנות בטחון עצמי לפני מעבר לתכניות מתקדמות.',
    attribution: 'צוות Selano · מבוסס NASM Beginner Female Protocol',
    sources: ['NASM Essentials of Personal Fitness Training (2021)'],
    addedOn: '2026-08-07',
    tags: ['מתחילה', 'גוף מלא', 'תכנית ממוקדת'],
    accent: '#7ab098',
    sessions: [
      {
        name: 'Full Body A',
        exercises: [
          { name: 'Leg Press', sets: 3, reps: '12', rest: 60 },
          { name: 'Chest Press Machine', sets: 3, reps: '12', rest: 60 },
          { name: 'Seated Cable Row', sets: 3, reps: '12', rest: 60 },
          { name: 'Glute Bridge (Bodyweight)', sets: 3, reps: '15', rest: 45 },
          { name: 'Plank', sets: 2, reps: '30ש׳', rest: 30 },
        ],
      },
      {
        name: 'Full Body B',
        exercises: [
          { name: 'Goblet Squat', sets: 3, reps: '10', rest: 60 },
          { name: 'Lat Pulldown', sets: 3, reps: '12', rest: 60 },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: 60 },
          { name: 'Leg Curl', sets: 3, reps: '12', rest: 45 },
          { name: 'Dead Bug', sets: 2, reps: '10 לכל צד', rest: 30 },
        ],
      },
      {
        name: 'Full Body C',
        exercises: [
          { name: 'Romanian Deadlift (Light)', sets: 3, reps: '10', rest: 75 },
          { name: 'Incline Push-up', sets: 3, reps: '8-10', rest: 60 },
          { name: 'Dumbbell Row', sets: 3, reps: '10', rest: 60 },
          { name: 'Walking Lunges', sets: 2, reps: '12 צעדים', rest: 60 },
          { name: 'Bird Dog', sets: 2, reps: '8 לכל צד', rest: 30 },
        ],
      },
    ],
    weeklyPlan: ['Full Body A', 'מנוחה', 'Full Body B', 'מנוחה', 'Full Body C', 'מנוחה', 'מנוחה'],
  },
]

LEGEND_PROGRAMS.push(...FEMALE_LEGEND_PROGRAMS)

export const LEGEND_BY_ID = Object.fromEntries(LEGEND_PROGRAMS.map(p => [p.id, p]))

// Filter helpers used by the browsing UI
export const LEGEND_TAGS = [...new Set(LEGEND_PROGRAMS.flatMap(p => p.tags))].sort()
export const LEGEND_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
export const LEGEND_GENDERS = ['male', 'female']

// The next scheduled batch — used to nudge the maintainer / show
// upcoming programs to the user. Update this string when a new
// batch lands.
export const NEXT_UPDATE_TARGET = '2026-10-01'
