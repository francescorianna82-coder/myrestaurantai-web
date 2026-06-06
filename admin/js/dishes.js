// admin/js/dishes.js
// MyRestaurantAI — gestione piatti

import { getDishes, addDish, updateDish, deleteDish } from './firebase.js';
import { translateDish } from './translate.js';

const ALLERGENS = [
  { key: 'gluten',      label: 'Glutine' },
  { key: 'crustaceans', label: 'Crostacei' },
  { key: 'eggs',        label: 'Uova' },
  { key: 'fish',        label: 'Pesce' },
  { key: 'peanuts',     label: 'Arachidi' },
  { key: 'soy',         label: 'Soia' },
  { key: 'milk',        label: 'Latte' },
  { key: 'nuts',        label: 'Frutta a guscio' },
  { key: 'celery',      label: 'Sedano' },
  { key: 'mustard',     label: 'Senape' },
  { key: 'sesame',      label: 'Sesamo' },
  { key: 'sulphites',   label: 'Solfiti' },
  { key: 'lupin',       label: 'Lupini' },
  { key: 'molluscs',    label: 'Molluschi' },
];

const BADGES = [
  { key: 'new',          label: 'Novità' },
  { key: 'recommended',  label: 'Consigliato' },
  { key: 'lastPortions', label: 'Ultime porzioni' },
  { key: 'soldOut',      label: 'Esaurito' },
  { key: 'dailySpecial', label: 'Speciale del giorno' },
  { key: 'homemade',     label: 'Fatto in casa' },
  { key: 'vegetarian',   label: 'Vegetariano' },
  { key: 'glutenFree',   label: 'Senza glutine' },
  { key: 'spicy',        label: 'Piccante' },
];

const CATEGORIES = [
  'Antipasti', 'Primi', 'Secondi', 'Contorni',
  'Dolci', 'Bevande', 'Il Bancone', 'Fuori menu',
];

let _restaurantId = null;
let _dishes       = [];
let _editingId    = null;

export async function initDishes(restaurantId) {
  _restaurantId = restaurantId;
  await loadDishes();
  renderDishList();
  setupForm();
}

async function loadDishes() {
  try {
    _dishes = await getDishes(_restaurantId);
  } catch (e) {
    console.error('Errore caricamento piatti', e);
    _dishes = [];
  }
}

function setupForm() {
  const form = document.getElementById('dish-form');
  if (!form) return;

  // Allergeni checkboxes
  const allergenWrap = document.getElementById('allergen-checks');
  if (allergenWrap) {
    allergenWrap.innerHTML = ALLERGENS.map(a => `
      <label class="check-label">
        <input type="checkbox" name="allergen" value="${a.key}">
        ${a.label}
      </label>
    `).join('');
  }

  // Badge checkboxes
  const badgeWrap = document.getElementById('badge-checks');
  if (badgeWrap) {
    badgeWrap.innerHTML = BADGES.map(b => `
      <label class="check-label">
        <input type="checkbox" name="badge" value="${b.key}">
        ${b.label}
      </label>
    `).join('');
  }

  // Categorie select
  const catSelect = document.getElementById('dish-category');
  if (catSelect) {
    catSelect.innerHTML = CATEGORIES.map(c =>
      `<option value="${c.toLowerCase().replace(/\s/g, '_')}">${c}</option>`
    ).join('');
  }

  form.addEventListener('submit', handleSubmit);
  document.getElementById('btn-cancel')?.addEventListener('click', resetForm);
}

