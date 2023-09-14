import chai from 'chai';
import mongoose from 'mongoose';
import CartModel from '../../src/dao/models/Carts.js';
import "dotenv/config";
import ProductModel from '../../src/dao/models/Products.js'; 
import CartDao from '../../src/dao/cartDao.js';
import productDao from '../../src/dao/productDao.js';

const expect = chai.expect;

describe('CartDao', () => {
  before(async () => {
    // Configuración de conexión a una base de datos de prueba
    await mongoose.connect(process.env.URL_MONGODB_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await CartModel.deleteMany({});
  });

  describe('getCartById', () => {
    it('Prueba 1 : Metodo getCartById , busca el id de carrito creado', async () => {
      const cart = await CartModel.create({ products: [] });
      const product = await ProductModel.create({
        title: 'Product 1',
        price: 10,
        stock: 50,
      });
      const updatedCart = await CartDao.getCartById(cart._id, product._id);
    });
  });

  describe('updateCart', () => {
    it('Prueba 2 : Metodo updateCart de actualizar productos en carrito ', async () => {
      const product1 = await productDao.addProduct({
        title: 'Product 1',
        price: 10,
        stock: 50,
        description: 'Description for Product 1',
        code: 'P1',
        id: 1,
        status: true,
        thumbnail: 'thumbnail1.jpg',
        owner: 'admin',
      });

      const product2 = await productDao.addProduct({
        title: 'Product 2',
        price: 20,
        stock: 30,
        description: 'Description for Product 2',
        code: 'P2',
        id: 2,
        status: true,
        thumbnail: 'thumbnail2.jpg',
        owner: 'admin',
      });

      const cart = await CartModel.create({
        products: [
          { id: product1._id, quantity: 2 },
          { id: product2._id, quantity: 3 },
        ],
      });
      cart.products[0].quantity = 5;
      cart.products[1].price = 25;
      const updatedCart = await CartDao.updateCart(cart);
      expect(updatedCart).to.have.property('_id');
      expect(updatedCart.products).to.be.an('array');
      expect(updatedCart.products).to.have.lengthOf(2);
      expect(updatedCart.products[0].id.toString()).to.equal(product1._id.toString());
      expect(updatedCart.products[0].quantity).to.equal(5);
      expect(updatedCart.products[1].id.toString()).to.equal(product2._id.toString());
      expect(updatedCart.products[1].price).to.equal(25);
    });


    describe('clearCartProducts', () => {
        it('Prueba 3 : Metodo clearCartProducts para eliminar todos los productos del carrito ', async () => {
          const product = await productDao.addProduct({
            title: 'Product 1',
            price: 10,
            stock: 50,
            description: 'Description for Product 1',
            code: 'P1',
            id: 1,
            status: true,
            thumbnail: 'thumbnail1.jpg',
            owner: 'admin',
          });
              const cart = await CartModel.create({
            products: [{ id: product._id, quantity: 3 }],
          });
              const clearedCart = await CartDao.clearCartProducts(cart._id);
              expect(clearedCart).to.have.property('_id');
          expect(clearedCart.products).to.be.an('array');
          expect(clearedCart.products).to.have.lengthOf(0);
        }); 
      });

});

});