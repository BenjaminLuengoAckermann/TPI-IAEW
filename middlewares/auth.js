const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');


const autorizar = auth({
    audience: 'https://operador-logico.com',
    issuerBaseURL: 'https://dev-6iuldjx0.us.auth0.com/',
  });

let verificar_token = (req, res, next) => {
    autorizar( req, res, (err) => {
        if(err){ return res.status(401).json({errorCode: err.statusCode, errorDescription: err.name}) }
        else{ next() }
    })
}
  
module.exports = verificar_token
