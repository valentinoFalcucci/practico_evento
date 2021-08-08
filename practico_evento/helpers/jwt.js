const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [  

            //exceptua de logueo
            {url:`${api}/eventos`, methods: ['GET', 'OPTIONS'] } ,
            {url:`${api}/fechas`, methods: ['GET', 'OPTIONS'] } , 
            `${api}/usuarios/login`,
            `${api}/usuarios/registrar`,

        ]
    })
}


async function isRevoked(req, payload, done) {
    if(!payload.isAdmin) {
        done(null, true)
    }

    done();
}
 
module.exports = authJwt