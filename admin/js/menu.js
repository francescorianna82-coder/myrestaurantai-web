// admin/js/menu.js
// MyRestaurantAI — gestione menu del giorno

import { getMenus, addMenu, updateMenu, deleteMenu, getDishes } from './firebase.js';

let _restaurantId = null;
let _menus        = [];
let _dishes       = [];
let _editingId    = null;

export async function initMenu(restaurantId) {
  _restaurantId = restaurantId;
  await Promise.all([loadMenus(), loadDishes()]);
  renderMenuList();
  setupForm();
}

async function loadMenus() {
  try {
    _menus = await getMenus(_restaurantId);
  } catch (e) {
    console.error('Errore caricamento menu', e);
    _menus = [];
  }
}

async function loadDishes() {
  try {
    _dishes = await getDishes(_restaurantId);
  } catch (e) {
    _dishes = [];
  }
}

function setupForm() {
  const form = document.getElementById('menu-form');
  if (!form) return;

  // Frequenza
  document.getElementById('menu-frequency')?.addEventListener('change', onFrequencyChange);

  // Piatti disponibili
  renderDishPicker();

  form.addEventListener('submit', handleSubmit);
  document.getElementById('btn-cancel-menu')?.addEventListener('click', resetForm);
}

function onFrequencyChange() {
  const freq      = document.getElementById('menu-frequency').value;
  const dateWrap  = document.getElementById('wrap-dates');
  const daysWrap  = document.getElementById('wrap-days');

  dateWrap.style.display = ['daily','monthly','custom'].includes(freq) ? 'block' : 'none';
  daysWrap.style.display = ['weekly','custom'].includes(freq)          ? 'block' : 'none';
}

function renderDishPicker() {
  const el = document.getElementById('dish-picker');
  if (!el || _dishes.length === 0) return;

  const grouped = {};
  _dishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  el.innerHTML = Object.entries(grouped).map(([cat, dishes]) => `
    <div class="picker-group">
      <div class="picker-group-title">${cat}</div>
      ${dishes.map(d => `
        <label class="check-label">
          <input type="checkbox" name="dish-pick" value="${d.id}" data-category="${d.category}">
          ${d.name} — ${d.price.toFixed(2)} €
        </label>
      `).join('')}
    </div>
  `).join('');
}

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-menu');
  btn.disabled    = true;
  btn.textContent = 'Salvataggio...';

  try {
    const title     = document.getElementById('menu-title').value.trim();
    const freq      = document.getElementById('menu-frequency').value;
    const timeSlot  = document.getElementById('menu-timeslot').value;
    const validFrom = document.getElementById('menu-from').value || null;
    const validTo   = document.getElementById('menu-to').value   || null;
    const priority  = parseInt(document.getElementById('menu-priority').value) || 10;
    const status    = document.getElementById('menu-status').value;

    const validWeekDays = [...document.querySelectorAll('input[name="weekday"]:checked')]
      .map(el => parseInt(el.value));

    const selectedDishes = [...document.querySelectorAll('input[name="dish-pick"]:checked')];
    const categories     = buildCategories(selectedDishes);

    const menuData = {
      restaurantId:  _restaurantId,
      title,
      frequencyType: freq,
      timeSlot,
      validFrom,
      validTo,
      validWeekDays: validWeekDays.length > 0 ? validWeekDays : null,
      priority,
      status,
      categories,
    };

    if (_editingId) {
      await updateMenu(_editingId, menuData);
    } else {
      await addMenu(menuData);
    }

    await loadMenus();
    renderMenuList();
    resetForm();
    showToast(_editingId ? 'Menu aggiornato.' : 'Menu pubblicato.');
  } catch (err) {
    showToast('Errore nel salvataggio. Riprova.', true);
    console.error(err);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Pubblica menu';
  }
}

function buildCategories(selectedDishes) {
  const grouped = {};
  selectedDishes.forEach(el => {
    const cat = el.dataset.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(el.value);
  });
  return Object.entries(grouped).map(([name, items]) => ({
    id:      'cat_' + name.toLowerCase().replace(/\s/g, '_'),
    name,
    name_en: '',
    items,
  }));
}

