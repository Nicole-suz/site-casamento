// Countdown
(function(){
  const destino = new Date('2026-08-26T00:00:00').getTime();
  function update(){
    const agora = new Date().getTime();
    const distancia = destino - agora;
    if(distancia<=0){
      document.getElementById('days').innerText='0';
      document.getElementById('hours').innerText='0';
      document.getElementById('minutes').innerText='0';
      document.getElementById('seconds').innerText='0';
      return;
    }
    const dias = Math.floor(distancia / (1000*60*60*24));
    const horas = Math.floor((distancia % (1000*60*60*24)) / (1000*60*60));
    const minutos = Math.floor((distancia % (1000*60*60)) / (1000*60));
    const segundos = Math.floor((distancia % (1000*60)) / 1000);
    document.getElementById('days').innerText = dias;
    document.getElementById('hours').innerText = horas;
    document.getElementById('minutes').innerText = minutos;
    document.getElementById('seconds').innerText = segundos;
  }
  update();
  setInterval(update,1000);
})();

// Gifts data
const gifts = [
  {id:1, title:'Contribuição para lua de mel', price:500.00},
  {id:2, title:'Jogo de panelas (cozinha)', price:350.00},
  {id:3, title:'Kit de toalhas (4 peças)', price:200.00},
  {id:4, title:'Contribuição para casa nova', price:1000.00},
  {id:5, title:'Jantar romântico', price:150.00},
  {id:6, title:'Cafeteira elétrica', price:220.00}
];

function formatReal(v){
  return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function renderGifts(){
  const grid = document.getElementById('giftGrid');
  grid.innerHTML='';
  gifts.forEach(g=>{
    const div = document.createElement('div');
    div.className='gift';
    div.innerHTML = `<h4>${g.title}</h4>
      <div class="price">${formatReal(g.price)}</div>
      <div class="actions">
        <button onclick="openPix(${g.id})">Pagar com Pix</button>
        <button class="secondary" onclick="cardInfo(${g.id})">Pagar com cartão</button>
      </div>`;
    grid.appendChild(div);
  });
}
renderGifts();

// Pix modal
const pixKey = 'nicolesuzane2308@gnail.com';
const pixModal = document.getElementById('pixModal');
const closeModal = document.getElementById('closeModal');
const pixAmountEl = document.getElementById('pixAmount');
const pixKeyEl = document.getElementById('pixKey');
const copyBtn = document.getElementById('copyPix');
const openInApp = document.getElementById('openInApp');

pixKeyEl.innerText = pixKey;

window.openPix = function(id){
  const gift = gifts.find(x=>x.id===id);
  pixAmountEl.innerText = formatReal(gift.price);
  // create a simple payment link that copies data to clipboard when user clicks copy
  openInApp.href = '#';
  pixModal.setAttribute('aria-hidden','false');
};
closeModal.addEventListener('click',()=>pixModal.setAttribute('aria-hidden','true'));
pixModal.addEventListener('click',(e)=>{ if(e.target===pixModal) pixModal.setAttribute('aria-hidden','true'); });

copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(pixKey);
    copyBtn.innerText='Copiado!';
    setTimeout(()=>copyBtn.innerText='Copiar chave',2200);
  }catch(e){
    copyBtn.innerText='Selecione e copie';
  }
});

window.cardInfo = function(id){
  const gift = gifts.find(x=>x.id===id);
  alert('Para pagar com cartão (inclusive parcelado) recomendamos usar um serviço de pagamento confiável (ex: Mercado Pago, PagSeguro ou Gerencianet). Faça a integração com a conta do casal e crie um botão de checkout com o valor: '+formatReal(gift.price)+'. Veja o README para instruções.');
};

// RSVP handling (saved to localStorage)
const form = document.getElementById('rsvpForm');
const success = document.getElementById('rsvpSuccess');

function loadRsvps(){
  const raw = localStorage.getItem('rsvps_v1');
  return raw ? JSON.parse(raw) : [];
}

function saveRsvps(list){
  localStorage.setItem('rsvps_v1', JSON.stringify(list));
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('rsvpName').value.trim();
  const guests = Number(document.getElementById('rsvpGuests').value);
  const message = document.getElementById('rsvpMessage').value.trim();
  if(!name) return;
  const list = loadRsvps();
  list.push({name, guests, message, date: new Date().toISOString()});
  saveRsvps(list);
  success.hidden=false;
  form.reset();
  setTimeout(()=>success.hidden=true,3000);
});

// Download CSV
document.getElementById('downloadCsv').addEventListener('click', ()=>{
  const list = loadRsvps();
  if(!list.length){ alert('Nenhuma confirmação encontrada.'); return; }
  const rows = [['Nome','Convidados','Mensagem','Data']];
  list.forEach(r=>rows.push([r.name, r.guests, r.message.replace(/\n/g,' '), r.date]));
  const csv = rows.map(r=>r.map(c=>`"\${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rsvps_casamento_nicole.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// helpful note: expose rsvps in console for quick access
window._wedding_rsvps = loadRsvps();
