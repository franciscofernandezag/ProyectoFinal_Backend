import { Router } from "express";
import { userModel } from "../dao/models/Users.js";
import { transporter } from "../utils/nodemailer.js";
import { comparePasswords, hashPassword } from "../utils/bcryptUtils.js";

const recoveryRouter = Router();

// Ruta para enviar correo electronico a usuario registrado
recoveryRouter.get("/", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await userModel.findOne({ email });

    if (user) {
      const timemail = new Date().toISOString();
      console.log("fecha y hora envio de correo    :" +timemail );
      const htmlBody = `<p>Hola ${user.first_name},</p>
                       <p>Para cambiar tu contraseña, haz clic en el siguiente enlace:</p>
                       <a href="http://localhost:4000/recovery/changepassword?email=${user.email}&timemail=${timemail}">Cambiar Contraseña</a>`;

      await transporter.sendMail({
        to: email,
        subject: "Cambio de contraseña",
        html: htmlBody,
      });

      res.render('mailsended', {
        layout: false,
        partials: {
          navbar: 'navbar', 
        },
        email: email,
    
      });
    } else {
      res.render('unregistred', {
        layout: false,
        partials: {
          navbar: 'navbar', 
        },
        email: email,
    
      });
    }
  } catch (error) {
    res.status(500).send("Error al enviar link de cambiar contraseña:");
  }
});


// Envio de correo de cambio de contraseña con vencimiento 1 hora 
recoveryRouter.get("/changepassword", async (req, res) => {
  try {
    const email = req.query.email;
    const timelink = new Date().getTime();
    console.log("hora acceso link " + new Date(timelink).toISOString());
    const timemail = new Date(req.query.timemail).getTime();
    console.log("hora envio correo " + new Date(timemail).toISOString());

    // Verifica si el enlace ha expirado (1 hora = 3600000 ms)
    if (timelink - timemail > 3600000) {
      // Si el enlace ha expirado, redirige a una vista para generar un nuevo correo
      res.render('linkexpired', {
        layout: false,
        partials: {
          navbar: 'navbar', 
        },
        email: email,
    
      });
    }
    // Renderiza la vista para cambiar la contraseña
    res.render('recovery', {
      layout: false,
      partials: {
        navbar: 'navbar', 
      },
      email: email,
  
    });

  } catch (error) {
    res.status(500).send("Error al recibir los productos:");
  }
});
// cambio de contraseña con corrroboracion de cmisma contraseña 
recoveryRouter.get("/changepassword/mailsended", async (req, res) => {
  try {
    
    const email = req.query.email;
    const user = await userModel.findOne({ email });
    console.log("email usuario " + email);
    const newPassword = req.query.newPassword;
    console.log("nueva contraseña " + newPassword);
    console.log("contraseña actual usuario " + user.password);

    const isPasswordMatch = await comparePasswords(newPassword, user.password);
    console.log(" verificacion de misma contraseña true or false:  " + isPasswordMatch);
    if (isPasswordMatch === true) {
      // Si la nueva contraseña es igual a la anterior, puedes mostrar un mensaje de error
      return res.render('recovery', { email: email, error: "La contraseña no puede ser igual a la anterior" });
    }
    // Hashear la nueva contraseña antes de guardarla en la base de datos
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Renderizar la vista de éxito
    res.render('changesuccesful', {
      layout: false,
      partials: {
        navbar: 'navbar', 
      },
      email: email,
  
    });
  } catch (error) {
    // Manejar el error en caso de que ocurra algún problema
    console.error(error);
    res.status(500).send("Error al cambiar la contraseña.");
  }
});

export default recoveryRouter;
