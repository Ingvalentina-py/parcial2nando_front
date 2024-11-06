const mongoose = require('mongoose');

const codigoSchema = new mongoose.Schema({
    codigo: { 
        type: String, 
        required: true 
    },
    premio: { 
        type: String, 
        required: true 
    },
    estado: { 
        type: String, 
        enum: ['libre', 'ocupado'], 
        required: true,
        default: 'ocupado'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    },
});

const Codigo = mongoose.model('Codigo', codigoSchema);
module.exports = Codigo;
