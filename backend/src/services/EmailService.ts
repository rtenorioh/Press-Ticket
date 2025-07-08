import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true para porta 465, false para outras portas
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Permite conexões sem certificado válido (use apenas em desenvolvimento)
      },
      debug: process.env.NODE_ENV !== "production",
      logger: process.env.NODE_ENV !== "production"
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Press Ticket'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`E-mail enviado: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar e-mail: ${error}`);
      return false;
    }
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info("Conexão com servidor de e-mail verificada com sucesso");
      return true;
    } catch (error) {
      logger.error(`Erro ao verificar conexão com servidor de e-mail: ${error}`);
      return false;
    }
  }
}

export default EmailService;
