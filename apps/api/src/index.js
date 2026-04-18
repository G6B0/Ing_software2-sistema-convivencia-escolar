const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
})
const express = require('express')
const cors = require('cors')
const supabase = require('./lib/supabase')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/test-supabase', async (_req, res) => {
  const { data, error } = await supabase.from('incidentes').select('*').limit(5)

  if (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }

  res.json({ ok: true, data })
})

const port = Number(process.env.PORT) || 3001

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
