import Customer from "@/models/customer.model.js";

class CustomerRepository {
  async create(data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    userId?: string;
  }) {
    return Customer.create(data);
  }

  async findAll(search?: string) {
    const filter: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    return Customer.find(filter).sort({ createdAt: -1 });
  }

  async findByUserId(userId: string) {
    return Customer.findOne({
      userId,
      isActive: true,
    });
  }
  async findMyProfile(userId: string) {
    return Customer.findOne({
      userId,
      isActive: true,
    });
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
    return Customer.findOneAndUpdate(
      {
        userId,
        isActive: true,
      },
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}

export default new CustomerRepository();
