const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
})
const crearApp = require('./app')

const port = Number(process.env.PORT) || 3001
const app = crearApp()

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
