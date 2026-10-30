import Joi from "joi";
export const createCustomerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().trim().min(7).max(20).required(),
    email: Joi.string().trim().email().optional().allow(""),
    address: Joi.string().trim().max(300).optional().allow(""),
    notes: Joi.string().trim().max(500).optional().allow(""),
});
