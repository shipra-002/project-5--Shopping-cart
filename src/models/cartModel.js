const mongoose = require("mongoose");

const cartModel = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "createUser"
    },
    items: [
      {
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"product"
        },
        quantity:{
            type:Number,
            required:true,
            default:0
        },
    } 
    ],
    totalPrice: {
      type: Number,
      required:true, //Holds total price of all the items in the cart
      default:0
    },
    totalItems: {
      
      type: Number,
      required:true,
      default:0
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartModel);