import Repair from "@/models/repair.model.js";
import type { RepairStatus } from "@/models/repair.model.js";

interface CreateRepairData {
  customerId: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  issue: string;
  estimatedCost: number;
  createdBy: string;
}

class RepairRepository {
  async create(data: CreateRepairData) {
    return Repair.create(data);
  }

  async findAll(status?: RepairStatus) {
    const filter = status ? { status } : {};

    return Repair.find(filter)
      .populate("customerId", "name phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    return Repair.findById(id)
      .populate("customerId", "name phone")
      .populate("createdBy", "name");
  }

  async updateStatus(id: string, status: RepairStatus) {
    return Repair.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .populate("customerId", "name phone")
      .populate("createdBy", "name");
  }
  async findByCustomerId(customerId: string) {
    return Repair.find({
      customerId,
    }).sort({ createdAt: -1 });
  }
}

export default new RepairRepository();
