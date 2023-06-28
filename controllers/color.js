import Color from '../models/color.js';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors/index.js';
import slugify from 'slugify';

// ################# Create Color #################
export const createColor = async (req, res) => {
  req.body.slug = slugify(req.body.name);

  const color = await Color.create(req.body);
  res.status(StatusCodes.CREATED).json({ color });
};

// ################# Get All Color #################
export const getColors = async (req, res) => {
  const colors = await Color.find({});
  res.status(StatusCodes.CREATED).json(colors);
};

// ################# Update Color #################
export const updateColor = async (req, res) => {
  const { id: colorId } = req.params;

  const color = await Color.findOneAndUpdate({ _id: colorId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!color) {
    throw new CustomError.NotFoundError(`No color with id : ${colorId}`);
  }

  res.status(StatusCodes.OK).json(color);
};

// ################# Delete color #################
export const deleteColor = async (req, res) => {
  const { id: colorId } = req.params;

  const color = await Color.findOne({ _id: colorId });

  if (!color) {
    throw new CustomError.NotFoundError(`No color with id : ${colorId}`);
  }

  await color.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Color removed.' });
};
