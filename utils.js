const $ = x => document.getElementById(x);
const v = x => parseFloat($(x).value);
const fmt = (x, d = 2) => x.toLocaleString('it-IT', {
  minimumFractionDigits: d,
  maximumFractionDigits: d
});
