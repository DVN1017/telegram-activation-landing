/* Configuration centralisée — ne pas commiter de clés privées.
   Remplissez les valeurs ci-dessous avant le déploiement.
*/
window.APP_CONFIG = {
  SUPABASE_URL: 'https://pwlqdsnhrxrjkjhrssec.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_rba8f3ER8UByjdTeweJndg_EUjmcg4r',
  WHATSAPP_NUMBER: '22669064476', // sans +, ex: 33612345678
  // Optionnel : lien de redirection générique si un service n'a pas sa propre URL
  CHARIOW_REDIRECT: 'https://chariow.example.com/checkout',
  SERVICES: {
    Telegram: {
      nom: 'Activation Telegram',
      prix: 1500,
      chariow: 'https://jevxiiyn.mychariow.shop/prd_f4q8rn'
    },
    Spotify: {
      nom: 'Spotify Premium',
      prix: 10000,
      chariow: 'https://jevxiiyn.mychariow.shop/prd_dbwdrwcr'
    },
    Netflix: {
      nom: 'Netflix Premium',
      prix: 10000,
      chariow: 'https://jevxiiyn.mychariow.shop/prd_e3v8mw9v'
    }
  }
};
