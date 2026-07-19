function openHistory(){$('drawer').classList.add('on');$('ov').classList.add('on');renderHistory()}
function closeHistory(){$('drawer').classList.remove('on');$('ov').classList.remove('on')}
function getHistory(){return JSON.parse(localStorage.getItem('formulaProHistory')||'[]')}
function putHistory(h){localStorage.setItem('formulaProHistory',JSON.stringify(h));renderHistory()}
function addHistory(x){const h=getHistory();h.unshift(x);putHistory(h);openHistory()}

function saveF(){
  if(!(v('kt')>0&&v('po')>0))return alert('Inserisci i dati del calcolo');
  addHistory({
    type:'Fine formulazione',
    date:new Date().toLocaleString('it-IT'),
    tabId:'f',
    campi:{kt:$('kt').value,po:$('po').value,fa:$('fa').value,dataPartenza:$('dataPartenza').value,ora:$('ora').value},
    rows:['Kg da formulare: '+fmt(v('kt')),'Portata: '+fmt(v('po'))+' kg/h','Kg formulati: '+fmt(isNaN(v('fa'))?0:v('fa')),'Data di partenza: '+($('dataPartenza').value?new Date($('dataPartenza').value+'T00:00:00').toLocaleDateString('it-IT'):'—'),'Ora di partenza: '+$('ora').value,'Fine prevista: '+$('fp').textContent]
  });
}

function saveD(){
  if(!(v('kf')>0&&v('km')>=0))return alert('Inserisci i dati del calcolo');
  addHistory({
    type:'Dosaggio preservante',
    date:new Date().toLocaleString('it-IT'),
    tabId:'d',
    campi:{kf:$('kf').value,km:$('km').value,ka:$('ka').value},
    rows:['Kg formulati: '+fmt(v('kf')),'Dosaggio: '+fmt(v('km'))+' kg/1000','Kg da aggiungere: '+$('r1').textContent,'Kg aggiunti: '+(isNaN(v('ka'))?'—':fmt(v('ka'))+' kg')]
  });
}

function saveBatch(){
  calcBatch();
  if(!batchPlan)return alert('Inserisci i dati della pianificazione');
  const numeroBatchTesto=$('numBatch').value.trim();
  const ultimoBatch=batchPlan.ultimoParziale ? $('ultimoBatch').textContent+' • '+batchPlan.ultimoBatchData+' · '+batchPlan.ultimoBatchOra : $('ultimoBatch').textContent;
  const rigaScadenza=numeroBatchTesto!==''?'Numero di batch: '+numeroBatchTesto:'Data limite: '+new Date($('dataFine').value+'T00:00:00').toLocaleDateString('it-IT')+' · Ora limite: '+$('oraFine').value;
  addHistory({
    type:'Pianificazione Batch',
    date:new Date().toLocaleString('it-IT'),
    tabId:'b',
    campi:{portataBatch:$('portataBatch').value,kb:$('kb').value,dataPartenzaBatch:$('dataPartenzaBatch').value,oraBatch:$('oraBatch').value,numBatch:$('numBatch').value,dataFine:$('dataFine').value,oraFine:$('oraFine').value},
    ultimoBatchCompletamento:batchPlan.ultimoBatchCompletamento?batchPlan.ultimoBatchCompletamento.toISOString():null,
    ultimoBatchData:batchPlan.ultimoBatchData,
    ultimoBatchOra:batchPlan.ultimoBatchOra,
    rows:[rigaScadenza,'Tempo disponibile: '+$('tempoDisp').textContent,'Kg producibili: '+$('kgProd').textContent,'Batch completati: '+$('batchComp').textContent,'Ultimo batch: '+ultimoBatch]
  });
}

function reuseHistory(i){
  const h=getHistory();
  const rec=h[i];
  if(!rec)return;
  if(rec.campi){
    Object.keys(rec.campi).forEach(id=>{ if($(id)) $(id).value=rec.campi[id]; });
  }
  if(rec.tabId) switchTab(rec.tabId);
  closeHistory();
  if(rec.tabId==='b') calcBatch();
  else if(rec.tabId==='d'||rec.tabId==='f') calc();
}

function renderHistory(){
  const h=getHistory();
  $('history').innerHTML=h.length?h.map((x,i)=>'<div class="histItem"><div class="histActions">'+(x.campi?'<button class="reuseBtn" onclick="reuseHistory('+i+')">↺ Riusa</button>':'')+'<button class="del" onclick="delHistory('+i+')">Elimina</button></div><small>'+x.date+'</small><b>'+x.type+'</b>'+x.rows.map(r=>'<p>'+r+'</p>').join('')+'</div>').join(''):'<p style="color:#94a3b8">Nessun calcolo salvato.</p>';
}

function delHistory(i){const h=getHistory();h.splice(i,1);putHistory(h)}
function clearHistory(){if(confirm('Cancellare tutta la cronologia?'))putHistory([])}
