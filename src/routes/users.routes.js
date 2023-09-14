 import { Router } from "express";
import userDao from "../dao/userDao.js"
import { comparePasswords, hashPassword } from "../utils/bcryptUtils.js";
import { profileUploadMiddleware, dniUploadMiddleware , comprobanteDomicilioMiddleware, estadoCuentaMiddleware }from "../middleware/multer.js";


const userRouter = Router();

// renderiza USUARIO  
userRouter.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.session.user;
    const cartId = req.session.user.cartId;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');
    
    res.render('users', { user, userId, cartId, userProfileImage });
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta POST de edición de USUARIO
userRouter.post('/:userId/edit', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { first_name, last_name, gender } = req.body; 
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');
    const updateData = { first_name, last_name, gender };
    const updatedUser = await userDao.updateUserById(userId, updateData);

    if (updatedUser) {
      req.session.user = updatedUser;
    } else {

      res.status(500).send('Error al actualizar los datos del usuario');
      return;
    }

    res.render('users', { user, userId, userProfileImage,  message: 'Datos de usuario editados exitosamente', });
  } catch (error) {
    console.error('Error al actualizar los datos del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para manejar la solicitud POST de cambio de contraseña usuario
userRouter.post('/:userId/change-password', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword } = req.body; 
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');
    const hashedPassword = await hashPassword(newPassword);

    const updateData = { password: hashedPassword };
    const updatedUser = await userDao.updateUserById(userId, updateData);

    if (updatedUser) {

      res.render('users', { user, userId, userProfileImage,  message: 'Datos de usuario editados exitosamente', });
    } else {

      res.status(500).send('Error al actualizar la contraseña del usuario');
    }
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

 //actualizar foto de perfil USUARIO 
 userRouter.post('/:userId/documents/upload-profile', profileUploadMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const profileImage = req.file;

    if (!profileImage) {
      
      return res.status(400).json({ error: 'Debes cargar una imagen de perfil' });
    }

    const existingProfileImage = await userDao.getUserDocumentByName(userId, 'Foto de perfil');
    if (existingProfileImage) {
      await userDao.removeUserDocumentById(userId, existingProfileImage._id);
    }
    const updateData = {
      $push: {
        documents: {
          name: 'Foto de perfil',
          reference: profileImage.filename
        }
      }
    };
    const updatedUser = await userDao.updateUserById(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    req.session.user = updatedUser;
    const userProfileImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Foto de perfil');
    res.render('users', { user: updatedUser, message: 'Imagen de perfil cargada exitosamente', userProfileImage });  
  } catch (error) {
    console.error('Error al cargar la imagen de perfil:', error);
    res.status(500).send('Error en el servidor');
  }
});


// renderiza PREMIUM
userRouter.get('/premium/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');
    const userDniImage = user.documents && user.documents.find((doc) => doc.name === 'Identificación');
    const userDomicilioImage = user.documents && user.documents.find((doc) => doc.name ==='comprobante_domicilio');
    const userCuentaImage =user.documents && user.documents.find((doc) => doc.name === 'estado_cuenta');

    res.render('users-premium', { user, userId, userProfileImage, userDniImage, userDomicilioImage, userCuentaImage,  layout: false, partials: { navbar: "" } });
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

  // Ruta para manejar la solicitud POST de edición de  PREMIUM
userRouter.post('/premium/:userId/edit', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { first_name, last_name, gender } = req.body; 
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');

    const updateData = { first_name, last_name, gender };
    const updatedUser = await userDao.updateUserById(userId, updateData);

    if (updatedUser) {
      req.session.user = updatedUser;
    } else {

      res.status(500).send('Error al actualizar los datos del usuario');
      return;
    }

    res.render('users-premium', { user: updatedUser, userProfileImage, message: 'Datos de usuario editados exitosamente', layout: false, partials: { navbar: "" } });  
  } catch (error) {
    console.error('Error al actualizar los datos del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

  // Ruta para manejar la solicitud POST de cambio de contraseña usuario PREMIUM
userRouter.post('/premium/:userId/change-password', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword } = req.body; 
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');
    const hashedPassword = await hashPassword(newPassword);

    const updateData = { password: hashedPassword };
    const updatedUser = await userDao.updateUserById(userId, updateData);

    if (updatedUser) {

      res.render('users-premium', { user: updatedUser, userProfileImage, message: 'Contraseña cambiada exitosamente', layout: false, partials: { navbar: "" } });  
    } else {

      res.status(500).send('Error al actualizar la contraseña del usuario');
    }
  } catch (error) {
    console.error('Error al actualizar la contraseña del usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

 
//actualizar foto de perfil usuario PREMIUM
  userRouter.post('/premium/:userId/documents/upload-profile', profileUploadMiddleware, async (req, res) => {
    try {
      const userId = req.params.userId;
      const profileImage = req.file;
  
      if (!profileImage) {
        
        return res.status(400).json({ error: 'Debes cargar una imagen de perfil' });
      }
  
      const existingProfileImage = await userDao.getUserDocumentByName(userId, 'Foto de perfil');
      if (existingProfileImage) {
        await userDao.removeUserDocumentById(userId, existingProfileImage._id);
      }
      const updateData = {
        $push: {
          documents: {
            name: 'Foto de perfil',
            reference: profileImage.filename
          }
        }
      };
      const updatedUser = await userDao.updateUserById(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      req.session.user = updatedUser;
      const userProfileImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Foto de perfil');
      const userDniImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Identificación');
      const userDomicilioImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'comprobante_domicilio');
      const userCuentaImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'estado_cuenta');
      
            res.render('users-premium', { user: updatedUser,userDniImage,userDomicilioImage,userCuentaImage, message: 'Imagen de perfil cargada exitosamente', userProfileImage, layout: false, partials: { navbar: "" } });  
    } catch (error) {
      console.error('Error al cargar la imagen de perfil:', error);
      res.status(500).send('Error en el servidor');
    }
  });

  //actualizar identificacion usuario PREMIUM
  userRouter.post('/premium/:userId/documents/upload-id', dniUploadMiddleware, async (req, res) => {
    try {
      const userId = req.params.userId;
      const dniDocument = req.file;
  
      if (!dniDocument) {
        
        return res.status(400).json({ error: 'Debes cargar identificación' });
      }
  
      const existingdniDocument = await userDao.getUserDocumentByName(userId, 'Identificación');
      if (existingdniDocument) {
        await userDao.removeUserDocumentById(userId, existingdniDocument._id);
      }
      const updateData = {
        $push: {
          documents: {
            name: 'Identificación',
            reference: dniDocument.filename
          }
        }
      };
      const updatedUser = await userDao.updateUserById(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      req.session.user = updatedUser;
      const userProfileImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Foto de perfil');
      const userDniImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Identificación');
      const userDomicilioImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'comprobante_domicilio');
      const userCuentaImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'estado_cuenta');
      
      res.render('users-premium', { user: updatedUser,userDniImage,userDomicilioImage,userCuentaImage, message: 'DNI cargado exitosamente', userProfileImage, layout: false, partials: { navbar: "" } });  
    } catch (error) {
      console.error('Error al cargar la imagen de perfil:', error);
      res.status(500).send('Error en el servidor');
    }
  });

 //actualizar comprobante de domicilio usuario PREMIUM

 userRouter.post('/premium/:userId/documents/upload-domicilio', comprobanteDomicilioMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const comprobanteDomicilioDocument = req.file;

    if (!comprobanteDomicilioDocument) {
      
      return res.status(400).json({ error: 'Debes cargar identificación' });
    }

    const existingdomicilioDocument = await userDao.getUserDocumentByName(userId, 'comprobante_domicilio');
    if (existingdomicilioDocument) {
      await userDao.removeUserDocumentById(userId, existingdomicilioDocument._id);
    }
    const updateData = {
      $push: {
        documents: {
          name: 'comprobante_domicilio',
          reference: comprobanteDomicilioDocument.filename
        }
      }
    };
    const updatedUser = await userDao.updateUserById(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    req.session.user = updatedUser;
    const userProfileImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Foto de perfil');
    const userDniImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Identificación');
    const userDomicilioImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'comprobante_domicilio');
    const userCuentaImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'estado_cuenta');
    
    res.render('users-premium', { user: updatedUser,userDniImage,userDomicilioImage,userCuentaImage, message: 'Comprobante de domicilio cargado exitosamente', userProfileImage, layout: false, partials: { navbar: "" } });  
  } catch (error) {
    console.error('Error al cargar la imagen de perfil:', error);
    res.status(500).send('Error en el servidor');
  }
});

