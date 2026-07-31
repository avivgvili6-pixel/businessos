// per 100g. `barcode` is a demo EAN-13 for on-device lookup.
export const foods = [
  { id:'chicken_breast', name:'חזה עוף מבושל', kcal:165, p:31, c:0, f:3.6, cat:'חלבון', barcode:'7290000000101' },
  { id:'salmon', name:'סלמון אפוי', kcal:206, p:22, c:0, f:12, cat:'חלבון' },
  { id:'tuna', name:'טונה במים', kcal:116, p:26, c:0, f:1, cat:'חלבון' },
  { id:'egg', name:'ביצה שלמה', kcal:143, p:13, c:1.1, f:9.5, cat:'חלבון' },
  { id:'tofu', name:'טופו', kcal:76, p:8, c:1.9, f:4.8, cat:'חלבון' },
  { id:'greek_yogurt', name:'יוגורט יווני 2%', kcal:73, p:10, c:3.6, f:1.9, cat:'חלבון', barcode:'7290000000200' },
  { id:'cottage', name:'קוטג׳ 5%', kcal:98, p:11, c:3.4, f:5, cat:'חלבון', barcode:'7290000000217' },
  { id:'whey', name:'אבקת חלבון (מנה 30ג)', kcal:120, p:24, c:3, f:1, cat:'חלבון', barcode:'7290000000224' },
  { id:'rice', name:'אורז לבן מבושל', kcal:130, p:2.7, c:28, f:0.3, cat:'פחמימה' },
  { id:'rice_brown', name:'אורז מלא מבושל', kcal:112, p:2.6, c:23, f:0.9, cat:'פחמימה' },
  { id:'oats', name:'שיבולת שועל יבשה', kcal:389, p:16.9, c:66, f:6.9, cat:'פחמימה', barcode:'7290000000305' },
  { id:'sweet_potato', name:'בטטה אפויה', kcal:90, p:2, c:21, f:0.1, cat:'פחמימה' },
  { id:'pasta', name:'פסטה מבושלת', kcal:158, p:5.8, c:31, f:0.9, cat:'פחמימה' },
  { id:'bread_whole', name:'לחם מחמצת מלא', kcal:247, p:9, c:41, f:3.4, cat:'פחמימה', barcode:'7290000000411' },
  { id:'lentils', name:'עדשים מבושלות', kcal:116, p:9, c:20, f:0.4, cat:'קטניה' },
  { id:'chickpea', name:'חומוס מבושל', kcal:164, p:8.9, c:27, f:2.6, cat:'קטניה' },
  { id:'avocado', name:'אבוקדו', kcal:160, p:2, c:9, f:15, cat:'שומן' },
  { id:'olive_oil', name:'שמן זית (כף)', kcal:120, p:0, c:0, f:14, cat:'שומן' },
  { id:'almond', name:'שקדים', kcal:579, p:21, c:22, f:50, cat:'שומן' },
  { id:'walnut', name:'אגוזי מלך', kcal:654, p:15, c:14, f:65, cat:'שומן' },
  { id:'peanut_butter', name:'חמאת בוטנים', kcal:588, p:25, c:20, f:50, cat:'שומן', barcode:'7290000000602' },
  { id:'broccoli', name:'ברוקולי מאודה', kcal:35, p:2.4, c:7, f:0.4, cat:'ירק' },
  { id:'cucumber', name:'מלפפון', kcal:15, p:0.7, c:3.6, f:0.1, cat:'ירק' },
  { id:'tomato', name:'עגבנייה', kcal:18, p:0.9, c:3.9, f:0.2, cat:'ירק' },
  { id:'apple', name:'תפוח', kcal:52, p:0.3, c:14, f:0.2, cat:'פרי' },
  { id:'banana', name:'בננה', kcal:89, p:1.1, c:23, f:0.3, cat:'פרי' },
  { id:'berries', name:'פירות יער', kcal:57, p:0.7, c:14, f:0.3, cat:'פרי' },
  { id:'dark_choc', name:'שוקולד מריר 70%', kcal:598, p:7.8, c:46, f:43, cat:'קינוח', barcode:'7290000000701' },
]

// portion size hints (grams) for common serving units
export const portionSizes = {
  'כף':      15,
  'כפית':    5,
  'כוס':     240,
  'חצי כוס': 120,
  'פרוסה':   30,
  'ביצה':    50,
  'פרי בינוני': 150,
  'מנה קטנה':  100,
  'מנה בינונית': 200,
  'מנה גדולה': 300,
}

// OpenFoodFacts API lookup - free, no key needed
// Returns { name, kcal, p, c, f, cat, barcode } or null
export async function lookupBarcode(barcode) {
  // First check local db
  const local = foods.find(f => f.barcode === barcode)
  if (local) return { ...local, source: 'local' }

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1) return null
    const p = data.product || {}
    const n = p.nutriments || {}
    return {
      id: 'off_' + barcode,
      name: p.product_name_he || p.product_name || `מוצר ${barcode}`,
      kcal: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || (n.energy_100g ? n.energy_100g / 4.184 : 0)) || 0,
      p:    Math.round((n.proteins_100g || 0) * 10) / 10,
      c:    Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      f:    Math.round((n.fat_100g || 0) * 10) / 10,
      cat:  p.categories_hierarchy?.[0]?.replace(/^en:/, '') || 'סרוק',
      barcode,
      brand: p.brands || '',
      image: p.image_front_thumb_url || p.image_thumb_url || null,
      source: 'openfoodfacts',
    }
  } catch { return null }
}

