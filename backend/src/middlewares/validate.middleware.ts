
import type { RequestHandler } from "express";
import type Joi from "joi";

export function validate(
  schema: Joi.ObjectSchema
): RequestHandler {
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
