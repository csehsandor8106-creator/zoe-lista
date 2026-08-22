(() => {
  'use strict';

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  if (!form || !input) return;

  function expandPackageShorthand(value) {
    const s = String(value || '').trim();
    let m = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:cs|csom)\.?\s+(.+)$/i);
    if (m) return `${m[1]} csomag ${m[2]}`;

    m = s.match(/^(?:cs|csom)\.?\s+(.+)$/i);
    if (m) return `1 csomag ${m[1]}`;

    m = s.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:cs|csom)\.?$/i);
    if (m) return `${m[1]} ${m[2]} csomag`;

    return s;
  }

  form.addEventListener('submit', () => {
    input.value = expandPackageShorthand(input.value);
  });
})();
