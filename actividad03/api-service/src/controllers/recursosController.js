const prisma = require('../config/db');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, validarCampos } = require('../utils/request');

const includeRelaciones = {
  usuario: true,
  materia: true
};

const obtenerRecursos = async (req, res, next) => {
  try {
    const recursos = await prisma.recurso.findMany({
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(recursos);
  } catch (error) {
    next(error);
  }
};

const obtenerRecursoPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recurso = await prisma.recurso.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!recurso) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    res.json(recurso);
  } catch (error) {
    next(error);
  }
};

const crearRecurso = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['titulo', 'tipo', 'url', 'usuarioId', 'materiaId']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const recurso = await prisma.recurso.create({
      data: {
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        url: req.body.url,
        descripcion: req.body.descripcion,
        usuarioId: Number(req.body.usuarioId),
        materiaId: Number(req.body.materiaId)
      },
      include: includeRelaciones
    });

    await publicarEvento(CHANNELS.RECURSO_PUBLICADO, 'recurso.publicado', recurso);

    res.status(201).json(recurso);
  } catch (error) {
    next(error);
  }
};

const actualizarRecurso = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recursoExiste = await prisma.recurso.findUnique({ where: { id } });

    if (!recursoExiste) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    const recurso = await prisma.recurso.update({
      where: { id },
      data: limpiarDatos({
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        url: req.body.url,
        descripcion: req.body.descripcion,
        usuarioId: req.body.usuarioId !== undefined ? Number(req.body.usuarioId) : undefined,
        materiaId: req.body.materiaId !== undefined ? Number(req.body.materiaId) : undefined
      }),
      include: includeRelaciones
    });

    res.json(recurso);
  } catch (error) {
    next(error);
  }
};

const eliminarRecurso = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recursoExiste = await prisma.recurso.findUnique({ where: { id } });

    if (!recursoExiste) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    await prisma.recurso.delete({ where: { id } });

    res.json({ mensaje: `Recurso con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarRecurso,
  crearRecurso,
  eliminarRecurso,
  obtenerRecursoPorId,
  obtenerRecursos
};
