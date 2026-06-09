// menus/firebase.js
// MyRestaurantAI — configurazione Firebase

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs }
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
const db  = getFirestore(app);

export async function getRestaurantBySlug(slug) {
  const q    = query(collection(db, 'restaurants'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getMenusByRestaurant(restaurantId) {
  const q = query(
    collection(db, 'menus'),
    where('restaurantId', '==', restaurantId),
    where('status', '==', 'active'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function getDishesByRestaurant(restaurantId) {
  const q    = query(
    collection(db, 'dishes'),
    where('restaurantId', '==', restaurantId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
