(() => {
  'use strict';

  // Zoé Lista – stabil, finoman animált kompakt gyorsbevitel.
  // A kompakt módot NEM a scrollY kapcsolja, mert a sticky composer
  // saját magasságváltozása visszahatna a scrollY-ra és görgetési pingpongot okozhat.
  // Ehelyett a composer ELŐTT lévő topbar helyzete dönt.
  const body = document.body;
  const topbar = document.querySelector('.topbar');
  const input = document.getElementById('itemInput');
  const addButton = document.querySelector('#addForm .add-btn');
  if (!body || !topbar || !input || !addButton) return;

  const normalPlaceholder = input.getAttribute('placeholder') || 'Termék hozzáadása';
  const normalButtonText = addButton.textContent || 'Hozzáadás';
  const compactPlaceholder = 'Termék hozzáadása…';

  // Kis hiszterézis: lefelé hamarabb csukunk, felfelé csak akkor nyitunk,
  // amikor a topbar már egyértelműen visszatért. Így nincs határérték-remegés.
  const COMPACT_ENTER_AT = 8;
  const COMPACT_EXIT_AT = 28;

  let compact = false;
  let frame = 0;

  function apply(next) {
    if (compact === next) return;
    compact = next;
    body.classList.toggle('ui-compact', compact);

    if (compact) {
      input.setAttribute('placeholder', compactPlaceholder);
      addButton.textContent = '+';
      addButton.setAttribute('aria-label', 'Termék hozzáadása');
      addButton.setAttribute('title', 'Termék hozzáadása');
    } else {
      input.setAttribute('placeholder', normalPlaceholder);
      addButton.textContent = normalButtonText;
      addButton.removeAttribute('aria-label');
      addButton.removeAttribute('title');
    }
  }

  function update() {
    frame = 0;

    // Ha a felhasználó TÉNYLEG gépel, maradjon nyitva a teljes beviteli sáv.
    // Mobilon az üres input görgetés közben is gyakran fókuszban marad;
    // önmagában a fókusz ezért többé nem akadályozza a kompakt módot.
    const typing = document.activeElement === input && input.value.trim().length > 0;
    if (typing) {
      apply(false);
      return;
    }

    // Stabil referencia: a topbar a composer előtt van, így a composer
    // zsugorodása/nyílása ezt a mérést nem tudja visszabillenteni.
    const topbarBottom = topbar.getBoundingClientRect().bottom;
    if (compact) apply(topbarBottom <= COMPACT_EXIT_AT);
    else apply(topbarBottom <= COMPACT_ENTER_AT);
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('orientationchange', schedule, {passive:true});
  input.addEventListener('focus', schedule);
  input.addEventListener('blur', schedule);
  input.addEventListener('input', schedule);

  update();
})();
