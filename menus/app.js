// menus/app.js
// MyRestaurantAI — logica principale pagina pubblica

import { getRestaurantBySlug, getMenusByRestaurant, getDishesByRestaurant } from './firebase.js';
import { selectActiveMenu, groupDishesByCategory } from './menuEngine.js';
import { getLang, t, LANGUAGES } from './i18n.js';
import { mockRestaurant, mockMenus, mockDishes } from './mock.js';

const USE_MOCK = false;
const lang     = getLang();
const slug     = new URLSearchParams(window.location.search).get('slug') || 'freddys';

let allDishes       = [];
let activeMenu      = null;
let activeAllergens = new Set();
let activeBadges    = new Set();
let collapsed       = new Set();

// ─── SVG ────────────────────────────────────────────────────────────────────

const SVG = {
  phone:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127 1.32.59 2.7 1.18 3.93a2 2 0 01-.45 2.11L6.91 8.58a16 16 0 006.51 6.51l1.82-1.82a2 2 0 012.11-.45c1.23.59 2.61 1.053 3.93 1.18A2 2 0 0122 16.92z"/></svg>`,
  whatsapp:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  maps:      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  web:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  instagram: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  facebook:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`,
  location:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  chevron:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  frozen:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5 5-5-5"/><path d="M17 17l-5-5-5 5"/><path d="M2 12h20"/><path d="M7 7l-5 5 5 5"/><path d="M17 7l5 5-5 5"/></svg>`,
  filter:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  close:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

// ─── ALLERGENI DISPONIBILI ───────────────────────────────────────────────────

const ALLERGEN_LIST = ['gluten','crustaceans','eggs','fish','peanuts','soy','milk','nuts','celery','mustard','sesame','sulphites','lupin','molluscs'];
const BADGE_LIST    = ['vegetarian','glutenFree','vegan','homemade','new','recommended','dailySpecial','lastPortions','spicy'];

// ─── DATA ───────────────────────────────────────────────────────────────────

async function loadData() {
  if (USE_MOCK) return { restaurant: mockRestaurant, menus: mockMenus, dishes: mockDishes };
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
  root.style.setProperty('--brand',    r.brandColor         || '#1a2744');
  root.style.setProperty('--accent',   r.accentColor        || '#c9a96e');
  root.style.setProperty('--text',     r.textColor          || '#f5f0e8');
  root.style.setProperty('--text-sec', r.textSecondaryColor || 'rgba(245,240,232,0.60)');
  document.title = r.name + ' — Menu';
}

// ─── APERTO ORA ─────────────────────────────────────────────────────────────

function isOpenNow(restaurant) {
  const schedule   = restaurant.schedule;
  const exceptions = restaurant.exceptions || [];
  if (!schedule) return null;

  const now      = new Date();
  const todayStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  const ex       = exceptions.find(e => e.date === todayStr);
  if (ex?.closed) return false;

  const day = now.getDay();
  const d   = schedule[day];
  if (!d || d.closed) return false;

  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = s => { if (!s) return 0; const [h,m] = s.split(':').map(Number); return h*60+m; };

  if (d.lunchOpen  && cur >= toMin(d.lunchFrom)  && cur <= toMin(d.lunchTo))  return true;
  if (d.dinnerOpen && cur >= toMin(d.dinnerFrom) && cur <= toMin(d.dinnerTo)) return true;
  return false;
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
    it: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
    de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
    es: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
    ru: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    zh: ['周日','周一','周二','周三','周四','周五','周六'],
    ja: ['日','月','火','水','木','金','土'],
    ko: ['일','월','화','수','목','금','토'],
  };
  const closedLabel = { it:'Chiuso', en:'Closed', fr:'Fermé', de:'Geschlossen', es:'Cerrado', ru:'Закрыто', zh:'休息', ja:'休業', ko:'휴무' };
  const dayNames    = DAYS[lang] || DAYS.it;
  const closed      = closedLabel[lang] || 'Chiuso';
  const today       = new Date().getDay();

  const rows = [1,2,3,4,5,6,0].map(day => {
    const d    = schedule[day];
    if (!d) return '';
    const name    = dayNames[day];
    const isToday = day === today;
    const cls     = isToday ? ' schedule-today' : '';
    if (d.closed) return `<div class="schedule-row${cls}"><span class="schedule-day">${name}</span><span class="schedule-closed">${closed}</span></div>`;
    const parts = [];
    if (d.lunchOpen)  parts.push(`${d.lunchFrom}–${d.lunchTo}`);
    if (d.dinnerOpen) parts.push(`${d.dinnerFrom}–${d.dinnerTo}`);
    const hours = parts.length > 0 ? parts.join(' · ') : closed;
    return `<div class="schedule-row${cls}"><span class="schedule-day">${name}</span><span class="schedule-hours">${hours}</span></div>`;
  }).join('');

  const now      = new Date();
  const todayStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
  const upcoming = exceptions.filter(ex => ex.date >= todayStr).slice(0, 3);
  const exLabel  = { it:'Chiusure straordinarie', en:'Upcoming closures', fr:'Fermetures exceptionnelles', de:'Sonderöffnungszeiten', es:'Cierres extraordinarios', ru:'Особые закрытия', zh:'特别停业', ja:'特別休業', ko:'특별 휴무' };

  const exceptionsHtml = upcoming.length > 0 ? `
    <div class="exceptions">
      <p class="exceptions-title">${exLabel[lang] || exLabel.it}</p>
      ${upcoming.map(ex => `<div class="exception-row"><span class="exception-date">${ex.date}</span><span class="exception-label">${ex.label}</span></div>`).join('')}
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
  const el    = document.getElementById('header');
  const tag   = lang !== 'it' && r.translations?.tagline?.[lang]     ? r.translations.tagline[lang]     : r.tagline     || '';
  const desc  = lang !== 'it' && r.translations?.description?.[lang] ? r.translations.description[lang] : r.description || '';
  const cuis  = lang !== 'it' && r.translations?.cuisineType?.[lang] ? r.translations.cuisineType[lang] : r.cuisineType || '';
  const open  = isOpenNow(r);
  const badge = open === null ? '' : open
    ? `<span class="open-badge open-now">${t('openNow', lang)}</span>`
    : `<span class="open-badge closed-now">${t('closedNow', lang)}</span>`;

  el.innerHTML = `
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
    <div class="header-top">
      ${r.logo ? `<img src="${r.logo}" class="logo" alt="${r.name}">` : `<div class="logo-text">${r.name}</div>`}
    </div>
    ${badge}
    ${tag  ? `<p class="tagline">${tag}</p>`       : ''}
    ${desc ? `<p class="description">${desc}</p>`  : ''}
    ${cuis ? `<p class="cuisine">${cuis}</p>`      : ''}
    ${formatSchedule(r)}
  `;

  // sticky bar
  document.getElementById('sticky-name').textContent = r.name;
}

// ─── ACTIONS ────────────────────────────────────────────────────────────────

function renderActions(r) {
  const el   = document.getElementById('actions');
  const btns = [];
  if (r.phone)    btns.push(`<a href="tel:${r.phone}" class="btn btn-primary">${SVG.phone} ${t('call', lang)}</a>`);
  if (r.whatsapp) btns.push(`<a href="https://wa.me/${r.whatsapp.replace(/\D/g,'')}" class="btn btn-whatsapp" target="_blank">${SVG.whatsapp} ${t('whatsapp', lang)}</a>`);
  if (r.mapsUrl)  btns.push(`<a href="${r.mapsUrl}" class="btn btn-maps" target="_blank">${SVG.maps} ${t('directions', lang)}</a>`);
  el.innerHTML = btns.join('');
}

// ─── SOCIAL ─────────────────────────────────────────────────────────────────

function renderSocial(r) {
  const el    = document.getElementById('social');
  const links = [];
  if (r.website)   links.push(`<a href="${r.website}"   target="_blank" class="social-link">${SVG.web} Web</a>`);
  if (r.instagram) links.push(`<a href="${r.instagram}" target="_blank" class="social-link">${SVG.instagram} Instagram</a>`);
  if (r.facebook)  links.push(`<a href="${r.facebook}"  target="_blank" class="social-link">${SVG.facebook} Facebook</a>`);
  el.innerHTML = links.join('');
}

// ─── ADDRESS ────────────────────────────────────────────────────────────────

function renderAddress(r) {
  const el = document.getElementById('address');
  if (r.address) el.innerHTML = `<p class="address-text">${SVG.location} ${r.address}</p>`;
}

// ─── FILTRI ──────────────────────────────────────────────────────────────────

function getAllergensInMenu() {
  if (!activeMenu) return [];
  const ids  = activeMenu.categories.flatMap(c => c.items || []);
  const used = new Set();
  allDishes.filter(d => ids.includes(d.id)).forEach(d => (d.allergens || []).forEach(a => used.add(a)));
  return ALLERGEN_LIST.filter(a => used.has(a));
}

function getBadgesInMenu() {
  if (!activeMenu) return [];
  const ids  = activeMenu.categories.flatMap(c => c.items || []);
  const used = new Set();
  allDishes.filter(d => ids.includes(d.id)).forEach(d => (d.badges || []).forEach(b => used.add(b)));
  return BADGE_LIST.filter(b => used.has(b));
}

function renderFilters() {
  const el         = document.getElementById('filters');
  const allergens  = getAllergensInMenu();
  const badges     = getBadgesInMenu();
  if (allergens.length === 0 && badges.length === 0) { el.innerHTML = ''; return; }

  const hasActive = activeAllergens.size > 0 || activeBadges.size > 0;

  el.innerHTML = `
    <div class="filters-wrap">
      ${badges.length > 0 ? `
        <div class="filter-group">
          <p class="filter-label">${SVG.filter} ${t('badgeFilter', lang)}</p>
          <div class="filter-chips">
            ${badges.map(b => `
              <button class="chip ${activeBadges.has(b) ? 'chip-active' : ''}" onclick="toggleBadge('${b}')">
                ${t('badges.'+b, lang)}
              </button>`).join('')}
          </div>
        </div>` : ''}
      ${allergens.length > 0 ? `
        <div class="filter-group">
          <p class="filter-label">${SVG.filter} ${t('allergenFilter', lang)}</p>
          <div class="filter-chips">
            ${allergens.map(a => `
              <button class="chip chip-allergen ${activeAllergens.has(a) ? 'chip-active' : ''}" onclick="toggleAllergen('${a}')">
                ${t('allergens.'+a, lang)}
              </button>`).join('')}
          </div>
        </div>` : ''}
      ${hasActive ? `
        <button class="clear-filters" onclick="clearFilters()">
          ${SVG.close} ${t('clearFilters', lang)}
        </button>` : ''}
    </div>`;
}

window.toggleAllergen = function(a) {
  activeAllergens.has(a) ? activeAllergens.delete(a) : activeAllergens.add(a);
  renderFilters();
  renderMenu();
};

window.toggleBadge = function(b) {
  activeBadges.has(b) ? activeBadges.delete(b) : activeBadges.add(b);
  renderFilters();
  renderMenu();
};

window.clearFilters = function() {
  activeAllergens.clear();
  activeBadges.clear();
  renderFilters();
  renderMenu();
};

// ─── CATEGORY NAV ───────────────────────────────────────────────────────────

function renderCategoryNav(categories) {
  const el = document.getElementById('cat-nav');
  if (!el || categories.length < 3) { if(el) el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="cat-nav-scroll">
      ${categories.map(cat => {
        const name = lang !== 'it' && cat[`name_${lang}`] ? cat[`name_${lang}`] : (cat.name_en && lang !== 'it' ? cat.name_en : cat.name);
        return `<a class="cat-nav-item" href="#cat-${cat.id}">${name}</a>`;
      }).join('')}
    </div>`;
}

