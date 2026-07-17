// ===== FormulaPro v2.9 - BLOCCO 2 =====

function calcBatchPlanner(){

    const portata = v("po");
    const kgBatch = v("kb");

    if(!(portata>0 && kgBatch>0)) return;

    if(!dataFine.value || !oraFine.value) return;

    const inizio = startDate();

    const fine = new Date(
        dataFine.value + "T" + oraFine.value + ":00"
    );

    if(fine <= inizio){

        tempoDisp.textContent="—";
        kgProd.textContent="—";
        batchComp.textContent="0";
        ultimoBatch.textContent="—";

        return;

    }

    const minuti = Math.floor((fine-inizio)/60000);
    const ore = minuti/60;
    const kg = ore*portata;
    const batch = Math.floor(kg/kgBatch);

    tempoDisp.textContent =
        Math.floor(minuti/60)+" h "+(minuti%60)+" min";

    kgProd.textContent =
        fmt(kg)+" kg";

    batchComp.textContent =
        batch;
}

// Sostituisci:
// document.querySelectorAll('input').forEach(x=>x.oninput=calc);
// con:
// document.querySelectorAll("input").forEach(x=>x.oninput=()=>{calc();calcBatchPlanner();});

// Sostituisci:
// setNow();calc();
// con:
// setNow();calc();calcBatchPlanner();
