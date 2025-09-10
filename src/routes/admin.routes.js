import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();
const USERS_FILE = './src/data/users.json';

router.post('/create-admin', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, firstName, lastName, role = 'user' } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const VALID_ROLES = ['user', 'admin'];
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin"' });
  }

  try {
    // Verificar si el usuario ya existe en MongoDB
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Asociar el nuevo admin a la tienda del admin creador
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      store: req.user.store || undefined
    });
    await newUser.save();

    res.status(201).json({
      message: `Usuario ${role} creado correctamente`,
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        store: newUser.store
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

export default router;
