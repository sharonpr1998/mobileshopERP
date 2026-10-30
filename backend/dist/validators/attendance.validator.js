import Joi from "joi";
const locationSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
});
export const attendanceLocationSchema = locationSchema;
export const checkInSchema = Joi.object({
    location: locationSchema.required(),
});
export const checkOutSchema = Joi.object({
    location: locationSchema.required(),
});
