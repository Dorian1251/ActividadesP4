const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { borrarTodaCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { validarCampos } = require('../utils/request');
 
const limpiarUsuario = (usuario) => {
  const { password, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
};
 
const generarToken = (usuario) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no esta configurado');
  }
 
  return jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
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
 
    const passwordValido = await bcrypt.compare(password, usuario.password);
 
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
 
    const token = generarToken(usuario);
    const usuarioSeguro = limpiarUsuario(usuario);
 
    res.json({
      mensaje: 'Login correcto',
      token,
      tipo: 'Bearer',
      expiraEn: process.env.JWT_EXPIRES_IN || '1h',
      usuario: usuarioSeguro
    });
  } catch (error) {
    next(error);
  }
};
 
module.exports = {
  login,
  registrar
};