// ─── MENU ───────────────────────────────────────────────────────────────────

function renderMenu() {
  const el = document.getElementById('menu');
  if (!activeMenu) {
    el.innerHTML = `<p class="no-menu">${t('noMenu', lang)}</p>`;
    return;
  }

  const categories = groupDishesByCategory(activeMenu, allDishes);

  const filtered = categories.map(cat => {
    let dishes = cat.dishes;
    if (activeAllergens.size > 0)
      dishes = dishes.filter(d => ![...(d.allergens||[])].some(a => activeAllergens.has(a)));
    if (activeBadges.size > 0)
      dishes = dishes.filter(d => [...activeBadges].every(b => (d.badges||[]).includes(b)));
    return { ...cat, dishes };
  }).filter(cat => cat.dishes.length > 0);

  if (filtered.length === 0) {
    el.innerHTML = `<p class="no-menu">${t('noResults', lang)}</p>`;
    renderCategoryNav([]);
    return;
  }

  renderCategoryNav(filtered);

  el.innerHTML = filtered.map(cat => {
    const catName  = lang !== 'it' && cat[`name_${lang}`] ? cat[`name_${lang}`] : (cat.name_en && lang !== 'it' ? cat.name_en : cat.name);
    const isCollapsed = collapsed.has(cat.id);
    return `
      <div class="category" id="cat-${cat.id}">
        <button class="category-title" onclick="toggleCategory('${cat.id}')">
          <span>${catName}</span>
          <span class="cat-count">${cat.dishes.length}</span>
          <span class="cat-chevron ${isCollapsed ? 'collapsed' : ''}">${SVG.chevron}</span>
        </button>
        <div class="dishes ${isCollapsed ? 'dishes-hidden' : ''}">
          ${cat.dishes.map(dish => renderDish(dish)).join('')}
        </div>
      </div>`;
  }).join('');
}

