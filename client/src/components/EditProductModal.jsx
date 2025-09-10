import { useState, useEffect } from 'react';

export default function EditProductModal({ open, product, onSave, onCancel }) {
    const [form, setForm] = useState(product || {});
    const [hasChanges, setHasChanges] = useState(false);
    const [warning, setWarning] = useState('');

    useEffect(() => {
        setForm(product || {});
        setHasChanges(false);
        setWarning('');
    }, [product, open]);

    useEffect(() => {
        if (!product) return;
        // Comparar todos los campos excepto id
        const keys = ['title','description','code','price','status','stock','category','thumbnails'];
        const changed = keys.some(k => {
            if (k === 'thumbnails') {
                return Array.isArray(form[k]) ? form[k].join(',') !== (Array.isArray(product[k]) ? product[k].join(',') : '') : form[k] !== product[k];
            }
            return form[k] !== product[k];
        });
        setHasChanges(changed);
    }, [form, product]);

    if (!open) return null;

    function handleChange(e) {
        const { name, value } = e.target;
        let newValue = value;
        if (name === 'status') {
            newValue = value === 'true';
        } else if (name === 'stock' || name === 'price') {
            if (value === '') {
                newValue = '';
            } else {
                const num = Number(value);
                newValue = num < 0 ? 0 : num;
            }
        }
        setForm({ ...form, [name]: newValue });
    }

    function handleThumbnails(e) {
        setForm({ ...form, thumbnails: e.target.value.split(',').map(t => t.trim()).filter(Boolean) });
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!hasChanges) {
            setWarning('No hay cambios para guardar');
            return;
        }
        // Eliminar id/_id del objeto antes de guardar
        const { _id, id, ...body } = form;
        // El id debe venir del prop product, si no existe, del form
        let productId = product?._id || product?.id;
        console.log('EditProductModal: product prop:', product);
        console.log('EditProductModal: form:', form);
        if (!productId) {
            productId = _id || id;
        }
        console.log('EditProductModal: resolved productId:', productId);
        console.log('EditProductModal: body to send:', body);
        if (!productId) {
            setWarning('No se puede guardar: producto sin identificador');
            return;
        }
        setWarning('');
        // onSave recibe {id, body}
        onSave({ id: productId, body });
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4" onClick={onCancel}>
            <div className="relative w-full max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Editar producto</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Título</label>
                        <input name="title" value={form.title || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Descripción</label>
                        <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Código</label>
                        <input name="code" value={form.code || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Precio</label>
                        <input name="price" type="number" step="0.01" min="0" value={form.price === 0 ? 0 : form.price || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Stock</label>
                        <input name="stock" type="number" min="0" value={form.stock === 0 ? 0 : form.stock || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Categoría</label>
                        <input name="category" value={form.category || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Thumbnails (URLs separadas por coma)</label>
                        <input name="thumbnails" value={Array.isArray(form.thumbnails) ? form.thumbnails.join(',') : form.thumbnails || ''} onChange={handleThumbnails} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    {warning && <p className="text-red-600 mb-2 text-center font-semibold">{warning}</p>}
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
                        <button type="submit" className={`px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!hasChanges}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
