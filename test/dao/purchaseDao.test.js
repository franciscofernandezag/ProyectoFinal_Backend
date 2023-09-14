import "dotenv/config";
import chai from 'chai';
import mongoose from 'mongoose';
import purchaseDao from '../../src/dao/purchaseDao.js';
import purchaseModel from "../../src/dao/models/Purchase.js";

const expect = chai.expect;

describe('PurchaseDao', () => {
  before(async () => {
    await mongoose.connect(process.env.URL_MONGODB_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  after(async () => {
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await purchaseModel.deleteMany({});
  });

  describe('createPurchase', () => {
    it('Prueba 1 : Metodo createPurchase para crear modelo de purchase', async () => {
      const purchaseData = {

        userId: '60e7f979af0d411a34f8f944', 
        userEmail: 'example@example.com',
        products: [
          {
            Id: '60e7f979af0d411a34f8f955', 
            quantity: 3,
            price: 15,
            subtotal: 45,
          },
          
        ],
        successful: true,
        total: 45,
        ticket: 123456,

      };
      const createdPurchase = await purchaseDao.createPurchase(purchaseData);
      expect(createdPurchase).to.have.property('_id');
      expect(createdPurchase.userEmail).to.equal(purchaseData.userEmail);
    });
    it('Prueba 1.1: Metodo createPurchase con datos invalidos ( falta mail).Error al crear purchase por datos invalidos', async () => {
      try {
        const invalidPurchaseData = {
            // No se proporciona el campo userEmail, que es requerido
            products: [
              {
                Id: '60e7f979af0d411a34f8f955',
                quantity: 3,
                price: 15,
                subtotal: 45,
              },
            ],
            successful: true,
            total: 45,
            ticket: 123456,
          };

        await purchaseDao.createPurchase(invalidPurchaseData);
        // Si el código llega a este punto, la prueba debe fallar
        assert.fail('Se esperaba un error pero no se arrojó ninguno.');
      } catch (error) {
        expect(error.message).to.include('Error al crear la compra');
      }
    });
  });

  describe('getPurchaseById', () => {
    it('Prueba 2 : Metodo getPurchaseById.Obtener una compra por su ID', async () => {
      const purchaseData = {
        userId: '60e7f979af0d411a34f8f956',
        userEmail: 'user@example.com',
        products: [
          {
            Id: '60e7f979af0d411a34f8f955',
            quantity: 3,
            price: 15,
            subtotal: 45,
          },
        ],
        successful: true,
        total: 45,
        ticket: 123456,
      };
      const newPurchase = await purchaseDao.createPurchase(purchaseData);
      // Obtener la compra por su ID
      const foundPurchase = await purchaseDao.getPurchaseById(newPurchase._id);
      // Verificar que la compra encontrada tenga los mismos datos que la creada
      expect(foundPurchase).to.have.property('_id');
      expect(foundPurchase.userEmail).to.equal(purchaseData.userEmail);
      //  verificar que los IDs sean iguales si estás seguro de que son correctos
       expect(foundPurchase._id.toString()).to.equal(newPurchase._id.toString());
    });

  });

  describe('updatePurchase', () => {
    it('Prueba 3 : Metodo updatePurchase. Actualizar una compra existente', async () => {
      const purchaseData = {
        userId: '60e7f979af0d411a34f8f956',
        userEmail: 'user@example.com',
        products: [
          {
            Id: '60e7f979af0d411a34f8f955',
            quantity: 3,
            price: 15,
            subtotal: 45,
          },
        ],
        successful: true,
        total: 45,
        ticket: 123456,
      };
      const newPurchase = await purchaseDao.createPurchase(purchaseData);
      // Modificar la compra
      newPurchase.total = 60;
      const updatedPurchase = await purchaseDao.updatePurchase(newPurchase);
      expect(updatedPurchase).to.have.property('_id');
      expect(updatedPurchase.total).to.equal(60);
    });
  });

  describe('deletePurchase', () => {
    it('Prueba 4 : Metodo deletePurchase. Eliminar una compra existente', async () => {
      
      const purchaseData = {
        userId: '60e7f979af0d411a34f8f956',
        userEmail: 'user@example.com',
        products: [
          {
            Id: '60e7f979af0d411a34f8f955',
            quantity: 3,
            price: 15,
            subtotal: 45,
          },
        ],
        successful: true,
        total: 45,
        ticket: 123456,
      };
      const newPurchase = await purchaseDao.createPurchase(purchaseData);
      // Eliminar la compra utilizando la función del DAO
      const deletedPurchase = await purchaseDao.deletePurchase(newPurchase._id);

      expect(await purchaseModel.findById(newPurchase._id)).to.be.null;
    });
  });


});
