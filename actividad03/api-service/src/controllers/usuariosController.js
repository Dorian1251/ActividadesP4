const prisma = require('../config/db');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, validarCampos } = require('../utils/request');

const includeRelaciones = {
  sesiones: true,
  recursos: true,
  grupos: true,
  gruposCreados: true
};

const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!usuario) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const crearUsuario = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['nombre', 'email', 'rol']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre: req.body.nombre,
        email: req.body.email,
        rol: req.body.rol
      }
    });

    await publicarEvento(CHANNELS.USUARIO_REGISTRADO, 'usuario.registrado', usuario);

    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

const actualizarUsuario = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { id } });

    if (!usuarioExiste) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: limpiarDatos({
        nombre: req.body.nombre,
        email: req.body.email,
        rol: req.body.rol
      })
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const eliminarUsuario = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { id } });

    if (!usuarioExiste) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    await prisma.usuario.delete({ where: { id } });

    res.json({ mensaje: `Usuario con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  obtenerUsuarioPorId,
  obtenerUsuarios
};
