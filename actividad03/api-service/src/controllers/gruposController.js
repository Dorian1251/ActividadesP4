const prisma = require('../config/db');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, obtenerPaginacion, validarCampos } = require('../utils/request');

const includeRelaciones = {
  materia: true,
  organizador: true,
  integrantes: true
};

const obtenerGrupos = async (req, res, next) => {
  try {
    const { q, materia } = req.query;
    const { skip, take } = obtenerPaginacion(req.query);
    const where = limpiarDatos({
      nombre: q ? { contains: q, mode: 'insensitive' } : undefined,
      materia: materia
        ? {
            OR: [
              { nombre: { contains: materia, mode: 'insensitive' } },
              { codigo: { contains: materia, mode: 'insensitive' } },
              Number.isInteger(Number(materia)) ? { id: Number(materia) } : undefined
            ].filter(Boolean)
          }
        : undefined
    });

    const grupos = await prisma.grupo.findMany({
      where,
      include: includeRelaciones,
      skip,
      take,
      orderBy: { id: 'asc' }
    });

    res.json(grupos);
  } catch (error) {
    next(error);
  }
};

const obtenerGruposPorMateria = async (req, res, next) => {
  try {
    const materia = req.params.materia;

    const grupos = await prisma.grupo.findMany({
      where: {
        materia: {
          OR: [
            { nombre: { contains: materia, mode: 'insensitive' } },
            { codigo: { contains: materia, mode: 'insensitive' } },
            Number.isInteger(Number(materia)) ? { id: Number(materia) } : undefined
          ].filter(Boolean)
        }
      },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(grupos);
  } catch (error) {
    next(error);
  }
};

const obtenerGrupoPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const grupo = await prisma.grupo.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!grupo) {
      return res.status(404).json({ error: `No existe un grupo con id ${id}` });
    }

    res.json(grupo);
  } catch (error) {
    next(error);
  }
};

const crearGrupo = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, [
      'nombre',
      'descripcion',
      'materiaId',
      'organizadorId'
    ]);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const grupo = await prisma.grupo.create({
      data: {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        materiaId: Number(req.body.materiaId),
        organizadorId: Number(req.body.organizadorId)
      },
      include: includeRelaciones
    });

    res.status(201).json(grupo);
  } catch (error) {
    next(error);
  }
};

const actualizarGrupo = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const grupoExiste = await prisma.grupo.findUnique({ where: { id } });

    if (!grupoExiste) {
      return res.status(404).json({ error: `No existe un grupo con id ${id}` });
    }

    const grupo = await prisma.grupo.update({
      where: { id },
      data: limpiarDatos({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        materiaId: req.body.materiaId !== undefined ? Number(req.body.materiaId) : undefined,
        organizadorId: req.body.organizadorId !== undefined ? Number(req.body.organizadorId) : undefined
      }),
      include: includeRelaciones
    });

    res.json(grupo);
  } catch (error) {
    next(error);
  }
};

const eliminarGrupo = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const grupoExiste = await prisma.grupo.findUnique({ where: { id } });

    if (!grupoExiste) {
      return res.status(404).json({ error: `No existe un grupo con id ${id}` });
    }

    await prisma.grupo.delete({ where: { id } });

    res.json({ mensaje: `Grupo con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
};

const agregarIntegrante = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const campoFaltante = validarCampos(req.body, ['usuarioId']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const grupo = await prisma.grupo.update({
      where: { id },
      data: {
        integrantes: {
          connect: { id: Number(req.body.usuarioId) }
        }
      },
      include: includeRelaciones
    });

    const integrante = grupo.integrantes.find((usuario) => usuario.id === Number(req.body.usuarioId));

    await publicarEvento(CHANNELS.USUARIO_UNIDO, 'usuario.unido', {
      grupoId: grupo.id,
      grupo: grupo.nombre,
      usuarioId: Number(req.body.usuarioId),
      usuario: integrante?.nombre || `Usuario ${req.body.usuarioId}`,
      organizador: grupo.organizador?.nombre,
      materia: grupo.materia?.nombre
    });

    res.json(grupo);
  } catch (error) {
    next(error);
  }
};

const quitarIntegrante = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);
    const usuarioId = obtenerId(req.params.usuarioId);

    if (!id || !usuarioId) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const grupo = await prisma.grupo.update({
      where: { id },
      data: {
        integrantes: {
          disconnect: { id: usuarioId }
        }
      },
      include: includeRelaciones
    });

    res.json(grupo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarGrupo,
  agregarIntegrante,
  crearGrupo,
  eliminarGrupo,
  obtenerGrupoPorId,
  obtenerGrupos,
  obtenerGruposPorMateria,
  quitarIntegrante
};
