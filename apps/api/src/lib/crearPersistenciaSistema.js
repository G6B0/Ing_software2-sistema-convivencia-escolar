const { PersistenciaSistemaMemoria } = require('./persistenciaSistema')
const PersistenciaSistemaSupabase = require('./persistenciaSistemaSupabase')
const { crearClienteSupabase } = require('./supabase')

function crearPersistenciaSistema({ env = process.env, createClientImpl } = {}) {
  if (env.SISTEMA_DB_ADAPTER === 'supabase') {
    const supabase = crearClienteSupabase({
      env,
      ...(createClientImpl ? { createClientImpl } : {}),
    })

    return new PersistenciaSistemaSupabase(supabase)
  }

  return new PersistenciaSistemaMemoria()
}

module.exports = crearPersistenciaSistema
