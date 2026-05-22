const model = require('../models/usuarios');
const gruposModel = require('../models/grupos');

const getAll = (req, res) => {
    let resultado = model.data;
    const { q, rol, page = 1, limit = 10 } = req.query;
    if (q) resultado = resultado.filter(item => item.nombre.toLowerCase().includes(q.toLowerCase()));
    if (rol) resultado = resultado.filter(item => item.rol === rol);
    const start = (page - 1) * limit;
    resultado = resultado.slice(start, start + parseInt(limit));
    res.status(200).json(resultado);
};

const getById = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(item);
};

const getByRol = (req, res) => {
    const resultado = model.data.filter(item => item.rol === req.params.rol);
    res.status(200).json(resultado);
};

const getGruposById = (req, res) => {
    const usuario = model.data.find(item => item.id === parseInt(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const resultado = gruposModel.data.filter(grupo => {
        const integrantes = Array.isArray(grupo.integrantes) ? grupo.integrantes : [grupo.integrantes];

        return integrantes.some(integrante => {
            if (integrante && typeof integrante === 'object') {
                return String(integrante.id) === String(usuario.id)
                    || integrante.email === usuario.email
                    || integrante.nombre === usuario.nombre;
            }

            return String(integrante) === String(usuario.id)
                || integrante === usuario.email
                || integrante === usuario.nombre;
        });
    });

    res.status(200).json(resultado);
};

const create = (req, res) => {
    const { nombre, email, rol } = req.body;

    const camposFaltantes = [];
    if (!nombre) camposFaltantes.push('nombre');
    if (!email) camposFaltantes.push('email');
    if (!rol) camposFaltantes.push('rol');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}` });
    }

    const nuevo = { id: model.nextId++, nombre, email, rol };
    model.data.push(nuevo);
    res.status(201).json(nuevo);
};

const update = (req, res) => {
    const item = model.data.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { nombre, email, rol } = req.body;
    if (nombre) item.nombre = nombre;
    if (email) item.email = email;
    if (rol) item.rol = rol;
    res.status(200).json(item);
};

const remove = (req, res) => {
    const index = model.data.findIndex(i => i.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
    model.data.splice(index, 1);
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
};

module.exports = { getAll, getById, getByRol, getGruposById, create, update, remove };
