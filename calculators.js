function tab(id, b) {
  document.querySelectorAll('.page,.tab').forEach(x => x.classList.remove('on'));
  $(id).classList.add('on');
  b.classList.add('on');
}

function switchTab(id) {
  document.querySelectorAll('.page,.tab').forEach(x => x.classList.remove('on'));
  const pagina = $(id);
  if (pagina) pagina.classList.add('on');
  document.querySelectorAll('.tab').forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    if (onclickAttr.indexOf("'" + id + "'") !== -1) btn.classList.add('on');
  });
}

function calc() {
  const f = v('kf'), m = v('km'), a = v('ka');
  const msgD = $('dosaggioMessage');
  if (msgD) {
    if ($('kf').value.trim() !== '' && !(f > 0)) { msgD.textContent = 'Inserisci kg formulati maggiori di zero.'; msgD.classList.add('error'); }
    else if ($('km').value.trim() !== '' && !(m >= 0)) { msgD.textContent = 'Il dosaggio non può essere negativo.'; msgD.classList.add('error'); }
    else if ($('ka').value.trim() !== '' && !(a >= 0)) { msgD.textContent = 'I kg aggiunti non possono essere negativi.'; msgD.classList.add('error'); }
    else { msgD.textContent = ''; msgD.classList.remove('error'); }
  }
  $('r1').textContent = f > 0 && !isNaN(m) ? fmt(f * m / 1000) + ' kg' : '—';
  $('r2').textContent = f > 0 && !isNaN(a) ? fmt(a / f * 100, 3) + ' %' : '—';
  $('r3').textContent = f > 0 && !isNaN(a) ? fmt(a / f * 1000) + ' kg' : '—';

  const t = v('kt'), p = v('po');
  let q = v('fa');
  const msgF = $('formulazioneMessage');
  if (msgF) {
    if ($('kt').value.trim() !== '' && !(t > 0)) { msgF.textContent = 'Inserisci kg da formulare maggiori di zero.'; msgF.classList.add('error'); }
    else if ($('po').value.trim() !== '' && !(p > 0)) { msgF.textContent = 'La portata deve essere maggiore di zero.'; msgF.classList.add('error'); }
    else if ($('fa').value.trim() !== '' && !(q >= 0)) { msgF.textContent = 'I kg formulati non possono essere negativi.'; msgF.classList.add('error'); }
    else { msgF.textContent = ''; msgF.classList.remove('error'); }
  }
  if (t > 0 && p > 0) {
    q = isNaN(q) ? 0 : q;
    const r = Math.max(0, t - q);
    const min = Math.round(r / p * 60);
    const per = Math.max(0, Math.min(100, q / t * 100));
    const e = calcolaTempoLavorativo(startDate(), min);
    $('rr').textContent = fmt(r) + ' kg';
    $('pc').textContent = fmt(per, 1) + ' %';
    $('tr').textContent = Math.floor(min / 60) + ' h ' + min % 60 + ' min';
    $('fp').textContent = e.toLocaleDateString('it-IT') + ' · ' + e.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}

function resetD() {
  ['kf', 'km', 'ka'].forEach(x => $(x).value = '');
  if ($('dosaggioMessage')) $('dosaggioMessage').textContent = '';
  calc();
}

function resetF() {
  ['kt', 'po', 'fa', 'dataPartenza', 'ora'].forEach(x => $(x).value = '');
  $('rr').textContent = '—';
  $('pc').textContent = '—';
  $('tr').textContent = '—';
  $('fp').textContent = '—';
  if ($('formulazioneMessage')) $('formulazioneMessage').textContent = '';
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
