import multer from 'multer';
import path from 'path';
import { __dirname, __filename } from '../../src/path.js' 


// Carpeta de destino para imágenes de productos
const productsUploadPath = path.join(__dirname, 'public', 'documents', 'products');

// Carpeta de destino para imágenes de perfiles de usuarios
const profilesUploadPath = path.join(__dirname, 'public', 'documents', 'profiles');

// Carpeta de destino para documentos de DNI
const dniUploadPath = path.join(__dirname, 'public', 'documents', 'dni');

// Carpeta de destino para comprobantes de domicilio
const comprobanteDomicilioUploadPath = path.join(__dirname, 'public', 'documents', 'comprobante_domicilio');

// Carpeta de destino para estados de cuenta
const estadoCuentaUploadPath = path.join(__dirname, 'public', 'documents', 'estado_cuenta');

// Configuración de almacenamiento de Multer para productos, perfiles de usuarios y documentos
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const dniStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dniUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const comprobanteDomicilioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobanteDomicilioUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

const estadoCuentaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, estadoCuentaUploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

// Configurar Multer para productos, perfiles de usuarios y documentos
const productUpload = multer({ storage: productStorage });
const profileUpload = multer({ storage: profileStorage });
const dniUpload = multer({ storage: dniStorage });
const comprobanteDomicilioUpload = multer({ storage: comprobanteDomicilioStorage });
const estadoCuentaUpload = multer({ storage: estadoCuentaStorage });

// Middleware para manejar la carga de archivos de productos
const productUploadMiddleware = (req, res, next) => {
  const uploadHandler = productUpload.single('productImage');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error específico de Multer
      console.error('Error de Multer:', err);
      res.status(400).json({ error: 'Error de carga de archivo: ' + err.message });
    } else if (err) {
      // Otro error
      console.error('Error durante la carga del archivo:', err);
      res.status(500).json({ error: 'Ocurrió un error durante la carga del archivo' });
    } else {
      next();
    }
  });
};

// Middleware para manejar la carga de archivos de perfiles de usuarios
const profileUploadMiddleware = (req, res, next) => {
  const uploadHandler = profileUpload.single('profileImage');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'Error de carga de archivo: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Ocurrió un error durante la carga del archivo' });
    } else {
      next();
    }
  });
};

// Middleware para manejar la carga de archivos de DNI
const dniUploadMiddleware = (req, res, next) => {
  const uploadHandler = dniUpload.single('dniDocument');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'Error de carga de archivo: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Ocurrió un error durante la carga del archivo' });
    } else {
      next();
    }
  });
};

// Middleware para manejar la carga de archivos de comprobantes de domicilio
const comprobanteDomicilioMiddleware = (req, res, next) => {
  const uploadHandler = comprobanteDomicilioUpload.single('comprobanteDomicilioDocument');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'Error de carga de archivo: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Ocurrió un error durante la carga del archivo' });
    } else {
      next();
    }
  });
};

// Middleware para manejar la carga de archivos de estados de cuenta
const estadoCuentaMiddleware = (req, res, next) => {
  const uploadHandler = estadoCuentaUpload.single('estadoCuentaDocument');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: 'Error de carga de archivo: ' + err.message });
    } else if (err) {
      res.status(500).json({ error: 'Ocurrió un error durante la carga del archivo' });
    } else {
      next();
    }
  });
};

export { productUploadMiddleware, profileUploadMiddleware, dniUploadMiddleware, comprobanteDomicilioMiddleware, estadoCuentaMiddleware };
