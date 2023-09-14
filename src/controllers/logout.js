import userDao from "../dao/userDao.js"; 
import { loggerDev, loggerProd } from "../utils/logger.js";

export async function logout(req) {
  if (req.session.user) {
    const userId = req.session.user._id;
    try {
      const newLastConnection = new Date();
      await userDao.updateUserById(userId, { last_connection: newLastConnection });

      loggerDev.info(`Usuario ${req.session.user.email} cerró sesión. Última conexión: ${newLastConnection}`);
    } catch (error) {
      console.error('Error al actualizar la última conexión al cerrar sesión:', error);
    }
  }
  req.session.destroy();
}
