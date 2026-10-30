import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),

  sku: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .required(),

  brand: Joi.string().trim().min(2).max(100).required(),

  categoryId: Joi.string().hex().length(24).required(),

  purchasePrice: Joi.number().min(0).required(),

  sellingPrice: Joi.number().min(0).required(),

  stockQuantity: Joi.number().integer().min(0).default(0),
});