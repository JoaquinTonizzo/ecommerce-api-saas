import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userManager from '../managers/UserManager.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';


import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();
const manager = userManager;

// POST /register -> Registra un nuevo usuario
router.post('/register', async (req, res, next) => {
  try {
    
    const { email, password, firstName, lastName } = req.body || {};

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const newUser = await manager.addUser({
      email,
      password,
      firstName,
      lastName,
      role: 'user'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.message === 'El email ya está registrado') {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

// POST /login -> Autentica usuario y devuelve JWT
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const user = await manager.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT (payload con id, email, rol y store si existe)
    const tokenPayload = {
  id: user.id,
  email: user.email,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  ...(user.store ? { store: user.store } : {})
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ...(user.store ? { store: user.store } : {})
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /profile/:id -> Obtener perfil (protegido)
router.get('/profile/:id', authenticateToken, async (req, res, next) => {
  try {
    // Solo el mismo usuario o admin pueden ver el perfil
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const user = await manager.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// GET /users -> Listar todos los usuarios (solo admin)
router.get('/users', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const users = await manager.getUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    next(error);
  }
});

// PUT /update-profile -> Actualiza datos del usuario autenticado
router.put('/update-profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;
    // Validaciones básicas
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    const updatedUser = await manager.updateUserProfile(userId, { firstName, lastName, email });
    if (!updatedUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Generar nuevo token con los datos actualizados
    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      ...(updatedUser.store ? { store: updatedUser.store } : {})
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });

    res.json({
      message: 'Perfil actualizado',
      token,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// POST /logout -> Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso. Por favor borra el token en el cliente.' });
});

export default router;
