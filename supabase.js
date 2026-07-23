// Supabase client initializer using the local official browser bundle.
(function initSupabase(){
  if(window.supabaseClient){
    window.supabaseReady = Promise.resolve(window.supabaseClient);
    return;
  }

  const cfg = window.APP_CONFIG || {};
  const SUPABASE_URL = cfg.SUPABASE_URL;
  const SUPABASE_ANON_KEY = cfg.SUPABASE_ANON_KEY;

  window.supabaseReady = new Promise((resolve, reject)=>{
    if(!SUPABASE_URL || !SUPABASE_ANON_KEY){
      const error = new Error('Supabase configuration manquante: verifiez SUPABASE_URL et SUPABASE_ANON_KEY dans config.js');
      console.error(error);
      reject(error);
      return;
    }

    if(!window.supabase || typeof window.supabase.createClient !== 'function'){
      const error = new Error('Client Supabase introuvable. Assurez-vous que vendor/supabase/supabase.js est charge avant supabase.js.');
      console.error(error);
      reject(error);
      return;
    }

    try{
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase initialise');
      resolve(window.supabaseClient);
    }catch(e){
      console.error('Erreur initialisation Supabase', e);
      reject(e);
    }
  });
})();

// Export helper functions (global)
window.supabaseHelpers = {
  insertActivation: async (data)=>{
    if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non initialisé');
    const now = new Date().toISOString();
    const payload = Object.assign({ created_at: now, updated_at: now }, data);
    return await window.supabaseClient.from('activation_requests').insert([payload]);
  },
  fetchRequests: async ()=>{
    if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non initialisé');
    return await window.supabaseClient.from('activation_requests').select('*').order('created_at',{ascending:false});
  },
  getRequestById: async (id)=>{
    if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non initialisé');
    const res = await window.supabaseClient.from('activation_requests').select('*').eq('id', id).limit(1);
    if(res.error) return res;
    return { data: Array.isArray(res.data) ? (res.data[0] || null) : null, error: null };
  },
  getRequestByOrderNumber: async (orderNumber)=>{
    if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non initialisé');
    const res = await window.supabaseClient.from('activation_requests').select('*').eq('order_number', orderNumber).limit(1);
    if(res.error) return res;
    return { data: Array.isArray(res.data) ? (res.data[0] || null) : null, error: null };
  },
  updateRequest: async (id, patch)=>{
    if(!window.supabaseClient || !window.supabase) throw new Error('Supabase non initialisé');
    const updatedPatch = Object.assign({}, patch, { updated_at: new Date().toISOString() });
    return await window.supabaseClient.from('activation_requests').update(updatedPatch).eq('id', id);
  }
};
