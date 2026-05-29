const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Ya existe un registro con un valor unico repetido',
      detalle: err.meta?.target
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'No se puede completar la operacion porque una relacion no existe o esta en uso'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Registro no encontrado'
    });
  }

  res.status(500).json({
    error: 'Error interno del servidor'
  });
};

module.exports = errorHandler;
