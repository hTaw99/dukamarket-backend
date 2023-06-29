import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { StatusCodes } from "http-status-codes";
import CustomError from "../errors/index.js";
import jwt_decode from "jwt-decode";
// import User from "../models/user.js";

// #################################################################################

export const getCart = async (req, res) => {
  const cookies = req.cookies;
  const cartId = cookies["cart_id"];

  const refreshToken = cookies["ishop-refresh-token"];
  const decoded = refreshToken ? jwt_decode(refreshToken) : null;

  const cart = await Cart.findOne({
    $or: [
      { $and: [{ user: { $exists: true } }, { user: decoded?._id }] },
      { $and: [{ user: { $exists: false } }, { _id: cartId }] },
    ],
  }).populate({
    path: "items.product items.selectedColor",
    select: "name price images priceAfterDiscount",
  });

  if (!cart) {
    return res.status(StatusCodes.CREATED).json({ message: "No Cart Found" });
  }

  return res.status(StatusCodes.CREATED).json({ cart });
};

// #################################################################################

export const addItemToCart = async (req, res) => {
  const { productId, color, amount } = req.body;
  const { priceAfterDiscount, price } = await Product.findById(productId);

  // #################################################################
  const cookies = req.cookies;
  const cartId = cookies["cart_id"];
  const refreshToken = cookies["ishop-refresh-token"];
  const decoded = refreshToken ? jwt_decode(refreshToken) : null;

  // #################################################################

  const cart = await Cart.findOne({
    $or: [
      { $and: [{ user: { $exists: true } }, { user: decoded?._id }] },
      { $and: [{ user: { $exists: false } }, { _id: cartId }] },
    ],
  });

  if (!cart) {
    const cartData = {
      items: [
        {
          product: productId,
          selectedColor: color,
          // selectedSize: size,
          amount,
          totalProductPrice: priceAfterDiscount
            ? priceAfterDiscount * amount
            : price * amount,
        },
      ],
      totalItems: amount,
      totalPrice: priceAfterDiscount
        ? priceAfterDiscount * amount
        : price * amount,
      user: decoded?._id,
    };

    const newCart = await Cart.create(cartData);
    if (!refreshToken) {
      res.cookie("cart_id", newCart.id, {
        domain: "http://localhost:5173",
        // secure: process.env.NODE_ENV === "production"
      });
      // res.cookie("cart_id", newCart.id);
    }

    return res.status(StatusCodes.CREATED).json({ cart: newCart });

    // #################################################################
    // if (refreshToken) {
    //   const user = await User.findById(decoded._id);
    //   user.cart = newCart._id;
    //   await user.save();
    // }
    // #################################################################
  } else {
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() &&
        item.selectedColor.toString() === color.toString()
      // && item.selectedSize.toString() === size.toString()
    );

    if (itemIndex === -1) {
      cart.items.push({
        product: productId,
        selectedColor: color,
        // selectedSize: size,
        amount,
        totalProductPrice: priceAfterDiscount
          ? priceAfterDiscount * amount
          : price * amount,
      });

      cart.totalItems += amount;
      cart.totalPrice += priceAfterDiscount || price * amount;
    } else {
      cart.items = cart.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              amount: item.amount + amount,
              totalProductPrice: priceAfterDiscount
                ? item.totalProductPrice + priceAfterDiscount * amount
                : item.totalProductPrice + price * amount,
            }
          : item
      );
      cart.totalItems += amount;
      cart.totalPrice += priceAfterDiscount
        ? priceAfterDiscount * amount
        : price * amount;
    }

    await cart.save();
    // if (!cartId) {
    //   console.log("hey");
    //   res.cookie("cart_id", cart.id);
    // }
    return res.status(StatusCodes.CREATED).json({ cart });
  }
};

// #################################################################################

export const deleteItemFromCart = async (req, res, next) => {
  const { itemId } = req.params;

  const cookies = req.cookies;
  const cartId = cookies["cart_id"];
  const refreshToken = cookies["ishop-refresh-token"];
  const decoded = refreshToken ? jwt_decode(refreshToken) : null;

  const cart = await Cart.findOne({
    $or: [
      { $and: [{ user: { $exists: true } }, { user: decoded?._id }] },
      { $and: [{ user: { $exists: false } }, { _id: cartId }] },
    ],
  });

  if (!cart) {
    throw new CustomError.NotFoundError(`No cart for found`);
  }

  const deletedItem = cart.items.find(
    (item) => item._id.toString() === itemId.toString()
  );

  if (!deletedItem) {
    throw new CustomError.NotFoundError(`No item with id: ${itemId}`);
  }
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== itemId.toString()
  );
  cart.totalItems -= deletedItem.amount;
  cart.totalPrice -= deletedItem.totalProductPrice;

  await cart.save();

  if (cart.totalItems === 0) {
    await cart.delete();
    res.clearCookie("cart_id");
  }

  // const cart = await Cart.findOne({
  //   $or: [{ user: decoded?._id }, { _id: cartId }],
  // });

  // cart.items.forEach((product) => {
  //   if (product.id === itemId) {
  //     product.amount -= 1;
  //     product.totalProductPrice -= product.product.price;
  //   } else {
  //     return product;
  //   }
  // });

  // cart.totalItems -= 1
  // cart.totalPrice -= cart

  return res
    .status(StatusCodes.CREATED)
    .json({ message: "item deleted successfully from cart" });
};
