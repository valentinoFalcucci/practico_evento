const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');



const eventoSchema = mongoose.Schema({
    titulo: {
        type: String 
    },
    descripcion: {
        type: String 
    }, 
    imagen: {
        type: String,
        default: ''
    },
    imagenes: [{
        type: String
    }],
    destacado: {
        type: Boolean,
        default: false,
    },
    fechas: [{  //guarda un array con el id de cada orden
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fecha' 
    }]
   
})
 
eventoSchema.plugin(mongoosePaginate);

exports.Evento = mongoose.model('Evento', eventoSchema);