window.toggleCategory = function(id) {
  collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
  renderMenu();
};

// ─── DISH ───────────────────────────────────────────────────────────────────

function renderDish(dish) {
  const unavailable = dish.available === false;
  const tr          = dish.translations || {};
  const name        = lang !== 'it' && tr[lang]?.name        ? tr[lang].name        : dish.name        || '';
  const description = lang !== 'it' && tr[lang]?.description ? tr[lang].description : dish.description || '';

  const badgesHtml = (dish.badges || []).map(b =>
    `<span class="badge badge-${b}">${t('badges.'+b, lang)}</span>`).join('');

  const frozenHtml = dish.frozen
    ? `<span class="badge badge-frozen">${SVG.frozen} ${t('frozen', lang)}</span>` : '';

  const allergensHtml = (dish.allergens || []).map(a =>
    `<span class="allergen ${activeAllergens.has(a) ? 'allergen-active' : ''}" title="${t('allergens.'+a, lang)}">${t('allergens.'+a, lang)}</span>`).join('');

  const price = unavailable
    ? `<span class="dish-unavailable-label">${t('unavailable', lang)}</span>`
    : `<span class="dish-price">${typeof dish.price === 'number' ? dish.price.toFixed(2) + ' €' : dish.price}</span>`;

  return `
    <div class="dish ${unavailable ? 'dish-unavailable' : ''}">
      ${dish.image ? `<img src="${dish.image}" class="dish-image" alt="${name}" loading="lazy">` : ''}
      <div class="dish-body">
        <div class="dish-top">
          <span class="dish-name">${name}</span>
          ${price}
        </div>
        ${description ? `<p class="dish-desc">${description}</p>` : ''}
        ${badgesHtml || frozenHtml || allergensHtml ? `
          <div class="dish-meta">
            <div class="dish-badges">${frozenHtml}${badgesHtml}</div>
            ${allergensHtml ? `<div class="allergens-row">${allergensHtml}</div>` : ''}
          </div>` : ''}
      </div>
    </div>`;
}

