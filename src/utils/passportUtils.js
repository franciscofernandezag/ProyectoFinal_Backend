import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import { userModel } from '../dao/models/Users.js';
import { loggerDev, loggerProd } from  "../utils/logger.js";

// Configurar la estrategia de autenticación local
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await userModel.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        loggerProd.info(`Usuario: ${email} intentando acceder con email o contraseña incorrecta`);
        return done(null, false, { message: 'Correo o contraseña incorrecta' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
