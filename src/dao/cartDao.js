
import CartModel from "./models/Carts.js";

const cartDao = {
    async getCartByIdAdd(cartId) {
        try {
            return await CartModel.findById(cartId).populate("products.id");
        } catch (error) {
            throw new Error(`Error al obtener el carrito por ID: ${error.message}`);
        }
    },

    async getCartById(cartId) {
        try {
            return await CartModel.findById(cartId);
        } catch (error) {
            throw new Error(`Error al obtener el carrito por ID: ${error.message}`);
        }
    },

    async updateCart(cart) {
        try {
            return await cart.save();
        } catch (error) {
            throw new Error(`Error al actualizar el carrito: ${error.message}`);
        }
    },

    async clearCartProducts(cartId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            cart.products = []; 
            return await this.updateCart(cart);
        } catch (error) {
            throw new Error(`Error al eliminar productos del carrito: ${error.message}`);
        }
    },

    async updateCart(cart) {
        try {
            return await cart.save();
        } catch (error) {
            throw new Error(`Error al actualizar el carrito: ${error.message}`);
        }
    },

    async getCartByUserId(userId) {
        try {
            return await CartModel.findOne({ user: userId }).populate("products.id");
        } catch (error) {
            throw new Error(`Error al obtener el carrito por ID de usuario: ${error.message}`);
        }
    },

    async getTotalProductCount(queryOptions) {
        try {
          return await productModel.countDocuments(queryOptions);
        } catch (error) {
          throw new Error(`Error al obtener el conteo total de productos: ${error.message}`);
        }
      },

};

export default cartDao;
