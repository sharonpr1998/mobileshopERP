import authService from "@/services/auth.service.js";
class AuthController {
    async register(req, res) {
        try {
            const user = await authService.registerCustomer(req.body);
            res.status(201).json({
                success: true,
                message: "Customer registered successfully",
                data: user,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Registration failed";
            const statusCode = message === "Email is already registered" ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message,
            });
        }
    }
    async login(req, res) {
        try {
            const data = await authService.login(req.body.email, req.body.password);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data,
            });
        }
        catch {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
    }
}
export default new AuthController();
