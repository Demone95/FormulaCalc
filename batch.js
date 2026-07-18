let batchPlan = null;

function resetBatchResults() {
  $('tempoDisp').textContent = '\u2014';
  $('kgProd').textContent = '\u2014';
  $('batchComp').textContent = '0';
  $('ultimoBatch').textContent = '\u2014';
  batchPlan = null;
}

function dataOraBatch(dataId, oraId) {
  const data = $(dataId).value, ora = $(oraId).value;
  return data && ora ? new Date(data + 'T' + ora + ':00') : null;
}

function formattaTempo(minuti) {
  return Math.floor(minuti / 60) + ' h ' + minuti % 60 + ' min';
}

function calcBatch() {
  const portata = v('portataBatch'), kgPerBatch = v('kb');
  const inizio = dataOraBatch('dataPartenzaBatch', 'oraBatch');
  const limite = dataOraBatch('dataFine', 'oraFine');

  if (!(portata > 0 && kgPerBatch > 0 && inizio && limite && !isNaN(inizio) && !isNaN(limite) && limite > inizio)) {
    resetBatchResults();
    return;
  }

  const minuti = calcolaTempoLavorativo(inizio, limite);
  const kgProducibili = portata * minuti / 60;
  const batchCompleti = Math.floor(kgProducibili / kgPerBatch);
  const residuo = kgProducibili - batchCompleti * kgPerBatch;
  const ultimoParziale = residuo > 0.000001 ? residuo : 0;
  const ultimoBatchCompletamento = ultimoParziale ? calcolaTempoLavorativo(inizio, Math.round(kgProducibili / portata * 60)) : null;
  const ultimoBatchData = ultimoBatchCompletamento ? ultimoBatchCompletamento.toLocaleDateString('it-IT') : null;
  const ultimoBatchOra = ultimoBatchCompletamento ? ultimoBatchCompletamento.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : null;

  $('tempoDisp').textContent = formattaTempo(minuti);
  $('kgProd').textContent = fmt(kgProducibili) + ' kg';
  $('batchComp').textContent = String(batchCompleti);
  $('ultimoBatch').textContent = ultimoParziale ? fmt(ultimoParziale) + ' kg (parziale)' : '\u2014';
  batchPlan = { inizio, limite, portata, kgPerBatch, minuti, kgProducibili, batchCompleti, ultimoParziale, ultimoBatchCompletamento, ultimoBatchData, ultimoBatchOra };
}

function fineBatch(kg) {
  return calcolaTempoLavorativo(batchPlan.inizio, Math.round(kg / batchPlan.portata * 60));
}

function formatoDataOra(data) {
  return data.toLocaleDateString('it-IT') + ' \u00B7 ' + data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function openBatchDetails() {
  calcBatch();
  if (!batchPlan) return alert('Inserisci data e ora di partenza e limite, portata e kg per batch validi.');

  const righe = [];
  for (let i = 1; i <= batchPlan.batchCompleti; i++) {
    const cumulativi = i * batchPlan.kgPerBatch;
    righe.push('<div class="histItem"><b>Batch ' + i + '</b><p>' + fmt(batchPlan.kgPerBatch) + ' kg</p><small>Completamento: ' + formatoDataOra(fineBatch(cumulativi)) + '</small></div>');
  }
  if (batchPlan.ultimoParziale) {
    righe.push('<div class="histItem batchPartial"><b>Ultimo batch parziale</b><p>' + fmt(batchPlan.ultimoParziale) + ' kg</p><small>Completamento: ' + formatoDataOra(batchPlan.ultimoBatchCompletamento) + '</small></div>');
  }

  $('batchDetails').innerHTML = '<p class="batchSummary">Tempo disponibile: <b>' + formattaTempo(batchPlan.minuti) + '</b><br>Kg producibili: <b>' + fmt(batchPlan.kgProducibili) + ' kg</b></p>' + (righe.length ? righe.join('') : '<p class="batchEmpty">Nessun batch completabile nel periodo selezionato.</p>');
  $('batchModal').classList.add('on');
}

function closeBatchDetails() {
  $('batchModal').classList.remove('on');
}

function useCurrentTimeBatch() {
  const d = new Date();
  $('dataPartenzaBatch').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  $('oraBatch').value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  calcBatch();
}

function resetBatch() {
  ['portataBatch', 'kb', 'dataPartenzaBatch', 'oraBatch', 'dataFine', 'oraFine'].forEach(id => $(id).value = '');
  resetBatchResults();
  closeBatchDetails();
}

function initializeBatch() {
  ['portataBatch', 'kb', 'dataPartenzaBatch', 'oraBatch', 'dataFine', 'oraFine'].forEach(id => $(id).addEventListener('input', calcBatch));
  $('btnBatch').addEventListener('click', openBatchDetails);
  calcBatch();
}
