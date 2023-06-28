import mongoose from "mongoose";
import pkg from "validator";
import bcrypt from "bcryptjs";
import Cart from "./cart.js";
import crypto from "crypto";
import generateOtp from "../utils/generateOtp.js";

const { model, Schema } = mongoose;
const { isEmail } = pkg;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter an username"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter an password"],
      minlength: [6, "Password cannot be lower than 6 character"],
    },
    otp: String,
    otpExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    address: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
  },
  {
    methods: {
      comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      },
      mergeGuestAndUserCarts: async function (geustCart, userCart) {
        if (geustCart && userCart) {
          const arr = [...userCart.items, ...geustCart.items];

          const newOne = Object.values(
            arr.reduce((acc, item) => {
              if (!acc[item.product])
                acc[item.product] = {
                  product: item.product,
                  selectedColor: item.selectedColor,
                  selectedSize: item.selectedSize,
                  _id: item._id,
                  amount: 0,
                  totalProductPrice: 0,
                };

              acc[item.product].amount += item.amount;
              acc[item.product].totalProductPrice += item.totalProductPrice;
              return acc;
            }, {})
          );

          userCart.items = newOne;
          userCart.totalItems += geustCart.totalItems;
          userCart.totalPrice += geustCart.totalPrice;

          await userCart.save();
          await geustCart.delete();
        } else if (geustCart) {
          geustCart.user = this._id;
          this.cart = geustCart._id;
          await geustCart.save();
          await this.save();
        }
      },
      createPassowrdResetToken: function () {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.passwordResetToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        return resetToken;
      },
      createOtp: function () {
        const otp = generateOtp();
        this.otp = otp;
        this.otpExpires = Date.now() + 3 * 60 * 1000;
        return otp;
      },
    },
    timestamps: true,
  }
);

// userSchema.virtual("cart", {
//   ref: "Cart",
//   foreignField: "user",
//   localField: "_id",
// })

// Fire a function before doc saved to db
userSchema.pre("save", async function () {
  // console.log('this.modifiedPaths()', this.modifiedPaths());
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// userSchema.post("save", async function () {
//   if (!this.otp) return;
//   setTimeout(
//     () => {
//       this.otp = undefined;
//       this.otpExpires = undefined;
//     },
//     180
//   );
// });

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now();

  next();
});

userSchema.post("save", async function () {
  if (this.cart) {
    const cart = await Cart.findById(this.cart);
    // This check is very important prevent from looping , and put cart.user once not again & again
    if (!cart.user) {
      cart.user = this._id;
      await cart.save();
    }
  }
});

const User = model("User", userSchema);
export default User;
