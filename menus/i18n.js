// menus/i18n.js
// MyRestaurantAI — traduzioni italiano / inglese

const translations = {
  it: {
    loading:          'Caricamento menu...',
    notFound:         'Ristorante non trovato.',
    noMenu:           'Il menu di oggi sarà disponibile a breve.',
    call:             'Chiama',
    whatsapp:         'WhatsApp',
    directions:       'Indicazioni',
    allergenWarning:  'Per allergie o intolleranze informa sempre il personale.',
    poweredBy:        'Powered by MyRestaurantAI',
    unavailable:      'Non disponibile',
    lastUpdated:      'Ultimo aggiornamento',
    openingHours:     'Orari',
    badges: {
      new:            'Novità',
      recommended:    'Consigliato',
      lastPortions:   'Ultime porzioni',
      soldOut:        'Esaurito',
      dailySpecial:   'Speciale del giorno',
      homemade:       'Fatto in casa',
      vegetarian:     'Vegetariano',
      glutenFree:     'Senza glutine',
      spicy:          'Piccante',
    },
    allergens: {
      gluten:         'Glutine',
      crustaceans:    'Crostacei',
      eggs:           'Uova',
      fish:           'Pesce',
      peanuts:        'Arachidi',
      soy:            'Soia',
      milk:           'Latte',
      nuts:           'Frutta a guscio',
      celery:         'Sedano',
      mustard:        'Senape',
      sesame:         'Sesamo',
      sulphites:      'Solfiti',
      lupin:          'Lupini',
      molluscs:       'Molluschi',
    },
  },
  en: {
    loading:          'Loading menu...',
    notFound:         'Restaurant not found.',
    noMenu:           "Today's menu will be available shortly.",
    call:             'Call',
    whatsapp:         'WhatsApp',
    directions:       'Directions',
    allergenWarning:  'Please inform the staff of any allergies or intolerances.',
    poweredBy:        'Powered by MyRestaurantAI',
    unavailable:      'Unavailable',
    lastUpdated:      'Last updated',
    openingHours:     'Opening hours',
    badges: {
      new:            'New',
      recommended:    'Recommended',
      lastPortions:   'Last portions',
      soldOut:        'Sold out',
      dailySpecial:   'Daily special',
      homemade:       'Homemade',
      vegetarian:     'Vegetarian',
      glutenFree:     'Gluten free',
      spicy:          'Spicy',
    },
    allergens: {
      gluten:         'Gluten',
      crustaceans:    'Crustaceans',
      eggs:           'Eggs',
      fish:           'Fish',
      peanuts:        'Peanuts',
      soy:            'Soy',
      milk:           'Milk',
      nuts:           'Tree nuts',
      celery:         'Celery',
      mustard:        'Mustard',
      sesame:         'Sesame',
      sulphites:      'Sulphites',
      lupin:          'Lupin',
      molluscs:       'Molluscs',
    },
  },
};

export function getLang() {
  const browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  return browser === 'en' ? 'en' : 'it';
}

export function t(key, lang) {
  const keys = key.split('.');
  let val = translations[lang] || translations.it;
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) break;
  }
  return val || key;
}
