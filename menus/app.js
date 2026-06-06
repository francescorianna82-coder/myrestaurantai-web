// menus/app.js
// MyRestaurantAI — logica principale pagina pubblica

import { getRestaurantBySlug, getMenusByRestaurant, getDishesByRestaurant } from './firebase.js';
import { selectActiveMenu, groupDishesByCategory } from './menuEngine.js';
import { getLang, t, LANGUAGES } from './i18n.js';
import { mockRestaurant, mockMenus, mockDishes } from './mock.js';

const USE_MOCK = true;
const lang     = getLang();
const slug     = new URLSearchParams(window.location.search).get('slug') || 'freddys';

// ─── DATA ───────────────────────────────────────────────────────────────────

async function loadData() {
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

// ─── BRANDING ───────────────────────────────────────────────────────────────

function applyBranding(r) {
  const root = document.documentElement;
  root.style.setProperty('--brand',  r.brandColor  || '#1a2744');
  root.style.setProperty('--accent', r.accentColor || '#c9a96e');
  root.style.setProperty('--text',   r.textColor   || '#f5f0e8');
  document.title = r.name + ' — Menu';
}

// ─── HEADER ─────────────────────────────────────────────────────────────────

function renderHeader(r) {
  const el    = document.getElementById('header');
  const hours = r.openingHours?.[lang] || r.openingHours?.en || r.openingHours?.it || '';
  const name  = lang !== 'it' && r.name_en ? r.name_en : r.name;
  const tag   = lang !== 'it' && r.tagline_en    ? r.tagline_en    : r.tagline;
  const desc  = lang !== 'it' && r.description_en ? r.description_en : r.description;
  const cuis  = lang !== 'it' && r.cuisineType_en ? r.cuisineType_en : r.cuisineType;

  el.innerHTML = `
    <div class="header-top">
      ${r.logo
        ? `<img src="${r.logo}" class="logo" alt="${r.name}">`
        : `<div class="logo-text">${r.name}</div>`}
    </div>
    <div class="lang-switcher">
      ${LANGUAGES.map(l => `
        <button onclick="switchLang('${l.code}')" class="${lang === l.code ? 'active' : ''}" title="${l.name}">
          ${l.label}
        </button>`).join('')}
    </div>
    <p class="tagline">${tag}</p>
    <p class="description">${desc}</p>
    <p class="cuisine">${cuis}</p>
    ${hours ? `<p class="hours"><span class="hours-label">${t('openingHours', lang)}:</span> ${hours}</p>` : ''}
  `;
}

// ─── ACTIONS ────────────────────────────────────────────────────────────────

function renderActions(r) {
  const el   = document.getElementById('actions');
  const btns = [];
  if (r.phone)
    btns.push(`<a href="tel:${r.phone}" class="btn btn-primary">&#9990; ${t('call', lang)}</a>`);
  if (r.whatsapp)
    btns.push(`<a href="https://wa.me/${r.whatsapp.replace(/\D/g,'')}" class="btn btn-whatsapp" target="_blank">&#128172; ${t('whatsapp', lang)}</a>`);
  if (r.mapsUrl)
    btns.push(`<a href="${r.mapsUrl}" class="btn btn-maps" target="_blank">&#128205; ${t('directions', lang)}</a>`);
  el.innerHTML = btns.join('');
}

// ─── SOCIAL ─────────────────────────────────────────────────────────────────

function renderSocial(r) {
  const el    = document.getElementById('social');
  const links = [];
  if (r.instagram)
    links.push(`<a href="${r.instagram}" target="_blank" class="social-link">Instagram</a>`);
  if (r.facebook)
    links.push(`<a href="${r.facebook}" target="_blank" class="social-link">Facebook</a>`);
  el.innerHTML = links.join('');
}

// ─── ADDRESS ────────────────────────────────────────────────────────────────

function renderAddress(r) {
  const el = document.getElementById('address');
  if (r.address) el.innerHTML = `<p class="address-text">&#128205; ${r.address}</p>`;
}

// ─── MENU ───────────────────────────────────────────────────────────────────

function renderMenu(menu, dishes) {
  const el = document.getElementById('menu');
  if (!menu) {
    el.innerHTML = `<p class="no-menu">${t('noMenu', lang)}</p>`;
    return;
  }
  const categories = groupDishesByCategory(menu, dishes);
  el.innerHTML = categories.map(cat => {
    const catName = lang !== 'it' && cat[`name_${lang}`] ? cat[`name_${lang}`] : (lang !== 'it' && cat.name_en ? cat.name_en : cat.name);
    return `
      <div class="category">
        <h2 class="category-title">${catName}</h2>
        <div class="dishes">
          ${cat.dishes.map(dish => renderDish(dish)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// ─── DISH ───────────────────────────────────────────────────────────────────

function renderDish(dish) {
  const unavailable   = dish.available === false;
  const name          = lang !== 'it' && dish[`name_${lang}`]        ? dish[`name_${lang}`]        : (lang !== 'it' && dish.name_en        ? dish.name_en        : dish.name);
  const description   = lang !== 'it' && dish[`description_${lang}`] ? dish[`description_${lang}`] : (lang !== 'it' && dish.description_en ? dish.description_en : dish.description);
  const badgesHtml    = (dish.badges || []).map(b =>
    `<span class="badge badge-${b}">${t('badges.' + b, lang)}</span>`
  ).join('');
  const allergensHtml = (dish.allergens || []).map(a =>
    `<span class="allergen" title="${t('allergens.' + a, lang)}">${t('allergens.' + a, lang)}</span>`
  ).join('');

  return `
    <div class="dish ${unavailable ? 'dish-unavailable' : ''}">
      ${dish.image ? `<img src="${dish.image}" class="dish-image" alt="${name}">` : ''}
      <div class="dish-body">
        <div class="dish-top">
          <span class="dish-name">${name}</span>
          <span class="dish-price">${unavailable ? t('unavailable', lang) : dish.price.toFixed(2) + ' €'}</span>
        </div>
        ${description ? `<p class="dish-desc">${description}</p>` : ''}
        ${badgesHtml || allergensHtml ? `
          <div class="dish-meta">
            ${badgesHtml}
            ${allergensHtml ? `<div class="allergens-row">${allergensHtml}</div>` : ''}
          </div>` : ''}
      </div>
    </div>
  `;
}

// ─── ALLERGEN WARNING ────────────────────────────────────────────────────────

function renderAllergenWarning() {
  document.getElementById('allergen-warning').textContent = t('allergenWarning', lang);
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────

function renderFooter(r) {
  const el = document.getElementById('footer');
  if (r.poweredBy) el.innerHTML = `<p class="powered-by">${t('poweredBy', lang)}</p>`;
}

// ─── LANG SWITCHER ──────────────────────────────────────────────────────────

window.switchLang = function(l) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', l);
  window.location.href = url.toString();
};

// ─── INIT ───────────────────────────────────────────────────────────────────

async function init() {
  document.getElementById('loading').textContent = t('loading', lang);
  try {
    const data = await loadData();
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
    renderMenu(selectActiveMenu(menus), dishes);
    renderAllergenWarning();
    renderFooter(restaurant);
  } catch (e) {
    document.getElementById('loading').textContent = 'Errore nel caricamento. Riprova.';
    console.error(e);
  }
}

init();
