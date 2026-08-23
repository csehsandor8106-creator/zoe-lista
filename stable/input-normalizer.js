(() => {
  'use strict';

  const form = document.getElementById('addForm');
  const input = document.getElementById('itemInput');
  if (!form || !input) return;

  function canonicalUnit(raw) {
    const u = String(raw || '').toLowerCase().replace('.','');
    if (u === 'cs' || u === 'csom') return 'csomag';
    if (u === 'uveg') return 'üveg';
    if (u === 'zacsko' || u === 'zacskó') return 'csomag';
    return u;
  }

  function expandShoppingShorthand(value) {
    const s = String(value || '').trim();
    const U = 'kg|g|l|ml|db|cs|csom|csomag|doboz|üveg|uveg|flakon|zacskó|zacsko';
    let m;

    // pl. 2 cs zokni -> 2 csomag zokni
    m = s.match(new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*(' + U + ')\\.?\\s+(.+)$','i'));
    if (m) return `${m[1]} ${canonicalUnit(m[2])} ${m[3]}`;

    // pl. cs zokni / db paprika / kg fokhagyma -> 1 ...
    m = s.match(new RegExp('^(' + U + ')\\.?\\s+(.+)$','i'));
    if (m) return `1 ${canonicalUnit(m[1])} ${m[2]}`;

    // pl. zokni 2 cs -> zokni 2 csomag
    m = s.match(new RegExp('^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(' + U + ')\\.?$','i'));
    if (m) return `${m[1]} ${m[2]} ${canonicalUnit(m[3])}`;

    // pl. kaliforniai paprika db -> kaliforniai paprika 1 db
    m = s.match(new RegExp('^(.+?)\\s+(' + U + ')\\.?$','i'));
    if (m) return `${m[1]} 1 ${canonicalUnit(m[2])}`;

    return s;
  }

  form.addEventListener('submit', () => {
    input.value = expandShoppingShorthand(input.value);
  }, true);
})();
