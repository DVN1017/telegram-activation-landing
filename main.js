// Read from central config
const cfg = window.APP_CONFIG || {};
const WHATSAPP_NUMBER = cfg.WHATSAPP_NUMBER || 'MON_NUMERO';

function getServiceConfig(key){
  const services = (window.APP_CONFIG && window.APP_CONFIG.SERVICES) || {};
  return services[key] || null;
}

function generateOrderNumber(){
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const time = now.toISOString().slice(11,19).replace(/:/g,'');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `FLX-${date}-${time}-${random}`;
}

function getDefaultServiceKey(){
  const services = (window.APP_CONFIG && window.APP_CONFIG.SERVICES) || {};
  return Object.keys(services)[0] || null;
}

function prefillService(serviceKey){
  const serviceConfig = getServiceConfig(serviceKey);
  const inputSvc = document.getElementById('inputService');
  const inputPrice = document.getElementById('inputPrice');
  const summary = document.getElementById('formSummary');
  const summarySvc = document.getElementById('summaryService');
  const summaryPrice = document.getElementById('summaryPrice');
  if(!serviceConfig) return;
  if(inputSvc) inputSvc.value = serviceKey;
  if(inputPrice) inputPrice.value = serviceConfig.prix;
  if(summarySvc) summarySvc.textContent = serviceConfig.nom;
  if(summaryPrice) summaryPrice.textContent = serviceConfig.prix + ' FCFA';
  if(summary) summary.setAttribute('aria-hidden','false');
}

// UI bindings
document.addEventListener('DOMContentLoaded', ()=>{
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  const openBtns = [document.getElementById('openFormBtn'), document.getElementById('heroActivate'), document.getElementById('cardActivate')];
  const modal = document.getElementById('formModal');
  const close = document.getElementById('closeModal');
  const cancel = document.getElementById('cancelForm');
  const form = document.getElementById('activationForm');
  const whatsappFab = document.getElementById('whatsappFab');
  const contactSupport = document.getElementById('contactSupport');
  const heroSupport = document.getElementById('heroSupport');
  const whatsappLink = document.getElementById('whatsappLink');

  if(!modal || !close || !cancel || !form || !whatsappFab){
    console.error('Elements requis du parcours de commande introuvables.');
    return;
  }

  function openModal(){ modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); }

  const defaultServiceKey = getDefaultServiceKey();
  openBtns.forEach(b=>{
    if(!b) return;
    b.addEventListener('click', ()=>{
      if(defaultServiceKey) prefillService(defaultServiceKey);
      openModal();
    });
  });
  close.addEventListener('click', closeModal);
  cancel.addEventListener('click', closeModal);

  // Whatsapp links
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}`;
  whatsappFab.setAttribute('href', waHref);
  contactSupport && contactSupport.setAttribute('href', waHref);
  heroSupport && heroSupport.setAttribute('href', waHref);
  whatsappLink && whatsappLink.setAttribute('href', waHref);

  // Accordion
  document.querySelectorAll('.acc-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const panel = btn.nextElementSibling;
      const open = panel.style.display === 'block';
      document.querySelectorAll('.acc-panel').forEach(p=>p.style.display='none');
      document.querySelectorAll('.acc-item .acc-icon').forEach(i=>i.textContent='+');
      if(!open){ panel.style.display='block'; btn.querySelector('.acc-icon').textContent='−' }
    })
  });

  // Scroll back to top
  const backTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', ()=>{
    if(window.scrollY>300) backTop.style.display='block'; else backTop.style.display='none';
  });
  if(backTop){
    backTop.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  // Form submit
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // Validate
    const accept = form.querySelector('input[name="accept"]');
    if(!data.fullname || !data.phone || !data.country || !accept || !accept.checked){
      alert('Veuillez remplir tous les champs obligatoires et accepter les conditions.');
      return;
    }

    const serviceConfig = getServiceConfig(data.service);
    if(!serviceConfig){
      alert('Service invalide. Veuillez recommencer votre commande.');
      return;
    }

    const orderNumber = generateOrderNumber();
    const record = {
      order_number: orderNumber,
      fullname: data.fullname,
      phone: data.phone,
      country: data.country,
      email: data.email || null,
      service: serviceConfig.nom,
      price: serviceConfig.prix,
      payment_status: 'pending',
      status: 'waiting',
      payment_reference: null
    };

    try{
      await waitForSupabase();
      const res = await window.supabaseHelpers.insertActivation(record);
      if(res.error){
        console.error(res.error); alert('Erreur serveur, réessayez plus tard.'); return;
      }

      closeModal();
      const inserted = res.data && res.data[0];
      localStorage.setItem('last_order_number', orderNumber);
      if(inserted && inserted.id) localStorage.setItem('last_activation_id', inserted.id);
      const chariowUrl = serviceConfig.chariow || cfg.CHARIOW_REDIRECT || 'https://chariow.example.com/checkout';
      const returnUrl = encodeURIComponent(location.origin + '/success.html');
      const redirectUrl = `${chariowUrl}${chariowUrl.includes('?')? '&':'?'}return_url=${returnUrl}&activation_id=${inserted && inserted.id ? inserted.id : ''}&order_number=${encodeURIComponent(orderNumber)}`;
      window.location.href = redirectUrl;

    }catch(err){
      console.error(err); alert('Impossible de contacter le service.');
    }
  });

  // Order buttons: open modal and prefill service
  document.querySelectorAll('.orderBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const svc = btn.getAttribute('data-service');
      const serviceConfig = getServiceConfig(svc);
      if(!serviceConfig){
        alert('Service introuvable.');
        return;
      }
      prefillService(svc);
      openModal();
    });
  });
});

async function waitForSupabase(){
  const max = 40; let i=0;
  while((!window.supabaseClient || !window.supabase) && i<max){ await new Promise(r=>setTimeout(r,150)); i++; }
  if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non chargé');
}
