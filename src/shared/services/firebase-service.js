import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js';

let firebaseServices = null;

export const firestoreApi = Object.freeze({
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
  orderBy,
  limit,
});

export const authApi = Object.freeze({
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
});

export const storageApi = Object.freeze({
  ref,
  uploadBytes,
  getDownloadURL,
});

export function createFirebaseServices(config) {
  if (!config?.apiKey) {
    throw new Error('Firebase config missing. Check js/app-config.js.');
  }

  if (!firebaseServices) {
    const app = initializeApp(config);
    firebaseServices = {
      app,
      db: getFirestore(app),
      auth: getAuth(app),
      storage: getStorage(app),
      fb: firestoreApi,
      authApi,
      storageApi,
    };
  }

  return firebaseServices;
}

export function installFirebaseGlobals(windowRef = window, config = windowRef.ASWA_CONFIG?.FIREBASE) {
  const services = createFirebaseServices(config);

  windowRef.db = services.db;
  windowRef.auth = services.auth;
  windowRef.storage = services.storage;
  windowRef.FB = services.fb;
  windowRef.FBAuth = services.authApi;
  windowRef.FBStorage = services.storageApi;
  windowRef.ASWA_STORAGE_ENABLED = windowRef.ASWA_CONFIG?.STORAGE_MODE === 'firebase_storage';
  windowRef.ST_REF = services.storageApi.ref;
  windowRef.ST_UP = services.storageApi.uploadBytes;
  windowRef.ST_URL = services.storageApi.getDownloadURL;

  return services;
}

export function getFirebaseServices(windowRef = window) {
  return {
    db: windowRef.db,
    auth: windowRef.auth,
    storage: windowRef.storage,
    fb: windowRef.FB,
    authApi: windowRef.FBAuth,
    storageApi: windowRef.FBStorage,
  };
}
