export function createAppShell({ modules = {} } = {}) {
  const readiness = new Map();

  return {
    modules,
    setReady(name, value = true) {
      readiness.set(name, Boolean(value));
    },
    isReady(name) {
      return readiness.get(name) === true;
    },
    snapshot() {
      return {
        ready: Object.fromEntries(readiness),
        modules: Object.keys(modules),
      };
    },
  };
}
