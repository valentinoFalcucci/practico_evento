const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');



app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
//app.use(authJwt()); // comentarlo en caso de no funcionar adecuadamente el token
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
//app.use(errorHandler); // comentarlo en caso de no funcionar adecuadamente el token

 

//Routes
const usuarioRuta = require('./rutas/usuarios'); 
const eventosRuta = require('./rutas/eventos');
const fechasRuta = require('./rutas/fechas');

const api = process.env.API_URL;

app.use(`${api}/usuarios`,usuarioRuta); 
app.use(`${api}/eventos`, eventosRuta);
app.use(`${api}/fechas`, fechasRuta);


//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eventos-bd'
})
.then(()=>{
    console.log('BASE CONECTADA')
})
.catch((err)=> {
    console.log(err);
})

app.set('port',process.env.PORT ||3000);
//Server
app.listen(app.get('port'), ()=>{

    console.log('SERVIDOR CORRIENDO EN  http://localhost:3000');
})