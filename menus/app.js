// menus/app.js
// MyRestaurantAI — logica principale pagina pubblica

import { getRestaurantBySlug, getMenusByRestaurant, getDishesByRestaurant } from './firebase.js';
import { selectActiveMenu, groupDishesByCategory } from './menuEngine.js';
import { getLang, t } from './i18n.js';
import { mockRestaurant, mockMenus, mockDishes } from './mock.js';

const USE_MOCK = true; // false quando Firestore ha dati reali

const lang = getLang();

async function loadData(slug) {
  if (USE_MOCK) {
    return { restaurant: mockRestaurant, menus: mockMenus, dishes: mockDishes };
  }
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return null;
  const [menus, dishes] = await Promise.all([
    getMenusByRestaurant(restaurant.id),
    getDishesByRestaurant(restaurant.id),
  ]);
  return { restaurant, menus, dishes };
}

function applyBranding(restaurant) {
  const r = document.documentElement;
  r.style.setProperty('--brand',  restaurant.brandColor  || '#1a2744');
  r.style.setProperty('--accent', restaurant.accentColor || '#c9a96e');
  r.style.setProperty('--text',   restaurant.textColor   || '#f5f0e8');
  document.title = restaurant.name + ' — Menu';
}

function renderHeader(restaurant) {
  const el = document.getElementById('header');
  const hours = restaurant.openingHours?.[lang] || restaurant.openingHours?.it || '';
  el.innerHTML = `
    <div class="header-top">
      ${restaurant.logo ? `<img src="${restaurant.logo}" class="logo" alt="${restaurant.name}">` : `<div class="logo-text">${restaurant.name}</div>`}
      <div class="lang-switcher">
        <button onclick="switchLang('it')" class="${lang==='it'?'active':''}">IT</button>
        <button onclick="switchLang('en')" class="${lang==='en'?'active':''}">EN</button>
      </div>
    </div>
    <p class="tagline">${lang==='en' ? restaurant.tagline_en : restaurant.tagline}</p>
    <p class="description">${lang==='en' ? restaurant.description_en : restaurant.description}</p>
    <p class="cuisine">${lang==='en' ? restaurant.cuisineType_en : restaurant.cuisineType}</p>
    ${hours ? `<p class="hours"><span class="hours-label">${t('openingHours', lang)}:</span> ${hours}</p>` : ''}
  `;
}

function renderActions(restaurant) {
  const el = document.getElementById('actions');
  const btns = [];
  if (restaurant.phone)
    btns.push(`<a href="tel:${restaurant.phone}" class="btn btn-primary"><span>&#9990;</span> ${t('call', lang)}</a>`);
  if (restaurant.whatsapp)
    btns.push(`<a href="https://wa.me/${restaurant.whatsapp.replace(/\D/g,'')}" class="btn btn-whatsapp" target="_blank"><span>&#128172;</span> ${t('whatsapp', lang)}</a>`);
  if (restaurant.mapsUrl)
    btns.push(`<a href="${restaurant.mapsUrl}" class="btn btn-maps" target="_blank"><span>&#128205;</span> ${t('directions', lang)}</a>`);
  el.innerHTML = btns.join('');
}

function renderSocial(restaurant) {
  const el = document.getElementById('social');
  const links = [];
  if (restaurant.instagram)
    links.push(`<a href="${restaurant.instagram}" target="_blank" class="social-link">Instagram</a>`);
  if (restaurant.facebook)
    links.push(`<a href="${restaurant.facebook}" target="_blank" class="social-link">Facebook</a>`);
  el.innerHTML = links.join('');
}

function renderMenu(menu, dishes) {
  const el = document.getElementById('menu');
  if (!menu) {
    el.innerHTML = `<p class="no-menu">${t('noMenu', lang)}</p>`;
    return;
  }
  const categories = groupDishesByCategory(menu, dishes);
  el.innerHTML = categories.map(cat => `
    <div class="category">
      <h2 class="category-title">${lang==='en' && cat.name_en ? cat.name_en : cat.name}</h2>
      <div class="dishes">
        ${cat.dishes.map(dish => renderDish(dish)).join('')}
      </div>
    </div>
  `).join('');
}

function renderDish(dish) {
  const badgesHtml = (dish.badges || []).map(b => `<span class="badge badge-${b}">${t('badges.'+b, lang)}</span>`).join('');
  const allergensHtml = (dish.allergens || []).map(a => `<span class="allergen" title="${t('allergens.'+a, lang)}">${allergenIcon(a)}</span>`).join('');
  const unavailable = dish.available === false;
  return `
    <div class="dish ${unavailable ? 'dish-unavailable' : ''}">
      ${dish.image ? `<img src="${dish.image}" class="dish-image" alt="${dish.name}">` : ''}
      <div class="dish-body">
        <div class="dish-top">
          <span class="dish-name">${dish.name}</span>
          <span class="dish-price">${unavailable ? t('unavailable', lang) : dish.price.toFixed(2) + ' €'}</span>
        </div>
        ${dish.description ? `<p class="dish-desc">${dish.description}</p>` : ''}
        <div class="dish-meta">
          ${badgesHtml}
          ${allergensHtml}
        </div>
      </div>
    </div>
  `;
}

function allergenIcon(key) {
  const icons = {
    gluten: 'G', crustaceans: 'CR', eggs: 'UO', fish: 'PE',
    peanuts: 'AR', soy: 'SO', milk: 'LA', nuts: 'FG',
    celery: 'SE', mustard: 'MO', sesame: 'SS', sulphites: 'SO2',
    lupin: 'LU', molluscs: 'MO',
  };
  return icons[key] || key.toUpperCase().slice(0,2);
}

function renderAllergenWarning() {
  const el = document.getElementById('allergen-warning');
  el.textContent = t('allergenWarning', lang);
}

function renderFooter(restaurant) {
  const el = document.getElementById('footer');
  if (restaurant.poweredBy) {
    el.innerHTML = `<p class="powered-by">${t('poweredBy', lang)}</p>`;
  }
}

function renderAddress(restaurant) {
  const el = document.getElementById('address');
  if (restaurant.address) {
    el.innerHTML = `<p class="address-text">${restaurant.address}</p>`;
  }
}

window.switchLang = function(l) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', l);
  window.location.href = url.toString();
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug') || 'freddys';
  const forceLang = params.get('lang');
  if (forceLang) {
    Object.defineProperty(navigator, 'language', { value: forceLang, configurable: true });
  }

  document.getElementById('loading').textContent = t('loading', lang);

  try {
    const data = await loadData(slug);
    if (!data) {
      document.getElementById('loading').textContent = t('notFound', lang);
      return;
    }
    const { restaurant, menus, dishes } = data;
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display     = 'block';

    applyBranding(restaurant);
    renderHeader(restaurant);
    renderActions(restaurant);
    renderSocial(restaurant);
    renderAddress(restaurant);

    const activeMenu = selectActiveMenu(menus);
    renderMenu(activeMenu, dishes);
    renderAllergenWarning();
    renderFooter(restaurant);
  } catch (e) {
    document.getElementById('loading').textContent = 'Errore nel caricamento. Riprova.';
    console.error(e);
  }
}

init();
