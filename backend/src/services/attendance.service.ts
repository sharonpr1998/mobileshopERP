
import mongoose from "mongoose";

import { env } from "@/config/env.js";
import attendanceRepository from "@/repositories/attendance.repository.js";
import imageUploadService from "@/services/image-upload.service.js";

interface Location {
  latitude: number;
  longitude: number;
}

class AttendanceService {
  private readonly workingHoursMinutes = 8 * 60;

  private getTodayKey(): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  }

  private getDistanceInMeters(first: Location, second: Location): number {
    const earthRadius = 6_371_000;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const latitudeDifference = toRadians(
      second.latitude - first.latitude,
    );
    const longitudeDifference = toRadians(
      second.longitude - first.longitude,
    );

    const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(toRadians(first.latitude)) *
        Math.cos(toRadians(second.latitude)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return (
      earthRadius *
      2 *
      Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
  }

  private verifyShopLocation(location: Location): void {
    const shopLocation = {
      latitude: env.shopLatitude,
      longitude: env.shopLongitude,
    };

    if (
      !Number.isFinite(shopLocation.latitude) ||
      !Number.isFinite(shopLocation.longitude)
    ) {
      throw new Error("Shop GPS coordinates are not configured");
    }

    const distance = this.getDistanceInMeters(shopLocation, location);

    if (distance > env.shopRadiusMeters) {
      throw new Error(
        "You must be inside the shop location to mark attendance",
      );
    }
  }

  private formatAttendance<T extends {
    checkInAt: Date;
    checkOutAt?: Date;
  }>(attendance: T) {
    const endTime = attendance.checkOutAt
      ? new Date(attendance.checkOutAt).getTime()
      : null;

    const startTime = new Date(attendance.checkInAt).getTime();

    const workedMinutes = endTime
      ? Math.max(0, Math.floor((endTime - startTime) / 60000))
      : null;

    const overtimeMinutes =
      workedMinutes === null
        ? null
        : Math.max(0, workedMinutes - this.workingHoursMinutes);

    return {
      ...attendance,
      workedMinutes,
      overtimeMinutes,
      completed: Boolean(attendance.checkOutAt),
    };
  }

  async checkIn(
    userId: string,
    location: Location,
    selfieBuffer: Buffer,
  ) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    this.verifyShopLocation(location);

    const dateKey = this.getTodayKey();
    const existingAttendance = await attendanceRepository.findToday(
      userId,
      dateKey,
    );

    if (existingAttendance) {
      throw new Error("Attendance already marked for today");
    }

    const image = await imageUploadService.uploadAttendanceSelfie(
      selfieBuffer,
    );

    try {
      return await attendanceRepository.create({
        userId,
        dateKey,
        checkInAt: new Date(),
        checkInLocation: location,
        checkInSelfieUrl: image.secure_url,
        checkInSelfiePublicId: image.public_id,
      });
    } catch (error) {
      // Handles simultaneous duplicate check-in requests.
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        throw new Error("Attendance already marked for today");
      }

      throw error;
    }
  }

  async checkOut(
    userId: string,
    location: Location,
    selfieBuffer: Buffer,
  ) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    this.verifyShopLocation(location);

    const dateKey = this.getTodayKey();
    const attendance = await attendanceRepository.findToday(
      userId,
      dateKey,
    );

    if (!attendance) {
      throw new Error("Please check in before checking out");
    }

    if (attendance.checkOutAt) {
      throw new Error("You have already checked out");
    }

    const image = await imageUploadService.uploadAttendanceSelfie(
      selfieBuffer,
    );

    const updatedAttendance = await attendanceRepository.checkOut(
      attendance.id,
      {
        checkOutAt: new Date(),
        checkOutLocation: location,
        checkOutSelfieUrl: image.secure_url,
        checkOutSelfiePublicId: image.public_id,
      },
    );

    if (!updatedAttendance) {
      throw new Error("Attendance was already checked out");
    }

    return this.formatAttendance(updatedAttendance.toObject());
  }

  async getMyAttendance(userId: string) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new Error("Invalid user ID");
    }

    const records = await attendanceRepository.findByUserId(userId);

    return records.map((record) => this.formatAttendance(record));
  }

  async getAllAttendance() {
    const records = await attendanceRepository.findAll();

    return records.map((record) => this.formatAttendance(record));
  }
}

export default new AttendanceService();
