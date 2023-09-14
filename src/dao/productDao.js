import productModel from "./models/Products.js";

const productDao = {
  async getProducts(queryOptions, options, sortOption) {
    try {
      const productsQuery = productModel.find(queryOptions, null, options);

      if (sortOption === "asc") {
        productsQuery.sort({ price: 1 }); 
      } else if (sortOption === "desc") {
        productsQuery.sort({ price: -1 }); 
      }

      return await productsQuery.exec();
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  },
  
  async getTotalProductCount(queryOptions) {
    try {
      return await productModel.countDocuments(queryOptions);
    } catch (error) {
      throw new Error(`Error al obtener el conteo total de productos: ${error.message}`);
    }
  },
  
  async getProductById(productId) {
    try {
      return await productModel.findById(productId);
    } catch (error) {
      throw new Error(`Error al obtener producto por ID: ${error.message}`);
    }
  },
  
  async updateStock(productId, newStock) {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      product.stock = newStock;
      return await product.save();
    } catch (error) {
      throw new Error(`Error al actualizar el stock: ${error.message}`);
    }
  },
  
  async updatePrice(productId, newPrice) {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      product.price = newPrice;
      return await product.save();
    } catch (error) {
      throw new Error(`Error al actualizar el precio: ${error.message}`);
    }
  },
  
  async deleteProduct(productId) {
    try {
      return await productModel.findByIdAndDelete(productId);
    } catch (error) {
      throw new Error(`Error al eliminar el producto: ${error.message}`);
    }
  },
  
  async addProduct(productData) {
    try {
      const newProduct = new productModel(productData);
      return await newProduct.save();
    } catch (error) {
      throw new Error(`Error al agregar el producto: ${error.message}`);
    }
  },

  async getDistinctOwners() {
    try {
      const distinctOwners = await productModel.distinct("owner");

      return distinctOwners;
    } catch (error) {
      throw new Error(`Error al obtener propietarios únicos: ${error.message}`);
    }
  },

};

export default productDao;
