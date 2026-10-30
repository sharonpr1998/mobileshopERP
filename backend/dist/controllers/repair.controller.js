import repairService from "@/services/repair.service.js";
class RepairController {
    async create(req, res, next) {
        try {
            const repair = await repairService.createRepair(req.body, res.locals.userId);
            res.status(201).json({
                success: true,
                message: "Repair job created successfully",
                data: repair,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const status = typeof req.query.status === "string"
                ? req.query.status
                : undefined;
            const repairs = await repairService.getAllRepairs(status);
            res.status(200).json({
                success: true,
                data: repairs,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const repair = await repairService.updateRepairStatus(req.params.id, req.body.status);
            res.status(200).json({
                success: true,
                message: "Repair status updated successfully",
                data: repair,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new RepairController();
