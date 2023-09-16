import { Router } from "express";
import { transporter } from "../utils/nodemailer.js";
import { loggerDev, loggerProd } from "../utils/logger.js";
import { __dirname, __filename } from "../path.js";
import path from "path";
import fs from "fs";

const messagesRouter = Router();

messagesRouter.get("/succesful", async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    const products = req.session.products;

    let htmlBody = `<h1>Felicitaciones, ha adquirido los siguientes productos</h1>`;
    htmlBody += `<table>
                  <tr>
                    <th>Producto</th>
                    <th>Portada</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>`;
    let total = 0;

    const attachments = []; // Crear una matriz para almacenar los archivos adjuntos

    for (const product of products) {
      htmlBody += `<tr>
                     <td>${product.product.title}</td>
                     <td><img src="${product.product.thumbnail}" alt="Imagen del producto" width="100"></td>
                     <td>${product.quantity}</td>
                     <td>${product.price}</td>
                     <td>${product.subtotal}</td>
                   </tr>`;
      total += product.subtotal;

      if (!/^https?:\/\//.test(product.product.thumbnail)) {
        const thumbnailPath = path.join(__dirname, "public", product.product.thumbnail); 
         const filename = `${product.product.title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`; // Nombre del archivo basado en el título del producto

        try {
          const fileData = fs.readFileSync(thumbnailPath);

          attachments.push({
            filename: filename,
            content: fileData,
            contentType: 'image/jpeg', 
          });
        } catch (error) {
          console.error("Error al leer el archivo local:", error);
        }
      }
    }

    htmlBody += `<tr>
                   <td colspan="4">Total</td>
                   <td>${total}</td>
                 </tr>`;
    htmlBody += `</table>`;

    await transporter.sendMail({
      to: userEmail,
      subject: "Compra procesada exitosamente",
      html: htmlBody,
      attachments: attachments,
    });

    loggerDev.info(
      `Se envió un correo a ${userEmail} con la compra exitosa procesada.`
    );
    return res.render("messages-succesful");
  } catch (error) {
    loggerProd.error("Error al procesar la compra exitosa:", error);
    res.status(500).json({ message: error });
  }
});


messagesRouter.get("/failed", async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    const products = req.session.products;

    let htmlBody = `<h1>No se pudo procesar su orden por falta de stock</h1>`;
    htmlBody += `<table>
                  <tr>
                    <th>Producto</th>
                    <th>Portada</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>`;
    let total = 0;

    const attachments = []; // Crear una matriz para almacenar los archivos adjuntos

    for (const product of products) {
      htmlBody += `<tr>
                     <td>${product.product.title}</td>
                     <td><img src="${product.product.thumbnail}" alt="Imagen del producto" width="100"></td>
                     <td>${product.quantity}</td>
                     <td>${product.price}</td>
                     <td>${product.subtotal}</td>
                   </tr>`;
      total += product.subtotal;

      if (!/^https?:\/\//.test(product.product.thumbnail)) {
        const thumbnailPath = path.join(__dirname, "public", product.product.thumbnail); 
        const filename = `${product.product.title.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`; 

        try {
          const fileData = fs.readFileSync(thumbnailPath);

          attachments.push({
            filename: filename,
            content: fileData,
            contentType: 'image/jpeg', 
          });
        } catch (error) {
          console.error("Error al leer el archivo local:", error);
        }
      }
    }

    htmlBody += `<tr>
                   <td colspan="4">Total</td>
                   <td>${total}</td>
                 </tr>`;
    htmlBody += `</table>`;

    await transporter.sendMail({
      to: userEmail,
      subject: "Tiene una compra pendiente !",
      html: htmlBody,
      attachments: attachments, 
    });
    loggerDev.info(
      `Se envió un correo a ${userEmail} para la compra pendiente.`
    );

    return res.render("messages-failed");
  } catch (error) {
    loggerProd.error("Error al procesar la compra pendiente:", error);
    res.status(500).json({ message: error });
  }
});


export default messagesRouter;
