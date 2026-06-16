export function createStorageAdapter({ getBusinessId, storage = window.localStorage } = {}) {
  const resolveBusinessId = () => {
    const id = typeof getBusinessId === 'function' ? getBusinessId() : getBusinessId;
    return String(id || 'aswa001');
  };

  const keyFor = (key) => `${resolveBusinessId()}_${key}`;

  return {
    keyFor,
    get(key) {
      return storage.getItem(keyFor(key));
    },
    set(key, value) {
      storage.setItem(keyFor(key), String(value));
    },
    remove(key) {
      storage.removeItem(keyFor(key));
    },
    getJson(key, fallback = null) {
      const raw = storage.getItem(keyFor(key));
      if (!raw) return fallback;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return fallback;
      }
    },
    setJson(key, value) {
      storage.setItem(keyFor(key), JSON.stringify(value));
    },
  };
}
