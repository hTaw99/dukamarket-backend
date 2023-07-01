import mongoose from "mongoose";
import User from "./user.js";

const { model, Schema } = mongoose;

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",

      // required: [true, 'Please provide user id'],
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        selectedColor: {
          type: Schema.Types.ObjectId,
          ref: "Color",
        },
        selectedSize: String,
        amount: {
          type: Number,
          default: 0,
        },
        totalProductPrice: {
          type: Number,
          default: 0,
        },
      },
    ],

    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 50,
    },
    // expireAt: {
    //   type: Date,
    //   default: Date.now(),
    //   expires: 5,
    // },
  },
  {
    timestamps: true,
    statics: {
      countTotals: async function () {},
    },
  }
);

// cartSchema.post("save", async function () {
//   if (this.user) {
//     const user = await User.findById(this.user);
//     // This check is very important prevent from looping , and put user.cart once not again & again
//     if (!user.cart) {
//       user.cart = this._id;
//       await user.save();
//     }
//   }
// });

cartSchema.pre("remove", async function () {
  if (this.user) {
    const user = await User.findById(this.user);
    user.cart = undefined;
    await user.save();
  }
});

// userSchema.post("find", async function () {
//   mergeGuestAndUserCarts(this.cart)
// });

// cartSchema.pre('save', async function () {
//   const totalItems = this.items.reduce((a, e) => (a += e.amount), 0);
//   const totalPrice = this.items.reduce((a, e) => (a += e.amount * e.product.price), 0);
//   console.log('from pre save', this.items[0].product.price);
//   this.totalItems = totalItems;
//   this.totalPrice = totalPrice;
// });

const Cart = model("Cart", cartSchema);
export default Cart;
