import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jhzlmmnifgcruimcdscz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoemxtbW5pZmdjcnVpbWNkc2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzAzNzYsImV4cCI6MjA2OTYwNjM3Nn0.XowMu2azuNwsXJGlZyExKlsk73YVdu0xnbSw3YGq9yE'

export const supabase = createClient(supabaseUrl, supabaseKey)