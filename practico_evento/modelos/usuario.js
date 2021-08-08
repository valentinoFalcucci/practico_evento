const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    passwordEncriptado: { //passwordHash
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    esAdministrador: {
        type: Boolean,
        default: false,
    },
    calle: {
        type: String,
        default: ''
    },
    ciudad: {
        type: String,
        default: ''
    },
    pais: {
        type: String,
        default: ''
    }

});

usuarioSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

usuarioSchema.set('toJSON', {
    virtuals: true,
});

exports.Usuario = mongoose.model('Usuario', usuarioSchema);
exports.usuarioSchema = usuarioSchema;
