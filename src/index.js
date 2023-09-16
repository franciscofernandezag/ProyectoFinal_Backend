import "dotenv/config";
import express from "express";
import session from 'express-session';
import { Server } from 'socket.io'
import { engine } from 'express-handlebars';
import path from 'path';
import passport from './controllers/githubAuth.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo'
import { __dirname, __filename } from './path.js'
import { authenticate } from './middleware/authenticate.js';
import { connectDatabase } from './database.js';
import { loginUser } from "./controllers/localAuth.js"; 
import { registerUser } from "./controllers/localAuth.js"; 
import { logout } from './controllers/logout.js'; 
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import adminRouter from "./routes/admin.routes.js";
import premiumRouter from "./routes/premium.routes.js";
import userRouter from "./routes/users.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import recoveryRouter from "./routes/recovery.routes.js";
import loggerTestRouter from "./routes/loggerTest.routes.js";
import { loggerDev, loggerProd } from  "./utils/logger.js";
import swaggerJsdoc from  'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'


const app = express();
const PORT = 4000;

const server = app.listen(PORT, () => {
  loggerDev.http(`Server on port ${PORT}`);
})

app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SIGNED_COOKIE));
app.use(session({
  store: MongoStore.create({
      mongoUrl: process.env.URL_MONGODB_ATLAS,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 500 // Medido en segundos
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));;

//ServerIO

const io = new Server(server)
const mensajes = []

io.on('connection', (socket) => {
  loggerDev.http(`Ciente conectado socket IO`);
    socket.on("mensaje", info => {
      console.log(info)
        mensajes.push(info)
        io.emit("mensajes", mensajes) 
    })
})

//Swagger configuracion 
const swaggerOptions={
  definition:{
      openapi:'3.0.1',
      info:{
          title:" Documentacion de las API",
          description:" Informacion de tienda virtual",
          version: '1.0.0',
          contact:{
              name:"Francisco Fernandez",
              url: "https://www.linkedin.com/in/francisco-fernandez-fernandez-97930430/"
          }
      }
  },
  apis: [`${process.cwd()}/src/docs/**/*.yaml`],
  // apis: [`./docs/**/*.yaml`],
}

const spec=swaggerJsdoc(swaggerOptions)

// Handlebars
app.engine(
  'handlebars',
  engine({
    partialsDir: path.resolve(__dirname, 'views'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    },
    helpers: {
      eq: function (a, b, options) {
        if (a === b) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    }
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, 'views'));

// Conexion MongoDB
connectDatabase();

// Acceso Home
app.get('/', (req, res) => {
  res.render('home', {
    layout: false,
    partials: {
      navbar: 'navbar', 
    },
    title: 'Página de inicio',
  });
});

// Rutas de login y registros 
app.post('/login', loginUser);
app.post('/registro', registerUser);
app.get('/auth/github', passport.authenticate('github', { scope: ['user:usernamegithub'] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/products');
  }
);
app.get("/logout", async (req, res) => {
  await logout(req); 
  res.redirect("/");
});

// Rutas con permisos de acceso de usuarios segun rol
app.use('/products', authenticate(['usuario', 'premium']), productRouter);
app.use('/carts', authenticate(['usuario', 'premium']), cartRouter);
app.use('/admin', authenticate(['administrador']), adminRouter);
app.use('/premium', authenticate(['premium']), premiumRouter);
app.use('/users', authenticate(['usuario', 'premium','administrador']), userRouter);
app.use('/message',authenticate(['usuario', 'premium','administrador']), messagesRouter);
app.use('/chat', authenticate(['usuario', 'premium', 'administrador']));
app.use('/recovery', recoveryRouter);
app.use('/apidocs',swaggerUiExpress.serve,swaggerUiExpress.setup(spec))

//vista chat
app.get("/chat", (req, res) => {
  const cartId = req.session.user.cartId; 
  const userEmail = req.session.user.email; 
  const userId = req.session.user._id;

  console.log("Se accedió a la vista de chat. Usuario:", userEmail);
  loggerDev.http(`Ciente ${userEmail} acaba de conectarse a chat`);
  res.render('chat', { cartId: cartId , userId:userId }); 
});

// ruta de prueba del logger
app.use("/loggerTest", loggerTestRouter);