//actualizar Estado de cuenta usuario PREMIUM

userRouter.post('/premium/:userId/documents/upload-estadoCuenta', estadoCuentaMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const estadoCuentaDocument = req.file; 
    
    if (!estadoCuentaDocument) {
      return res.status(400).json({ error: 'Debes cargar estado de cuenta' });
    }

    const existingEstadoCuentaDocument = await userDao.getUserDocumentByName(userId, 'estado_cuenta');
    if (existingEstadoCuentaDocument) {
      await userDao.removeUserDocumentById(userId, existingEstadoCuentaDocument._id);
    }
    const updateData = {
      $push: {
        documents: {
          name: 'estado_cuenta',
          reference: estadoCuentaDocument.filename 
        }
      }
    };
    const updatedUser = await userDao.updateUserById(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    req.session.user = updatedUser;
    const userProfileImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Foto de perfil');
    const userDniImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'Identificación');
    const userDomicilioImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'comprobante_domicilio');
    const userCuentaImage = updatedUser.documents && updatedUser.documents.find((doc) => doc.name === 'estado_cuenta');
    
    res.render('users-premium', { user: updatedUser, userDniImage, userDomicilioImage, userCuentaImage, message: 'Estado de cuenta cargado exitosamente', userProfileImage, layout: false, partials: { navbar: '' } });
  } catch (error) {
    console.error('Error al cargar el estado de cuenta:', error);
    res.status(500).send('Error en el servidor');
  }
});


export default userRouter;
