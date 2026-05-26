const model = require('../models/recursos');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');

const getAll = (req, res) => {
    let resultado = model.data;
    const { q, tipo, page = 1, limit = 10 } = req.query;
    if (q) resultado = resultado.filter(item => item.titulo.toLowerCase().includes(q.toLowerCase()));
    if (tipo) resultado = resultado.filter(item => item.tipo === tipo);
    const start = (page - 1) * limit;
    resultado = resultado.slice(start, start + parseInt(limit));
    res.status(200).json(resultado);
};

const getById = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Recurso no encontrado' });
    res.status(200).json(item);
};

const getByTipo = (req, res) => {
    const resultado = model.data.filter(item => item.tipo === req.params.tipo);
    res.status(200).json(resultado);
};

const searchByTitulo = (req, res) => {
    const titulo = req.params.titulo.toLowerCase();
    const resultado = model.data.filter(item => item.titulo.toLowerCase().includes(titulo));
    res.status(200).json(resultado);
};

const create = (req, res) => {
    const { titulo, tipo, url, materia } = req.body;

    const camposFaltantes = [];
    if (!titulo) camposFaltantes.push('titulo');
    if (!tipo) camposFaltantes.push('tipo');
    if (!url) camposFaltantes.push('url');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` });
    }

    const nuevo = { id: model.nextId++, titulo, tipo, url };
    if (materia) nuevo.materia = materia;

    model.data.push(nuevo);
    publicarEvento(CHANNELS.RECURSO_PUBLICADO, 'recurso.publicado', {
        ...nuevo,
        materia: materia || 'General'
    });
    res.status(201).json(nuevo);
};

const update = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Recurso no encontrado' });
    const { titulo, tipo, url } = req.body;
    if (titulo) item.titulo = titulo;
    if (tipo) item.tipo = tipo;
    if (url) item.url = url;
    res.status(200).json(item);
};

const remove = (req, res) => {
    const index = model.data.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Recurso no encontrado' });
    model.data.splice(index, 1);
    res.status(200).json({ mensaje: 'Recurso eliminado correctamente' });
};

module.exports = { getAll, getById, getByTipo, searchByTitulo, create, update, remove };
