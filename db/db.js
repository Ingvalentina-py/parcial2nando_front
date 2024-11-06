const mongoose = require('mongoose');
const Numero = require('../models/Numero'); // Asegúrate de que la ruta sea correcta

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://jairomoran01:R90D0GZ4l5FEWZpw@cluster0.ue0hm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a MongoDB exitosa');

        //Inicialización de los datos de "números" después de la conexión exitosa
        await initializeCodigos();

    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1); // Termina el proceso si no se puede conectar
    }
};

// Función para generar un número aleatorio único entre 000 y 999
function generateUniqueRandomNumbers(count, min = 0, max = 999) {
    const numbers = new Set();
    while (numbers.size < count) {
        const randomNum = String(Math.floor(Math.random() * (max - min + 1) + min)).padStart(3, '0');
        numbers.add(randomNum);
    }
    return Array.from(numbers);
}

// Función para inicializar la colección "números" con números aleatorios
async function initializeCodigos() {
    try {
        const existingCount = await Numero.countDocuments();
        if (existingCount === 0) {
            const randomNumbers = generateUniqueRandomNumbers(400);
            const numerosGanadores = [];
            const premios = [
                { cantidad: 50, premio: '1 millón' },
                { cantidad: 150, premio: '50 mil' },
                { cantidad: 200, premio: '10 mil' }
            ];

            let index = 0;
            for (const { cantidad, premio } of premios) {
                for (let i = 0; i < cantidad; i++) {
                    numerosGanadores.push({
                        numero: parseInt(randomNumbers[index++]),
                        premio,
                        estado: 'libre',
                        fecha: new Date(),
                        hora: new Date().toLocaleTimeString()
                    });
                }
            }

            await Numero.insertMany(numerosGanadores);
            console.log('Winning numbers initialized');
        }
    } catch (error) {
        console.error('Error initializing winning numbers:', error);
    }
}

module.exports = connectDB;