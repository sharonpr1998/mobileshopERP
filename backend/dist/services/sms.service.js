import twilio from "twilio";
import { env } from "@/config/env.js";
class SmsService {
    async sendRepairStatusSms(phone, deviceModel, status) {
        const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber, } = env;
        if (!twilioAccountSid ||
            !twilioAuthToken ||
            !twilioPhoneNumber) {
            console.warn("Twilio is not configured. SMS skipped.");
            return;
        }
        const messages = {
            in_progress: `${deviceModel} repair is now in progress.`,
            ready: `Your ${deviceModel} repair is ready for pickup.`,
            delivered: `Your ${deviceModel} repair has been delivered. Thank you!`,
            cancelled: `Your ${deviceModel} repair has been cancelled.`,
        };
        const message = messages[status];
        if (!message)
            return;
        try {
            const client = twilio(twilioAccountSid, twilioAuthToken);
            await client.messages.create({
                body: message,
                from: twilioPhoneNumber,
                to: phone,
            });
        }
        catch (error) {
            // SMS failure should not undo the repair status update.
            console.error("Repair status SMS failed:", error);
        }
    }
}
export default new SmsService();