// ─── ALLERGEN WARNING ───────────────────────────────────────────────────────

function renderAllergenWarning() {
  document.getElementById('allergen-warning').textContent = t('allergenWarning', lang);
}

// ─── FOOTER ─────────────────────────────────────────────────────────────────

function renderFooter(r) {
  const el = document.getElementById('footer');
  if (r.poweredBy) el.innerHTML = `<p class="powered-by">${t('poweredBy', lang)}</p>`;
}

// ─── STICKY HEADER ──────────────────────────────────────────────────────────

function initSticky() {
  const sticky  = document.getElementById('sticky-bar');
  const header  = document.getElementById('header');
  if (!sticky || !header) return;
  const observer = new IntersectionObserver(
    ([e]) => sticky.classList.toggle('sticky-visible', !e.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(header);
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
  if (wrap && !wrap.contains(e.target))
    document.getElementById('lang-dropdown')?.classList.remove('open');
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
    allDishes  = dishes;
    activeMenu = selectActiveMenu(menus);

    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display     = 'block';

    applyBranding(restaurant);
    renderHeader(restaurant);
    renderActions(restaurant);
    renderSocial(restaurant);
    renderAddress(restaurant);
    renderFilters();
    renderMenu();
    renderAllergenWarning();
    renderFooter(restaurant);
    initSticky();
  } catch (e) {
    document.getElementById('loading').textContent = 'Errore nel caricamento. Riprova.';
    console.error(e);
  }
}

init();
