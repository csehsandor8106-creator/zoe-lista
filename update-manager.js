(() => {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  // Védelmek a service-worker frissítési hurok ellen.
  // Egy controller-váltás legfeljebb egyszer töltheti újra az oldalt rövid időn belül,
  // és a load/visibilitychange események sem indíthatnak egymásra torlódó update() hívásokat.
  const RELOAD_KEY = 'zoe-lista-sw-reload-at';
  const CHECK_KEY = 'zoe-lista-sw-check-at';
  const RELOAD_GUARD_MS = 60 * 1000;
  const CHECK_GUARD_MS = 30 * 1000;

  let updateInFlight = false;
  let hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Első telepítéskor nincs régi controller, ezért ott nincs szükség újratöltésre.
    if (!hadController) {
      hadController = true;
      return;
    }

    const now = Date.now();
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (now - lastReload < RELOAD_GUARD_MS) return;

    sessionStorage.setItem(RELOAD_KEY, String(now));
    location.reload();
  });

  async function checkForUpdate() {
    if (updateInFlight) return;

    const now = Date.now();
    const lastCheck = Number(sessionStorage.getItem(CHECK_KEY) || 0);
    if (now - lastCheck < CHECK_GUARD_MS) return;

    sessionStorage.setItem(CHECK_KEY, String(now));
    updateInFlight = true;
    try {
      const reg = await navigator.serviceWorker.getRegistration('./');
      if (reg) await reg.update();
    } catch {
      // Offline vagy átmeneti hálózati hiba esetén az app a meglévő cache-sel működik tovább.
    } finally {
      updateInFlight = false;
    }
  }

  window.addEventListener('load', checkForUpdate, {once:true});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
})();
