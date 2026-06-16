export function createPwaCacheController({
  cacheName,
  serviceWorker,
  location,
  sessionStorage,
} = {}) {
  const reloadKey = () => `aswa_sw_reload_${cacheName}`;

  return {
    cacheName,
    async refreshInstalledClients() {
      if (!serviceWorker || !cacheName) return false;
      const regs = await serviceWorker.getRegistrations();
      await Promise.all(regs.map(async (reg) => {
        await reg.update();
        reg.waiting?.postMessage('skipWaiting');
      }));
      return true;
    },
    markReloadUrl() {
      if (!location || !cacheName) return '';
      const url = new URL(location.href);
      url.searchParams.set('aswa_sw', cacheName);
      return url.href;
    },
    shouldReloadOnce() {
      if (!sessionStorage || !cacheName) return false;
      if (sessionStorage.getItem(reloadKey()) === '1') return false;
      sessionStorage.setItem(reloadKey(), '1');
      return true;
    },
  };
}
