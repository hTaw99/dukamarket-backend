import Address from "../models/address.js";
import { StatusCodes } from "http-status-codes";
import CustomError from "../errors/index.js";

export const createAddress = async (req, res) => {
  const newAddress = await Address.create({
    user: req.user._id,
    fullname: req.body.fullname,
    goverment: req.body.goverment,
    email: req.body.email,
    area: req.body.area,
    phone: req.body.phone,
    street: req.body.street,
    building: req.body.building ? req.body.building : undefined,
    apartment: req.body.apartment ? req.body.apartment : undefined,
    floor: req.body.floor ? req.body.floor : undefined,
  });

  // const adds = await Address.updateMany(
  //   { $and: [{ user: req.user._id }, { _id: { $ne: newAddress._id } }] },
  //   { $set: { selectedAddress: false } }
  // );

  res.status(StatusCodes.CREATED).json({ address: newAddress });
};

export const getAddress = async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });

  // if (addresses.length === 0) {
  //   throw new CustomError.BadRequestError(
  //     "No addresses found related to this user"
  //   );
  // }

  res.status(StatusCodes.CREATED).json({ addresses });
};

// export const selectAddress = async (req, res, next) => {
//   const selectedAddressId = req.body.addressId;
//   const selectedAddress = await Address.findById(selectedAddressId);

//   // const adds = await Address.updateMany(
//   //   { $and: [{ user: req.user._id }, { _id: { $ne: req.body.addressId } }] },
//   //   { selectedAddress: false }
//   // );

//   // res.status(StatusCodes.CREATED).json({ success: "Your Address is selected" });

//   if (!selectedAddress) {
//     throw new CustomError.BadRequestError("Please provide your address");
//   }
//   req.selectedAddress = selectedAddress;
//   next();
// };

export const deleteAddress = async (req, res) => {
  const selectedAddressId = req.body.addressId;
  const selectedAddress = await Address.findOneAndRemove({
    $and: [{ user: req.user._id }, { _id: selectedAddressId }],
  });

  if (!selectedAddress) {
    throw new CustomError.BadRequestError("No address found with this id");
  }
  res.status(StatusCodes.CREATED).json({ msg: "Address deleted successfuly" });
};
