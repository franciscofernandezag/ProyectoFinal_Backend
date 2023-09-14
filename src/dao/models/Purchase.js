import { Schema, model } from "mongoose";
import paginate from 'mongoose-paginate-v2';

const purchaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User" 
  },
  userEmail: {
    type: String,
    required: true
  },
  products: {
    "_id" : false,
    type: [
      {
        Id: {
          type: Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number,
        price: Number,
        subtotal: Number
      }
    ],
    default: []
  },
  successful: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  ticket: {
    type: Number
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

purchaseSchema.plugin(paginate);


export default model("Purchase", purchaseSchema);