async function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save');
  btn.disabled    = true;
  btn.textContent = 'Salvataggio...';

  try {
    const name        = document.getElementById('dish-name').value.trim();
    const description = document.getElementById('dish-description').value.trim();
    const price       = parseFloat(document.getElementById('dish-price').value);
    const category    = document.getElementById('dish-category').value;
    const available   = document.getElementById('dish-available').checked;

    const allergens = [...document.querySelectorAll('input[name="allergen"]:checked')]
      .map(el => el.value);
    const badges    = [...document.querySelectorAll('input[name="badge"]:checked')]
      .map(el => el.value);

    btn.textContent = 'Traduzione in corso...';
    const translations = await translateDish(name, description);

    const dishData = {
      restaurantId: _restaurantId,
      name,
      description,
      price,
      category,
      available,
      allergens,
      badges,
      image: null,
      translations,
    };

    if (_editingId) {
      await updateDish(_editingId, dishData);
    } else {
      await addDish(dishData);
    }

    await loadDishes();
    renderDishList();
    resetForm();
    showToast(_editingId ? 'Piatto aggiornato.' : 'Piatto aggiunto.');
  } catch (err) {
    showToast('Errore nel salvataggio. Riprova.', true);
    console.error(err);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salva piatto';
  }
}

function renderDishList() {
  const el = document.getElementById('dish-list');
  if (!el) return;

  if (_dishes.length === 0) {
    el.innerHTML = '<p class="empty-state">Nessun piatto ancora. Aggiungine uno.</p>';
    return;
  }

  const grouped = {};
  _dishes.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = [];
    grouped[d.category].push(d);
  });

  el.innerHTML = Object.entries(grouped).map(([cat, dishes]) => `
    <div class="dish-group">
      <h3 class="dish-group-title">${cat}</h3>
      ${dishes.map(d => `
        <div class="dish-row ${d.available ? '' : 'dish-unavailable'}">
          <div class="dish-row-info">
            <span class="dish-row-name">${d.name}</span>
            <span class="dish-row-price">${d.price.toFixed(2)} €</span>
          </div>
          <div class="dish-row-actions">
            <button class="btn-icon btn-toggle" onclick="toggleAvailable('${d.id}', ${d.available})" title="${d.available ? 'Segna esaurito' : 'Segna disponibile'}">
              ${d.available ? '&#10003;' : '&#10007;'}
            </button>
            <button class="btn-icon btn-edit" onclick="editDish('${d.id}')" title="Modifica">&#9998;</button>
            <button class="btn-icon btn-delete" onclick="confirmDelete('${d.id}')" title="Elimina">&#128465;</button>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

window.editDish = function(id) {
  const dish = _dishes.find(d => d.id === id);
  if (!dish) return;
  _editingId = id;

  document.getElementById('dish-name').value        = dish.name;
  document.getElementById('dish-description').value = dish.description;
  document.getElementById('dish-price').value       = dish.price;
  document.getElementById('dish-category').value    = dish.category;
  document.getElementById('dish-available').checked = dish.available;

  document.querySelectorAll('input[name="allergen"]').forEach(el => {
    el.checked = (dish.allergens || []).includes(el.value);
  });
  document.querySelectorAll('input[name="badge"]').forEach(el => {
    el.checked = (dish.badges || []).includes(el.value);
  });

  document.getElementById('form-title').textContent = 'Modifica piatto';
  document.getElementById('dish-form').scrollIntoView({ behavior: 'smooth' });
};

window.toggleAvailable = async function(id, current) {
  try {
    await updateDish(id, { available: !current });
    await loadDishes();
    renderDishList();
  } catch (e) {
    showToast('Errore aggiornamento disponibilità.', true);
  }
};

window.confirmDelete = function(id) {
  const dish = _dishes.find(d => d.id === id);
  if (!dish) return;
  if (confirm(`Eliminare "${dish.name}"?`)) deleteDishById(id);
};

async function deleteDishById(id) {
  try {
    await deleteDish(id);
    await loadDishes();
    renderDishList();
    showToast('Piatto eliminato.');
  } catch (e) {
    showToast('Errore eliminazione.', true);
  }
}

function resetForm() {
  _editingId = null;
  document.getElementById('dish-form').reset();
  document.getElementById('form-title').textContent = 'Aggiungi piatto';
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent  = msg;
  toast.className    = 'toast ' + (isError ? 'toast-error' : 'toast-success');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
