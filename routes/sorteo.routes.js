const express = require('express');
const router = express.Router();
const { login, createAdmin, createAccount, registrarCodigo, getCodigosRegistrados, getWinners } = require('../controllers/sorteoController');

router
    .post('/login', login) // Ruta para login
    .post('/registro', createAccount) // Nueva ruta para crear cuentas
    .post('/createAdmin', createAdmin) // Nueva ruta para crear administradores
    .post('/codigos', registrarCodigo)
    .get('/codigos-registrados', getCodigosRegistrados)
    .get('/winners', getWinners);  // New route for getting winners


module.exports = router;
