
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";
import { env } from "@/config/env.js";

class AuthService {
  async registerCustomer(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const existingUser = await User.findOne({
      email: data.email,
    });

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

    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      roleId: customerRole._id,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: "customer",
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+passwordHash");

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

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role.name,
      },
    };
  }
}

export default new AuthService();
