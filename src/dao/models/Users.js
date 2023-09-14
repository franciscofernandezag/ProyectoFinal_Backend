import { Schema, model } from "mongoose";

const documentSchema = new Schema({
  name: String,      // Nombre del documento (por ejemplo, "foto de perfil", "identificación", etc.)
  reference: String  // Referencia al archivo de la imagen (nombre del archivo, URL, o identificador)
});

const userSchema = new Schema({
  first_name: {
    type: String,
    required: false
  },
  last_name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    unique: false,
    index: false
  },
  gender: {
    type: String,
    required: false
  },
  rol: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: false
  },
  usernamegithub: {
    type: String,
    required: false
  },
  authenticationType: {
    type: String,
    required: false
  },
  cartId: {
    type: Schema.Types.ObjectId,
    ref: "cart"
  },
  documents: [documentSchema], // Arreglo de objetos para documentos
  last_connection: {
    type: Date,
    required: false
  }
});

export const userModel = model("users", userSchema);
