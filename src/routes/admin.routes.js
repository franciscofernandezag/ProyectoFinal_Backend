import { Router } from "express";
import { __dirname, __filename } from "../../src/path.js";
import productDao from "../dao/productDao.js";
import userDao from "../dao/userDao.js";
import { transporter } from "../utils/nodemailer.js";
import path from "path";
import fs from "fs";

const adminRouter = Router();

adminRouter.get("/", async (req, res) => {
  try {
    const {limit = 12,page = 1,sort,query, owner, message,
    } = req.query;

    const userName = req.session.user.first_name;
    const email = req.session.user.email;
    const rol = req.session.user.rol;
    const cartId = req.session.user.cartId;
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');

    const options = {};
    options.limit = parseInt(limit);
    options.skip = (parseInt(page) - 1) * parseInt(limit);

    const queryOptions = {};

    if (query) {
      queryOptions.title = { $regex: query, $options: "i" };
    }

    // Agregar la opción de filtrar por "owner" si se proporciona
    if (owner) {
      queryOptions.owner = owner;
    }

    let productsQuery = productDao.getProducts(queryOptions, options, sort);
    const totalCount = await productDao.getTotalProductCount(queryOptions);
    const totalPages = Math.ceil(totalCount / options.limit);
    const storeList = await productDao.getDistinctOwners();
    const products = await productsQuery;

    const response = {
      status: "success",
      payload: products,
      totalPages: totalPages,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
      page: parseInt(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink:
        page > 1
          ? `http://localhost:4000/admin?limit=${limit}&page=${
              parseInt(page) - 1
            }`
          : null,
      nextLink:
        page < totalPages
          ? `http://localhost:4000/admin?limit=${limit}&page=${
              parseInt(page) + 1
            }`
          : null,
    };
    res.render("admin", {
      layout: false,
      partials: {
        navbar: "navbar",
      },
      userProfileImage: userProfileImage,
      products: products,
      response: response,
      userName: userName,
      email: email,
      rol: rol,
      cartId: cartId,
      storeList: storeList,
      message: message || "",
      selectedOwner: owner,
    });
  } catch (error) {
    console.log("Error al recibir los productos:", error);
    res.status(500).send("Error al recibir los productos:");
  }
});

// Ruta para actualizar stock
adminRouter.post("/products/:id/update-stock", async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount } = req.body;
    const product = await productDao.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    product.stock = parseInt(amount);
    await productDao.updateStock(productId, parseInt(amount));
    req.session.message = "Se ha actualizado el stock del producto.";
    res.redirect(`/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    console.log("Error al actualizar el stock:", error);
    res.status(500).send("Error al actualizar el stock");
  }
});

// Ruta para actualizar precio
adminRouter.post("/products/:id/update-price", async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount } = req.body;
    const product = await productDao.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    product.price = parseInt(amount);
    await productDao.updatePrice(productId, parseInt(amount));
    req.session.message = "Se ha actualizado el precio del producto.";
    res.redirect(`/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    console.log("Error al actualizar el precio:", error);
    res.status(500).send("Error al actualizar el precio");
  }
});

// Ruta para eliminar un producto del market

