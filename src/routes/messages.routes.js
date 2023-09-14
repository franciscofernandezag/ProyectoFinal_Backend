import { Router } from "express";
import { transporter } from "../utils/nodemailer.js";
import { loggerDev, loggerProd } from "../utils/logger.js";

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

    for (const product of products) {
      htmlBody += `<tr>
                     <td>${product.product.title}</td>
                     <td><img src="${product.product.thumbnail}" alt="Imagen del producto" width="100"></td>
                     <td>${product.quantity}</td>
                     <td>${product.price}</td>
                     <td>${product.subtotal}</td>
                   </tr>`;
      total += product.subtotal;
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

    for (const product of products) {
      htmlBody += `<tr>
                     <td>${product.product.title}</td>
                     <td><img src="${product.product.thumbnail}" width="100"></td>
                     <td>${product.quantity}</td>
                     <td>${product.price}</td>
                     <td>${product.subtotal}</td>
                   </tr>`;
      total += product.subtotal;
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
