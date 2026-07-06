import { createClient } from '@supabase/supabase-js';

// The anon key has RLS restrictions. To bypass them from a backend script,
// we must use the service_role key. Since we don't have it, we'll use a hack
// where we query the DB via SQL using a workaround if possible, or explain
// to the user why they need the SQL Editor.

console.log('To set a user as admin, you MUST run this SQL command in your Supabase SQL Editor:');
console.log('');
console.log('UPDATE public.profiles');
console.log('SET role = \'super_admin\'');
console.log('WHERE email = \'admin@sougapp.com\'; -- Note: you might need to join auth.users if profiles does not have email');
console.log('');
console.log('Or using the UUID of the user directly:');
console.log('UPDATE public.profiles');
console.log('SET role = \'super_admin\'');
console.log('WHERE id = \'0686e593-41fc-4af1-9b3d-4fb02f064d35\';');
