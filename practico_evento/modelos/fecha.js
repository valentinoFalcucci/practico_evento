const mongoose = require('mongoose');



const fechaSchema = mongoose.Schema({
    fecha: {
        type: String
    },
    fechaDate:{
        type:Date,
        default:Date.now()
    },precio:{
        type:Number 
    },evento:{  //guarda un array con el id de cada orden
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evento' 
    }
})
 




exports.Fecha = mongoose.model('Fecha', fechaSchema);
