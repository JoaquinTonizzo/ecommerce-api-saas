import express from 'express';
import Store from '../models/Store.js';
import Product from '../models/Product.js';
const router = express.Router();

// GET /api/store/all -> Lista todas las tiendas
router.get('/all', async (req, res) => {
    try {
        const stores = await Store.find().populate('owner', 'firstName lastName email').lean();
        res.json(stores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/store/:id -> Info de la tienda y sus productos
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('owner', 'firstName lastName email').lean();
        if (!store) return res.status(404).json({ error: 'Tienda no encontrada' });
        const products = await Product.find({ store: store._id });
        res.json({ store, products });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
