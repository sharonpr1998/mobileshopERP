import Joi from "joi";

export const createRepairSchema = Joi.object({
  customerId: Joi.string()
    .hex()
    .length(24)
    .required(),

  deviceBrand: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  deviceModel: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required(),

  imei: Joi.string()
    .trim()
    .pattern(/^\d{15}$/)
    .optional()
    .allow(""),

  issue: Joi.string()
    .trim()
    .min(3)
    .max(1000)
    .required(),

  estimatedCost: Joi.number()
    .min(0)
    .required(),
});

export const updateRepairStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "received",
      "in_progress",
      "ready",
      "delivered",
      "cancelled",
    )
    .required(),
});