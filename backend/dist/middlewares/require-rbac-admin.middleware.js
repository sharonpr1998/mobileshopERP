import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
const requireRbacAdmin = async (_req, res, next) => {
    try {
        const userId = res.locals.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }
        const user = await User.findById(userId).select("roleId status");
        if (!user || user.status !== "active") {
            res.status(401).json({
                success: false,
                message: "User account is unavailable",
            });
            return;
        }
        const role = await Role.findById(user.roleId).select("name");
        if (!role || role.name !== "super_admin") {
            res.status(403).json({
                success: false,
                message: "Only super admin can manage RBAC",
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
export default requireRbacAdmin;
