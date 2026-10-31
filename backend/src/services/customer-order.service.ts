import customerRepository from "@/repositories/customer.repository.js";
import saleRepository from "@/repositories/sale.repository.js";

class CustomerOrderService {
  async getMyOrders(userId: string) {
    const customer = await customerRepository.findByUserId(userId);

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    const orders = await saleRepository.findByCustomerId(
      customer._id.toString(),
    );

    return orders;
  }
}

export default new CustomerOrderService();