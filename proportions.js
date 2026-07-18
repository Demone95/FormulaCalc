let indiceProporzioneCalcolato = null;

function valoreProporzione(testo) {
  const valore = testo.trim().replace(/\s/g, '');
  if (!valore) return null;

  const ultimaVirgola = valore.lastIndexOf(',');
  const ultimoPunto = valore.lastIndexOf('.');
  let normalizzato = valore;
  if (ultimaVirgola !== -1 && ultimoPunto !== -1) {
    const separatoreDecimale = ultimaVirgola > ultimoPunto ? ',' : '.';
    const separatoreMigliaia = separatoreDecimale === ',' ? /\./g : /,/g;
    normalizzato = valore.replace(separatoreMigliaia, '').replace(separatoreDecimale, '.');
  } else {
    normalizzato = valore.replace(',', '.');
  }

  const numero = Number(normalizzato);
  return Number.isFinite(numero) ? numero : NaN;
}

function formattaProporzione(numero) {
  return numero.toLocaleString('it-IT', { maximumFractionDigits: 2 });
}

function calcolaProporzioneUniversale(event) {
  const ids = ['propA', 'propB', 'propC', 'propD'];
  const campi = ids.map($);
  const messaggio = $('proportionMessage');
  const editedId = event && event.target ? event.target.id : null;
  const editedIndice = ids.indexOf(editedId);

  let vuoti = campi.map((campo, indice) => campo.value.trim() === '' ? indice : null).filter(indice => indice !== null);

  if (vuoti.length === 0 && indiceProporzioneCalcolato !== null) {
    if (editedIndice === indiceProporzioneCalcolato) {
      // L'utente ha modificato manualmente il campo calcolato in precedenza:
      // accettiamo il nuovo valore e smettiamo di ricalcolarlo automaticamente.
      indiceProporzioneCalcolato = null;
      messaggio.textContent = '';
      return null;
    }
    // L'utente ha cambiato uno degli altri tre campi: continuiamo a ricalcolare
    // il campo che avevamo calcolato l'ultima volta, anche se ora è "pieno".
    vuoti = [indiceProporzioneCalcolato];
  }

  if (vuoti.length === 1 && vuoti[0] === editedIndice) {
    // L'utente sta svuotando proprio il campo su cui sta scrivendo:
    // lasciamolo vuoto invece di ricalcolarlo subito, altrimenti non
    // riuscirebbe mai a cancellarlo del tutto.
    messaggio.textContent = '';
    return null;
  }

  if (vuoti.length !== 1) {
    if (vuoti.length > 1) messaggio.textContent = 'Compila tre valori per calcolare il quarto.';
    else messaggio.textContent = '';
    return null;
  }

  const valori = campi.map(campo => valoreProporzione(campo.value));
  if (valori.some((valore, indice) => indice !== vuoti[0] && !Number.isFinite(valore))) {
    messaggio.textContent = 'Inserisci valori numerici validi.';
    return null;
  }

  const indice = vuoti[0];
  let risultato;
  if (indice === 0) risultato = valori[1] * valori[2] / valori[3];
  if (indice === 1) risultato = valori[0] * valori[3] / valori[2];
  if (indice === 2) risultato = valori[0] * valori[3] / valori[1];
  if (indice === 3) risultato = valori[1] * valori[2] / valori[0];

  if (!Number.isFinite(risultato)) {
    messaggio.textContent = 'Il valore divisore non può essere zero.';
    return null;
  }

  campi[indice].value = formattaProporzione(risultato);
  indiceProporzioneCalcolato = indice;
  messaggio.textContent = '';
  return indice;
}

function resetProportion() {
  ['propA', 'propB', 'propC', 'propD'].forEach(id => $(id).value = '');
  indiceProporzioneCalcolato = null;
  $('proportionMessage').textContent = 'Compila tre valori per calcolare il quarto.';
}

function saveProportion() {
  calcolaProporzioneUniversale();
  const campi = ['propA', 'propB', 'propC', 'propD'].map($);
  if (indiceProporzioneCalcolato === null || campi.some(campo => campo.value.trim() === '')) {
    return alert('Compila tre valori per calcolare il quarto.');
  }

  const etichette = ['A', 'B', 'C', 'D'];
  const valori = campi.map(campo => campo.value.trim());
  addHistory({
    type: 'Proporzioni',
    date: new Date().toLocaleString('it-IT'),
    rows: [
      'Proporzione: ' + valori[0] + ' : ' + valori[1] + ' = ' + valori[2] + ' : ' + valori[3],
      'Valore calcolato: ' + etichette[indiceProporzioneCalcolato] + ' = ' + valori[indiceProporzioneCalcolato]
    ]
  });
}

['propA', 'propB', 'propC', 'propD'].forEach(id => $(id).addEventListener('input', calcolaProporzioneUniversale));
