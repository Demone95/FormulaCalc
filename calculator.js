let cv = '0', aa = null, oo = null, nw = true, ex = '';
let resultToInsert = null;

function sym(x) {
  return x === '/' ? '÷' : x === '*' ? '×' : x === '-' ? '−' : '+';
}

function sh() {
  $('result').textContent = cv.replace('.', ',');
  $('expr').textContent = ex;
  document.querySelectorAll('.keys .op').forEach(b => b.classList.toggle('active', b.dataset.op === oo));
}

function openCalc() {
  $('cm').classList.add('on');
  sh();
}

function closeCalc() {
  $('cm').classList.remove('on');
}

function dg(x) {
  if (nw) {
    cv = x === '.' ? '0.' : x;
    nw = false;
  } else if (x !== '.' || !cv.includes('.')) {
    cv += x;
  }
  if (oo) ex = String(aa).replace('.', ',') + ' ' + sym(oo) + ' ' + cv.replace('.', ',');
  sh();
}

function cl() {
  cv = '0';
  aa = null;
  oo = null;
  nw = true;
  ex = '';
  sh();
}

function bk() {
  if (nw) return;
  cv = cv.length > 1 ? cv.slice(0, -1) : '0';
  if (oo) ex = String(aa).replace('.', ',') + ' ' + sym(oo) + ' ' + cv.replace('.', ',');
  sh();
}

function pct() {
  cv = String(parseFloat(cv) / 100);
  if (oo) ex = String(aa).replace('.', ',') + ' ' + sym(oo) + ' ' + cv.replace('.', ',');
  sh();
}

function run() {
  const b = parseFloat(cv);
  if (oo === '+') aa += b;
  if (oo === '-') aa -= b;
  if (oo === '*') aa *= b;
  if (oo === '/') aa = b === 0 ? 0 : aa / b;
  cv = String(aa);
}

function opr(x) {
  if (oo && !nw) run();
  else aa = parseFloat(cv);
  oo = x;
  nw = true;
  ex = String(aa).replace('.', ',') + ' ' + sym(x);
  sh();
}

function eq() {
  if (oo && !nw) {
    const old = ex;
    run();
    ex = old + ' =';
    oo = null;
    nw = true;
    sh();
  }
}

function useResult() {
  resultToInsert = parseFloat(cv);
  if (!isFinite(resultToInsert)) return;
  closeCalc();
  $('pickMsg').classList.add('on');
  document.querySelectorAll('input[type="number"]').forEach(x => x.classList.add('pickTarget'));
}

function cancelUseResult() {
  resultToInsert = null;
  $('pickMsg').classList.remove('on');
  document.querySelectorAll('input.pickTarget').forEach(x => x.classList.remove('pickTarget'));
}
