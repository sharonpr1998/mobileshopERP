
import Joi from "joi";

export const createStaffSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().lowercase().required(),

  phone: Joi.string().trim().required(),

  password: Joi.string().min(8).required(),
});

export const updateStaffSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  email: Joi.string().trim().email().lowercase(),

  phone: Joi.string().trim(),
}).min(1);

export const updateStaffStatusSchema = Joi.object({
  status: Joi.string()
    .valid("active", "inactive")
    .required(),
});