function renderMenuList() {
  const el = document.getElementById('menu-list');
  if (!el) return;

  if (_menus.length === 0) {
    el.innerHTML = '<p class="empty-state">Nessun menu ancora. Creane uno.</p>';
    return;
  }

  el.innerHTML = _menus.map(m => `
    <div class="menu-row status-${m.status}">
      <div class="menu-row-info">
        <span class="menu-row-title">${m.title}</span>
        <span class="menu-row-meta">${freqLabel(m.frequencyType)} · ${m.timeSlot} · <strong>${statusLabel(m.status)}</strong></span>
        ${m.validFrom ? `<span class="menu-row-dates">${m.validFrom}${m.validTo && m.validTo !== m.validFrom ? ' → ' + m.validTo : ''}</span>` : ''}
      </div>
      <div class="menu-row-actions">
        <button class="btn-icon btn-publish" onclick="toggleMenuStatus('${m.id}', '${m.status}')" title="Cambia stato">
          ${m.status === 'published' ? '&#9646;' : '&#9654;'}
        </button>
        <button class="btn-icon btn-edit" onclick="editMenu('${m.id}')" title="Modifica">&#9998;</button>
        <button class="btn-icon btn-delete" onclick="confirmDeleteMenu('${m.id}')" title="Elimina">&#128465;</button>
      </div>
    </div>
  `).join('');
}

function freqLabel(f) {
  return { daily: 'Giornaliero', weekly: 'Settimanale', monthly: 'Mensile', custom: 'Custom' }[f] || f;
}

function statusLabel(s) {
  return { draft: 'Bozza', scheduled: 'Pianificato', published: 'Pubblicato', archived: 'Archiviato' }[s] || s;
}

window.toggleMenuStatus = async function(id, current) {
  const next = current === 'published' ? 'draft' : 'published';
  try {
    await updateMenu(id, { status: next });
    await loadMenus();
    renderMenuList();
    showToast(next === 'published' ? 'Menu pubblicato.' : 'Menu messo in bozza.');
  } catch (e) {
    showToast('Errore aggiornamento stato.', true);
  }
};

window.editMenu = function(id) {
  const menu = _menus.find(m => m.id === id);
  if (!menu) return;
  _editingId = id;

  document.getElementById('menu-title').value     = menu.title;
  document.getElementById('menu-frequency').value = menu.frequencyType;
  document.getElementById('menu-timeslot').value  = menu.timeSlot;
  document.getElementById('menu-from').value      = menu.validFrom || '';
  document.getElementById('menu-to').value        = menu.validTo   || '';
  document.getElementById('menu-priority').value  = menu.priority  || 10;
  document.getElementById('menu-status').value    = menu.status;

  onFrequencyChange();

  const allDishIds = (menu.categories || []).flatMap(c => c.items || []);
  document.querySelectorAll('input[name="dish-pick"]').forEach(el => {
    el.checked = allDishIds.includes(el.value);
  });

  (menu.validWeekDays || []).forEach(day => {
    const el = document.querySelector(`input[name="weekday"][value="${day}"]`);
    if (el) el.checked = true;
  });

  document.getElementById('menu-form-title').textContent = 'Modifica menu';
  document.getElementById('menu-form').scrollIntoView({ behavior: 'smooth' });
};

window.confirmDeleteMenu = function(id) {
  const menu = _menus.find(m => m.id === id);
  if (!menu) return;
  if (confirm(`Eliminare il menu "${menu.title}"?`)) deleteMenuById(id);
};

async function deleteMenuById(id) {
  try {
    await deleteMenu(id);
    await loadMenus();
    renderMenuList();
    showToast('Menu eliminato.');
  } catch (e) {
    showToast('Errore eliminazione.', true);
  }
}

function resetForm() {
  _editingId = null;
  document.getElementById('menu-form').reset();
  document.getElementById('menu-form-title').textContent = 'Crea menu';
  onFrequencyChange();
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent   = msg;
  toast.className     = 'toast ' + (isError ? 'toast-error' : 'toast-success');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
