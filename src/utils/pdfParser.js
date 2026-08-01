// PDF → structured workout plan parser.
// Uses pdfjs-dist to extract text; regex/heuristics turn it into
// sessions[] × exercises[]. Also accepts raw text (paste flow).
//
// pdf.js is lazy-loaded (~500KB) so it only downloads when the user
// actually opens the PDF import flow.

let _pdfjsPromise = null
async function getPdfjs() {
  if (!_pdfjsPromise) {
    _pdfjsPromise = (async () => {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      // Prefer a real Worker (module-type) so mobile Safari + Chromium behave
      // identically. Fall back to disableWorker if the browser rejects it.
      try {
        const workerUrl = new URL(
          'pdfjs-dist/legacy/build/pdf.worker.mjs',
          import.meta.url,
        )
        pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(workerUrl, { type: 'module' })
      } catch {
        try {
          const workerModule = await import('pdfjs-dist/legacy/build/pdf.worker.mjs?url')
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default
        } catch {
          // last resort — run inline (slower, but works when workers are blocked)
          pdfjsLib.GlobalWorkerOptions.workerSrc = ''
        }
      }
      return pdfjsLib
    })()
  }
  return _pdfjsPromise
}

// ─── Extraction ────────────────────────────────────────
// Throws typed errors so the UI can show a specific message:
//   err.code === 'password'   → PDF is password-protected
//   err.code === 'invalid'    → not a real PDF / corrupt
//   err.code === 'empty'      → PDF has zero pages
//   err.code === 'scanned'    → PDF has pages but no text layer
//   err.code === 'worker'     → pdf.js worker refused to start
export async function extractTextFromPDF(file) {
  let pdfjsLib
  try {
    pdfjsLib = await getPdfjs()
  } catch (err) {
    const e = new Error('pdf.js failed to load: ' + (err?.message || err))
    e.code = 'worker'
    throw e
  }

  let arrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch (err) {
    const e = new Error('Failed to read file bytes: ' + (err?.message || err))
    e.code = 'invalid'
    throw e
  }

  let pdf
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise
  } catch (err) {
    const name = err?.name || ''
    const msg = String(err?.message || err)
    const e = new Error(msg)
    if (name === 'PasswordException' || /password/i.test(msg)) e.code = 'password'
    else if (name === 'InvalidPDFException' || /invalid|structure|missing/i.test(msg)) e.code = 'invalid'
    else e.code = 'invalid'
    throw e
  }

  if (!pdf || !pdf.numPages) {
    const e = new Error('PDF has no pages')
    e.code = 'empty'
    throw e
  }

  const out = []
  let totalTextChars = 0
  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const lines = groupItemsIntoLines(content.items)
      for (const l of lines) totalTextChars += l.length
      out.push(...lines)
    } catch (err) {
      // one page failing shouldn't kill the whole doc
      console.warn(`[pdf] page ${i} failed:`, err)
    }
  }

  if (totalTextChars < 20) {
    const e = new Error('PDF appears to contain no extractable text')
    e.code = 'scanned'
    throw e
  }

  return out.join('\n')
}

function groupItemsIntoLines(items) {
  if (!items.length) return []
  const sorted = [...items].sort((a, b) => (b.transform[5] - a.transform[5]) || (a.transform[4] - b.transform[4]))
  const lines = []
  let currentY = null
  let currentLine = []
  const TOLERANCE = 3

  for (const item of sorted) {
    const y = item.transform[5]
    if (currentY === null || Math.abs(y - currentY) <= TOLERANCE) {
      currentLine.push(item)
      currentY = y
    } else {
      if (currentLine.length) {
        // Sort within-line by x (RTL: right → left, so x descending)
        currentLine.sort((a, b) => b.transform[4] - a.transform[4])
        lines.push(currentLine.map(i => i.str).join(' ').trim())
      }
      currentLine = [item]
      currentY = y
    }
  }
  if (currentLine.length) {
    currentLine.sort((a, b) => b.transform[4] - a.transform[4])
    lines.push(currentLine.map(i => i.str).join(' ').trim())
  }
  return lines.filter(l => l.length > 0)
}

// ─── Parsing ────────────────────────────────────────
export function parseWorkoutText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const sessions = []
  let currentSession = null

  for (const line of lines) {
    // Skip obvious non-workout lines
    if (isNoisyLine(line)) continue

    // Session header?
    const sessionMatch = detectSessionHeader(line)
    if (sessionMatch) {
      if (currentSession && currentSession.exercises.length) sessions.push(currentSession)
      currentSession = { name: sessionMatch, exercises: [], rawLine: line }
      continue
    }

    // Exercise?
    const ex = parseExerciseLine(line)
    if (ex) {
      if (!currentSession) currentSession = { name: 'Workout 1', exercises: [] }
      currentSession.exercises.push(ex)
    }
  }
  if (currentSession && currentSession.exercises.length) sessions.push(currentSession)

  // Fallback if no sessions detected but exercises exist - lump into one
  if (!sessions.length) {
    const exs = lines.map(parseExerciseLine).filter(Boolean)
    if (exs.length) return [{ name: 'Imported plan', exercises: exs }]
  }

  return sessions
}

