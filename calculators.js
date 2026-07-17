function tab(id, b) {
  document.querySelectorAll('.page,.tab').forEach(x => x.classList.remove('on'));
  $(id).classList.add('on');
  b.classList.add('on');
}

function fineLavorativa(inizio, minuti) {
  let d = new Date(inizio), resto = minuti;
  while (resto > 0) {
    const g = d.getDay(), h = d.getHours();
    if (g === 0 || (g === 6 && h >= 6) || (g === 1 && h < 6)) {
      const giorni = g === 6 ? 2 : g === 0 ? 1 : 0;
      d.setDate(d.getDate() + giorni);
      d.setHours(6, 0, 0, 0);
      continue;
    }
    let stop = new Date(d);
    if (g === 5) {
      stop.setDate(stop.getDate() + 1);
      stop.setHours(6, 0, 0, 0);
    } else if (g === 6 && h < 6) {
      stop.setHours(6, 0, 0, 0);
    } else {
      stop = new Date(d.getTime() + resto * 60000);
    }
    const disp = Math.floor((stop - d) / 60000);
    if (resto <= disp) {
      d = new Date(d.getTime() + resto * 60000);
      resto = 0;
    } else {
      d = stop;
      resto -= disp;
    }
  }
  return d;
}

function calc() {
  const f = v('kf'), m = v('km'), a = v('ka');
  $('r1').textContent = f > 0 && !isNaN(m) ? fmt(f * m / 1000) + ' kg' : '—';
  $('r2').textContent = f > 0 && !isNaN(a) ? fmt(a / f * 100, 3) + ' %' : '—';
  $('r3').textContent = f > 0 && !isNaN(a) ? fmt(a / f * 1000) + ' kg' : '—';

  const t = v('kt'), p = v('po');
  let q = v('fa');
  if (t > 0 && p > 0) {
    q = isNaN(q) ? 0 : q;
    const r = Math.max(0, t - q);
    const min = Math.round(r / p * 60);
    const per = Math.max(0, Math.min(100, q / t * 100));
    const e = fineLavorativa(startDate(), min);
    $('rr').textContent = fmt(r) + ' kg';
    $('pc').textContent = fmt(per, 1) + ' %';
    $('tr').textContent = Math.floor(min / 60) + ' h ' + min % 60 + ' min';
    $('fp').textContent = e.toLocaleDateString('it-IT') + ' · ' + e.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    $('bar').style.width = per + '%';
    $('bt').textContent = fmt(per, 0) + '%';
  }
}

function resetD() {
  ['kf', 'km', 'ka'].forEach(x => $(x).value = '');
  calc();
}

function resetF() {
  ['kt', 'po', 'fa'].forEach(x => $(x).value = '');
  $('rr').textContent = '—';
  $('pc').textContent = '—';
  $('tr').textContent = '—';
  $('fp').textContent = '—';
  $('bar').style.width = '0%';
  $('bt').textContent = '0%';
}

function setNow() {
  const d = new Date();
  $('dataPartenza').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  $('ora').value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function useCurrentTime() {
  setNow();
  calc();
  calcBatch();
}

function startDate() {
  const ds = $('dataPartenza').value, x = $('ora').value;
  const d = ds ? new Date(ds + 'T00:00:00') : new Date();
  if (x) {
    const z = x.split(':');
    d.setHours(+z[0], +z[1], 0, 0);
  }
  return d;
}
