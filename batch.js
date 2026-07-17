let batchPlan = null;

function resetBatchResults() {
  $('tempoDisp').textContent = '—';
  $('kgProd').textContent = '—';
  $('batchComp').textContent = '0';
  $('ultimoBatch').textContent = '—';
  batchPlan = null;
}

function prossimoInizioLavorativo(data) {
  const d = new Date(data);
  const giorno = d.getDay();
  const primaDelleSei = d.getHours() < 6;
  const dopoSabato = giorno === 6 && d.getHours() >= 6;

  if (giorno === 0 || dopoSabato) {
    d.setDate(d.getDate() + (giorno === 6 ? 2 : 1));
    d.setHours(6, 0, 0, 0);
  } else if (giorno === 1 && primaDelleSei) {
    d.setHours(6, 0, 0, 0);
  }
  return d;
}

function fineFinestraLavorativa(data) {
  const d = new Date(data);
  const giorniAlSabato = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + giorniAlSabato);
  d.setHours(6, 0, 0, 0);
  return d;
}

function minutiLavorativiDisponibili(inizio, limite) {
  let corrente = prossimoInizioLavorativo(inizio);
  let minuti = 0;

  while (corrente < limite) {
    const fineFinestra = fineFinestraLavorativa(corrente);
    const fine = fineFinestra < limite ? fineFinestra : limite;
    minuti += Math.max(0, Math.floor((fine - corrente) / 60000));
    if (fine >= limite) break;
    corrente = prossimoInizioLavorativo(fine);
  }
  return minuti;
}

function dataLimiteBatch() {
  const data = $('dataFine').value;
  const ora = $('oraFine').value;
  return data && ora ? new Date(data + 'T' + ora + ':00') : null;
}

function formattaTempo(minuti) {
  return Math.floor(minuti / 60) + ' h ' + minuti % 60 + ' min';
}

function calcBatch() {
  const portata = v('po');
  const kgPerBatch = v('kb');
  const inizio = startDate();
  const limite = dataLimiteBatch();

  if (!(portata > 0 && kgPerBatch > 0 && limite instanceof Date && !isNaN(limite) && limite > inizio)) {
    resetBatchResults();
    return;
  }

  const minuti = minutiLavorativiDisponibili(inizio, limite);
  const kgProducibili = portata * minuti / 60;
  const batchCompleti = Math.floor(kgProducibili / kgPerBatch);
  const residuoCalcolato = kgProducibili - batchCompleti * kgPerBatch;
  const ultimoParziale = residuoCalcolato > 0.000001 ? residuoCalcolato : 0;

  $('tempoDisp').textContent = formattaTempo(minuti);
  $('kgProd').textContent = fmt(kgProducibili) + ' kg';
  $('batchComp').textContent = String(batchCompleti);
  $('ultimoBatch').textContent = ultimoParziale ? fmt(ultimoParziale) + ' kg (parziale)' : '—';
  batchPlan = { inizio, portata, kgPerBatch, minuti, kgProducibili, batchCompleti, ultimoParziale };
}

function fineBatch(kg) {
  return fineLavorativa(batchPlan.inizio, Math.round(kg / batchPlan.portata * 60));
}

function formatoDataOra(data) {
  return data.toLocaleDateString('it-IT') + ' · ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function openBatchDetails() {
  calcBatch();
  if (!batchPlan) {
    alert('Inserisci data e ora limite, portata e kg per batch validi.');
    return;
  }

  const righe = [];
  for (let i = 1; i <= batchPlan.batchCompleti; i++) {
    const kgCumulativi = i * batchPlan.kgPerBatch;
    righe.push('<div class="histItem"><b>Batch ' + i + '</b><p>' + fmt(batchPlan.kgPerBatch) + ' kg</p><small>Completamento: ' + formatoDataOra(fineBatch(kgCumulativi)) + '</small></div>');
  }
  if (batchPlan.ultimoParziale) {
    righe.push('<div class="histItem batchPartial"><b>Ultimo batch parziale</b><p>' + fmt(batchPlan.ultimoParziale) + ' kg</p><small>Completamento: ' + formatoDataOra(fineBatch(batchPlan.kgProducibili)) + '</small></div>');
  }

  $('batchDetails').innerHTML = '<p class="batchSummary">Tempo disponibile: <b>' + formattaTempo(batchPlan.minuti) + '</b><br>Kg producibili: <b>' + fmt(batchPlan.kgProducibili) + ' kg</b></p>' + (righe.length ? righe.join('') : '<p class="batchEmpty">Nessun batch completabile nel periodo selezionato.</p>');
  $('batchModal').classList.add('on');
}

function closeBatchDetails() {
  $('batchModal').classList.remove('on');
}

function initializeBatch() {
  ['po', 'kb', 'dataPartenza', 'ora', 'dataFine', 'oraFine'].forEach(id => {
    $(id).addEventListener('input', calcBatch);
  });
  $('btnBatch').addEventListener('click', openBatchDetails);
  calcBatch();
}
