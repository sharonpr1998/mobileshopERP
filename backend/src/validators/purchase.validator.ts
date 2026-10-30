
import Joi from "joi";

export const createPurchaseSchema = Joi.object({
  supplierName: Joi.string().trim().max(150).required(),
  invoiceNumber: Joi.string().trim().max(100).required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().integer().min(1).required(),
        unitCost: Joi.number().min(0).required(),
      }),
    )
    .min(1)
    .required(),
});
