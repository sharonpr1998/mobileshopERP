import customerRepository from "@/repositories/customer.repository.js";

class CustomerService {
  async createCustomer(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }) {
    return customerRepository.create(data);
  }

  async getAllCustomers(search?: string) {
    return customerRepository.findAll(search);
  }
}

export default new CustomerService();