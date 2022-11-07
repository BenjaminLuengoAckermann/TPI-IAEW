const express = require("express")
const app = new express()
//const mysql = require("mysql2")
const cors = require("cors")
const ordenes_envio = require("./routes/ordenes_envio")
const deliveries = require("./routes/deliveries")
const Sequelize = require('sequelize');
const shipping = require("./models/shipping_status")



//shipping.crearTabla(sequelize)

// Establecemos la conexion a la base de datos mediante el archivo db.js 
/*db.connect(function(err) {
  if (err) {
    console.log('No se ha podido contectar a MySQL.')
    process.exit(1)
  } else {
      console.log('Conectado a la BD')
    }
  })*/


app.use(express.json()) // Esto es middleware
app.use(express.urlencoded({extended: true})) // Permite mandar con clave valor el POST sin modificar nuestro metodo

var corsOptions = { origin: "http://localhost:4200"}
// Habilitar CORS
app.use(cors(corsOptions))



// Declaracion de Rutas
app.use("/ordenes_envio", ordenes_envio)
app.use("/repartidores", deliveries)

// CONFIGURACION DE ENTORNO
const port = process.env.PORT || 3000 //Toma el valor de la var de entorno o 3000

app.listen(port, () => {
    console.log("La aplicacion se escucha desde el puerto " + port)
})