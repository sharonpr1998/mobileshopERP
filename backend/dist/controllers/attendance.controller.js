import attendanceService from "@/services/attendance.service.js";
class AttendanceController {
    async checkIn(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: "Selfie image is required",
                });
                return;
            }
            const attendance = await attendanceService.checkIn(res.locals.userId, req.body.location, req.file.buffer);
            res.status(201).json({
                success: true,
                message: "Check-in successful",
                data: attendance,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async checkOut(req, res, next) {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: "Selfie image is required",
                });
                return;
            }
            const attendance = await attendanceService.checkOut(res.locals.userId, req.body.location, req.file.buffer);
            res.status(200).json({
                success: true,
                message: "Check-out successful",
                data: attendance,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(_req, res, next) {
        try {
            const attendance = await attendanceService.getAllAttendance();
            res.status(200).json({
                success: true,
                data: attendance,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new AttendanceController();
