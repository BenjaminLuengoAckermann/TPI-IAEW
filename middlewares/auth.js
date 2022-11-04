/*const jwt = require("jsonwebtoken")
const config = require("config")*/


let verificar_token = (req, res, next) => {
    /*let token = req.get("Authorization")
    jwt.verify(token, config.get("config_token.SEED"), (err, decoded) => {
        if(err){
            return res.status(401).json({
                err
            })
        }
        req.usuario = decoded.usuario
        next()
    })*/
    next()
}


module.exports = verificar_token