const prisma = require('../config/db');
const { borrarTodaCache, crearCacheKey, guardarCache, obtenerCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, obtenerPaginacion, validarCampos } = require('../utils/request');

const includeRelaciones = {
  sesiones: true,
  recursos: true,
  grupos: true,
  gruposCreados: true
};

const obtenerUsuarios = async (req, res, next) => {
  try {
    const cacheKey = crearCacheKey('usuarios', req.query);
    const cache = await obtenerCache(cacheKey);

    if (cache) {
      res.set('X-Cache', 'HIT');
      return res.json(cache);
    }

    const { q, rol } = req.query;
    const { skip, take } = obtenerPaginacion(req.query);
    const where = limpiarDatos({
      nombre: q ? { contains: q, mode: 'insensitive' } : undefined,
      rol: rol || undefined
    });

    const usuarios = await prisma.usuario.findMany({
      where,
      include: includeRelaciones,
      skip,
      take,
      orderBy: { id: 'asc' }
    });

    await guardarCache(cacheKey, usuarios);
    res.set('X-Cache', 'MISS');
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const obtenerUsuariosPorRol = async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { rol: req.params.rol },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(usuarios);
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

    await borrarTodaCache();
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
