const express = require('express');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});

const { publicarEvento, CHANNELS } = require('./publisher');

const app = express();
app.use(express.json());

const sesiones = [];
const usuarios = [];
const recursos = [];
const grupos = [];

let nextSesionId = 1;
let nextUsuarioId = 1;
let nextRecursoId = 1;
let nextGrupoId = 1;

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Publisher Service - StudySync',
        eventos: ['sesion.creada', 'usuario.registrado', 'recurso.publicado']
    });
});

app.post('/sesiones', async (req, res, next) => {
    try {
        const { titulo, materia, creadoPor } = req.body;

        if (!titulo || !materia || !creadoPor) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios: titulo, materia, creadoPor'
            });
        }

        const sesion = {
            id: nextSesionId++,
            titulo,
            materia,
            creadoPor
        };

        sesiones.push(sesion);

        await publicarEvento(CHANNELS.SESION_CREADA, 'sesion.creada', sesion);

        res.status(201).json(sesion);
    } catch (error) {
        next(error);
    }
});

app.post('/usuarios', async (req, res, next) => {
    try {
        const { nombre, email, rol } = req.body;

        if (!nombre || !email || !rol) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios: nombre, email, rol'
            });
        }

        const usuario = {
            id: nextUsuarioId++,
            nombre,
            email,
            rol
        };

        usuarios.push(usuario);

        await publicarEvento('usuario.registrado', usuario);

        res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
});

app.post('/recursos', async (req, res, next) => {
    try {
        const { titulo, tipo, url, materia } = req.body;

        if (!titulo || !tipo || !url || !materia) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios: titulo, tipo, url, materia'
            });
        }

        const recurso = {
            id: nextRecursoId++,
            titulo,
            tipo,
            url,
            materia
        };

        recursos.push(recurso);

        await publicarEvento(CHANNELS.RECURSO_PUBLICADO, 'recurso.publicado', recurso);

        res.status(201).json(recurso);
    } catch (error) {
        next(error);
    }
});

app.post('/grupos/unirse', async (req, res, next) => {
    try {
        const { grupo, usuario, organizador } = req.body;

        if (!grupo || !usuario || !organizador) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios: grupo, usuario, organizador'
            });
        }

        const union = {
            id: nextGrupoId++,
            grupo,
            usuario,
            organizador
        };

        grupos.push(union);

        await publicarEvento(CHANNELS.USUARIO_UNIDO, 'usuario.unido', union);

        res.status(201).json(union);
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: 'Error interno del publisher-service'
    });
});

const PORT = process.env.PUBLISHER_PORT || 3001;

app.listen(PORT, () => {
    console.log(`Publisher Service corriendo en http://localhost:${PORT}`);
});