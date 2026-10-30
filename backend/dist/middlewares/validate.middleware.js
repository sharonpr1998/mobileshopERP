export function validate(schema) {
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
