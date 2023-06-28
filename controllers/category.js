import Category from "../models/category.js";
import { StatusCodes } from "http-status-codes";
import CustomError from "../errors/index.js";
import slugify from "slugify";
import cloudinary from "cloudinary";
import fs from "fs";

// ################# Create Category #################
export const createCategory = async (req, res) => {
  req.body.slug = slugify(req.body.name);

  const category = await Category.create(req.body);
  res.status(StatusCodes.CREATED).json({ category });
};

// ################# Get All Category #################
export const getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.status(StatusCodes.CREATED).json(categories);
};

// ################# Update Category #################
export const updateCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOneAndUpdate(
    { _id: categoryId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    throw new CustomError.NotFoundError(`No category with id : ${categoryId}`);
  }

  res.status(StatusCodes.OK).json(category);
};

// ################# Delete Category #################
export const deleteCategory = async (req, res) => {
  const { id: categoryId } = req.params;

  const category = await Category.findOne({ _id: categoryId });

  if (!category) {
    throw new CustomError.NotFoundError(`No category with id : ${categoryId}`);
  }

  await category.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

export const uploadCategoryImage = async (req, res) => {

  const category = await Category.findById(req.params.id);
  const result = await cloudinary.v2.uploader.upload(
    req.files.image.tempFilePath,
    { use_filename: true, folder: "elgendy-ecommerce" },
    (a, p) => {
      // console.log({ a, p });
    }
  );
  fs.unlinkSync(req.files.image.tempFilePath);
  category.images = result.secure_url;
  await category.save({validateBeforeSave: false});

  // console.log(result);
  res.status(StatusCodes.OK).json({ image: result.secure_url });
};
