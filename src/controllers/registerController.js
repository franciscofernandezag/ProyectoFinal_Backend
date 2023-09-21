import userDao from "../dao/userDao.js";
import cartModel from "../dao/models/Carts.js";
import { comparePasswords, hashPassword } from "../utils/bcryptUtils.js";



export async function registerUser(req, res) {
  const { nombre, apellido, email, genero, rol, password } = req.body;
  try {
    if (!nombre || !apellido || !email || !genero || !rol || !password) {
      return res.status(400).render('home', { title: 'Página de inicio', error: 'Faltan campos obligatorios' });
    }

    // Comprobar si el email ya está en uso utilizando el userDao
    const existingUser = await userDao.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).render('home', { title: 'Página de inicio', error: 'Email de usuario en uso' });
    }

    // Generar el hash de la contraseña
    const hashedPassword = await hashPassword(password);
    const user = await userDao.createUser({
      first_name: nombre,
      last_name: apellido,
      email,
      gender: genero,
      rol,
      password: hashedPassword,
      authenticationType: 'local'
    });

    // Crear un carrito vacío para el usuario
    const cart = await cartModel.create({ products: [] });

    // Asociar el carrito al usuario
    user.cartId = cart._id;
    await user.save();

    res.render('home', { title: 'Página de inicio', success: 'Usuario creado exitosamente', error: null });
  } catch (error) {
    console.error('Error en el registro de usuarios:', error);
    res.status(500).render('home', { title: 'Página de inicio', error: 'Error en el servidor', success: null });
  }
}
