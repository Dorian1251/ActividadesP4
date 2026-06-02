const prisma = require('../config/db');
const { borrarTodaCache, crearCacheKey, guardarCache, obtenerCache } = require('../services/cacheService');
const { limpiarDatos, obtenerId } = require('../utils/request');

const includeRelaciones = {
  sesiones: true,
  recursos: true,
  grupos: true,
  gruposCreados: true
};

const obtenerUsuarios = async (req, res, next) => {
  try {
    const cacheKey = crearCacheKey('usuarios', { usuarioId: req.user.id });
    const cache = await obtenerCache(cacheKey);

    if (cache) {
      res.set('X-Cache', 'HIT');
      return res.json(cache);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: includeRelaciones,
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Tu usuario autenticado ya no existe' });
    }

    const usuarios = [usuario];

    await guardarCache(cacheKey, usuarios);
    res.set('X-Cache', 'MISS');
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const obtenerUsuariosPorRol = async (req, res, next) => {
  try {
    if (req.user.rol !== req.params.rol) {
      return res.json([]);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: includeRelaciones
    });

    res.json(usuario ? [usuario] : []);
  } catch (error) {
    next(error);
  }
};

const obtenerGruposDelUsuario = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    if (id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes consultar grupos de otro usuario' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        grupos: {
          include: {
            materia: true,
            organizador: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    res.json(usuario.grupos);
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

    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes consultar tu propio usuario' });
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
    res.status(403).json({
      error: 'No puedes crear usuarios desde esta ruta. Usa /auth/register'
    });
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

    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes actualizar tu propio usuario' });
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

    await borrarTodaCache();
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

    if (id !== req.user.id) {
      return res.status(403).json({ error: 'Solo puedes eliminar tu propio usuario' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { id } });

    if (!usuarioExiste) {
      return res.status(404).json({ error: `No existe un usuario con id ${id}` });
    }

    await prisma.usuario.delete({ where: { id } });

    await borrarTodaCache();
    res.json({ mensaje: `Usuario con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  obtenerGruposDelUsuario,
  obtenerUsuarioPorId,
  obtenerUsuarios,
  obtenerUsuariosPorRol
};
