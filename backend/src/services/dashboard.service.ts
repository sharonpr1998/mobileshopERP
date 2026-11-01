
import mongoose from "mongoose";

import Sale from "@/models/sale.model.js";
import Product from "@/models/product.model.js";
import Customer from "@/models/customer.model.js";
import Repair from "@/models/repair.model.js";
import Purchase from "@/models/purchase.model.js";
import Attendance from "@/models/attendance.model.js";
import User from "@/models/user.model.js";
import Role from "@/models/role.model.js";

const LOW_STOCK_LIMIT = 5;

function getIndiaDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getIndiaDateRange() {
  const { year, month, day } = getIndiaDateParts();

  // India timezone is UTC +05:30.
  const todayStart = new Date(
    Date.UTC(year, month - 1, day) - 330 * 60 * 1000,
  );

  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const monthStart = new Date(
    Date.UTC(year, month - 1, 1) - 330 * 60 * 1000,
  );

  return { todayStart, tomorrowStart, monthStart };
}

function getTodayKey() {
  const { year, month, day } = getIndiaDateParts();

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

class DashboardService {
  async getDashboardData() {
    const { todayStart, tomorrowStart, monthStart } =
      getIndiaDateRange();

    const todayKey = getTodayKey();

    const staffRole = await Role.findOne({ name: "staff" }).select("_id");

    if (!staffRole) {
      throw new Error("Staff role not found");
    }

    const staffRoleId = staffRole._id;

    const [
      totalSales,
      todaySales,
      monthlySales,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockUnits,
      inventoryPurchaseValue,
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalRepairs,
      receivedRepairs,
      inProgressRepairs,
      readyRepairs,
      deliveredRepairs,
      cancelledRepairs,
      totalPurchases,
      todayPurchases,
      monthlyPurchases,
      totalStaff,
      activeStaff,
      inactiveStaff,
      blockedStaff,
      todayAttendance,
      recentSales,
      recentPurchases,
      recentRepairs,
      lowStockList,
    ] = await Promise.all([
      Sale.countDocuments(),

      Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lt: tomorrowStart },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({
        isActive: true,
        stockQuantity: { $gt: 0, $lte: LOW_STOCK_LIMIT },
      }),
      Product.countDocuments({
        isActive: true,
        stockQuantity: 0,
      }),

      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: "$stockQuantity" },
          },
        },
      ]),

      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            value: {
              $sum: {
                $multiply: ["$purchasePrice", "$stockQuantity"],
              },
            },
          },
        },
      ]),

      Customer.countDocuments(),
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ isActive: false }),

      Repair.countDocuments(),
      Repair.countDocuments({ status: "received" }),
      Repair.countDocuments({ status: "in_progress" }),
      Repair.countDocuments({ status: "ready" }),
      Repair.countDocuments({ status: "delivered" }),
      Repair.countDocuments({ status: "cancelled" }),

      Purchase.countDocuments(),

      Purchase.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lt: tomorrowStart },
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      Purchase.aggregate([
        { $match: { createdAt: { $gte: monthStart } } },
        {
          $group: {
            _id: null,
            amount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      User.countDocuments({ roleId: staffRoleId }),
      User.countDocuments({ roleId: staffRoleId, status: "active" }),
      User.countDocuments({ roleId: staffRoleId, status: "inactive" }),
      User.countDocuments({ roleId: staffRoleId, status: "blocked" }),

      Attendance.find({ dateKey: todayKey })
        .populate({
          path: "userId",
          select: "name email phone roleId",
        })
        .sort({ checkInAt: -1 })
        .lean(),

      Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("invoiceNumber customerName totalAmount createdAt")
        .lean(),

      Purchase.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("invoiceNumber supplierName totalAmount createdAt")
        .lean(),

      Repair.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customerId", "name phone")
        .select("deviceBrand deviceModel status estimatedCost createdAt customerId")
        .lean(),

      Product.find({
        isActive: true,
        stockQuantity: { $lte: LOW_STOCK_LIMIT },
      })
        .sort({ stockQuantity: 1 })
        .limit(5)
        .select("name sku brand stockQuantity sellingPrice")
        .lean(),
    ]);

    const presentStaff = todayAttendance.length;

    const currentlyWorking = todayAttendance.filter(
      (record) => !record.checkOutAt,
    ).length;

    const checkedOut = todayAttendance.filter(
      (record) => Boolean(record.checkOutAt),
    ).length;

    const activeStaffCount = activeStaff;

    const notCheckedIn = Math.max(
      0,
      activeStaffCount - presentStaff,
    );

    const totalWorkingMinutes = todayAttendance.reduce(
      (total, record) => {
        const endTime = record.checkOutAt
          ? new Date(record.checkOutAt).getTime()
          : Date.now();

        const startTime = new Date(record.checkInAt).getTime();

        return total + Math.max(
          0,
          Math.floor((endTime - startTime) / 60000),
        );
      },
      0,
    );

    const attendanceDetails = todayAttendance.map((record) => {
      const endTime = record.checkOutAt
        ? new Date(record.checkOutAt).getTime()
        : Date.now();

      const workedMinutes = Math.max(
        0,
        Math.floor(
          (endTime - new Date(record.checkInAt).getTime()) / 60000,
        ),
      );

      const user = record.userId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        phone: string;
      } | null;

      return {
        user: user
          ? {
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
            }
          : null,
        checkInAt: record.checkInAt,
        checkOutAt: record.checkOutAt ?? null,
        workedMinutes,
        overtimeMinutes: Math.max(0, workedMinutes - 480),
        status: record.checkOutAt ? "checked_out" : "working",
      };
    });

    return {
      overview: {
        totalSales,
        totalRevenue: monthlySales[0]?.revenue ?? 0,
        todayRevenue: todaySales[0]?.revenue ?? 0,
        todaySalesCount: todaySales[0]?.count ?? 0,
        monthlySalesCount: monthlySales[0]?.count ?? 0,
      },

      inventory: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalStockUnits: totalStockUnits[0]?.total ?? 0,
        inventoryPurchaseValue: inventoryPurchaseValue[0]?.value ?? 0,
        lowStockLimit: LOW_STOCK_LIMIT,
      },

      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
      },

      repairs: {
        total: totalRepairs,
        received: receivedRepairs,
        inProgress: inProgressRepairs,
        ready: readyRepairs,
        delivered: deliveredRepairs,
        cancelled: cancelledRepairs,
      },

      purchases: {
        total: totalPurchases,
        todayAmount: todayPurchases[0]?.amount ?? 0,
        todayCount: todayPurchases[0]?.count ?? 0,
        monthlyAmount: monthlyPurchases[0]?.amount ?? 0,
        monthlyCount: monthlyPurchases[0]?.count ?? 0,
      },

      staff: {
        total: totalStaff,
        active: activeStaff,
        inactive: inactiveStaff,
        blocked: blockedStaff,
      },

      attendance: {
        present: presentStaff,
        notCheckedIn,
        currentlyWorking,
        checkedOut,
        totalWorkingMinutes,
        records: attendanceDetails,
      },

      recentSales,
      recentPurchases,
      recentRepairs,
      lowStockList,
    };
  }
}

export default new DashboardService();
