import { useState } from 'react';

export default function CreateAdminModal({ open, onSave, onCancel }) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    if (!open) return null;

    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSave(form);
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4" onClick={onCancel}>
            <div className="relative w-full max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Crear admin</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Nombre</label>
                        <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Apellido</label>
                        <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-semibold">Contraseña</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition">Cancelar</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Crear</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
