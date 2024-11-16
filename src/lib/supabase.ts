import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugiwmtfjgtxcmzayhbep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaXdtdGZqZ3R4Y216YXloYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwODQ3NDIsImV4cCI6MjA0NjY2MDc0Mn0.9zJhX1f8nYT68I_e9qB5glLcMp7G4CVOGyxfPZkYLUc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);