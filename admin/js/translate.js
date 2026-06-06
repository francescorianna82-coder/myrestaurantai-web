// admin/js/translate.js
// MyRestaurantAI — traduzione automatica via MyMemory API

const LANGS = ['en', 'fr', 'de', 'es', 'ru', 'zh', 'ja', 'ko'];
const EMAIL  = 'info@myrestaurantai.com';

async function translateText(text, targetLang) {
  if (!text || !text.trim()) return '';
  const pair = `it|${targetLang}`;
  const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}&de=${EMAIL}`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    return text;
  } catch (e) {
    console.warn('Traduzione fallita per', targetLang, e);
    return text;
  }
}

export async function translateDish(name, description) {
  const results = { name: {}, description: {} };
  await Promise.all(LANGS.map(async lang => {
    const [n, d] = await Promise.all([
      translateText(name, lang),
      translateText(description, lang),
    ]);
    results.name[lang]        = n;
    results.description[lang] = d;
  }));
  return results;
}

export async function translateCategory(name) {
  const results = {};
  await Promise.all(LANGS.map(async lang => {
    results[lang] = await translateText(name, lang);
  }));
  return results;
}

export async function translateRestaurantInfo(tagline, description, cuisineType) {
  const results = { tagline: {}, description: {}, cuisineType: {} };
  await Promise.all(LANGS.map(async lang => {
    const [t, d, c] = await Promise.all([
      translateText(tagline, lang),
      translateText(description, lang),
      translateText(cuisineType, lang),
    ]);
    results.tagline[lang]     = t;
    results.description[lang] = d;
    results.cuisineType[lang] = c;
  }));
  return results;
}
