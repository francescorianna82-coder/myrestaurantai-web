// menus/menuEngine.js
// MyRestaurantAI — logica selezione menu attivo

export function selectActiveMenu(menus) {
  if (!menus || menus.length === 0) return null;

  const now        = new Date();
  const todayStr   = toDateStr(now);
  console.log('todayStr:', todayStr, 'menus:', menus.map(m => m.validFrom));

  const todayDay   = now.getDay(); // 0=dom, 1=lun, ...6=sab
  const currentH   = now.getHours() + now.getMinutes() / 60;
  const timeSlot   = currentH >= 12 && currentH < 16 ? 'lunch'
                   : currentH >= 19                   ? 'dinner'
                   :                                    'allDay';

  const valid = menus.filter(m => isMenuValid(m, todayStr, todayDay, timeSlot));

  if (valid.length === 0) {
    // Fallback — ultimo menu pubblicato per data
    return menus.sort((a, b) => (b.validFrom || '').localeCompare(a.validFrom || ''))[0] || null;
  }

  // Ordina per priorità decrescente
  valid.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return valid[0];
}

function isMenuValid(menu, todayStr, todayDay, timeSlot) {
  const { frequencyType, validFrom, validTo, validWeekDays, timeSlot: ts } = menu;

  // Controllo fascia oraria
  if (ts && ts !== 'allDay' && ts !== timeSlot) return false;

  switch (frequencyType) {
    case 'daily':
      return validFrom === todayStr;

    case 'weekly': {
      const days = validWeekDays || [1, 2, 3, 4, 5, 6, 0];
      return days.includes(todayDay);
    }

    case 'monthly': {
      if (!validFrom || !validTo) return false;
      return todayStr >= validFrom && todayStr <= validTo;
    }

    case 'custom': {
      if (!validFrom || !validTo) return false;
      if (todayStr < validFrom || todayStr > validTo) return false;
      if (validWeekDays && validWeekDays.length > 0) {
        return validWeekDays.includes(todayDay);
      }
      return true;
    }

    default:
      return true;
  }
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function groupDishesByCategory(menu, allDishes) {
  if (!menu || !menu.categories) return [];

  return menu.categories.map(cat => {
    const items = (cat.items || [])
      .map(itemId => allDishes.find(d => d.id === itemId))
      .filter(Boolean)
      .filter(d => d.available !== false);

    return { ...cat, dishes: items };
  }).filter(cat => cat.dishes.length > 0);
}
