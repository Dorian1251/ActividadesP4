const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { borrarTodaCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { agregarTokenABlacklist } = require('../services/tokenBlacklistService');
const { validarCampos } = require('../utils/request');
 
const limpiarUsuario = (usuario) => {
  const { password, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
};
 
const obtenerJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no esta configurado');
  }

  return process.env.JWT_SECRET;
};

const generarAccessToken = (usuario) => {
  const jwtSecret = obtenerJwtSecret();
 
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      tipo: 'access'
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

const generarRefreshToken = (usuario) => {
  const jwtSecret = obtenerJwtSecret();

  return jwt.sign(
    {
      id: usuario.id,
      tipo: 'refresh'
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};
 
const registrar = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['nombre', 'email', 'password', 'rol']);
 
    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }
 
    const nombre = String(req.body.nombre).trim();
    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);
    const rol = String(req.body.rol).trim();
 
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
 
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { email }
    });
 
    if (usuarioExiste) {
      return res.status(400).json({ error: 'Ya existe un usuario registrado con ese email' });
    }
 
    const passwordHash = await bcrypt.hash(password, 10);
 
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol
      }
    });
 
    const usuarioSeguro = limpiarUsuario(usuario);
 
    await borrarTodaCache();
    await publicarEvento(CHANNELS.USUARIO_REGISTRADO, 'usuario.registrado', usuarioSeguro);
 
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: usuarioSeguro
    });
  } catch (error) {
    next(error);
  }
};
 
const login = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['email', 'password']);
 
    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }
 
    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);
 
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });
 
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }

    if (!usuario.password) {
      return res.status(401).json({
        error: 'Credenciales invalidas. El usuario debe registrarse nuevamente para habilitar acceso con JWT'
      });
    }
 
    const passwordValido = await bcrypt.compare(password, usuario.password);
 
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
 
    const token = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken(usuario);
    const usuarioSeguro = limpiarUsuario(usuario);
 
    res.json({
      mensaje: 'Login correcto',
      token,
      refreshToken,
      tipo: 'Bearer',
      expiraEn: process.env.JWT_EXPIRES_IN || '1h',
      refreshExpiraEn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      usuario: usuarioSeguro
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['refreshToken']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const decoded = jwt.verify(req.body.refreshToken, obtenerJwtSecret());

    if (decoded.tipo !== 'refresh') {
      return res.status(401).json({ error: 'Refresh token invalido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(decoded.id) }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario del refresh token no existe' });
    }

    const token = generarAccessToken(usuario);

    res.json({
      mensaje: 'Token renovado correctamente',
      token,
      tipo: 'Bearer',
      expiraEn: process.env.JWT_EXPIRES_IN || '1h'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expirado, inicia sesion nuevamente' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Refresh token invalido' });
    }

    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await agregarTokenABlacklist(req.token, req.tokenPayload?.exp);

    res.json({
      mensaje: 'Logout correcto. Token invalidado hasta su expiracion'
    });
  } catch (error) {
    next(error);
  }
};
 
module.exports = {
  login,
  logout,
  refresh,
  registrar
};
