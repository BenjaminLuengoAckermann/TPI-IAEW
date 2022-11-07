const express = require("express")
const ruta = express.Router()
const verificar_token = require("../middlewares/auth")
const validators = require("../validators/ordenes_envio")
const deliveries_controller = require("../controllers/deliveries")

ruta.get("/", verificar_token, deliveries_controller.findAll)
ruta.get("/:id", verificar_token, deliveries_controller.findOne)
ruta.post("/", verificar_token, deliveries_controller.create)
ruta.delete("/:id", verificar_token, deliveries_controller.delete)

module.exports = ruta