// Noise filters - page numbers, dates, disclaimers
function isNoisyLine(line) {
  if (line.length < 3) return true
  if (/^page \d+/i.test(line)) return true
  if (/^\d+\/\d+$/.test(line)) return true
  if (/©|copyright|all rights/i.test(line)) return true
  return false
}

// Session headers: "יום א'", "אימון 1/A/יום ראשון", "Day 1", "Workout A", "Push Day"
// Lines that ALSO contain sets×reps (e.g. "Back squat 5x5") are exercises,
// not headers, so we skip detection in that case.
function detectSessionHeader(line) {
  // Any sets×reps pattern → this is an exercise line, not a header
  if (/\d+\s*[x×X]\s*\d+/.test(line)) return null
  if (/\d+\s*sets?\s+(?:of\s+)?\d+/i.test(line)) return null
  if (/\d+\s*סטים?/.test(line)) return null

  const patterns = [
    /^(יום\s+[א-ז]['׳]?|יום\s+\d+|אימון\s+\d+|אימון\s+[A-Za-z])/,
    /^(Day\s+\d+|Day\s+[A-Za-z]|Workout\s+\d+|Workout\s+[A-Za-z])/i,
    /^(דחיפה|משיכה|רגליים|חזה|גב|כתפיים|ידיים|עליון|תחתון|גוף\s+מלא)(\s|$|:)/,
    /^(Push|Pull|Legs|Upper|Lower|Full\s*Body|Chest|Back)(\s|$|:)/i,
    /^(HIIT|MetCon|WOD|Cardio|Recovery)(\s|$|:)/i,
  ]
  for (const p of patterns) {
    const m = line.match(p)
    if (m) {
      return line.length < 80 ? line.replace(/[:\-–—]+$/, '').trim() : m[0].trim()
    }
  }
  return null
}

// Exercise line patterns:
//   "סקוואט 5x5"                            → sets=5 reps=5
//   "סקוואט 5×5 @ 75%"                       → +intensity=0.75
//   "סקוואט 5×5 100kg" / "100 ק"ג"          → +weight=100
//   "3 sets of 10 pushups"                   → sets=3 reps=10
//   "לחיצת חזה - 4 × 8"                     → sets=4 reps=8
//   "Barbell squat: 5 x 5 @ 80% (100kg)"    → full parse
export function parseExerciseLine(line) {
  if (!line || line.length < 3) return null

  // Common sets × reps patterns
  const setsRepsPatterns = [
    /(\d+)\s*[x×X]\s*(\d+)/,          // 5x5 or 5×5
    /(\d+)\s*sets?\s*(?:of\s*)?(\d+)/i,
    /(\d+)\s*סטים?\s*[×xX]?\s*(\d+)\s*חזרות/,
    /(\d+)\s*סטים?\s*של?\s*(\d+)/,
  ]

  let sets = null, reps = null, matchIdx = -1, matchLen = 0
  for (const p of setsRepsPatterns) {
    const m = line.match(p)
    if (m) {
      sets = parseInt(m[1])
      reps = parseInt(m[2])
      matchIdx = m.index
      matchLen = m[0].length
      break
    }
  }
  if (!sets || !reps) return null // if no sets×reps, treat as non-exercise

  // Extract intensity (@ 75% / 75% 1RM / at 80%)
  let intensity = null
  const intMatch = line.match(/@?\s*(\d{2,3})\s*%\s*(?:1RM)?/)
  if (intMatch) intensity = parseInt(intMatch[1]) / 100

  // Extract weight (100kg / 100 ק"ג / 100 kg)
  let weight = null
  const weightMatch = line.match(/(\d{1,3}(?:\.\d)?)\s*(?:kg|ק["״]?ג|kilos?|כ["״]?ג)/i)
  if (weightMatch) weight = parseFloat(weightMatch[1])

  // Exercise name = the line with sets/reps/intensity/weight stripped out
  let name = line
    .replace(/(\d+)\s*[x×X]\s*(\d+)/, '')
    .replace(/(\d+)\s*sets?\s*(?:of\s*)?(\d+)/i, '')
    .replace(/(\d+)\s*סטים?\s*[×xX]?\s*(\d+)\s*חזרות/, '')
    .replace(/(\d+)\s*סטים?\s*של?\s*(\d+)/, '')
    .replace(/@?\s*\d{2,3}\s*%\s*(?:1RM)?/, '')
    .replace(/\d{1,3}(?:\.\d)?\s*(?:kg|ק["״]?ג|kilos?|כ["״]?ג)/i, '')
    .replace(/[()\-–—:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!name || name.length < 2) return null
  // If name is only numbers/symbols, reject
  if (/^\W*\d+\W*$/.test(name)) return null

  return { name, sets, reps, intensity, weight }
}
