const model = require('../models/grupos');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');

const getAll = (req, res) => {
    let resultado = model.data;
    const { q, materia, page = 1, limit = 10 } = req.query;
    if (q) resultado = resultado.filter(item => item.nombre.toLowerCase().includes(q.toLowerCase()));
    if (materia) resultado = resultado.filter(item => item.materia === materia);
    const start = (page - 1) * limit;
    resultado = resultado.slice(start, start + parseInt(limit));
    res.status(200).json(resultado);
};

const getById = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.status(200).json(item);
};

const getByMateria = (req, res) => {
    const resultado = model.data.filter(item => String(item.materia) === req.params.materia);
    res.status(200).json(resultado);
};

const create = (req, res) => {
    const { nombre, materia, integrantes } = req.body;

    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push('nombre');
    if (!materia) camposFaltantes.push('materia');
    if (!integrantes) camposFaltantes.push('integrantes');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` });
    }

    const nuevo = { id: model.nextId++, nombre, materia, integrantes };
    model.data.push(nuevo);
    res.status(201).json(nuevo);
};

const addIntegrante = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Grupo no encontrado' });

    const { integrante } = req.body;
    if (!integrante) return res.status(400).json({ error: 'Falta el campo obligatorio: integrante' });

    if (!Array.isArray(item.integrantes)) {
        item.integrantes = [item.integrantes];
    }

    item.integrantes.push(integrante);
    publicarEvento(CHANNELS.USUARIO_UNIDO, 'usuario.unido', {
        grupoId: item.id,
        grupo: item.nombre,
        materia: item.materia,
        usuario: integrante,
        organizador: item.organizador || 'Organizador no especificado'
    });
    res.status(201).json(item);
};

const update = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Grupo no encontrado' });
    const { nombre, materia, integrantes } = req.body;
    if (nombre) item.nombre = nombre;
    if (materia) item.materia = materia;
    if (integrantes) item.integrantes = integrantes;
    res.status(200).json(item);
};

const remove = (req, res) => {
    const index = model.data.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Grupo no encontrado' });
    model.data.splice(index, 1);
    res.status(200).json({ mensaje: 'Grupo eliminado correctamente' });
};

module.exports = { getAll, getById, getByMateria, create, addIntegrante, update, remove };
