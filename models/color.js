import mongoose from 'mongoose';

const { model, Schema } = mongoose;

const colorSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide color name'],
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  // productsCount: { type: Number, default: 0 },
});

const Color = model('Color', colorSchema);
export default Color;
