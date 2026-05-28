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

module.exports = {
  limpiarDatos,
  obtenerId,
  validarCampos
};
