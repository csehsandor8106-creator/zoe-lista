(() => {
  'use strict';

  const APP_PREFIX = 'zoe-lista-';
  const STABLE_PREFIX = 'zoe-lista-stable-';
  const proto = Storage.prototype;
  const native = {
    getItem: proto.getItem,
    setItem: proto.setItem,
    removeItem: proto.removeItem,
    clear: proto.clear,
    key: proto.key,
    length: Object.getOwnPropertyDescriptor(proto, 'length')?.get || null
  };

  const stableAreas = new Set([window.localStorage, window.sessionStorage]);

  function mapKey(key) {
    const value = String(key);
    if (value.startsWith(STABLE_PREFIX)) return value;
    if (value.startsWith(APP_PREFIX)) return STABLE_PREFIX + value.slice(APP_PREFIX.length);
    return value;
  }

  function unmapKey(key) {
    const value = String(key || '');
    if (value.startsWith(STABLE_PREFIX)) return APP_PREFIX + value.slice(STABLE_PREFIX.length);
    return value;
  }

  function shouldNamespace(storage, key) {
    return stableAreas.has(storage) && String(key).startsWith(APP_PREFIX);
  }

  proto.getItem = function(key) {
    return native.getItem.call(this, shouldNamespace(this, key) ? mapKey(key) : key);
  };

  proto.setItem = function(key, value) {
    return native.setItem.call(this, shouldNamespace(this, key) ? mapKey(key) : key, value);
  };

  proto.removeItem = function(key) {
    return native.removeItem.call(this, shouldNamespace(this, key) ? mapKey(key) : key);
  };

  proto.key = function(index) {
    if (!stableAreas.has(this) || !native.length) return native.key.call(this, index);
    const keys = [];
    const length = native.length.call(this);
    for (let i = 0; i < length; i += 1) {
      const key = native.key.call(this, i);
      if (key && key.startsWith(STABLE_PREFIX)) keys.push(unmapKey(key));
    }
    return keys[Number(index)] ?? null;
  };

  proto.clear = function() {
    if (!stableAreas.has(this) || !native.length) return native.clear.call(this);
    const remove = [];
    const length = native.length.call(this);
    for (let i = 0; i < length; i += 1) {
      const key = native.key.call(this, i);
      if (key && key.startsWith(STABLE_PREFIX)) remove.push(key);
    }
    remove.forEach(key => native.removeItem.call(this, key));
  };

  // A natív storage eseményben a fizikai (stable-) kulcs érkezik.
  // Küldünk mellé egy logikai kulcsú eseményt, így a meglévő modulok változtatás nélkül működnek.
  window.addEventListener('storage', event => {
    const key = event.key;
    if (!key || !key.startsWith(STABLE_PREFIX)) return;
    const area = event.storageArea;
    if (area !== window.localStorage && area !== window.sessionStorage) return;
    window.dispatchEvent(new StorageEvent('storage', {
      key: unmapKey(key),
      oldValue: event.oldValue,
      newValue: event.newValue,
      url: event.url,
      storageArea: area
    }));
  }, true);

  window.ZoeStableStorage = Object.freeze({
    version: 1,
    appPrefix: APP_PREFIX,
    stablePrefix: STABLE_PREFIX,
    mapKey,
    unmapKey
  });
})();
