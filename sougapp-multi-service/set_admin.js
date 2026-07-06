import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhmgzyjfstpzwtxsqiit.supabase.co';
const supabaseKey = 'sb_publishable_hRyxJTyDq_4lMroQYCGbNA_t6h1LpTU';
// We need the service role key to update roles directly in the profiles table if RLS is enabled
// For now, we will try to update it using the anon key assuming the user is logged in, or we might need to do it via SQL.

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdminRole() {
  console.log('Tentative de connexion...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@sougapp.com',
    password: 'admin123',
  });

  if (authError) {
    console.error('Erreur de connexion:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Connecté avec l\'ID:', userId);
  
  console.log('Tentative de mise à jour du rôle...');
  // Note: this will only work if the RLS policy allows the user to update their own role
  // According to schema.sql:
  // create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  // However, this might not prevent them from setting their own role to super_admin!
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Erreur lors de la mise à jour du rôle :', error.message);
  } else {
    console.log('Rôle mis à jour avec succès !');
    console.log(data);
  }
}

setAdminRole();
