const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const RATE = 0.00000579;
const DAY = 86400;
let state = JSON.parse(localStorage.getItem("nexora_state") || '{"balance":0,"start":null}');
let lastTick = Date.now();

function save(){ localStorage.setItem("nexora_state", JSON.stringify(state)); }
function userName(){
  const u = tg?.initDataUnsafe?.user;
  return u?.first_name || u?.username || "Miner";
}
document.getElementById("welcome").textContent = "Welcome, " + userName();

function tick(){
  if(state.start){
    const now = Date.now();
    const elapsed = Math.min((now - state.start)/1000, DAY);
    const lastElapsed = Math.min((lastTick - state.start)/1000, DAY);
    const delta = Math.max(0, elapsed - lastElapsed);
    state.balance += delta * RATE;
    if(elapsed >= DAY){ state.start = null; }
    save();
  }
  lastTick = Date.now();
  render();
}
function toggleMining(){
  if(state.start){ state.start = null; }
  else { state.start = Date.now(); lastTick = Date.now(); }
  save(); render();
}
function render(){
  document.getElementById("balance").textContent = state.balance.toFixed(8);
  const on = !!state.start;
  const status = document.getElementById("status");
  const btn = document.getElementById("mineBtn");
  status.textContent = on ? "MINING" : "OFF";
  status.className = "status " + (on ? "on" : "off");
  btn.textContent = on ? "STOP MINING" : "START MINING";
  btn.className = "mine-btn " + (on ? "stop" : "");
  let remaining = DAY;
  let progress = 0;
  if(on){
    const elapsed = Math.min((Date.now()-state.start)/1000, DAY);
    remaining = Math.max(0, DAY-elapsed);
    progress = Math.min(100, elapsed/DAY*100);
  }
  const h = String(Math.floor(remaining/3600)).padStart(2,"0");
  const m = String(Math.floor((remaining%3600)/60)).padStart(2,"0");
  const s = String(Math.floor(remaining%60)).padStart(2,"0");
  document.getElementById("timer").textContent = `${h}:${m}:${s}`;
  document.getElementById("progressBar").style.width = progress+"%";
}
function showToast(msg){
  const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
}
setInterval(tick,1000);
render();
