import { createClient } from '@supabase/supabase-js'

// Use environment variables - automatically switches between dev/prod
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add environment validation
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env files.'
  )
}

// Optional: Log which environment we're using (remove in production)
console.log(`🗄️ Connected to: ${import.meta.env.VITE_ENVIRONMENT || 'unknown'} database`)

export const supabase = createClient(supabaseUrl, supabaseKey)