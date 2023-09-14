import { Router } from "express";
import { loggerProd } from "../utils/logger.js";
import productDao from "../dao/productDao.js";
import { productUploadMiddleware} from "../middleware/multer.js";

const premiumRouter = Router();

premiumRouter.get("/", async (req, res) => {
  try {
    res.render('choose-action', { layout: false });
  } catch (error) {
    loggerProd.fatal("Error:", error);
    res.status(500).send("Error interno del servidor");
  }
});

premiumRouter.get("/admin", async (req, res) => {
  try {
    const { limit = 12, page = 1, sort, query, message } = req.query;
    const { first_name: userName, email, rol, cartId, _id: userId } = req.session.user;
    const options = { limit: parseInt(limit), skip: (parseInt(page) - 1) * parseInt(limit) };
    const queryOptions = query ? { title: { $regex: query, $options: "i" } } : {};
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');

    const totalCount = await productDao.getTotalProductCount({ ...queryOptions, owner: email });
    const totalPages = Math.ceil(totalCount / options.limit);
    let productsQuery = productDao.getProducts({ ...queryOptions, owner: email }, options);
    if (sort === "asc") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "desc") {
      productsQuery = productsQuery.sort({ price: -1 });
    }
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
      prevLink: page > 1 ? `http://localhost:4000/premium/admin?limit=${limit}&page=${parseInt(page) - 1}` : null,
      nextLink: page < totalPages ? `http://localhost:4000/premium/admin?limit=${limit}&page=${parseInt(page) + 1}` : null,
    };

    if (rol === "premium") {
      res.render("premium", {
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
        userId: userId,
        message: message || ""
      });
    } else {
      console.error(`Usuario '${email}' no autorizado accediendo a la ruta '/premium'.`);
      res.redirect("/");
    }
  } catch (error) {
    loggerProd.fatal("Error al recibir los productos:", error);
    res.status(500).send(`Error al recibir los productos: ${error.message}`);
  }
});
// Ruta para agregar producto con imagen en URL 
premiumRouter.post("/products/owner/addproduct", async (req, res) => {
  try {
    const { code, title, description, stock, id, status, price, thumbnail } =
      req.body;
    const productData = {
      code,
      title,
      description,
      stock,
      id,
      status: true,
      price,
      thumbnail,
      owner: req.session.user.email, // Establecer el owner como el owner logeado
    };
    await productDao.addProduct(productData);
    req.session.message = "Producto agregado exitosamente.";
    res.redirect(`/premium/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    loggerProd.fatal("Error al agregar un producto:", error);
    res.status(500).send("Error al agregar un producto");
  }
});

// Ruta para agregar producto con imagen cargada LOCALMENTE
premiumRouter.post("/products/owner/addproductLocal", productUploadMiddleware, async (req, res) => {
  try {
    const { code, title, description, stock, id, status, price } = req.body;
    const thumbnailPath = `/documents/products/${req.file.filename}`;
    console.log(thumbnailPath)
    const productData = {
      code,
      title,
      description,
      stock,
      id,
      status: true,
      price,
      thumbnail: thumbnailPath, 
      owner: req.session.user.email, 
    };

    await productDao.addProduct(productData);
    req.session.message = "Producto agregado exitosamente.";
    res.redirect(`/premium/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    loggerProd.fatal("Error al agregar un producto:", error);
    res.status(500).send("Error al agregar un producto");
  }
});


// Ruta para actualizar stock
premiumRouter.post("/products/:id/update-stock", async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount } = req.body;

    const product = await productDao.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }
    product.stock = parseInt(amount);

    await productDao.updateStock(productId, product.stock);

    req.session.message = "Se ha actualizado el stock del producto.";

    res.redirect(`/premium/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    loggerProd.fatal("Error al actualizar el stock:", error);
    res.status(500).send("Error al actualizar el stock");
  }
});

// Ruta para actualizar precio
premiumRouter.post("/products/:id/update-price", async (req, res) => {
  try {
    const productId = req.params.id;
    const { amount } = req.body;

    const product = await productDao.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    await productDao.updatePrice(productId, parseInt(amount));

    req.session.message = "Se ha actualizado el precio del producto.";
    loggerProd.info(
      `Se ha actualizado el precio del producto con ID ${productId}. Precio actualizado: ${amount}.`
    );

    res.redirect(`/premium/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    loggerProd.fatal("Error al actualizar precio:", error);
    res.status(500).send("Error al actualizar el precio");
  }
});

// Ruta para eliminar un producto del market
premiumRouter.post("/products/:id/delete-product", async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await productDao.getProductById(productId);
    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    // Verificar si el usuario conectado es el propietario del producto
    const { email } = req.session.user;
    if (product.owner !== email) {
      return res.status(403).render('forbidden', { title: 'Acceso denegado' });

    }
    // Eliminar el producto del modelo
    await productDao.deleteProduct(productId);

    req.session.message = "Has eliminado un producto.";
    loggerProd.info(`Producto con ID ${productId} eliminado por el propietario con ID ${productId}`);
    res.redirect(`/premium/admin?message=${encodeURIComponent(req.session.message)}`);
  } catch (error) {
    loggerProd.fatal("Error al eliminar un producto:", error);
    res.status(500).send("Error al eliminar un producto");
  }
});

export default premiumRouter;
