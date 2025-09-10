import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  code: { type: String, required: true, unique: true },
  category: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  thumbnails: [{ type: String }],
  status: { type: Boolean, default: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);
export default Product;
