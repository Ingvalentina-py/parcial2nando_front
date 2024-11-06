const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Codigo = require('../models/Codigo');
const UserInfo = require('../models/UserInfo');
const Numero = require('../models/Numero');
const NumeroNoGanador = require('../models/NumeroNoGanador');
const Intento = require('../models/Intento');

// Configura el secreto para JWT
const jwtSecret = 'your_jwt_secret';

// Inicio de sesión
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        const admin = await Admin.findOne({ email });

        const account = user || admin;

        if (!account) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, account.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const role = account instanceof User ? 'user' : 'admin';
        const token = jwt.sign({ id: account._id, role }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login exitoso', role, token });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Creación de cuenta de usuario
const createAccount = async (req, res) => {
    const { email, password, nombre, celular, cedula, fechaNacimiento, ciudad } = req.body;

    if (!email || !password || !nombre || !celular || !cedula || !fechaNacimiento || !ciudad) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            role: 'user' // Añade un rol por defecto, por ejemplo "user"
        });
        const userInfo = new UserInfo({
            user_id: user._id,
            nombre,
            celular,
            cedula,
            fecha_de_nacimiento: fechaNacimiento,
            ciudad
        });

        await user.save();
        await userInfo.save();

        res.status(201).json({ success: true, message: 'Cuenta creada con éxito' });
    } catch (error) {
        console.error('Error al crear cuenta:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Creación de cuenta de administrador
const createAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo administrador con el rol 'admin'
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Administrador creado exitosamente' });
    } catch (error) {
        console.error('Error al crear administrador:', error);
        res.status(500).json({ message: 'Error al intentar crear el administrador' });
    }
};


const registrarCodigo = async (req, res) => {
    const { codigo } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        const userId = decodedToken.id;

        // Check if the code is a winning number
        let numero = await Numero.findOne({ numero: parseInt(codigo) });

        if (numero) {
            if (numero.estado === 'libre') {
                // Update the winning number
                numero.estado = 'ocupado';
                numero.userId = userId;
                await numero.save();

                // Create a new Codigo entry
                const nuevoCodigo = new Codigo({
                    codigo: numero.numero,
                    premio: numero.premio,
                    estado: 'ocupado',
                    userId: userId,
                    fecha: new Date()
                });
                await nuevoCodigo.save();

                return res.status(200).json({
                    success: true,
                    message: '¡Felicidades! Has ganado.',
                    premio: numero.premio,
                    codigo: numero.numero,
                    fecha: nuevoCodigo.fecha,
                    hora: nuevoCodigo.fecha.toLocaleTimeString()
                });
            } else {
                return res.status(400).json({ success: false, message: 'Este código ya ha sido registrado.' });
            }
        } else {
            // Create a new Codigo entry for non-winning number
            const nuevoCodigo = new Codigo({
                codigo: parseInt(codigo),
                premio: 'No ganador',
                estado: 'ocupado',
                userId: userId,
                fecha: new Date()
            });
            await nuevoCodigo.save();

            return res.status(200).json({ success: false, message: 'Lo siento, no ganaste esta vez.' });
        }
    } catch (error) {
        console.error('Error al registrar código:', error);
        res.status(500).json({ success: false, message: 'Error al procesar la solicitud.' });
    }
};


// Add this new function to get registered codes for a user
const getCodigosRegistrados = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret);
        const userId = decodedToken.id;

        const codigosRegistrados = await Codigo.find({ userId: userId });
        res.status(200).json(codigosRegistrados);
    } catch (error) {
        console.error('Error al obtener códigos registrados:', error);
        res.status(500).json({ message: 'Error al obtener códigos registrados' });
    }
};


const getWinners = async (req, res) => {
    try {
        const winners = await Codigo.find({ premio: { $ne: 'No ganador' } })
            .populate('userId')
            .sort({ fecha: -1 });

        const formattedWinners = await Promise.all(winners.map(async (winner) => {
            const userInfo = await UserInfo.findOne({ user_id: winner.userId._id });
            return {
                fecha: winner.fecha,
                cedula: userInfo ? userInfo.cedula : 'N/A',
                telefono: userInfo ? userInfo.celular : 'N/A',
                codigo: winner.codigo,
                premio: winner.premio
            };
        }));

        res.json(formattedWinners);
    } catch (error) {
        console.error('Error al obtener ganadores:', error);
        res.status(500).json({ message: 'Error al obtener ganadores' });
    }
};



module.exports = {
    login,
    createAccount,
    createAdmin,
    registrarCodigo,
    getCodigosRegistrados,
    getWinners     // Exportar la función
};
