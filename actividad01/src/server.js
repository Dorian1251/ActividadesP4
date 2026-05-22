const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

const sesionesRoutes = require('./routes/sesionesRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const recursosRoutes = require('./routes/recursosRoutes');

app.use('/api/sesiones', sesionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/recursos', recursosRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'StudySync API - v1.0.0', entidades: ['sesiones', 'usuarios', 'materias', 'grupos', 'recursos'] });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
