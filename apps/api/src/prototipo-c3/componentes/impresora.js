function paso(componente, mensaje) {
  console.log(`[${componente}] ${mensaje}`)
}

function envio(origen, destino, informacion) {
  console.log(`[${origen}] Envia "${informacion}" hacia [${destino}]`)
}

function titulo(texto) {
  console.log('')
  console.log('='.repeat(72))
  console.log(texto)
  console.log('='.repeat(72))
}

module.exports = {
  paso,
  envio,
  titulo,
}
