const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    next(); // El usuario es admin, permite continuar
  } else {
    res
      .status(403)
      .json({ msg: "Acceso denegado. Se requiere rol de administrador." });
  }
};

module.exports = adminMiddleware;
