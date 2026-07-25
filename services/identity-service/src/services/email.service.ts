export class EmailService {
  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    console.log(`\n📧 [EMAIL MOCK] Sending verification OTP ${otp} to ${email}`);
    console.log(`👉 To verify, call POST /api/v1/auth/verify-email with the OTP.\n`);
  }
}

export const emailService = new EmailService();
export default emailService;
