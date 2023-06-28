import mongoose from "mongoose";

const { model, Schema } = mongoose;
const { ObjectId } = Schema.Types;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      required: true,
    },
    images: [String],
    brand: {
      type: ObjectId,
      ref: "Brand",
      required: [true, "Please provide product brand"],
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Please provide product category"],
    },
    subCategory: {
      type: ObjectId,
      ref: "SubCategory",
      required: [true, "Please provide product sub-category"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
    },
    priceAfterDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
    },
    colors: [
      {
        type: ObjectId,
        ref: "Color",
        required: [true, "Please provide product color"],
      },
    ],
    sizes: {
      type: [String],
      required: [true, "Please provide product size"],
      default: "xm",
    },
    quantity: {
      type: Number,
      required: [true, "Please provide product quantity"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    toObject: { virtuals: true },
    statics: {
      countByCategory: async function (categoryId) {
        const result = await this.aggregate([
          { $match: { category: categoryId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ]);
        try {
          const category = await this.model("Category").findById(categoryId);
          category.productsCount = result[0]?.count ?? 0;
          await category.save();
        } catch (error) {
          console.log(error);
        }
      },
      countBySubCategory: async function (subCategoryId) {
        const result = await this.aggregate([
          { $match: { subCategory: subCategoryId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ]);
        try {
          const sub = await this.model("SubCategory").findById(subCategoryId);
          sub.productsCount = result[0]?.count ?? 0;
          await sub.save();
        } catch (error) {
          console.log(error);
        }
      },
      countByBrand: async function (brandId) {
        const result = await this.aggregate([
          { $match: { brand: brandId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ]);
        try {
          const brand = await this.model("Brand").findById(brandId);
          brand.productsCount = result[0]?.count ?? 0;
          await brand.save();
        } catch (error) {
          console.log(error);
        }
      },
    },
  }
);

// Set property(reviews) to product object when create it
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

productSchema.post("save", async function () {
  await this.constructor.countByCategory(this.category);
  await this.constructor.countBySubCategory(this.subCategory);
});

productSchema.post("remove", async function () {
  await this.constructor.countByCategory(this.category);
  await this.constructor.countBySubCategory(this.subCategory);
});

productSchema.pre("remove", async function () {
  // delete all reviews related to this product
  await this.model("Review").deleteMany({ product: this._id });
  // delete all carts related to this product
  // await this.model('Cart')
});

const Product = model("Product", productSchema);
export default Product;
