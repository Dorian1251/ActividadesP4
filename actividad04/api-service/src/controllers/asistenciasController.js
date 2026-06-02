const QRCode = require('qrcode');
const { randomUUID } = require('crypto');
const prisma = require('../config/db');
const { borrarTodaCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { obtenerId, validarCampos } = require('../utils/request');

const includeAsistencia = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true
    }
  },
  sesion: {
    include: {
      materia: true
    }
  }
};

const construirBaseUrl = (req) => {
  const configuredUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  return `${req.protocol}://${req.get('host')}`;
};

const obtenerSesion = async (id) => {
  return prisma.sesion.findUnique({
    where: { id },
    include: {
      materia: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true
        }
      }
    }
  });
};

const obtenerQrSesion = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    let sesion = await obtenerSesion(id);

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    if (!sesion.codigoAsistencia) {
      sesion = await prisma.sesion.update({
        where: { id },
        data: { codigoAsistencia: randomUUID() },
        include: {
          materia: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true
            }
          }
        }
      });
    }

    const baseUrl = construirBaseUrl(req);
    const asistenciaUrl = `${baseUrl}/static/asistencia.html?sesionId=${sesion.id}&codigo=${sesion.codigoAsistencia}`;
    const qrDataUrl = await QRCode.toDataURL(asistenciaUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320
    });

    res.json({
      sesion: {
        id: sesion.id,
        titulo: sesion.titulo,
        fecha: sesion.fecha,
        hora: sesion.hora,
        modalidad: sesion.modalidad,
        materia: sesion.materia
      },
      asistenciaUrl,
      qrDataUrl
    });
  } catch (error) {
    next(error);
  }
};

const obtenerMiAsistencia = async (req, res, next) => {
  try {
    const sesionId = obtenerId(req.params.id);

    if (!sesionId) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesion = await obtenerSesion(sesionId);

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${sesionId}` });
    }

    const asistencia = await prisma.asistencia.findUnique({
      where: {
        usuarioId_sesionId: {
          usuarioId: req.user.id,
          sesionId
        }
      },
      include: includeAsistencia
    });

    res.json({
      marcada: Boolean(asistencia),
      asistencia,
      sesion
    });
  } catch (error) {
    next(error);
  }
};

const marcarAsistencia = async (req, res, next) => {
  try {
    const sesionId = obtenerId(req.params.id);

    if (!sesionId) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const campoFaltante = validarCampos(req.body, ['codigo']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const sesion = await obtenerSesion(sesionId);

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${sesionId}` });
    }

    if (String(req.body.codigo).trim() !== sesion.codigoAsistencia) {
      return res.status(401).json({ error: 'Codigo QR invalido para esta sesion' });
    }

    const asistencia = await prisma.asistencia.upsert({
      where: {
        usuarioId_sesionId: {
          usuarioId: req.user.id,
          sesionId
        }
      },
      update: {},
      create: {
        usuarioId: req.user.id,
        sesionId
      },
      include: includeAsistencia
    });

    await borrarTodaCache();
    await publicarEvento(CHANNELS.ASISTENCIA_MARCADA, 'asistencia.marcada', {
      asistenciaId: asistencia.id,
      sesionId,
      sesion: sesion.titulo,
      materia: sesion.materia?.nombre,
      usuarioId: req.user.id,
      usuario: req.user.nombre
    });

    res.status(201).json({
      mensaje: 'Asistencia marcada correctamente',
      asistencia
    });
  } catch (error) {
    next(error);
  }
};

const desmarcarAsistencia = async (req, res, next) => {
  try {
    const sesionId = obtenerId(req.params.id);

    if (!sesionId) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const asistencia = await prisma.asistencia.findUnique({
      where: {
        usuarioId_sesionId: {
          usuarioId: req.user.id,
          sesionId
        }
      },
      include: includeAsistencia
    });

    if (!asistencia) {
      return res.status(404).json({ error: 'No tienes asistencia marcada en esta sesion' });
    }

    await prisma.asistencia.delete({
      where: {
        usuarioId_sesionId: {
          usuarioId: req.user.id,
          sesionId
        }
      }
    });

    await borrarTodaCache();
    await publicarEvento(CHANNELS.ASISTENCIA_DESMARCADA, 'asistencia.desmarcada', {
      asistenciaId: asistencia.id,
      sesionId,
      sesion: asistencia.sesion?.titulo,
      materia: asistencia.sesion?.materia?.nombre,
      usuarioId: req.user.id,
      usuario: req.user.nombre
    });

    res.json({
      mensaje: 'Asistencia desmarcada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

const listarAsistenciasDeSesion = async (req, res, next) => {
  try {
    const sesionId = obtenerId(req.params.id);

    if (!sesionId) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesion = await obtenerSesion(sesionId);

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${sesionId}` });
    }

    const asistencias = await prisma.asistencia.findMany({
      where: { sesionId },
      include: includeAsistencia,
      orderBy: { fechaHora: 'asc' }
    });

    res.json({
      sesion,
      total: asistencias.length,
      asistencias
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  desmarcarAsistencia,
  listarAsistenciasDeSesion,
  marcarAsistencia,
  obtenerMiAsistencia,
  obtenerQrSesion
};
