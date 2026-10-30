import Joi from "joi";

export const createStockMovementSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),

  type: Joi.string()
    .valid("in", "out")
    .required(),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required(),

  reason: Joi.string()
    .trim()
    .min(3)
    .max(250)
    .required(),
});