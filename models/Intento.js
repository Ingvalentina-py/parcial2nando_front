const mongoose = require('mongoose');

const intentoSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codigo: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
});

const Intento = mongoose.model('Intento', intentoSchema);
module.exports = Intento;
