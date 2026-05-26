/**
 * Deprecated Firebase helper kept for compatibility.
 */

export const db = window.db || null;

function requireFirebase() {
  if (!window.FB || !window.db) {
    throw new Error('Firebase is not initialized. Check index.html.');
  }

  return { FB: window.FB, db: window.db };
}

export const addDocument = async (collectionName, data) => {
  const { FB, db: firestore } = requireFirebase();
  const docRef = await FB.addDoc(FB.collection(firestore, collectionName), data);
  return docRef.id;
};

export const getDocument = async (collectionName, id) => {
  const { FB, db: firestore } = requireFirebase();
  const docRef = FB.doc(firestore, collectionName, id);
  const docSnap = await FB.getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Document not found.');
  }

  return docSnap.data();
};
