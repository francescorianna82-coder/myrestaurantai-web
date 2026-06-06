// admin/js/auth.js
// MyRestaurantAI — gestione autenticazione admin

import { loginWithEmail, logout, onAuth, getRestaurantByUid, createRestaurant }
  from './firebase.js';
import { translateRestaurantInfo } from './translate.js';

export function requireAuth(callback) {
  onAuth(async user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    const restaurant = await getRestaurantByUid(user.uid);
    if (!restaurant) {
      window.location.href = 'setup.html';
      return;
    }
    callback(user, restaurant);
  });
}

export function requireNoAuth() {
  onAuth(user => {
    if (user) window.location.href = 'dashboard.html';
  });
}

export async function handleLogin(email, password, onError) {
  try {
    await loginWithEmail(email, password);
  } catch (e) {
    const msg = parseAuthError(e.code);
    onError(msg);
  }
}

export async function handleLogout() {
  await logout();
  window.location.href = 'index.html';
}

export async function handleSetup(uid, formData, onError, onSuccess) {
  try {
    showLoading(true);
    const translations = await translateRestaurantInfo(
      formData.tagline,
      formData.description,
      formData.cuisineType
    );
    const data = {
      ownerUid:      uid,
      slug:          formData.slug,
      name:          formData.name,
      tagline:       formData.tagline,
      description:   formData.description,
      cuisineType:   formData.cuisineType,
      address:       formData.address,
      phone:         formData.phone,
      whatsapp:      formData.whatsapp,
      email:         formData.email,
      instagram:     formData.instagram,
      facebook:      formData.facebook,
      mapsUrl:       formData.mapsUrl,
      brandColor:    formData.brandColor  || '#1a2744',
      accentColor:   formData.accentColor || '#c9a96e',
      textColor:     formData.textColor   || '#f5f0e8',
      openingHours:  { it: formData.openingHoursIt, en: formData.openingHoursEn },
      poweredBy:     true,
      translations,
    };
    await createRestaurant(data);
    onSuccess();
  } catch (e) {
    onError('Errore durante il salvataggio. Riprova.');
    console.error(e);
  } finally {
    showLoading(false);
  }
}

function parseAuthError(code) {
  switch (code) {
    case 'auth/user-not-found':      return 'Utente non trovato.';
    case 'auth/wrong-password':      return 'Password errata.';
    case 'auth/invalid-email':       return 'Email non valida.';
    case 'auth/too-many-requests':   return 'Troppi tentativi. Riprova tra qualche minuto.';
    case 'auth/invalid-credential':  return 'Credenziali non valide.';
    default:                         return 'Errore di accesso. Riprova.';
  }
}

function showLoading(show) {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = show ? 'flex' : 'none';
}
