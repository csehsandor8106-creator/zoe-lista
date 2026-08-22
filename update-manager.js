(() => {
  'use strict';

  if (!('serviceWorker' in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  async function forceUpdate() {
    try {
      const reg = await navigator.serviceWorker.getRegistration('./');
      if (reg) await reg.update();
    } catch {}
  }

  window.addEventListener('load', forceUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') forceUpdate();
  });
})();
