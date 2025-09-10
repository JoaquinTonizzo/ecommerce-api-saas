// Middleware de manejo de errores más flexible
export const errorHandler = (error, req, res, next) => {
  // Si el error tiene un status definido, lo usamos; si no, usamos 500 por defecto
  const status = error.status || 500;

  // Mensaje del error (puede venir de un throw personalizado)
  const message = error.message || "Internal Server Error";

  // Respondemos al cliente con el código y el mensaje
  res.status(status).json({ message });
};
