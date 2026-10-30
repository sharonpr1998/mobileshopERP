import Customer from "@/models/customer.model.js";

class CustomerRepository {
  async create(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }) {
    return Customer.create(data);
  }

  async findAll(search?: string) {
    const filter: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
      ];
    }

    return Customer.find(filter).sort({ createdAt: -1 });
  }
}

export default new CustomerRepository();