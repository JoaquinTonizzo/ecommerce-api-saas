
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

// GET /api/store/all - Obtener todas las tiendas
router.get('/all', async (req, res) => {
    try {
        const stores = await Store.find().populate('owner');
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/store/register
router.post('/register', async (req, res) => {
    try {
            const { storeName, firstName, lastName, password } = req.body;
            if (!storeName || !firstName || !lastName || !password) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }
            // Verificar si el email ya existe
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            // Crear la tienda con storeName, address y whatsapp
            const store = new Store({ storeName, address: req.body.address, whatsapp: req.body.whatsapp });
            await store.save();

            // Crear el usuario admin vinculado a la tienda
            const hashedPassword = await bcrypt.hash(password, 10);
            const adminUser = new User({
                email: req.body.email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'admin',
                store: store._id
            });
            await adminUser.save();

            // Actualizar la tienda para asignar el owner
            store.owner = adminUser._id;
            await store.save();

            res.status(201).json({ message: 'Tienda y admin creados exitosamente', store, adminUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET /api/store/:id - Obtener info de tienda por ID
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('owner');
        if (!store) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        // Buscar productos de la tienda
        const Product = (await import('../models/Product.js')).default;
        const products = await Product.find({ store: store._id });
        res.json({ store, products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

// PUT /api/store/:id
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { storeName, address, whatsapp } = req.body;
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        // Verificar que el usuario autenticado es el owner de la tienda
        const userId = req.user._id || req.user.id;
        if (!req.user || req.user.role !== 'admin' || String(store.owner) !== String(userId)) {
            return res.status(403).json({ error: 'Solo el administrador dueño de la tienda puede editar esta información.' });
        }
        if (storeName) store.storeName = storeName;
        if (address) store.address = address;
        if (whatsapp !== undefined) store.whatsapp = whatsapp;
        await store.save();
        const populatedStore = await Store.findById(store._id).populate('owner');
        res.json({ message: 'Tienda actualizada', store: populatedStore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
