const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' } // Define el rol con un valor por defecto
});

const User = mongoose.model('User', userSchema);
module.exports = User;
