const mongoose = require('mongoose');

const userInfoSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombre: { type: String, required: true },
    celular: { type: String, required: true },
    cedula: { type: String, required: true },
    fecha_de_nacimiento: { type: Date, required: true },
    ciudad: { type: String, required: true }  // Nuevo campo agregado
});

const UserInfo = mongoose.model('UserInfo', userInfoSchema);
module.exports = UserInfo;
