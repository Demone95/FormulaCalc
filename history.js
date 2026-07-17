function openHistory() {
  $('drawer').classList.add('on');
  $('ov').classList.add('on');
  renderHistory();
}

function closeHistory() {
  $('drawer').classList.remove('on');
  $('ov').classList.remove('on');
}

function getHistory() {
  return JSON.parse(localStorage.getItem('formulaProHistory') || '[]');
}

function putHistory(h) {
  localStorage.setItem('formulaProHistory', JSON.stringify(h));
  renderHistory();
}

function addHistory(x) {
  const h = getHistory();
  h.unshift(x);
  putHistory(h);
  openHistory();
}

function saveF() {
  if (!(v('kt') > 0 && v('po') > 0)) return alert('Inserisci i dati del calcolo');
  addHistory({
    type: 'Fine formulazione',
    date: new Date().toLocaleString('it-IT'),
    rows: [
      'Kg da formulare: ' + fmt(v('kt')),
      'Portata: ' + fmt(v('po')) + ' kg/h',
      'Kg formulati: ' + fmt(isNaN(v('fa')) ? 0 : v('fa')),
      'Kg per batch: ' + (isNaN(v('kb')) ? 'â€”' : fmt(v('kb')) + ' kg'),
      'Data di partenza: ' + ($('dataPartenza').value ? new Date($('dataPartenza').value + 'T00:00:00').toLocaleDateString('it-IT') : 'â€”'),
      'Ora di partenza: ' + $('ora').value,
      'Fine prevista: ' + $('fp').textContent
    ]
  });
}

function saveD() {
  if (!(v('kf') > 0 && v('km') >= 0)) return alert('Inserisci i dati del calcolo');
  addHistory({
    type: 'Dosaggio preservante',
    date: new Date().toLocaleString('it-IT'),
    rows: [
      'Kg formulati: ' + fmt(v('kf')),
      'Dosaggio: ' + fmt(v('km')) + ' kg/1000',
      'Kg da aggiungere: ' + $('r1').textContent,
      'Kg aggiunti: ' + (isNaN(v('ka')) ? 'â€”' : fmt(v('ka')) + ' kg')
    ]
  });
}

function renderHistory() {
  const h = getHistory();
  $('history').innerHTML = h.length
    ? h.map((x, i) => '<div class="histItem"><button class="del" onclick="delHistory(' + i + ')">Elimina</button><small>' + x.date + '</small><b>' + x.type + '</b>' + x.rows.map(r => '<p>' + r + '</p>').join('') + '</div>').join('')
    : '<p style="color:#94a3b8">Nessun calcolo salvato.</p>';
}

function delHistory(i) {
  const h = getHistory();
  h.splice(i, 1);
  putHistory(h);
}

function clearHistory() {
  if (confirm('Cancellare tutta la cronologia?')) putHistory([]);
}
