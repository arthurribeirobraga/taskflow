
import { createClient } from '@supabase/supabase-js';

console.log('Variáveis do ambiente:', import.meta.env);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('URL encontrada:', supabaseUrl);
console.log('Chave encontrada:', !!supabaseKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);