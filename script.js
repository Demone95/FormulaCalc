(function () {
  const temaSalvato = localStorage.getItem('formulaProTema');
  if (temaSalvato === 'light') {
    document.body.classList.add('light');
    document.documentElement.classList.add('light');
  }
  const btnTema = $('themeBtn');
  if (btnTema) btnTema.textContent = temaSalvato === 'light' ? '☀️' : '🌙';
})();

function toggleTheme() {
  document.body.classList.toggle('light');
  document.documentElement.classList.toggle('light');
  const chiaro = document.body.classList.contains('light');
  localStorage.setItem('formulaProTema', chiaro ? 'light' : 'dark');
  const btnTema = $('themeBtn');
  if (btnTema) btnTema.textContent = chiaro ? '☀️' : '🌙';
}

document.querySelectorAll('input').forEach(x => x.oninput = calc);

// Navigazione tra i campi: premendo "Avanti" sulla tastiera si passa al campo successivo.
const ordineCampi = {
  kf: 'km', km: 'ka',
  kt: 'po', po: 'fa',
  portataBatch: 'kb', kb: 'dataPartenzaBatch', numBatch: null,
  propA: 'propB', propB: 'propC', propC: 'propD'
};

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const id = e.target.id;
  if (!(id in ordineCampi)) return;
  e.preventDefault();
  const prossimoId = ordineCampi[id];
  const prossimo = prossimoId ? $(prossimoId) : null;
  if (prossimo) prossimo.focus();
  else e.target.blur();
});

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
  if (!el || el.classList.contains('tab')) return;
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
initializeBatch();
