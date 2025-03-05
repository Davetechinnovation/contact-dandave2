import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oqukvtmfqlvpisvgdwto.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY; // Correct way for Vite


export const supabase = createClient(supabaseUrl, supabaseKey);
