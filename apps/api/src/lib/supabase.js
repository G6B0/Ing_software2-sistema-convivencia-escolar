const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
})
const { createClient } = require('@supabase/supabase-js')

const rawSupabaseUrl = process.env.SUPABASE_URL?.trim()
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!rawSupabaseUrl) {
  throw new Error(
    'Falta SUPABASE_URL en apps/api/.env. Debe ser la URL del proyecto o el project ref.'
  )
}

if (!supabaseKey) {
  throw new Error(
    'Falta SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY en apps/api/.env.'
  )
}

const supabaseUrl = rawSupabaseUrl.match(/^https?:\/\//i)
  ? rawSupabaseUrl
  : `https://${rawSupabaseUrl}.supabase.co`

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

module.exports = supabase
