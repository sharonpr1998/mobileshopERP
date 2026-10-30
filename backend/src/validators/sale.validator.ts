
import Joi from "joi";

export const createSaleSchema = Joi.object({
  customerId: Joi.string().hex().length(24),

  customerName: Joi.string()
    .trim()
    .min(2)
    .max(150),

  invoiceNumber: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required(),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .unique("productId")
    .min(1)
    .required(),
})
  .or("customerId", "customerName")
  .messages({
    "object.missing": "Select a customer or enter a customer name.",
  });
