import Joi from "joi";
export const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).allow(""),
    parentCategoryId: Joi.string()
        .hex()
        .length(24)
        .allow(null),
});
