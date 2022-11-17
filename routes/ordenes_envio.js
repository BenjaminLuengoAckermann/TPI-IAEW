const express = require("express")
const ruta = express.Router()
const verificar_token = require("../middlewares/auth")
const validators = require("../validators/ordenes_envio")
const ordenes_envio_controller = require("../controllers/ordenes_envio")
/* 
Endpoints a desarrollar
POST /ordenes_envio/: Alta orden de envío.
GET /ordenes_envio/{orden_envio}: Consulta de la orden de envío.
POST /ordenes_envio/{orden_envio}/repartidor: Permite asignar el repartidor disponible.
POST /ordenes_envio/{orden_envio}/entrega: Se registra la entrega del producto persistiendo la fecha de entrega. (Esto debe disparar la notificación al Procesador de envíos para que actualice el estado)
GET/POST/DELETE /repartidores. ABM Repartidores.

Datos del Envío (De referencia, cada grupo define su contrato) :
Dirección Origen.
Dirección Destino. 
Contacto Comprador. 
Estado del Envío.
Detalle del producto.
Datos del repartidor asignado a la entrega del producto.

Estados de Envío.
Creado: Cuando se crea el pedido.
En tránsito: Cuando una orden de envío se asigna a un repartidor.
Entregado. Cuando un repartidor notifica que el producto se entregó.
*/

//GET /ordenes_envio/{orden_envio}: Consulta de la orden de envío.
ruta.get("/:orderId", verificar_token, ordenes_envio_controller.find)

//POST /ordenes_envio/: Alta orden de envío.
ruta.post("/", verificar_token, ordenes_envio_controller.create)

//POST /ordenes_envio/{orden_envio}/repartidor: Permite asignar el repartidor disponible.
ruta.post("/:orderId/repartidor", verificar_token, ordenes_envio_controller.asignar_repartidor)

//POST /ordenes_envio/{orden_envio}/entrega: Se registra la entrega del producto persistiendo la fecha de entrega. (Esto debe disparar la notificación al Procesador de envíos para que actualice el estado)
ruta.post("/:orderId/entrega", verificar_token, ordenes_envio_controller.notificar_cambio_estado)



module.exports = ruta