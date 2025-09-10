import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    whatsapp: { type: String, required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    createdAt: { type: Date, default: Date.now }
});

const Store = mongoose.model('Store', storeSchema);
export default Store;
