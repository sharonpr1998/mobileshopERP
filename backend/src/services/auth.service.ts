
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "@/models/user.model.js";
import Customer from "@/models/customer.model.js";
import Role from "@/models/role.model.js";
import RolePermission from "@/models/role-permission.model.js";
import { env } from "@/config/env.js";

class AuthService {
  async registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const customerRole = await Role.findOne({
      name: "customer",
    });

    if (!customerRole) {
      throw new Error("Customer role is not configured");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const session = await mongoose.startSession();

    let registeredData: {
      id: string;
      customerId: string;
      name: string;
      email: string;
      role: string;
    } | null = null;

    try {
      await session.withTransaction(async () => {
        // Create login account
        const [user] = await User.create(
          [
            {
              name: data.name.trim(),
              email,
              phone,
              passwordHash,
              roleId: customerRole._id,
            },
          ],
          { session }
        );

        // Create customer profile linked to User
        const [customer] = await Customer.create(
          [
            {
              userId: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              isActive: true,
            },
          ],
          { session }
        );

        registeredData = {
          id: user._id.toString(),
          customerId: customer._id.toString(),
          name: user.name,
          email: user.email,
          role: "customer",
        };
      });

      if (!registeredData) {
        throw new Error("Customer registration failed");
      }

      return registeredData;
    } finally {
      await session.endSession();
    }
  }

  async login(email: string, password: string) {
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid || user.status !== "active") {
      throw new Error("Invalid email or password");
    }

    const role = await Role.findById(user.roleId);

    if (!role) {
      throw new Error("User role is not configured");
    }

    const token = jwt.sign(
      { sub: user._id.toString() },
      env.jwtSecret,
      { expiresIn: "1h" }
    );

    const rolePermissions = await RolePermission.find({
      roleId: role._id,
    }).populate({
      path: "permissionId",
      populate: [
        {
          path: "moduleId",
          select: "code isActive",
        },
        {
          path: "actionId",
          select: "code",
        },
        {
          path: "moduleTypeId",
          select: "code",
        },
      ],
    });

    const permissions = rolePermissions
      .map((item) => {
        const permission = item.permissionId as unknown as {
          moduleId?: {
            code: string;
            isActive: boolean;
          };
          actionId?: {
            code: string;
          };
          moduleTypeId?: {
            code: string;
          };
        } | null;

        if (
          !permission?.moduleId ||
          !permission?.actionId ||
          !permission?.moduleTypeId ||
          !permission.moduleId.isActive
        ) {
          return null;
        }

        return {
          module: permission.moduleId.code,
          action: permission.actionId.code,
          moduleType: permission.moduleTypeId.code,
        };
      })
      .filter((permission) => permission !== null);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role.name,
      },
      permissions,
    };
  }
}

export default new AuthService();
