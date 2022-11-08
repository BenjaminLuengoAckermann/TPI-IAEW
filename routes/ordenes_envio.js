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


// Buscar ordenes por id
/*
ruta.get("/:orderId", verificar_token, (req, res) => {
    if(req.params.orderId) {   
        ordenes_envio.findById(req.params.orderId, (err, users) => {
                if (err) {
                    return res.send(err);
                }
                if(users.length > 0) res.json(users)
                else res.status(204).json({msg: "No se encontraron usuarios"})
            }
        )
    }
    else{
        res.status(400).json({msg: "Error en los parametros del servicio"})
    }
})*/
ruta.get("/:orderId", verificar_token, ordenes_envio_controller.find)

ruta.post("/", verificar_token, ordenes_envio_controller.create)
ruta.post("/:orderId/repartidor", verificar_token, ordenes_envio_controller.asignar_repartidor)
ruta.post("/:orderId/entrega", verificar_token, ordenes_envio_controller.notificar_cambio_estado)


// Registrar una Orden de Envio
/*
ruta.post("/", verificar_token, (req, res) => {
    const {error} = validators.ORDER_SCHEMA.validate(req.body, {errors: {wrap: {label: false}}})
    if(!error){
        // Verificamos la existencia de un usuario con el mismo email
        helpers.verify_user_existence(req.body.email, (usuario_existente) => {
            // Si el usuario no existe procedemos a validar el business que envio
            if(!usuario_existente){
                // Verificar si el businessCode que se inserta en el Usuario esta activa y existe
                helpers_business.verify_business_existense(req.body.businessCode, (business_in_existense) => {
                    // Si el business existe o es nulo
                    if(business_in_existense || req.body.businessCode == null) {
                        users.register_user(req.body, (err, datos) => {
                            if(err) res.status(400).json({msg: "Ocurrió un error en la inserción", 
                                                                code: err.code, 
                                                                errno: err.errno,
                                                                sqlMessage: err.sqlMessage})
                            else res.status(201).json({msg: "Se registró con exito el nuevo usuario!", datos})
                        })}
                    // Si el business existe o es nulo
                    else res.status(400).json({msg: "Error en los parametros del servicio. El negocio que intenta asociar no existe."})                
            })}
            else res.status(400).json({msg: "El usuario ya se encuentra registrado. Intente con otro email."})
        })
}
    else{
        res.status(400).json({error: "Error en los parametros del servicio",
                            msg: error.details[0].message})
    }
    })*/


module.exports = ruta