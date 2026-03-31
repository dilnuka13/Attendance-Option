import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmjxzyfevwbzyvzlwdca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtanh6eWZldndienl2emx3ZGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NjIyNzUsImV4cCI6MjA5MDUzODI3NX0.nkoD1hT3Pufy7X4K6bRl4tOhfLPOofeIgC9lEFubtS0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
