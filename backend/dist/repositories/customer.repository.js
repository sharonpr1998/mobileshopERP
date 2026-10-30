import Customer from "@/models/customer.model.js";
class CustomerRepository {
    async create(data) {
        return Customer.create(data);
    }
    async findAll(search) {
        const filter = {
            isActive: true,
        };
        if (search) {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { phone: { $regex: safeSearch, $options: "i" } },
            ];
        }
        return Customer.find(filter).sort({ createdAt: -1 });
    }
}
export default new CustomerRepository();
