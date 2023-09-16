import "dotenv/config";
import { expect } from "chai";
import supertest from 'supertest'; 
import mongoose from 'mongoose';
import { userModel } from "../../src/dao/models/Users.js";

const requester = supertest('http://localhost:4000');

describe('Test routes autentication', () => {
  before(async () => {
    await mongoose.connect(process.env.URL_MONGODB_ATLAS, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await userModel.findOneAndDelete({ email: 'test4@test4.com' });
    await mongoose.connection.close();
  });


  it('[POST] /registro  Registro exitoso', async () => {
    const mockuser = {
      nombre: 'Test4',
      apellido: 'User',
      email: 'test4@test4.com',
      edad : '25',
      genero: 'masculino',
      rol: 'usuario',
      password: '123456', 
    
    };

    const response = await requester.post('/registro').send(mockuser);
 
    expect(response.statusCode).to.be.eql(200)
    expect(response.text).to.include('Usuario creado exitosamente');
  
  });

  it('[POST] /login   successfully', async () => {
    const mockuserlogin = {
      email: 'correo@correo',
      password: '123456',
    };
  
    const response = await requester.post('/login').send(mockuserlogin);
    const cookieHeader = response.headers['set-cookie'][0];
  
    expect(cookieHeader).to.be.ok;
  
    const cookieName = cookieHeader.split('=')[0];
    const cookieValue = cookieHeader.split('=')[1];
  
    expect(cookieName).to.be.eql('connect.sid'); 
    expect(cookieValue).to.be.ok;
  });
});
