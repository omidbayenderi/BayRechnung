import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'demo@bayzenit.com',
    password: 'demo123',
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }

  console.log('Logged in as:', authData.user.id);
  const userId = authData.user.id;

  // Insert or Upsert company_settings
  const dbData = {
    user_id: userId,
    company_name: 'Test Company 123',
    city: 'Berlin',
    bic: 'BICCODE123',
  };

  const { error: upsertError } = await supabase.from('company_settings').upsert(dbData, { onConflict: 'user_id' });
  if (upsertError) {
    console.error('Upsert Error:', upsertError.message);
  } else {
    console.log('Upsert Success');
  }

  // Read back
  const { data: selectData, error: selectError } = await supabase.from('company_settings').select('*').eq('user_id', userId).maybeSingle();
  if (selectError) {
    console.error('Select Error:', selectError.message);
  } else {
    console.log('Select Success:', selectData);
  }
}
run();
