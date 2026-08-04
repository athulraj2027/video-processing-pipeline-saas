import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Only initialize transporter if SMTP credentials are provided
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    } else {
      console.log('⚠️ SMTP credentials not found. MailService will fall back to logging emails to the console.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to,
          subject,
          text,
          html: html || text,
        });
        console.log(`✉️ Email sent successfully to ${to}`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        return false;
      }
    } else {
      console.log('\n--- MOCK EMAIL OUTBOX ---');
      console.log(`To:      ${to}`);
      console.log(`From:    ${env.SMTP_FROM}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text:    ${text}`);
      console.log('-------------------------\n');
      return true;
    }
  }

  async sendOtpEmail(to: string, otpCode: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'): Promise<boolean> {
    const isVerification = type === 'VERIFY_EMAIL';
    const actionText = isVerification ? 'verify your email address' : 'reset your password';
    const title = isVerification ? 'Verify your email' : 'Reset your password';
    
    const subject = `${otpCode} is your flow studio verification code`;
    const text = `Hi,

Please use the following verification code to ${actionText}:

👉 ${otpCode}

This code is valid for 15 minutes. If you did not request this, you can safely ignore this email.

Thanks,
The flow studio Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #1c1fa2; font-size: 20px; font-weight: bold; margin-bottom: 20px;">${title}</h2>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">Hi,</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">Please use the following verification code to ${actionText}:</p>
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1a202c;">${otpCode}</span>
        </div>
        <p style="font-size: 12px; color: #718096; line-height: 1.5;">This code is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
        <p style="font-size: 12px; color: #a0aec0; margin: 0;">Thanks,<br/>The flow studio Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = `Welcome to flow studio, ${name}!`;
    const text = `Hi ${name},

Welcome to flow studio! Your storefront has been successfully launched.

You can now start uploading videos, configuring subscriptions, rentals, and customize your theme dashboard.

If you have any questions, feel free to reach out to our support team at any time.

Best,
The flow studio Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #1c1fa2; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Welcome to flow studio!</h2>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">Hi ${name},</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">Your storefront has been successfully launched.</p>
        <p style="font-size: 14px; color: #4a5568; line-height: 1.5;">You can now start uploading videos, configuring subscriptions, rentals, and customizing your store dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
        <p style="font-size: 12px; color: #a0aec0; margin: 0;">Best,<br/>The flow studio Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, text, html);
  }
}
