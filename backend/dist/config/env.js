import "dotenv/config";
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
}
if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in .env");
}
export const env = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri,
    jwtSecret,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    shopLatitude: Number(process.env.SHOP_LATITUDE),
    shopLongitude: Number(process.env.SHOP_LONGITUDE),
    shopRadiusMeters: Number(process.env.SHOP_RADIUS_METERS ?? 150),
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
