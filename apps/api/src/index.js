const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
})
const crearApp = require('./app')
const crearPersistenciaSistema = require('./lib/crearPersistenciaSistema')

const port = Number(process.env.PORT) || 3001
const persistenciaSistema = crearPersistenciaSistema()
const app = crearApp({ persistenciaSistema })

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
