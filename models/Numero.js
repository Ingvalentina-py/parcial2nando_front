const mongoose = require('mongoose');


const numeroSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true,
        unique: true
    },
    premio: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['libre', 'ocupado'],
        default: 'libre'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

const Numero = mongoose.model('Numero', numeroSchema);
module.exports = Numero;
