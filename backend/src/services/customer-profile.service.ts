import customerRepository from "@/repositories/customer.repository.js";

class CustomerProfileService {
  async getMyProfile(userId: string) {
    const customer = await customerRepository.findMyProfile(userId);

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    return customer;
  }

  async updateMyProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    },
  ) {
    const customer = await customerRepository.updateMyProfile(
      userId,
      data,
    );

    if (!customer) {
      throw new Error("Customer profile not found");
    }

    return customer;
  }
}

export default new CustomerProfileService();