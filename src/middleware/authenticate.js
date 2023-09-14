import { loggerDev, loggerProd } from  "..//utils/logger.js";

// Autentificacion de usuarios en base a roles. Esto es para proteguer las rutas
export function authenticate(allowedRoles) {
  return (req, res, next) => {
    if (req.session.user) {
      const user = req.session.user;

      if (allowedRoles.includes(user.rol)) {
        req.currentUser = user;
       
        next();
      } else {
        loggerDev.http(`Usuario con correo ${user.email} intentando acceder a una ruta no autorizada`);
        res.status(403).render('forbidden', { title: 'Acceso denegado' });
      }
    } else {
      loggerDev.http(`Intento de acceso a rutas no autorizado sin logearse`);
      res.redirect('/');
   
    }
  };
}
