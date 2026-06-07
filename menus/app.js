// menus/app.js
// MyRestaurantAI — logica principale pagina pubblica

import { getRestaurantBySlug, getMenusByRestaurant, getDishesByRestaurant } from './firebase.js';
import { selectActiveMenu, groupDishesByCategory } from './menuEngine.js';
import { getLang, t, LANGUAGES } from './i18n.js';
import { mockRestaurant, mockMenus, mockDishes } from './mock.js';

const USE_MOCK = false;
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

// ─── ORARI ──────────────────────────────────────────────────────────────────

function formatSchedule(restaurant) {
  const schedule   = restaurant.schedule;
  const exceptions = restaurant.exceptions || [];

  if (!schedule) {
    const hours = restaurant.openingHours?.[lang] || restaurant.openingHours?.it || '';
    return hours ? `<p class="hours"><span class="hours-label">${t('openingHours', lang)}:</span> ${hours}</p>` : '';
  }

  const DAYS = {
    it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };
  const dayNames = DAYS[lang] || DAYS.it;

  const rows = [1, 2, 3, 4, 5, 6, 0].map(day => {
    const d = schedule[day];
    if (!d) return '';
    const name = dayNames[day];
    if (d.closed) return `<div class="schedule-row"><span class="schedule-day">${name}</span><span class="schedule-closed">${lang === 'en' ? 'Closed' : 'Chiuso'}</span></div>`;

    const parts = [];
    if (d.lunchOpen)  parts.push(`${d.lunchFrom}–${d.lunchTo}`);
    if (d.dinnerOpen) parts.push(`${d.dinnerFrom}–${d.dinnerTo}`);
    const hours = parts.length > 0 ? parts.join(' · ') : (lang === 'en' ? 'Closed' : 'Chiuso');

    return `<div class="schedule-row"><span class="schedule-day">${name}</span><span class="schedule-hours">${hours}</span></div>`;
  }).join('');

  // Chiusure straordinarie
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
  const upcomingExceptions = exceptions.filter(ex => ex.date >= todayStr).slice(0, 3);
  const exceptionsHtml = upcomingExceptions.length > 0 ? `
    <div class="exceptions">
      <p class="exceptions-title">${lang === 'en' ? 'Upcoming closures' : 'Chiusure straordinarie'}</p>
      ${upcomingExceptions.map(ex => `<div class="exception-row"><span class="exception-date">${ex.date}</span><span class="exception-label">${ex.label}</span></div>`).join('')}
    </div>` : '';

  return `
    <div class="schedule-wrap">
      <p class="schedule-title">${t('openingHours', lang)}</p>
      <div class="schedule-grid">${rows}</div>
      ${exceptionsHtml}
    </div>`;
}

// ─── HEADER ─────────────────────────────────────────────────────────────────

function renderHeader(r) {
  const el  = document.getElementById('header');
  const tag = lang !== 'it' && r.translations?.tagline?.[lang]     ? r.translations.tagline[lang]     : r.tagline     || '';
  const desc= lang !== 'it' && r.translations?.description?.[lang] ? r.translations.description[lang] : r.description || '';
  const cuis= lang !== 'it' && r.translations?.cuisineType?.[lang] ? r.translations.cuisineType[lang] : r.cuisineType || '';

  el.innerHTML = `
    <div class="header-top">
      ${r.logo ? `<img src="${r.logo}" class="logo" alt="${r.name}">` : `<div class="logo-text">${r.name}</div>`}
    </div>
    <div class="lang-switcher">
      <div class="lang-select-wrap">
        <button class="lang-current" onclick="toggleLangMenu()">
          <span class="lang-short">${LANGUAGES.find(l => l.code === lang)?.short || lang.toUpperCase()}</span>
          <span class="lang-name">${LANGUAGES.find(l => l.code === lang)?.label || lang.toUpperCase()}</span>
          <span class="lang-arrow">&#9660;</span>
        </button>
        <div class="lang-dropdown" id="lang-dropdown">
          ${LANGUAGES.map(l => `
            <button onclick="switchLang('${l.code}')" class="${lang === l.code ? 'active' : ''}">
              <span class="lang-short">${l.short}</span> ${l.label}
            </button>`).join('')}
        </div>
      </div>
    </div>
    ${tag  ? `<p class="tagline">${tag}</p>`  : ''}
    ${desc ? `<p class="description">${desc}</p>` : ''}
    ${cuis ? `<p class="cuisine">${cuis}</p>` : ''}
    ${formatSchedule(r)}
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
  if (r.website)   links.push(`<a href="${r.website}"   target="_blank" class="social-link">Web</a>`);
  if (r.instagram) links.push(`<a href="${r.instagram}" target="_blank" class="social-link">Instagram</a>`);
  if (r.facebook)  links.push(`<a href="${r.facebook}"  target="_blank" class="social-link">Facebook</a>`);
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
    const catName = lang !== 'it' && cat[`name_${lang}`] ? cat[`name_${lang}`] : (cat.name_en && lang !== 'it' ? cat.name_en : cat.name);
    return `
      <div class="category">
        <h2 class="category-title">${catName}</h2>
        <div class="dishes">
          ${cat.dishes.map(dish => renderDish(dish)).join('')}
        </div>
      </div>`;
  }).join('');
}

// ─── DISH ───────────────────────────────────────────────────────────────────

function renderDish(dish) {
  const unavailable   = dish.available === false;
  const translations  = dish.translations || {};
  const name          = lang !== 'it' && translations.name?.[lang]        ? translations.name[lang]        : (dish.name_en && lang !== 'it' ? dish.name_en : dish.name);
  const description   = lang !== 'it' && translations.description?.[lang] ? translations.description[lang] : (dish.description_en && lang !== 'it' ? dish.description_en : dish.description);
  const badgesHtml    = (dish.badges || []).map(b => `<span class="badge badge-${b}">${t('badges.' + b, lang)}</span>`).join('');
  const allergensHtml = (dish.allergens || []).map(a => `<span class="allergen" title="${t('allergens.' + a, lang)}">${t('allergens.' + a, lang)}</span>`).join('');

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
    </div>`;
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

window.toggleLangMenu = function() {
  document.getElementById('lang-dropdown')?.classList.toggle('open');
};

document.addEventListener('click', function(e) {
  const wrap = document.querySelector('.lang-select-wrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('lang-dropdown')?.classList.remove('open');
  }
});

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
