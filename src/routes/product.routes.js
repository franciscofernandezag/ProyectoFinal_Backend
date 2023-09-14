import { Router } from "express";
import { loggerProd } from "../utils/logger.js";
import productDao from "../dao/productDao.js"; 
import cartDao from "../dao/cartDao.js";
import {contarProductosEnCarrito } from "../utils/utilsCarts.js";




const productRouter = Router();

productRouter.get("/", async (req, res) => {
  try {
    const { limit = 12, page = 1, sort, query, message, owner } = req.query;
    const userName = req.session.user.first_name;
    const email = req.session.user.email;
    const rol = req.session.user.rol;
    const cartId = req.session.user.cartId;
    const userId = req.session.user._id;
    const cart = await cartDao.getCartByIdAdd(cartId);
    const user = req.session.user;
    const userProfileImage = user.documents && user.documents.find((doc) => doc.name === 'Foto de perfil');

    const options = {};
    options.limit = parseInt(limit);
    options.skip = (parseInt(page) - 1) * parseInt(limit);
    const queryOptions = query ? { title: { $regex: query, $options: "i" } } : {};

    if (owner) {
      queryOptions.owner = owner;
    }

    let productsQuery = productDao.getProducts(queryOptions, options, sort);
    const totalCount = await productDao.getTotalProductCount(queryOptions);
    const totalPages = Math.ceil(totalCount / options.limit);
    const products = await productsQuery;
    const totalProductosEnCarrito = contarProductosEnCarrito(cart.products);

    const response = {
      status: "success",
      payload: products,
      totalPages: totalPages,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
      page: parseInt(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `http://localhost:4000/products?limit=${limit}&page=${parseInt(page) - 1}` : null,
      nextLink: page < totalPages ? `http://localhost:4000/products?limit=${limit}&page=${parseInt(page) + 1}` : null,
    };

    loggerProd.info(`Productos obtenidos satisfactoriamente. Cantidad de productos: ${products.length}`);

    const storeList = await productDao.getDistinctOwners(); // Obtener la lista de tiendas

    res.render('products', { 
      navbar: 'navbar', 
      userProfileImage: userProfileImage,
      products: products, 
      response: response,
      userId: userId,   
      userName: userName,  
      cartId: cartId,
      email: email, 
      rol: rol, 
      success: "Bienvenido",
      message: message || "",
      storeList: storeList, 
      selectedOwner: owner, 
      totalProductosEnCarrito: totalProductosEnCarrito, 
    });
  } catch (error) {
    loggerProd.fatal("Error al recibir los productos:", error);
    res.status(500).send("Error al recibir los productos:");
  }
});


export default productRouter;
