
import Attendance from "@/models/attendance.model.js";

class AttendanceRepository {
  async create(data: {
    userId: string;
    dateKey: string;
    checkInAt: Date;
    checkInLocation: {
      latitude: number;
      longitude: number;
    };
    checkInSelfieUrl: string;
    checkInSelfiePublicId: string;
  }) {
    return Attendance.create(data);
  }

  // Find one user's attendance for a particular day
  async findToday(userId: string, dateKey: string) {
    return Attendance.findOne({ userId, dateKey });
  }

  // Get attendance history of one staff member
  async findByUserId(userId: string) {
    return Attendance.find({ userId })
      .sort({ checkInAt: -1 })
      .lean();
  }

  // Update check-out details only once
  async checkOut(
    id: string,
    data: {
      checkOutAt: Date;
      checkOutLocation: {
        latitude: number;
        longitude: number;
      };
      checkOutSelfieUrl: string;
      checkOutSelfiePublicId: string;
    },
  ) {
    return Attendance.findOneAndUpdate(
      {
        _id: id,
        checkOutAt: { $exists: false },
      },
      { $set: data },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  // Admin: Get all staff attendance
  async findAll() {
    return Attendance.find()
      .populate("userId", "name email")
      .sort({ checkInAt: -1 })
      .lean();
  }
}

export default new AttendanceRepository();
