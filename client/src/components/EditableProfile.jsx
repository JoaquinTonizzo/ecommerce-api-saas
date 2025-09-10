import { useState } from 'react';

export default function EditableProfile({ user, setUser, editButtonClassName }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSave(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil');
            // Guardar el nuevo token y actualizar el contexto
            if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
            } else {
                setUser(u => ({ ...u, ...form }));
            }
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!editing) {
        return (
            <div className="mb-2 flex flex-col items-center">
                <div className="text-base font-semibold text-blue-700 dark:text-blue-300 mb-1 text-center">
                    {form.firstName} {form.lastName}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">{form.email}</span>
                </div>
                {editButtonClassName && (
                    <button
                        onClick={() => setEditing(true)}
                        aria-label="Editar perfil"
                        className={`absolute top-3 right-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${editButtonClassName}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.362z" />
                        </svg>
                    </button>
                )}
            </div>
        );
    }
    return (
        <form className="w-full flex flex-col items-center gap-2 mt-2" onSubmit={handleSave}>
            <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-100"
                required
            />
            <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Apellido"
                className="w-full px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-100"
                required
            />
            <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-3 py-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-blue-900 dark:text-blue-100"
                required
            />
            {error && <div className="text-red-500 text-sm mb-1">{error}</div>}
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-sm"
                >
                    Guardar
                </button>
                <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-1 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition shadow-sm"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}