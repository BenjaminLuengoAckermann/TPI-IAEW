const express = require("express")
const ruta = express.Router()
const ordenes_envio = require("../models/ordenes_envio")
const verificar_token = require("../middlewares/auth")
const validators = require("../validators/ordenes_envio")
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
ruta.get("/:orderId", verificar_token, (req, res) => {
    if(req.params.orderId) {   
        ordenes_envio.get_by_params("orderId", req.params.orderId,  (err, users) => {
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
})



// Registrar un usuario
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
    })

// Modificar username 
ruta.put("/update_username/:userCode", verificar_token, (req, res) => {
    if(req.params.userCode){
        // Verificamos que exista el usuario
        helpers.verify_user_existence_by_userCode(req.params.userCode, (usuario_existente) => {
            if(usuario_existente){
                if(!req.body || !req.body.userName){
                    res.status(400).json({err: "El username no puede ser nulo"})
                }
                // Si los parametros del body se enviaron bien se modifica el usuario existente
                else {
                    users.update_username(req.body, usuario_existente.userCode, (err, datos) => {
                    if (err) {
                        return res.send(err);
                    }
                    if(datos) return res.json(datos)
                })}
            }
            else res.status(204).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el email"})
})

// Modificar usuario 
ruta.put("/:userCode", verificar_token, (req, res) => {
    if(req.params.userCode){
        // Verificamos que exista el usuario
        helpers.verify_user_existence_by_userCode(req.params.userCode, (usuario_existente) => {
            if(usuario_existente){
                // Si el usuario existe verificamos su esquema
                const {error} = validators.UPDATE_USER_SCHEMA.validate(req.body, {errors: {wrap: {label: false}}})
                if(!error){
                    if(req.params.userCode == req.body.userCode){
                        // Verificar si el businessCode que se inserta en el Usuario esta activa y existe
                            helpers_business.verify_business_existense(req.body.businessCode, (business_in_existense) => {
                                // Si el business existe o es nulo
                                if(business_in_existense || req.body.businessCode == null) {
                                     // Verificar unicidad email incluso en aquellos users desactivados por si vuelven a la plataforma
                                        helpers.verify_user_existence_including_non_active(req.body.email, (email_existente) => {
                                            // Si existe y no es el mismo usuario que intenta cambiarlo, devolvemos error
                                            if(email_existente && email_existente.userCode !== req.body.userCode){
                                                res.status(400).json({msg: "El email que intenta registrar ya existe. Intente con otro."})
                                            }
                                            // Si no existe modificamos
                                            else{
                                                users.update_user(req.body, (err, datos) => {
                                                    if(err) res.status(400).json({msg: "Ocurrió un error en la modificación", 
                                                                                        code: err.code, 
                                                                                        errno: err.errno,
                                                                                        sqlMessage: err.sqlMessage})
                                                    else res.status(201).json({msg: "Se modificó con éxito el usuario!", datos})
                                                })
                                            }                                     
                                })
                            }
                            // Si el business existe o es nulo
                            else res.status(400).json({msg: "Error en los parametros del servicio"})                                
                        })
                        }   
                    // Si el codigo enviado por parametro es distinto al del body
                    else res.status(400).json({msg: "Error en los parametros del servicio"})
            }
                // Si el esquema del usuario no es apropiado
                else{res.status(400).json({error: "Error en los parametros del servicio",
                msg: error.details[0].message})}
            }
            // Si el usuario con ese userCode no existe
            else res.status(204).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el email"})
})

// Modificar mail del usuario (debe ser unico) 
ruta.put("/update_email/:userCode", verificar_token, (req, res) => {
    if(req.params.userCode){
        // Verificamos que exista el usuario
        helpers.verify_user_existence_by_userCode(req.params.userCode, (usuario_existente) => {
            if(usuario_existente){
                // Verificamos que el email enviado no sea nulo
                if(!req.body.email){
                    res.status(400).json({msg: "El email no puede ser nulo"})
                }
                // Si los parametros del body se enviaron se verifica que coincidan los userCode
                else {
                    if(req.params.userCode == req.body.userCode){
                        // Verificar unicidad email incluso en aquellos users desactivados por si vuelven a la plataforma
                        helpers.verify_user_existence_including_non_active(req.body.email, (email_existente) => {
                            // Si existe y no es el mismo usuario que intenta cambiarlo, devolvemos error
                            if(email_existente && email_existente.userCode !== req.body.userCode){
                                res.status(400).json({msg: "El email que intenta registrar ya existe. Intente con otro."})
                            }
                            // Si no existe modificamos
                            else{
                                users.update_email(req.body, (err, datos) => {
                                    if (err) {
                                        return res.send(err);
                                    }
                                    if(datos) return res.json(datos)
                                })
                            }
                        })
                    }
                    // Si el codigo enviado por parametro es distinto al del body
                    else res.status(400).json({msg: "Error en los parametros del servicio"})
                    }
            }
            // Si no existe un usuario con el userCode enviado
            else res.status(204).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el userCode"})
})

// Modificar password de usuario logueado
ruta.put("/modificar_pwd/user", verificar_token, (req, res) => {
    helpers.get_current_user(req, (usuario_logueado) => {
        if(usuario_logueado){
            if(!req.body.password){                
                res.status(400).json({msg: "La password no puede ser nula"})
            }
            // Si los parametros del body se enviaron bien se modifica el usuario logueado
            else {
                users.update_password(req.body.password, usuario_logueado.email, (err, datos) => {
                if (err) {
                    return res.send(err);
                }
                if(datos) return res.json(datos)
            })}
        }
        else res.status(404).json({msg: "No hay usuario logueado"})
    })
})

// Modificar password de un usuario como Administrador
ruta.put("/modificar_pwd/admin/:email", verificar_token, (req, res) => {
    if(req.params.email){
        // Verificamos que exista el usuario
        helpers.verify_user_existence(req.params.email, (usuario_existente) => {
            if(usuario_existente){
                if(!req.body.usuario || !req.body.usuario.password){
                    res.status(400).json({msg: "La password no puede ser nula"})
                }
                // Si los parametros del body se enviaron bien se modifica el usuario existente
                else {
                    users.update_password(req.body.usuario.password, usuario_existente.email, (err, datos) => {
                    if (err) {
                        return res.send(err);
                    }
                    if(datos) return res.json(datos)
                })}
            }
            else res.status(404).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el email"})
})



// Ejemplo de consumir SP
ruta.get("/sp", verificar_token, (req, res) => {
    if(req.body.lvl) {
        users.get_usuarios_nivel_mayor_igual(req.body.lvl, (err, users) => {
            if (err) {
                return res.send(err);
            }
            if(users[0].length > 0) res.json(users[0])
            else res.status(400).json({msg: "No se encontraron usuarios con un nivel mayor o igual al solicitado"})
        })
    }
    else{
        res.status(400).json({msg: "Error en los parametros del servicio"})
    }
})

// Eliminar un usuario
ruta.delete("/:userCode", verificar_token, (req, res) => {
    if(req.params.userCode){
        // Verificamos que exista el usuario
        helpers.verify_user_existence_by_userCode(req.params.userCode, (usuario_existente) => {
            if(usuario_existente){                
                users.delete_user(usuario_existente.userCode, (err, datos) => {
                    if (err) {
                        return res.send(err);
                    }
                    if(datos) return res.json(datos)
                })}
            else res.status(204).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el userCode"})
})

// Dar de alta un usuario
ruta.put("/activate/:userCode", verificar_token, (req, res) => {
    if(req.params.userCode){
        // Verificamos que exista el usuario
        helpers.verify_user_existence_by_userCode_including_non_active(req.params.userCode, (usuario_existente) => {
            if(usuario_existente){                
                users.activate_user(usuario_existente.userCode, (err, datos) => {
                    if (err) {
                        return res.send(err);
                    }
                    if(datos) return res.json(datos)
                })}
            else res.status(204).json({msg: "No se encontraron usuarios"})
        })
        }        
    else res.status(400).json({msg: "Error en los parametros del servicio. Debe enviar el userCode"})
})


module.exports = ruta