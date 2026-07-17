document.querySelectorAll('input').forEach(x => x.oninput = calc);

document.addEventListener('click', function (e) {
  if (resultToInsert === null) return;
  if (e.target.matches('input[type="number"]')) {
    e.target.value = String(resultToInsert).replace('.', ',');
    e.target.classList.remove('pickTarget');
    document.querySelectorAll('input.pickTarget').forEach(x => x.classList.remove('pickTarget'));
    $('pickMsg').classList.remove('on');
    resultToInsert = null;
    calc();
  }
}, true);

document.addEventListener('pointerdown', function (e) {
  const el = e.target.closest('button,input,select');
  if (!el) return;
  el.classList.add('touchFx');
  setTimeout(() => el.classList.remove('touchFx'), 160);
}, { passive: true });

let lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive: false });

setNow();
calc();
