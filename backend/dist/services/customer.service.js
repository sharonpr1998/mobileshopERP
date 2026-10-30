import customerRepository from "@/repositories/customer.repository.js";
class CustomerService {
    async createCustomer(data) {
        return customerRepository.create(data);
    }
    async getAllCustomers(search) {
        return customerRepository.findAll(search);
    }
}
export default new CustomerService();
