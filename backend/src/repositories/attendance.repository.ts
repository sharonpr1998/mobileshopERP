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

  async findToday(userId: string, dateKey: string) {
    return Attendance.findOne({ userId, dateKey });
  }

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
      { _id: id, checkOutAt: { $exists: false } },
      { $set: data },
      { new: true, runValidators: true },
    );
  }

  async findAll() {
    return Attendance.find()
      .populate("userId", "name email")
      .sort({ checkInAt: -1 });
  }
}

export default new AttendanceRepository();
