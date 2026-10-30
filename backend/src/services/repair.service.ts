import mongoose from "mongoose";

import Customer from "@/models/customer.model.js";
import type { RepairStatus } from "@/models/repair.model.js";
import repairRepository from "@/repositories/repair.repository.js";
import Repair from "@/models/repair.model.js";
import smsService from "@/services/sms.service.js";

class RepairService {
  async createRepair(
    data: {
      customerId: string;
      deviceBrand: string;
      deviceModel: string;
      imei?: string;
      issue: string;
      estimatedCost: number;
    },
    createdBy: string,
  ) {
    if (!mongoose.isValidObjectId(data.customerId)) {
      throw new Error("Invalid customer ID");
    }

    const customer = await Customer.findOne({
      _id: data.customerId,
      isActive: true,
    });

    if (!customer) {
      throw new Error("Active customer not found");
    }

    return repairRepository.create({
      ...data,
      createdBy,
    });
  }

  async getAllRepairs(status?: RepairStatus) {
    return repairRepository.findAll(status);
  }

async updateRepairStatus(id: string, status: RepairStatus) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid repair ID");
  }

  const repair = await Repair.findById(id);

  if (!repair) {
    throw new Error("Repair job not found");
  }

  if (
    repair.status === "delivered" ||
    repair.status === "cancelled"
  ) {
    throw new Error(
      "Delivered or cancelled repair jobs cannot be changed",
    );
  }

  const customer = await Customer.findById(repair.customerId);

  if (!customer || !customer.isActive) {
    throw new Error("Active customer not found");
  }

  const updatedRepair = await repairRepository.updateStatus(
    id,
    status,
  );

  if (!updatedRepair) {
    throw new Error("Failed to update repair status");
  }

  await smsService.sendRepairStatusSms(
    customer.phone,
    repair.deviceModel,
    status,
  );

  return updatedRepair;
}
}

export default new RepairService();