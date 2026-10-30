import mongoose from "mongoose";
import { connectDB } from "@/config/db.js";

import Module from "@/models/module.model.js";
import Action from "@/models/action.model.js";
import ModuleType from "@/models/module-type.model.js";
import Permission from "@/models/permission.model.js";
import Role from "@/models/role.model.js";
import RolePermission from "@/models/role-permission.model.js";

const modules = [
  { name: "Inventory", code: "inventory", type: "master" },
  { name: "Attendance", code: "attendance", type: "transaction" },
  { name: "Voucher", code: "voucher", type: "transaction" },
  { name: "Customer", code: "customer", type: "master" },
  { name: "Order", code: "order", type: "transaction" },
  { name: "Repair", code: "repair", type: "transaction" },
  { name: "Sales", code: "sales", type: "transaction" },
  { name: "Purchase", code: "purchase", type: "transaction" },
  { name: "Expense", code: "expense", type: "transaction" },
] as const;

const actions = [
  { name: "Create", code: "create" },
  { name: "Read", code: "read" },
  { name: "Update", code: "update" },
  { name: "Delete", code: "delete" },
  { name: "Approve", code: "approve" },
  { name: "Cancel", code: "cancel" },
] as const;

const moduleTypes = [
  { name: "Master", code: "master" },
  { name: "Transaction", code: "transaction" },
  { name: "Report", code: "report" },
  { name: "Settings", code: "settings" },
] as const;

async function seedRBAC(): Promise<void> {
  try {
    await connectDB();

    // 1. Create modules if they do not exist.
    for (const item of modules) {
      await Module.updateOne(
        { code: item.code },
        {
          $setOnInsert: {
            name: item.name,
            code: item.code,
          },
        },
        { upsert: true },
      );
    }

    // 2. Create actions if they do not exist.
    for (const item of actions) {
      await Action.updateOne(
        { code: item.code },
        {
          $setOnInsert: {
            name: item.name,
            code: item.code,
          },
        },
        { upsert: true },
      );
    }

    // 3. Create module types if they do not exist.
    for (const item of moduleTypes) {
      await ModuleType.updateOne(
        { code: item.code },
        {
          $setOnInsert: {
            name: item.name,
            code: item.code,
          },
        },
        { upsert: true },
      );
    }

    // 4. Fetch all seeded documents.
    const [moduleDocs, actionDocs, typeDocs] = await Promise.all([
      Module.find(),
      Action.find(),
      ModuleType.find(),
    ]);

    const typeMap = new Map(
      typeDocs.map((item) => [item.code, item._id]),
    );

    // 5. Create permissions for every module/action combination.
    for (const item of modules) {
      const moduleDoc = moduleDocs.find(
        (doc) => doc.code === item.code,
      );

      const moduleTypeId = typeMap.get(item.type);

      if (!moduleDoc || !moduleTypeId) {
        throw new Error(
          `RBAC configuration missing: ${item.code}`,
        );
      }

      for (const actionDoc of actionDocs) {
        await Permission.updateOne(
          {
            moduleId: moduleDoc._id,
            actionId: actionDoc._id,
            moduleTypeId,
          },
          {
            $setOnInsert: {
              moduleId: moduleDoc._id,
              actionId: actionDoc._id,
              moduleTypeId,
            },
          },
          { upsert: true },
        );
      }
    }

    // 6. Find Inventory Read permission.
    const inventoryModule = moduleDocs.find(
      (item) => item.code === "inventory",
    );

    const readAction = actionDocs.find(
      (item) => item.code === "read",
    );

    const masterTypeId = typeMap.get("master");

    if (!inventoryModule || !readAction || !masterTypeId) {
      throw new Error(
        "Required inventory permission configuration missing",
      );
    }

    const inventoryReadPermission = await Permission.findOne({
      moduleId: inventoryModule._id,
      actionId: readAction._id,
      moduleTypeId: masterTypeId,
    });

    if (!inventoryReadPermission) {
      throw new Error(
        "Inventory Read permission was not created",
      );
    }

    // 7. Assign Inventory Read permission to existing roles.
    // Valid role names from the IRole type.
    const roles = await Role.find({
      name: { $in: ["super_admin", "staff"] },
    });

    if (roles.length === 0) {
      throw new Error(
        "Super Admin/Staff roles were not found. Run the role seeding script first.",
      );
    }

    for (const role of roles) {
      await RolePermission.updateOne(
        {
          roleId: role._id,
          permissionId: inventoryReadPermission._id,
        },
        {
          $setOnInsert: {
            roleId: role._id,
            permissionId: inventoryReadPermission._id,
          },
        },
        { upsert: true },
      );

      console.log(
        `Inventory Read permission assigned to role: ${role.name}`,
      );
    }

    console.log("RBAC data seeded successfully");
  } catch (error: unknown) {
    console.error("RBAC seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedRBAC();
