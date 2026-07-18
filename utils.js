const $ = x => document.getElementById(x);
const v = x => parseFloat($(x).value);
const fmt = (x, d = 2) => x.toLocaleString('it-IT', {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});

// Unico motore del calendario produttivo: lunedì 06:00 - sabato 06:00.
// Con una data finale restituisce i minuti lavorativi; con una durata in
// minuti restituisce data e ora di completamento.
function calcolaTempoLavorativo(inizio, fineODurata) {
  const partenza = new Date(inizio);
  if (isNaN(partenza)) return null;

  const prossimoIstanteLavorativo = data => {
    const risultato = new Date(data);
    const giorno = risultato.getDay();
    if (giorno === 0 || (giorno === 6 && risultato.getHours() >= 6)) {
      risultato.setDate(risultato.getDate() + (giorno === 6 ? 2 : 1));
      risultato.setHours(6, 0, 0, 0);
    } else if (giorno === 1 && risultato.getHours() < 6) {
      risultato.setHours(6, 0, 0, 0);
    }
    return risultato;
  };

  const fineFinestraLavorativa = data => {
    const risultato = new Date(data);
    risultato.setDate(risultato.getDate() + (6 - risultato.getDay() + 7) % 7);
    risultato.setHours(6, 0, 0, 0);
    return risultato;
  };

  if (fineODurata instanceof Date) {
    const limite = new Date(fineODurata);
    if (isNaN(limite) || limite <= partenza) return 0;

    let corrente = prossimoIstanteLavorativo(partenza);
    let minuti = 0;
    while (corrente < limite) {
      const stop = fineFinestraLavorativa(corrente);
      const fine = stop < limite ? stop : limite;
      minuti += Math.max(0, Math.floor((fine - corrente) / 60000));
      if (fine >= limite) break;
      corrente = prossimoIstanteLavorativo(fine);
    }
    return minuti;
  }

  let minutiRimanenti = Math.max(0, Math.round(Number(fineODurata) || 0));
  let corrente = new Date(partenza);
  while (minutiRimanenti > 0) {
    corrente = prossimoIstanteLavorativo(corrente);
    const stop = fineFinestraLavorativa(corrente);
    const disponibili = Math.floor((stop - corrente) / 60000);
    if (minutiRimanenti <= disponibili) {
      return new Date(corrente.getTime() + minutiRimanenti * 60000);
    }
    minutiRimanenti -= disponibili;
    corrente = stop;
  }
  return corrente;
}
