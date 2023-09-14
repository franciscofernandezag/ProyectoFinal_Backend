import "dotenv/config";
import chai from 'chai';
import assert from 'assert';
import mongoose from 'mongoose';
import productDao from '../../src/dao/productDao.js';
import productModel from "../../src/dao/models/Products.js";

const expect = chai.expect;

describe('ProductDao', () => {
  before(async () => {
    // Configuración de conexión a una base de datos de prueba
    await mongoose.connect(process.env.URL_MONGODB_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    // Desconexión de la base de datos de prueba
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpieza de la colección de productos antes de cada prueba
    await productModel.deleteMany({});
  });

  // test de agregar productos 
  describe('addProduct', () => {
    it(' Prueba 1 : Metodo addproduct para agregar productos', async () => {
      const newProductData = {
        title: 'New Product',
        price: 50,
        stock: 10,
        description: 'A new product for testing',
        code: 'NP123',
        id: 1,
        status: true,
        thumbnail: 'thumbnail.jpg',
        owner: 'admin',
      };

      const result = await productDao.addProduct(newProductData);
      const result1 = !!result._id
      assert.deepStrictEqual(result1, true)
      assert.ok(result._id)
      assert.strictEqual(result.title, newProductData.title);
    });
  });

  describe('getProducts', () => {
    it(' Prueba 2 : Metodo getProduct para agregar productos', async () => {

      await productDao.addProduct({
        title: 'Product 1',
        price: 10,
        stock: 50,
      });
      await productDao.addProduct({
        title: 'Product 2',
        price: 20,
        stock: 30,
      });

      const result = await productDao.getProducts();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result[0].title).to.equal('Product 1');
      expect(result[0].price).to.equal(10);
      expect(result[0].stock).to.equal(50);
      expect(result[1].title).to.equal('Product 2');
      expect(result[1].price).to.equal(20);
      expect(result[1].stock).to.equal(30);

    });
  });

  describe('getTotalProductCount', () => {
    it(' Prueba 3 : Metodo getTotalProductCount para contar productos agregados', async () => {
      await productDao.addProduct({
        title: 'Product 1',
        price: 10,
        stock: 50,
      });
      await productDao.addProduct({
        title: 'Product 2',
        price: 20,
        stock: 30,
      });
      const result = await productDao.getTotalProductCount();
      expect(result).to.equal(2);
    });
  });

  describe('getProductById', () => {
    it('Prueba 4 : Metodo getProductById para obtener productos por su ID', async () => {
      const newProductData = {
        title: 'Test Product',
        price: 100,
        stock: 50,
      };
      const addedProduct = await productDao.addProduct(newProductData);
      // Obtener el producto por su ID
      const result = await productDao.getProductById(addedProduct._id);
      // Comparar los campos relevantes
      expect(result.title).to.equal(addedProduct.title);
      expect(result.price).to.equal(addedProduct.price);
      expect(result.stock).to.equal(addedProduct.stock);
      expect(result.owner).to.equal(addedProduct.owner);
    });
  });

  describe('updateStock', () => {
    it('Prueba 5 : Metodo updateStock para actualizar el stock de un producto', async () => {
      const newProductData = {
        title: 'Product 1',
        price: 50,
        stock: 10,
      };
      const addedProduct = await productDao.addProduct(newProductData);
      const newStock = 20;
      const updatedProduct = await productDao.updateStock(addedProduct._id, newStock);
      expect(updatedProduct.stock).to.equal(newStock);
      expect(updatedProduct.title).to.equal(newProductData.title);
      expect(updatedProduct.price).to.equal(newProductData.price);
    });
  });

  describe('updatePrice', () => {
    it('Prueba 6 : Metodo updatePrice para actualizar el precio de un producto', async () => {
      const newProductData = {
        title: 'Product 2',
        price: 50,
        stock: 10,
      };
      const addedProduct = await productDao.addProduct(newProductData);
      const newPrice = 60;
      const updatedProduct = await productDao.updatePrice(addedProduct._id, newPrice);
      expect(updatedProduct.price).to.equal(newPrice);
      expect(updatedProduct.title).to.equal(newProductData.title);
      expect(updatedProduct.stock).to.equal(newProductData.stock);
    });
  });

  describe('deleteProduct', () => {
    it('Prueba 7 : Metodo deleteProduct para eliminar un producto por su ID', async () => {
      const newProductData = {
        title: 'Product to delete',
        price: 50,
        stock: 10,
      };
      const addedProduct = await productDao.addProduct(newProductData);
      // Realizar la operación de eliminación de producto
      const deletedProduct = await productDao.deleteProduct(addedProduct._id);
      // Verificar que el producto se haya eliminado correctamente
      expect(deletedProduct).to.not.be.null;
      // Intentar obtener el producto eliminado debe dar como resultado null
      const nonExistingProduct = await productDao.getProductById(addedProduct._id);
      expect(nonExistingProduct).to.be.null;
    });
  });

});
