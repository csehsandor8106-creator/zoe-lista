(() => {
  'use strict';

  // Zoé Lista – vizuális termékcsaládok + üzleten belüli útvonal szerinti rendezés.
  // A felismerési és árlogikát nem módosítja; csak a már kirajzolt listát rendezi és színezi.
  const STORE_ROUTE = [
    'Zöldség-gyümölcs',
    'Pékáru',
    'Hús és felvágott',
    'Hal és tenger gyümölcsei',
    'Tejtermék és tojás',
    'Fagyasztott',
    'Alapélelmiszer',
    'Snack és édesség',
    'Italok',
    'Szeszes italok',
    'Háztartás',
    'Higiénia',
    'Baba és gyermek',
    'Állateledel',
    'Ruházat',
    'Virág és ajándék',
    'Egyéb'
  ];

  const FAMILY_COLORS = {
    'Zöldség-gyümölcs':'#55a95a',
    'Pékáru':'#c88a43',
    'Hús és felvágott':'#d45b62',
    'Hal és tenger gyümölcsei':'#4e9bd3',
    'Tejtermék és tojás':'#65b9cf',
    'Fagyasztott':'#7a9fd6',
    'Alapélelmiszer':'#b28b5e',
    'Snack és édesség':'#c46fba',
    'Italok':'#38a5a1',
    'Szeszes italok':'#8b65ad',
    'Háztartás':'#71808b',
    'Higiénia':'#df7f9e',
    'Baba és gyermek':'#dda55d',
    'Állateledel':'#987759',
    'Ruházat':'#6d79cf',
    'Virág és ajándék':'#c85d92',
    'Egyéb':'#7d8589'
  };

  const rank = new Map(STORE_ROUTE.map((name, index) => [name, index]));
  const root = document.getElementById('listRoot');
  if (!root) return;

  function categoryOf(section) {
    // A termékkártya első pill-je az app eredeti kategória-mezője.
    const categoryPill = section.querySelector('.item .pill:not(.estimate):not(.user)');
    if (categoryPill) return categoryPill.textContent.trim();

    const title = section.querySelector('.category-title');
    if (!title) return '';
    const copy = title.cloneNode(true);
    copy.querySelectorAll('span').forEach(node => node.remove());
    return copy.textContent.trim();
  }

  function productName(card) {
    return card.querySelector('.item-name')?.textContent?.trim() || '';
  }

  let queued = false;
  const observer = new MutationObserver(() => schedule());

  function applyLayout() {
    observer.disconnect();

    const sections = Array.from(root.children).filter(node => node.classList?.contains('category-block'));

    for (const section of sections) {
      const category = categoryOf(section) || 'Egyéb';
      section.dataset.family = category;
      section.style.setProperty('--family-color', FAMILY_COLORS[category] || FAMILY_COLORS['Egyéb']);

      const itemsBox = section.querySelector('.items');
      if (!itemsBox) continue;

      const cards = Array.from(itemsBox.children).filter(node => node.classList?.contains('item'));
      cards.sort((a, b) => productName(a).localeCompare(productName(b), 'hu', {
        sensitivity:'base',
        numeric:true
      }));
      for (const card of cards) itemsBox.appendChild(card);
    }

    sections.sort((a, b) => {
      const aName = categoryOf(a) || 'Egyéb';
      const bName = categoryOf(b) || 'Egyéb';
      const aRank = rank.has(aName) ? rank.get(aName) : 999;
      const bRank = rank.has(bName) ? rank.get(bName) : 999;
      return aRank - bRank || aName.localeCompare(bName, 'hu', {sensitivity:'base'});
    });

    for (const section of sections) root.appendChild(section);

    observer.observe(root, {childList:true, subtree:true});
  }

  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      applyLayout();
    });
  }

  observer.observe(root, {childList:true, subtree:true});
  applyLayout();
})();
