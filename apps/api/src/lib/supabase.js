const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  quiet: true,
})
const { createClient } = require('@supabase/supabase-js')
const { ErrorConfiguracionBaseDatos } = require('./erroresSistema')

function obtenerConfigSupabase(env = process.env) {
  const rawSupabaseUrl = env.SUPABASE_URL?.trim()
  const supabaseKey = env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!rawSupabaseUrl) {
    throw new ErrorConfiguracionBaseDatos(
      'Falta SUPABASE_URL para conectar con la Base de Datos del Sistema.'
    )
  }

  if (!supabaseKey) {
    throw new ErrorConfiguracionBaseDatos(
      'Falta SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY para conectar con la Base de Datos del Sistema.'
    )
  }

  const supabaseUrl = rawSupabaseUrl.match(/^https?:\/\//i)
    ? rawSupabaseUrl
    : `https://${rawSupabaseUrl}.supabase.co`

  return {
    supabaseUrl,
    supabaseKey,
  }
}

function crearClienteSupabase({ env = process.env, createClientImpl = createClient } = {}) {
  const { supabaseUrl, supabaseKey } = obtenerConfigSupabase(env)

  return createClientImpl(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

module.exports = {
  crearClienteSupabase,
  obtenerConfigSupabase,
}
