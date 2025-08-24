// app.js — ultra-fast client-side demo
const seedIn = document.getElementById('seed');
const go = document.getElementById('go');
const rand = document.getElementById('rand');
const clr = document.getElementById('clr');
const res = document.getElementById('result');
const outSeed = document.getElementById('out-seed');
const outHash = document.getElementById('out-hash');
const outMul = document.getElementById('out-mul');
const hist = document.getElementById('history');
document.getElementById('year').textContent = new Date().getFullYear();

function rndHex(len=32){
  const a = new Uint8Array(len/2);
  crypto.getRandomValues(a);
  return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// fast sha256 -> hex (Web Crypto API)
async function sha256Hex(msg){
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(msg));
  const arr = new Uint8Array(digest);
  let s = '';
  for(let i=0;i<arr.length;i++) s += arr[i].toString(16).padStart(2,'0');
  return s;
}

// deterministic demo mapping (educational only)
// use first 13 hex chars -> 52-bit int -> scaled multiplier
const TWO52 = Math.pow(2,52);
function hex13ToInt(h13){ return parseInt(h13, 16); }
function mapToMult(x){
  // tuned for visually interesting spread; non-game formula
  const base = (110 * TWO52) / (x + 1);
  const m = Math.max(1.00, Math.floor(base)/100);
  return m;
}

// render one simulation instantly (async but very fast)
async function simulate(seed){
  const s = (seed && seed.trim()) ? seed.trim() : rndHex(32);
  const h = await sha256Hex(s);
  const x = hex13ToInt(h.slice(0,13));
  const m = mapToMult(x);
  outSeed.textContent = s;
  outHash.textContent = h;
  outMul.textContent = m.toFixed(2);
  res.classList.remove('hidden');

  // add to history (DOM only, keep small)
  const rdiv = document.createElement('div');
  rdiv.className = 'row';
  rdiv.innerHTML = `<div style="font-weight:700;color:#ffb6a5">x${m.toFixed(2)}</div><div style="opacity:.7;font-size:12px">${s.length>28? s.slice(0,28)+'…':s}</div><div style="opacity:.6;font-size:12px">${new Date().toLocaleTimeString()}</div>`;
  hist.prepend(rdiv);
  // limit history rows to ~80
  while(hist.children.length > 80) hist.removeChild(hist.lastChild);
}

// UI wiring (instant perceived speed)
go.addEventListener('click', ()=> simulate(seedIn.value));
rand.addEventListener('click', ()=> { seedIn.value = rndHex(32); });
clr.addEventListener('click', ()=> { seedIn.value=''; res.classList.add('hidden'); hist.innerHTML=''; });
seedIn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); simulate(seedIn.value); }});
