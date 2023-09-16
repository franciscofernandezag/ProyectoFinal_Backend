import chai from 'chai';
import "dotenv/config";
import supertest from 'supertest';
import mongoose from 'mongoose';


const expect = chai.expect;
const requester = supertest('http://localhost:4000');

describe('Test routes Products', () => {
  before(async () => {
    await mongoose.connect(process.env.URL_MONGODB_ATLAS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  it('[POST] /login extitoso y redireccion a ruta  /products', async () => {
    const mockuserlogin = {
      email: 'testroutes@testroutes.com',
      password: '123456',
    };

    const loginResponse = await requester.post('/login').send(mockuserlogin);
    expect(loginResponse.statusCode).to.be.eql(302);

    const sessionCookie = loginResponse.headers['set-cookie'];
    const productsResponse = await requester.get('/products').set('Cookie', sessionCookie);
  
    expect(productsResponse.statusCode).to.be.eql(200); 
    expect(productsResponse.text).to.include('Bienvenido'); // Buscar el mensaje en la respuesta
    

  });

  it('[POST] /login extitoso y redireccion a ruta  /carts', async () => {
    const mockuserlogin = {
      email: 'testroutes@testroutes.com',
      password: '123456',
    };
   
    const loginResponse = await requester.post('/login').send(mockuserlogin);
    expect(loginResponse.statusCode).to.be.eql(302);

    const sessionCookie = loginResponse.headers['set-cookie'];
    const cartsResponse = await requester.get('/carts/64ef4f0f1ca5cd36834bbd71').set('Cookie', sessionCookie);
  
    expect(cartsResponse.statusCode).to.be.eql(200); 

    expect(cartsResponse.text).to.include('Bienvenido al Carrito de compras');
    

  });

});
