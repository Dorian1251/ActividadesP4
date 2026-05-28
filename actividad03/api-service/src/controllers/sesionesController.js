const prisma = require('../config/db');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, validarCampos } = require('../utils/request');

const includeRelaciones = {
  usuario: true,
  materia: true
};

const obtenerSesiones = async (req, res, next) => {
  try {
    const sesiones = await prisma.sesion.findMany({
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(sesiones);
  } catch (error) {
    next(error);
  }
};

const obtenerSesionPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesion = await prisma.sesion.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    res.json(sesion);
  } catch (error) {
    next(error);
  }
};

const crearSesion = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, [
      'titulo',
      'fecha',
      'hora',
      'modalidad',
      'usuarioId',
      'materiaId'
    ]);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const sesion = await prisma.sesion.create({
      data: {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fecha: req.body.fecha,
        hora: req.body.hora,
        modalidad: req.body.modalidad,
        usuarioId: Number(req.body.usuarioId),
        materiaId: Number(req.body.materiaId)
      },
      include: includeRelaciones
    });

    await publicarEvento(CHANNELS.SESION_CREADA, 'sesion.creada', sesion);

    res.status(201).json(sesion);
  } catch (error) {
    next(error);
  }
};

const actualizarSesion = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesionExiste = await prisma.sesion.findUnique({ where: { id } });

    if (!sesionExiste) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    const sesion = await prisma.sesion.update({
      where: { id },
      data: limpiarDatos({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fecha: req.body.fecha,
        hora: req.body.hora,
        modalidad: req.body.modalidad,
        usuarioId: req.body.usuarioId !== undefined ? Number(req.body.usuarioId) : undefined,
        materiaId: req.body.materiaId !== undefined ? Number(req.body.materiaId) : undefined
      }),
      include: includeRelaciones
    });

    res.json(sesion);
  } catch (error) {
    next(error);
  }
};

const eliminarSesion = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesionExiste = await prisma.sesion.findUnique({ where: { id } });

    if (!sesionExiste) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    await prisma.sesion.delete({ where: { id } });

    res.json({ mensaje: `Sesion con id ${id} eliminada correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarSesion,
  crearSesion,
  eliminarSesion,
  obtenerSesionPorId,
  obtenerSesiones
};
