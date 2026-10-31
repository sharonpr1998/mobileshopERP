
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";

interface CreateStaffData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface UpdateStaffData {
  name?: string;
  email?: string;
  phone?: string;
}

class UserService {
  // Find the existing staff role
  private async getStaffRole() {
    const staffRole = await Role.findOne({
      name: "staff",
    });

    if (!staffRole) {
      throw new Error("Staff role is not configured");
    }

    return staffRole;
  }

  // Create a new staff account
  async createStaff(data: CreateStaffData) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const staffRole = await this.getStaffRole();

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const staff = await User.create({
      name,
      email,
      phone,
      passwordHash,
      roleId: staffRole._id,
      status: "active",
    });

    return {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staffRole.name,
      status: staff.status,
    };
  }

  // Get all staff accounts
  async getAllStaff() {
    const staffRole = await this.getStaffRole();

    const staffList = await User.find({
      roleId: staffRole._id,
    })
      .select("-passwordHash")
      .populate("roleId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return staffList;
  }

  // Update staff details
  async updateStaff(
    id: string,
    data: UpdateStaffData
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid staff ID");
    }

    const staffRole = await this.getStaffRole();

    const staff = await User.findOne({
      _id: id,
      roleId: staffRole._id,
    });

    if (!staff) {
      throw new Error("Staff not found");
    }

    if (data.email) {
      const email = data.email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        throw new Error("Email is already registered");
      }

      staff.email = email;
    }

    if (data.name !== undefined) {
      staff.name = data.name.trim();
    }

    if (data.phone !== undefined) {
      staff.phone = data.phone.trim();
    }

    await staff.save();

    return {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staffRole.name,
      status: staff.status,
    };
  }

  // Activate or deactivate staff
  async updateStaffStatus(
    id: string,
    status: "active" | "inactive"
  ) {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error("Invalid staff ID");
    }

    const staffRole = await this.getStaffRole();

    const staff = await User.findOneAndUpdate(
      {
        _id: id,
        roleId: staffRole._id,
      },
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).select("-passwordHash");

    if (!staff) {
      throw new Error("Staff not found");
    }

    return {
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      status: staff.status,
    };
  }
}

export default new UserService();
