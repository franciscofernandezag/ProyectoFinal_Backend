import { Router } from "express";
import { sumarProductosIguales, calcularTotal, contarProductosEnCarrito } from "../utils/utilsCarts.js";
import { loggerDev, loggerProd } from "../utils/logger.js";
import cartDao from "../dao/cartDao.js";
import productDao from "../dao/productDao.js"; 
import purchaseDao from "../dao/purchaseDao.js";

const cartRouter = Router();

// Agregar producto a un carrito
cartRouter.post("/:cartId/products/:productId", async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const cart = await cartDao.getCartByIdAdd(cartId);
    const product = await productDao.getProductById(productId);
    const email = req.session.user.email;
  
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (product.owner !== email) {   // Verificar si el propietario del producto es igual al email del usuario
      const existingProduct = cart.products.find((item) =>
        item.id.equals(productId)
      );

      if (existingProduct) {
        // El producto ya existe en el carrito, actualiza la cantidad
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ id: productId, quantity: 1 }); // El producto no existe en el carrito, agrega un nuevo objeto al arreglo de productos
      }
      await cart.save();
      req.session.message = "Se ha agregado un producto al carrito.";
      loggerProd.info(`Producto con ID ${productId} agregado o actualizado en el carrito con ID ${cartId}`);

      res.redirect(`/products?message=${encodeURIComponent(req.session.message)}`);
    } else {
      req.session.message = "No puede comprar productos de su propiedad";
      loggerProd.info(`Usuario: ${email} intenta comprar producto de su propiedad`);
      return res.redirect(`/products?message=${encodeURIComponent(req.session.message)}`);
    }
  } catch (error) {
    loggerProd.fatal("Error al agregar producto al carrito:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// Ver productos de un carrito por ID de carrito
cartRouter.get("/:cartId", async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.session.user._id;
    const cart = await cartDao.getCartByIdAdd(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const summedProducts = sumarProductosIguales(cart.products); 
    const totalProductosEnCarrito = contarProductosEnCarrito(cart.products);

    const message = req.session.message;
    req.session.message = null; 
    loggerProd.info(
      `Carrito con ID ${cartId} obtenido satisfactoriamente. Cantidad de productos en el carrito: ${summedProducts.length}`
    );

    res.render("carts", {
      cart: cart,
      cartId: cartId,
      userId : userId,
      products: summedProducts,
      total: calcularTotal(summedProducts),
      totalProductosEnCarrito: totalProductosEnCarrito, 
      message: message,
      success: "Bienvenido al Carrito de compras" 
    });
  } catch (error) {
    loggerProd.fatal("Error al obtener los productos del carrito:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los productos del carrito" });
  }
});


// Eliminar todos los productos del carrito
cartRouter.get("/:cartId/products", async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await cartDao.clearCartProducts(cartId); 
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    loggerProd.info(`Todos los productos eliminados del carrito con ID ${cartId}`);
    res.redirect(`/carts/${cartId}`);
  } catch (error) {
    loggerProd.fatal("Error al eliminar productos del carrito:", error);
    res.status(500).json({ error: "Error al eliminar productos del carrito" });
  }
});

// Eliminar  un  productos del producto a un carrito en vase a su ID
cartRouter.post("/:cartId/products/:productId/delete", async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const cart = await cartDao.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const productIndex = cart.products.findIndex(
      (item) => item.id.toString() === productId
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Producto no encontrado en el carrito" });
    }
    cart.products.splice(productIndex, 1);
    await cartDao.updateCart(cart);
    req.session.message = "Has eliminado un producto.";
    loggerProd.info(
      `Producto con ID ${productId} eliminado del carrito con ID ${cartId}`
    );
    res.redirect(`/carts/${cartId}`);
  } catch (error) {
    loggerProd.fatal("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});


// Finalizar compra
cartRouter.post("/:cartId/purchase", async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.session.user._id;
    const userEmail = req.session.user.email;
    
    // Obtener el carrito y productos asociados
    const cart = await cartDao.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    
    const productsToPurchase = [];
    let total = 0;
    let successful = true;

    for (const product of cart.products) {
      const { id, quantity } = product;
      
      // Obtener el producto de la base de datos
      const productFromDB = await productDao.getProductById(id);
      if (!productFromDB) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      
      if (productFromDB.stock >= quantity) {
        // Restar la cantidad del producto del stock
        productFromDB.stock -= quantity;
        const subtotal = productFromDB.price * quantity;
        total += subtotal;
        productsToPurchase.push({
          product: productFromDB,
          Id: productFromDB._id,
          quantity: quantity,
          price: productFromDB.price,
          subtotal: subtotal,
        });
        
        // Actualizar el stock del producto en la base de datos
        await productDao.updateStock(id, productFromDB.stock);
      } else {
        successful = false;
        productsToPurchase.push({
          product: productFromDB,
          Id: productFromDB._id,
          quantity: quantity,
          price: productFromDB.price,
          subtotal: productFromDB.price * quantity,
        });
      }
    }
    
    // Crear una nueva compra
    const purchase = await purchaseDao.createPurchase({
      userId: userId,
      userEmail: userEmail,
      products: productsToPurchase,
      successful: successful,
      total: successful ? total : 0,
      purchaseDate: Date.now(),
    });
    
    if (!purchase) {
      return res.status(500).json({ error: "Error al finalizar la compra" });
    }

    // Si la compra fue exitosa, vaciar el carrito
    if (successful) {
      await cartDao.clearCartProducts(cartId);
      req.session.products = productsToPurchase;
      loggerProd.info(
        `Compra finalizada con éxito para el carrito con ID ${cartId}.`
      );
      return res.render("purchase-successful", {
        products: productsToPurchase,
        total: total,
        cartId: cartId,
      });
    } else {
      req.session.products = productsToPurchase;
      loggerProd.info(
        `Compra no se pudo realizar para el carrito con ID ${cartId}.`
      );
      return res.render("purchase-failed", {
        products: productsToPurchase,
        total: total,
        cartId: cartId,
      });
    }
  } catch (error) {
    loggerProd.fatal("Error al finalizar la compra:", error);
    res.status(500).json({ error: "Error al finalizar la compra" });
  }
});

export default cartRouter;