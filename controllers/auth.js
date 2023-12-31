import User from "../models/user.js";
import Cart from "../models/cart.js";
import { StatusCodes } from "http-status-codes";
import CustomError from "../errors/index.js";
import createTokenUser from "../utils/createToken.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

export const register = async (req, res) => {
  // ####################################
  // const cookies = req.cookies;
  // const cartId = cookies["cart_id"];
  // ####################################

  const { email, name, password, emailToSend } = req.body;

  const emailUser = await User.findOne({ email });

  if (emailUser) {
    throw new CustomError.BadRequestError("Email is already taken");
  }
  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Create the user
  const user = await User.create({
    email,
    name,
    password,
    role,
  });
  await sendEmail({
    message: "Welcome to dukamarket",
    email: user.email,
    subject: "Welcome to dukamarket",
    html: emailToSend,
  });

  // Create Token User
  const tokenUser = createTokenUser(user);
  const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
  const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  // Create secure cookie with refresh token
  res.cookie("ishop-refresh-token", refreshToken, {
    httpOnly: true, //accessible only by web server
    sameSite: "None",
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24, //cookie expiry: set to match rT
  });
  // res.clearCookie("cart_id");
  // Return the user
  res.status(StatusCodes.CREATED).json({ user: tokenUser, accessToken });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const cartId = req.cookies["cart_id"];

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordMatches = await user.comparePassword(password);
  if (!isPasswordMatches) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = createTokenUser(user);
  const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
  const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  // ###################################################################
  const geustCart = await Cart.findById(cartId);
  const userCart = await Cart.findOne({ user: user._id });

  user.mergeGuestAndUserCarts(geustCart, userCart);

  // Create secure cookie with refresh token
  res.cookie("ishop-refresh-token", refreshToken, {
    // domain:
    //   process.env.NODE_ENV === "production"
    //     ? "dukamarket.vercel.app"
    //     : "localhost",
    httpOnly: true, //accessible only by web server
    sameSite: "None",
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    // maxAge: 1000 * 20, //cookie expiry: set to match refresh Token
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  });
  res.clearCookie("cart_id");
  // res.clearCookie("cart_id");
  res.status(StatusCodes.OK).json({ user: tokenUser, accessToken });
};

export const refresh = async (req, res) => {
  const cookies = req.cookies;
  // console.log({ cookies: req.cookies });
  if (!cookies["ishop-refresh-token"])
    throw new CustomError.UnauthenticatedError(
      "Unauthorized you do not have a cookie"
    );

  const refreshToken = cookies["ishop-refresh-token"];

  try {
    const { _id: userId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(userId);
    if (!user) throw new CustomError.UnauthenticatedError("Unauthorized");

    const tokenUser = createTokenUser(user);
    const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });

    return res.json({ accessToken });
  } catch (error) {
    throw new CustomError.UnauthorizedError(`Forbidden ${error.message}`);
  }
};

export const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies["ishop-refresh-token"])
    return res.status(StatusCodes.NO_CONTENT).json({ message: "No content" });
  res.clearCookie("ishop-refresh-token", {
    httpOnly: true,
    sameSite: "None",
    // secure: process.env.NODE_ENV === "production",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};

export const forgotPassword = async (req, res) => {
  // ##########################################################################
  // const formatTime = (time) => {
  //   let min = Math.floor(time / 60);
  //   let sec = Math.floor(time - min * 60);

  //   if (min <= 10) min = "0" + min;
  //   if (sec <= 10) sec = "0" + sec;

  //   return min + ":" + sec;
  // };
  // let timeInSecond = 3 * 60;
  // const countdown = setInterval(() => {
  //   timeInSecond--;
  //   formatTime(timeInSecond);
  //   if (timeInSecond <= 0 || timeInSecond < 1) clearInterval(countdown);
  // }, 1000);
  // ##########################################################################

  const { emailToSend } = req.body;

  const user = await User.findOne({ email: req.body.email });
  try {
    // 1) check if user found or not
    if (!user) {
      throw "Email you entered not found";
    }
    // 2) Generate rondom Password token that we send back it to user
    const otp = user.createOtp();
    await user.save({ validateBeforeSave: false });

    // 3) send io user's email via NODEMAILER
    const emailHtml = emailToSend.replace("MYOTP", otp);
    await sendEmail({
      message: `Forgot your password? Enter your Otp to complete your reseting password `,
      email: user.email,
      subject: "Your Otp code (valid for 3 min)",
      html: emailHtml,
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    if (user) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const user = await User.findOne({
      otp: req.body.otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw "Otp is invalid or expired!";
    }
    user.otpExpires = undefined;
    user.otp = undefined;
    const resetToken = user.createPassowrdResetToken();

    await user.save({ validateBeforeSave: false });

    res
      .status(StatusCodes.OK)
      .json({ status: "success", resetToken, message: "Verified OTP" });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // 1) Find the user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and there is user, set new password
    if (!user) {
      throw "Reset Token is invalid or expired!";
    }
    user.password = req.body.password;
    // user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // 3) Update "changedPasswordAt" property for the user

    // 4) Log the user in, and send JWT

    const tokenUser = createTokenUser(user);
    const accessToken = jwt.sign(tokenUser, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("ishop-refresh-token", refreshToken, {
      domain:
        process.env.NODE_ENV === "production"
          ? "dukamarket.vercel.app"
          : "localhost",

      httpOnly: true, //accessible only by web server
      sameSite: true,
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    res.status(StatusCodes.OK).json({ user: tokenUser, accessToken });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
