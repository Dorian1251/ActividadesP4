const model = require('../models/materias');
const sesionesModel = require('../models/sesiones');

const getAll = (req, res) => {
    let resultado = model.data;
    const { q, semestre, page = 1, limit = 10 } = req.query;
    if (q) resultado = resultado.filter(item => item.nombre.toLowerCase().includes(q.toLowerCase()));
    if (semestre) resultado = resultado.filter(item => item.semestre === semestre);
    const start = (page - 1) * limit;
    resultado = resultado.slice(start, start + parseInt(limit));
    res.status(200).json(resultado);
};

const getById = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Materia no encontrada' });
    res.status(200).json(item);
};

const getBySemestre = (req, res) => {
    const resultado = model.data.filter(item => String(item.semestre) === req.params.semestre);
    res.status(200).json(resultado);
};

const getSesionesById = (req, res) => {
    const materia = model.data.find(item => item.id === parseInt(req.params.id));
    if (!materia) return res.status(404).json({ error: 'Materia no encontrada' });

    const resultado = sesionesModel.data.filter(sesion => {
        if (sesion.materia && typeof sesion.materia === 'object') {
            return String(sesion.materia.id) === String(materia.id)
                || sesion.materia.codigo === materia.codigo
                || sesion.materia.nombre === materia.nombre;
        }

        return String(sesion.materia) === String(materia.id)
            || sesion.materia === materia.codigo
            || sesion.materia === materia.nombre;
    });

    res.status(200).json(resultado);
};

const create = (req, res) => {
    const { nombre, codigo, semestre } = req.body;

    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push('nombre');
    if (!codigo) camposFaltantes.push('codigo');
    if (!semestre) camposFaltantes.push('semestre');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` });
    }

    const nuevo = { id: model.nextId++, nombre, codigo, semestre };
    model.data.push(nuevo);
    res.status(201).json(nuevo);
};

const update = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Materia no encontrada' });
    const { nombre, codigo, semestre } = req.body;
    if (nombre) item.nombre = nombre;
    if (codigo) item.codigo = codigo;
    if (semestre) item.semestre = semestre;
    res.status(200).json(item);
};

const remove = (req, res) => {
    const index = model.data.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Materia no encontrada' });
    model.data.splice(index, 1);
    res.status(200).json({ mensaje: 'Materia eliminada correctamente' });
};

module.exports = { getAll, getById, getBySemestre, getSesionesById, create, update, remove };
