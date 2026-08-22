(() => {
  'use strict';

  // Zoé Lista – görgetéskor kompakt gyorsbevitel.
  // Csak UI-osztályokat és feliratokat módosít; az app adat- és felismerési logikájához nem nyúl.
  const body = document.body;
  const input = document.getElementById('itemInput');
  const addButton = document.querySelector('#addForm .add-btn');
  if (!body || !input || !addButton) return;

  const normalPlaceholder = input.getAttribute('placeholder') || 'Termék hozzáadása';
  const normalButtonText = addButton.textContent || 'Hozzáadás';
  const compactPlaceholder = 'Termék hozzáadása…';
  const THRESHOLD = 92;

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
    // Ha a felhasználó épp a mezőben dolgozik, maradjon a teljes Hozzáadás felirat.
    const editing = document.activeElement === input;
    apply(window.scrollY > THRESHOLD && !editing);
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive:true});
  input.addEventListener('focus', schedule);
  input.addEventListener('blur', schedule);
  window.addEventListener('resize', schedule, {passive:true});
  update();
})();
