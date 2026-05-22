const model = require('../models/sesiones');

const getAll = (req, res) => {
    let resultado = model.data;
    const { q, materia, page = 1, limit = 10 } = req.query;
    if (q) resultado = resultado.filter(item => item.titulo.toLowerCase().includes(q.toLowerCase()));
    if (materia) resultado = resultado.filter(item => item.materia === materia);
    const start = (page - 1) * limit;
    resultado = resultado.slice(start, start + parseInt(limit));
    res.status(200).json(resultado);
};

const getById = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.status(200).json(item);
};

const getByMateria = (req, res) => {
    const resultado = model.data.filter(item => String(item.materia) === req.params.materia);
    res.status(200).json(resultado);
};

const getByFecha = (req, res) => {
    const resultado = model.data.filter(item => item.fecha === req.params.fecha);
    res.status(200).json(resultado);
};

const create = (req, res) => {
    const { titulo, materia, fecha } = req.body;

    const camposFaltantes = [];
    if (!titulo) camposFaltantes.push('titulo');
    if (!materia) camposFaltantes.push('materia');
    if (!fecha) camposFaltantes.push('fecha');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` });
    }

    const nuevo = { id: model.nextId++, titulo, materia, fecha };
    model.data.push(nuevo);
    res.status(201).json(nuevo);
};

const update = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Sesión no encontrada' });
    const { titulo, materia, fecha } = req.body;
    if (titulo) item.titulo = titulo;
    if (materia) item.materia = materia;
    if (fecha) item.fecha = fecha;
    res.status(200).json(item);
};

const remove = (req, res) => {
    const index = model.data.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Sesión no encontrada' });
    model.data.splice(index, 1);
    res.status(200).json({ mensaje: 'Sesión eliminada correctamente' });
};

module.exports = { getAll, getById, getByMateria, getByFecha, create, update, remove };
