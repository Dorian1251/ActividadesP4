const prisma = require('../config/db');
const { limpiarDatos, obtenerId, validarCampos } = require('../utils/request');

const includeRelaciones = {
  sesiones: true,
  recursos: true,
  grupos: true
};

const obtenerMaterias = async (req, res, next) => {
  try {
    const materias = await prisma.materia.findMany({
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(materias);
  } catch (error) {
    next(error);
  }
};

const obtenerMateriaPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!materia) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    res.json(materia);
  } catch (error) {
    next(error);
  }
};

const crearMateria = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['nombre', 'codigo', 'docente']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const materia = await prisma.materia.create({
      data: {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        docente: req.body.docente
      }
    });

    res.status(201).json(materia);
  } catch (error) {
    next(error);
  }
};

const actualizarMateria = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materiaExiste = await prisma.materia.findUnique({ where: { id } });

    if (!materiaExiste) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    const materia = await prisma.materia.update({
      where: { id },
      data: limpiarDatos({
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        docente: req.body.docente
      })
    });

    res.json(materia);
  } catch (error) {
    next(error);
  }
};

const eliminarMateria = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materiaExiste = await prisma.materia.findUnique({ where: { id } });

    if (!materiaExiste) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    await prisma.materia.delete({ where: { id } });

    res.json({ mensaje: `Materia con id ${id} eliminada correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarMateria,
  crearMateria,
  eliminarMateria,
  obtenerMateriaPorId,
  obtenerMaterias
};
