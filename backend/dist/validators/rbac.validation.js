import Joi from "joi";
export const objectIdSchema = Joi.string()
    .hex()
    .length(24)
    .required();
export const roleSchema = Joi.object({
    name: Joi.string()
        .valid("super_admin", "staff", "customer")
        .required(),
    description: Joi.string().trim().max(300).allow(""),
    isSystemRole: Joi.boolean(),
});
export const masterSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    code: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9_-]+$/)
        .required(),
});
export const permissionSchema = Joi.object({
    moduleId: objectIdSchema,
    actionId: objectIdSchema,
    moduleTypeId: objectIdSchema,
});
export const rolePermissionsSchema = Joi.object({
    permissionIds: Joi.array()
        .items(Joi.string().hex().length(24))
        .unique()
        .required(),
});
export function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.details.map((detail) => detail.message),
            });
            return;
        }
        req.body = value;
        next();
    };
}
export function validateId(req, res, next) {
    const { error } = objectIdSchema.validate(req.params.id);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Invalid ID",
        });
        return;
    }
    next();
}
export function validateRoleId(req, res, next) {
    const { error } = objectIdSchema.validate(req.params.roleId);
    if (error) {
        res.status(400).json({
            success: false,
            message: "Invalid role ID",
        });
        return;
    }
    next();
}
