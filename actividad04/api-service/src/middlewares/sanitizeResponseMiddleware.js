const limpiarPassword = (data, vistos = new WeakSet()) => {
  if (data === null || data === undefined) {
    return data;
  }
 
  if (data instanceof Date) {
    return data;
  }
 
  if (Array.isArray(data)) {
    return data.map((item) => limpiarPassword(item, vistos));
  }
 
  if (typeof data === 'object') {
    if (vistos.has(data)) {
      return data;
    }
 
    vistos.add(data);
 
    return Object.fromEntries(
      Object.entries(data)
        .filter(([key]) => key !== 'password')
        .map(([key, value]) => [key, limpiarPassword(value, vistos)])
    );
  }
 
  return data;
};
 
const sanitizeResponseMiddleware = (req, res, next) => {
  const jsonOriginal = res.json.bind(res);
 
  res.json = (body) => {
    return jsonOriginal(limpiarPassword(body));
  };
 
  next();
};
 
module.exports = sanitizeResponseMiddleware;
