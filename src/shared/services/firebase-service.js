export function getFirebaseServices(windowRef = window) {
  return {
    db: windowRef.db,
    auth: windowRef.auth,
    storage: windowRef.storage,
    fb: windowRef.FB,
  };
}
