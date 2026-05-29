const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
 
const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
 
    if (!authorization) {
      return res.status(401).json({ error: 'Token requerido' });
    }
 
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Formato de token invalido. Use Bearer TOKEN' });
    }
 
    const token = authorization.split(' ')[1];
 
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }
 
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET no esta configurado' });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(decoded.id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      }
    });
 
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario del token no existe' });
    }
 
    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
 
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalido' });
    }
 
    next(error);
  }
};
 
module.exports = authMiddleware;
