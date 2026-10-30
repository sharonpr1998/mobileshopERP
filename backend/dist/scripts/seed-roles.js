import { connectDB } from "@/config/db.js";
import Role from "@/models/role.model.js";
async function seedRoles() {
    try {
        await connectDB();
        const roles = [
            { name: "super_admin", description: "Full system administration" },
            { name: "staff", description: "Shop staff access" },
            { name: "customer", description: "Customer account access" },
        ];
        for (const role of roles) {
            await Role.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true });
        }
        console.log("Roles seeded successfully");
    }
    catch (error) {
        console.error("Role seeding failed:", error);
        process.exitCode = 1;
    }
    finally {
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();
    }
}
seedRoles();
