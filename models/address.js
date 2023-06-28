import mongoose from "mongoose";

const { model, Schema } = mongoose;

const address = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fullname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  goverment: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },

  phone: {
    type: Number,
    required: true,
  },

  street: {
    type: String,
    required: true,
  },

  building: {
    type: String,
  },
  apartment: {
    type: Number,
  },
  floor: {
    type: Number,
  },
  // selectedAddress: { type: Boolean, default: true },
});

const Address = model("Address", address);
export default Address;
