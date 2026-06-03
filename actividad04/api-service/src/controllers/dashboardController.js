const prisma = require('../config/db');

const obtenerDashboard = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const hoy = new Date().toISOString().slice(0, 10);

    const [usuario, proximasSesiones, asistencias, recursosRecientes, materiasCount, sesionesCount] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, nombre: true, email: true, rol: true }
      }),
      prisma.sesion.findMany({
        where: { fecha: { gte: hoy } },
        include: { materia: true },
        orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
        take: 5
      }),
      prisma.asistencia.findMany({
        where: { usuarioId },
        include: { sesion: { select: { fecha: true } } }
      }),
      prisma.recurso.findMany({
        include: { materia: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.materia.count(),
      prisma.sesion.count({ where: { usuarioId } })
    ]);

    const total = asistencias.length;
    const asistidas = asistencias.filter((a) => a.sesion && a.sesion.fecha <= hoy).length;
    const porcentaje = total === 0 ? 0 : Math.round((asistidas / total) * 100);

    res.set('Cache-Control', 'private, max-age=60');
    res.json({
      usuario,
      proximasSesiones,
      asistencia: { total, asistidas, porcentaje },
      recursosRecientes,
      materiasCount,
      sesionesCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerDashboard };
