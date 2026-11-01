import twilio from "twilio";
import { env } from "@/config/env.js";

class SmsService {
  private getClient() {
    const {
      twilioAccountSid,
      twilioAuthToken,
      twilioPhoneNumber,
    } = env;

    if (
      !twilioAccountSid ||
      !twilioAuthToken ||
      !twilioPhoneNumber
    ) {
      throw new Error("Twilio configuration is missing in .env");
    }

    return twilio(twilioAccountSid, twilioAuthToken);
  }

  // Test SMS - Twilio Trial Account
  async sendTestSms(phone: string): Promise<string> {
    const client = this.getClient();

    const message = await client.messages.create({
      body: "sms_customer_support",
      from: env.twilioPhoneNumber!,
      to: phone,
    });

    console.log("Test SMS submitted. SID:", message.sid);

    return message.sid;
  }

  // Repair status SMS
  async sendRepairStatusSms(
    phone: string,
    deviceModel: string,
    status: string,
  ): Promise<void> {
    const messages: Record<string, string> = {
      received: `${deviceModel} repair has been received.`,
      in_progress: `${deviceModel} repair is in progress.`,
      ready: `Your ${deviceModel} repair is ready for pickup.`,
      delivered: `${deviceModel} repair has been delivered. Thank you!`,
      cancelled: `${deviceModel} repair has been cancelled.`,
    };

    const message = messages[status];

    if (!message) return;

    try {
      const client = this.getClient();

      await client.messages.create({
        body: message,
        from: env.twilioPhoneNumber!,
        to: phone,
      });
    } catch (error) {
      console.error("Repair status SMS failed:", error);
    }
  }
}

export default new SmsService();