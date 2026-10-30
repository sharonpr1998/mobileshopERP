import customerService from "@/services/customer.service.js";
class CustomerController {
    async create(req, res, next) {
        try {
            const customer = await customerService.createCustomer(req.body);
            res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const search = typeof req.query.search === "string"
                ? req.query.search
                : undefined;
            const customers = await customerService.getAllCustomers(search);
            res.status(200).json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new CustomerController();
