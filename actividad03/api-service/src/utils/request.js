const obtenerId = (valor) => {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

const validarCampos = (body, campos) => {
  for (const campo of campos) {
    if (body[campo] === undefined || body[campo] === null || body[campo] === '') {
      return campo;
    }
  }

  return null;
};

const limpiarDatos = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
};

const obtenerPaginacion = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  return {
    skip: (page - 1) * limit,
    take: limit
  };
};

module.exports = {
  limpiarDatos,
  obtenerId,
  obtenerPaginacion,
  validarCampos
};
