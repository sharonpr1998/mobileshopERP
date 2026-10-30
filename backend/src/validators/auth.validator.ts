
import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().lowercase().required(),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+()\-\s]{7,20}$/)
    .required(),

  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),

  password: Joi.string().min(1).max(128).required(),
});
