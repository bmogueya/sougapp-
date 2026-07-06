import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhmgzyjfstpzwtxsqiit.supabase.co';
const supabaseKey = 'sb_publishable_hRyxJTyDq_4lMroQYCGbNA_t6h1LpTU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  console.log('Tentative de création de l\'utilisateur admin@sougapp.com...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@sougapp.com',
    password: 'admin123',
  });

  if (error) {
    console.error('Erreur lors de la création :', error.message);
  } else {
    console.log('Utilisateur créé avec succès !');
    console.log('Si la confirmation par email est requise, vérifiez votre boîte de réception ou désactivez-la dans le dashboard Supabase.');
    console.log(data);
  }
}

createUser();
