import cloudinary from "@/config/cloudinary.js";
import { env } from "@/config/env.js";
class ImageUploadService {
    async uploadAttendanceSelfie(buffer) {
        if (!env.cloudinaryCloudName ||
            !env.cloudinaryApiKey ||
            !env.cloudinaryApiSecret) {
            throw new Error("Cloudinary is not configured");
        }
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({
                folder: "mobile-shop-erp/attendance",
                resource_type: "image",
                format: "jpg",
            }, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!result) {
                    reject(new Error("Image upload failed"));
                    return;
                }
                resolve(result);
            });
            upload.end(buffer);
        });
    }
}
export default new ImageUploadService();
