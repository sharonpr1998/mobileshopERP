import Attendance from "@/models/attendance.model.js";
class AttendanceRepository {
    async create(data) {
        return Attendance.create(data);
    }
    async findToday(userId, dateKey) {
        return Attendance.findOne({ userId, dateKey });
    }
    async checkOut(id, data) {
        return Attendance.findOneAndUpdate({ _id: id, checkOutAt: { $exists: false } }, { $set: data }, { new: true, runValidators: true });
    }
    async findAll() {
        return Attendance.find()
            .populate("userId", "name email")
            .sort({ checkInAt: -1 });
    }
}
export default new AttendanceRepository();
