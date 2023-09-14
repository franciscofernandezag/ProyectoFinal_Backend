import { Schema, model } from "mongoose";
import paginate from 'mongoose-paginate-v2';

const cartSchema = new Schema({
  products: {
    "_id" :false, 
    type: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Product" 
        },
        quantity: Number
      }
    ],
    default: []
  }
});

cartSchema.plugin(paginate);

export default model("Cart", cartSchema);


