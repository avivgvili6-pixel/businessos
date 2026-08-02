// Recipe photo resolver.
//
// We don't ship photos with the codebase (bandwidth + licensing).
// Instead we use Unsplash Source — a public, no-key endpoint that
// returns a themed photo for any query. Same query → same photo
// (deterministic by ?sig=hash), so recipe cards don't reshuffle
// between renders.
//
// Fallback: procedural gradient tinted by the recipe tag when the
// image fails to load (offline, adblock, etc).

const UNSPLASH = 'https://source.unsplash.com/600x400'

// Recipe id / tag → search query. We use the recipe id first (most
// specific), then fall back to tag mapping.
const ID_QUERIES = {
  // Breakfast
  oatmeal_bowl:        'oatmeal,breakfast,bowl',
  omelet_veggie:       'omelet,eggs,vegetables',
  shakshuka:           'shakshuka,eggs,tomato',
  greek_yogurt_parfait:'yogurt,parfait,berries,granola',
  avocado_toast:       'avocado,toast,egg',
  smoothie_bowl:       'smoothie,bowl,berries',
  protein_pancakes:    'pancakes,healthy,protein',
  chia_pudding:        'chia,pudding,berries',
  scrambled_eggs:      'scrambled,eggs,breakfast',
  cottage_bowl:        'cottage,cheese,fruit,bowl',
  // Lunch
  chicken_bowl:        'chicken,rice,vegetables,bowl',
  quinoa_salad:        'quinoa,salad,vegetables',
  tuna_salad:          'tuna,salad,plate',
  chicken_wrap:        'chicken,wrap,tortilla',
  turkey_bowl:         'turkey,rice,healthy',
  pasta_bolognese:     'pasta,bolognese,plate',
  poke_bowl:           'poke,bowl,salmon,rice',
  tofu_stir_fry:       'tofu,stirfry,vegetables',
  lentil_soup:         'lentil,soup,bowl',
  grilled_veg_bowl:    'grilled,vegetables,bowl',
  chicken_teriyaki:    'chicken,teriyaki,rice',
  falafel_salad:       'falafel,salad,pita',
  // Dinner
  salmon_veg:          'salmon,vegetables,plate',
  chicken_breast:      'chicken,breast,grilled,vegetables',
  cod_fish:            'cod,fish,plate,healthy',
  beef_stir_fry:       'beef,stirfry,vegetables',
  turkey_meatballs:    'meatballs,turkey,plate',
  steak_veg:           'steak,vegetables,plate',
  shrimp_pasta:        'shrimp,pasta,plate',
  chicken_thighs:      'chicken,thighs,roasted',
  fish_tacos:          'fish,tacos,plate',
  stuffed_peppers:     'stuffed,peppers,dinner',
  // Snacks
  protein_shake:       'protein,shake,glass',
  energy_balls:        'energy,balls,dates,nuts',
  hummus_veg:          'hummus,vegetables,plate',
  apple_pb:            'apple,peanut,butter',
  cottage_crackers:    'cottage,cheese,crackers',
  tuna_crackers:       'tuna,crackers,snack',
  nuts_mix:            'mixed,nuts,bowl',
  greek_yogurt_honey:  'greek,yogurt,honey',
  edamame:             'edamame,beans,bowl',
  rice_cakes:          'rice,cake,peanut,butter',
  banana_pb:           'banana,peanut,butter',
  fruit_bowl:          'fruit,bowl,healthy',
  boiled_eggs:         'boiled,eggs,snack',
}

const TAG_QUERIES = {
  'ארוחת בוקר':  'healthy,breakfast',
  'ארוחת צהריים': 'lunch,healthy,bowl',
  'ארוחת ערב':   'dinner,plate,healthy',
  'נשנוש':       'snack,healthy',
  'חלבון גבוה':  'protein,healthy,plate',
  'דל פחמימה':   'lowcarb,vegetables,plate',
  'צמחוני':      'vegetarian,plate,healthy',
  'טבעוני':      'vegan,plate,healthy',
  'ללא גלוטן':   'glutenfree,healthy,plate',
  'מהיר':        'quick,meal,healthy',
  'בוקר':        'healthy,breakfast',
  'צהריים':      'lunch,healthy',
  'ערב':         'dinner,plate',
}

// Deterministic photo URL for a recipe.
export function recipePhotoUrl(recipe) {
  if (!recipe) return null
  const idQuery = ID_QUERIES[recipe.id]
  const tagQuery = (recipe.tags || []).map(tg => TAG_QUERIES[tg]).find(Boolean)
  const query = idQuery || tagQuery || 'healthy,meal,plate'
  // sig makes Unsplash return the same photo for the same query rather
  // than random each request.
  const sig = hash(recipe.id || recipe.name || query)
  return `${UNSPLASH}/?${encodeURIComponent(query)}&sig=${sig}`
}

// A deterministic color gradient for the fallback state when the
// photo doesn't load.
export function recipeFallbackGradient(recipe) {
  const seed = hash(recipe?.id || recipe?.name || 'default')
  const hue = seed % 360
  return `linear-gradient(135deg, hsl(${hue} 40% 25%) 0%, hsl(${(hue + 30) % 360} 30% 18%) 100%)`
}

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
