import userDao from "../dao/userDao.js";
import passport from '../utils/passportUtils.js';
import { loggerDev, loggerProd } from  "../utils/logger.js";


export async function loginUser(req, res, next) {
    passport.authenticate('local', async (err, user, info) => {
      if (err) {
        console.error('Error en el inicio de sesión:', err);
        return res.status(500).render('home', { title: 'Página de inicio', error: 'Error en el servidor' });
      }
  
      if (!user) {
        return res.render('home', { title: 'Página de inicio', error: info.message });
      }
  
      req.logIn(user, async (err) => {
        if (err) {
          console.error('Error en el inicio de sesión:', err);
          return res.status(500).render('home', { title: 'Página de inicio', error: 'Error en el servidor' });
        }
  
        req.session.user = user;
        req.session.user.rol = user.rol;
  
        // Actualizar last_connection utilizando el userDao
        try {
          const newLastConnection = new Date();
          await userDao.updateUserById(user._id, { last_connection: newLastConnection });
  
          loggerDev.info(`Usuario ${user.email} inició sesión. Última conexión: ${newLastConnection}`);
        } catch (error) {
          console.error('Error al actualizar la última conexión:', error);
        }
  
        // Redirigir según el rol
        if (user.rol === 'administrador') {
          return res.redirect('/admin'); 
        } else if (user.rol === 'premium') {
          return res.redirect('/premium'); 
        } else {
          return res.redirect('/products'); 
        }
      });
    })(req, res, next);
  }
