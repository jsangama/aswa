export function createAppStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState() {
      return { ...state };
    },
    setState(patch) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(this.getState()));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
