(() => {
  'use strict';

  // Zoé Lista – stabil kompakt gyorsbevitel.
  // Fontos: a kompakt módot NEM a scrollY kapcsolja, mert a sticky composer
  // saját magasságváltozása visszahat a scrollY-ra és görgetési pingpongot okozhat.
  // Ehelyett a composer ELŐTT lévő topbar helyzete dönt, amelyet a composer
  // összecsukása nem tud elmozdítani.
  const body = document.body;
  const topbar = document.querySelector('.topbar');
  const input = document.getElementById('itemInput');
  const addButton = document.querySelector('#addForm .add-btn');
  if (!body || !topbar || !input || !addButton) return;

  const normalPlaceholder = input.getAttribute('placeholder') || 'Termék hozzáadása';
  const normalButtonText = addButton.textContent || 'Hozzáadás';
  const compactPlaceholder = 'Termék hozzáadása…';

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

    // Gépelés közben maradjon nyitva a teljes beviteli sáv.
    if (document.activeElement === input) {
      apply(false);
      return;
    }

    // Stabil referencia: a topbar a composer előtt van, így a composer
    // zsugorodása/nyílása ezt a mérést nem tudja visszabillenteni.
    const topbarBottom = topbar.getBoundingClientRect().bottom;
    apply(topbarBottom <= 8);
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

  update();
})();
