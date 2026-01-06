// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mregdwyqmjurjnforhxa.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yZWdkd3lxbWp1cmpuZm9yaHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4Mzc5MzksImV4cCI6MjA3ODQxMzkzOX0.tBYR1ngQ7riZLz7d_Rlh6zxp5WMN4L0OcSX7vwCdY_4";


// Create and export supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase initialized for React");