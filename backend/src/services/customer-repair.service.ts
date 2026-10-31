import customerRepository from "@/repositories/customer.repository.js";
import repairRepository from "@/repositories/repair.repository.js";

class CustomerRepairService {
  async getMyRepairs(userId: string) {
    const customer = await customerRepository.findByUserId(userId);

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    const repairs = await repairRepository.findByCustomerId(
      customer._id.toString(),
    );

    return repairs;
  }
}

export default new CustomerRepairService();