adminRouter.post("/products/:id/delete-product", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await productDao.getProductById(productId);

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    const ownerEmail = product.owner;

    // Verifica si product.thumbnail es una URL o una ruta local
    const isThumbnailUrl = /^https:\/\//.test(product.thumbnail);
    console.log(isThumbnailUrl);
    console.log(product.thumbnail);
    let attachments = [];

    if (!isThumbnailUrl) {
      // Si product.thumbnail no es una URL, es una ruta local
      const thumbnailPath = path.join(__dirname, "public", product.thumbnail);

      try {
        const fileData = fs.readFileSync(thumbnailPath);

        // Agrega el archivo como un adjunto
        attachments.push({
          filename: "portada.jpg",
          content: fileData,
          cid: "imagen",
          contentType: "image/jpeg",
        });
      } catch (error) {
        console.error("Error al leer el archivo local:", error);
      }
    }

    const htmlBody = `
    <p>Estimado usuario,</p>
    <p>El administrador ha eliminado el siguiente producto de la tienda:</p>
    <table>
      <tr>
        <th>Nombre del producto</th>
        <td>${product.title}</td>
      </tr>
      <tr>
        <th>Precio</th>
        <td>${product.price}</td>
      </tr>
      <tr>
        <th>Stock</th>
        <td>${product.stock}</td>
      </tr>
      <tr>
        <th>Descripción del producto</th>
        <td>${product.description}</td>
      </tr>
    </table>
    <p>Imagen del producto:</p>
    <img src="${product.thumbnail}" alt="Imagen del producto" style="max-width: 100%; height: auto;">
    <p>Gracias por usar nuestra tienda en línea.</p>
  `;

    // Elimina el producto de la base de datos
    await productDao.deleteProduct(productId);
    req.session.message =
      "Has eliminado un producto. Se envía correo al propietario del producto informando la eliminación";

    // Envía el correo electrónico al propietario del producto con los archivos adjuntos
    await transporter.sendMail({
      to: ownerEmail, // Envía el correo al correo electrónico del propietario
      subject:
        "Un producto de la tienda Ebookstotal ha sido eliminado por el administrador",
      html: htmlBody,
      attachments: attachments,
    });

    res.redirect(`/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    console.error("Error al eliminar un producto:", error);
    res.status(500).send("Error al eliminar un producto");
  }
});

// renderiza perfil de Administraodr
adminRouter.get("/perfil", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.session.user;
    const userProfileImage =
      user.documents &&
      user.documents.find((doc) => doc.name === "Foto de perfil");
    const userDniImage =
      user.documents &&
      user.documents.find((doc) => doc.name === "Identificación");
    const userDomicilioImage =
      user.documents &&
      user.documents.find((doc) => doc.name === "comprobante_domicilio");
    const userCuentaImage =
      user.documents &&
      user.documents.find((doc) => doc.name === "estado_cuenta");

    res.render("users-premium", {
      user,
      userId,
      userProfileImage,
      userDniImage,
      userDomicilioImage,
      userCuentaImage,
      layout: false,
      partials: { navbar: "" },
    });
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).send("Error en el servidor");
  }
});

adminRouter.get("/adminUser", async (req, res) => {
  try {
    const { limit = 12, page = 1, sort, query, message } = req.query;
    const userName = req.session.user.first_name;
    const email = req.session.user.email;
    const rol = req.session.user.rol;
    const options = {};
    options.limit = parseInt(limit);
    options.skip = (parseInt(page) - 1) * parseInt(limit);

    const queryOptions = query
      ? { title: { $regex: query, $options: "i" } }
      : {};

    const totalCount = await userDao.getTotalUserCount(queryOptions);
    const totalPages = Math.ceil(totalCount / options.limit);

    const userList = await userDao.getUserList(query, options);

    // Crea un array de objetos de datos de usuario
    const userData = userList.map((user) => {
      const userProfileImage = user.documents.find(
        (doc) => doc.name === "Foto de perfil"
      );
      return {
        username: user.first_name,
        userId: user._id,
        email: user.email,
        rol: user.rol,
        last_connection: user.last_connection,
        userProfileImage: userProfileImage
          ? `/documents/profiles/${userProfileImage.reference}`
          : null,
      };
    });

    const response = {
      status: "success",
      payload: userList,
      totalPages: totalPages,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
      page: parseInt(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink:
        page > 1
          ? `http://localhost:4000/admin?limit=${limit}&page=${
              parseInt(page) - 1
            }`
          : null,
      nextLink:
        page < totalPages
          ? `http://localhost:4000/admin?limit=${limit}&page=${
              parseInt(page) + 1
            }`
          : null,
    };

    res.render("adminUser", {
      layout: false,
      partials: {
        navbar: "navbar",
      },
      userList: userData,
      userName: userName,
      response: response,
      email: email,
      rol: rol,
      message: message || "",
    });
  } catch (error) {
    console.log("Error al recibir la lista de usuarios:", error);
    res.status(500).send("Error al recibir la lista de usuarios:");
  }
});


// Ruta para eliminar un usuario
adminRouter.post("/adminUsers/:userId/delete-user", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userDao.getUserById(userId);
    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }
    await userDao.deleteUser(userId);
    req.session.message = "Has eliminado un usuario.";
    res.redirect(
      `/admin/adminUser?message=${encodeURIComponent(req.session.message)}`
    );
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    res.status(500).send("Error al eliminar un usuario");
  }
});

// Ruta para modificar ROL de usuario
adminRouter.post("/adminUsers/:userId/update-rol", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { rol } = req.body;

    await userDao.findByIdAndUpdate(userId, { rol });

    req.session.message = "Se ha actualizado el rol del usuario.";
    res.redirect(
      `/admin/adminUser?message=${encodeURIComponent(req.session.message)}`
    );
  } catch (error) {
    console.error("Error al actualizar el rol del usuario:", error);
    res.status(500).send("Error al actualizar el rol del usuario");
  }
});

// Ruta para eliminar usuarios inactivos
adminRouter.post("/adminUsers/delete-inactive-users", async (req, res) => {
  try {
    const inactivityTime = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // Calcula la fecha de hace 20 días
    // const inactivityTime = new Date(Date.now() - 20 * 60 * 1000); // Calcula la fecha de hace 20 minutos
    // const inactivityTime = new Date(Date.now() - 5 * 60 * 1000); // Calcula la fecha de hace 5 minutos

    const result = await userDao.deleteInactiveUsers(inactivityTime);

    if (result.deletedCount > 0) {
      req.session.message = `${result.deletedCount} usuarios inactivos eliminados`;
    } else {
      req.session.message =
        "No se encontraron usuarios inactivos para eliminar";
    }

    res.redirect(
      `/admin/adminUser?message=${encodeURIComponent(req.session.message)}`
    );
  } catch (error) {
    console.error("Error al eliminar usuarios inactivos:", error);
    res.status(500).json({ error: "Error al eliminar usuarios inactivos" });
  }
});

export default adminRouter;
