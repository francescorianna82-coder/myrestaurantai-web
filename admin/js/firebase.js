// admin/js/firebase.js
// MyRestaurantAI — configurazione Firebase admin

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyAWjqSkP7n4R6WG5s_xWLE__2cPXXC-Ig0',
  authDomain:        'myrestaurantai-f04dc.firebaseapp.com',
  projectId:         'myrestaurantai-f04dc',
  storageBucket:     'myrestaurantai-f04dc.firebasestorage.app',
  messagingSenderId: '389066884592',
  appId:             '1:389066884592:web:b8963bb9483e857b7c0935',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── RISTORANTE ──────────────────────────────────────────────────────────────

export async function getRestaurantByUid(uid) {
  const q    = query(collection(db, 'restaurants'), where('ownerUid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function createRestaurant(data) {
  return addDoc(collection(db, 'restaurants'), { ...data, createdAt: serverTimestamp() });
}

export async function updateRestaurant(id, data) {
  return updateDoc(doc(db, 'restaurants', id), { ...data, updatedAt: serverTimestamp() });
}

// ─── PIATTI ──────────────────────────────────────────────────────────────────

export async function getDishes(restaurantId) {
  const q    = query(collection(db, 'dishes'), where('restaurantId', '==', restaurantId), orderBy('category'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addDish(data) {
  return addDoc(collection(db, 'dishes'), { ...data, createdAt: serverTimestamp() });
}

export async function updateDish(id, data) {
  return updateDoc(doc(db, 'dishes', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDish(id) {
  return deleteDoc(doc(db, 'dishes', id));
}

// ─── MENU ────────────────────────────────────────────────────────────────────

export async function getMenus(restaurantId) {
  const q    = query(collection(db, 'menus'), where('restaurantId', '==', restaurantId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addMenu(data) {
  return addDoc(collection(db, 'menus'), { ...data, createdAt: serverTimestamp() });
}

export async function updateMenu(id, data) {
  return updateDoc(doc(db, 'menus', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteMenu(id) {
  return deleteDoc(doc(db, 'menus', id));
}
