import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db.js";
import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
async function seedAdmin() {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const phone = process.env.ADMIN_PHONE;
        const password = process.env.ADMIN_PASSWORD;
        if (!name || !email || !phone || !password) {
            throw new Error("ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE and ADMIN_PASSWORD are required");
        }
        if (password.length < 12) {
            throw new Error("Admin password must be at least 12 characters");
        }
        await connectDB();
        const role = await Role.findOneAndUpdate({ name: "super_admin" }, {
            $setOnInsert: {
                name: "super_admin",
                description: "System administrator",
                isSystemRole: true,
            },
        }, { upsert: true, new: true });
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.roleId.toString() !== role._id.toString()) {
                throw new Error("This email already belongs to another role. No changes made.");
            }
            console.log("Super Admin account already exists.");
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await User.create({
            name,
            email,
            phone,
            passwordHash,
            roleId: role._id,
            status: "active",
        });
        console.log("Super Admin created successfully.");
    }
    catch (error) {
        console.error("Admin seeding failed:", error);
        process.exitCode = 1;
    }
    finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}
void seedAdmin();
