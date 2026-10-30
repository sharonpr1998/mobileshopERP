import Repair from "@/models/repair.model.js";
class RepairRepository {
    async create(data) {
        return Repair.create(data);
    }
    async findAll(status) {
        const filter = status ? { status } : {};
        return Repair.find(filter)
            .populate("customerId", "name phone")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
    }
    async findById(id) {
        return Repair.findById(id)
            .populate("customerId", "name phone")
            .populate("createdBy", "name");
    }
    async updateStatus(id, status) {
        return Repair.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
            .populate("customerId", "name phone")
            .populate("createdBy", "name");
    }
}
export default new RepairRepository();
