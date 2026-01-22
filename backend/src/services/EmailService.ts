import nodemailer from "nodemailer";
import { logger } from "../utils/logger";
import Setting from "../models/Setting";

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      const emailUser = await Setting.findOne({ where: { key: "emailUser" } });
      const emailPass = await Setting.findOne({ where: { key: "emailPass" } });
      const emailHost = await Setting.findOne({ where: { key: "emailHost" } });
      const emailPort = await Setting.findOne({ where: { key: "emailPort" } });

      const user = emailUser?.value?.trim() || "";
      const pass = emailPass?.value?.trim() || "";
      const host = emailHost?.value?.trim() || "smtp.gmail.com";
      const port = parseInt(emailPort?.value || "587");

      if (!user || !pass) {
        logger.warn("Credenciais de email não configuradas. Configure em: Configurações > Configurações de Email");
        this.transporter = null;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: process.env.NODE_ENV !== "production",
        logger: process.env.NODE_ENV !== "production"
      });

      logger.info("Transporter de email configurado com sucesso");
    } catch (error) {
      logger.error(`Erro ao inicializar transporter de email: ${error}`);
      this.transporter = null;
    }
  }

  public async reloadTransporter() {
    await this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      if (!this.transporter) {
        logger.warn("Não foi possível enviar e-mail: credenciais não configuradas. Configure em: Configurações > Configurações de Email");
        return false;
      }

      const emailUser = await Setting.findOne({ where: { key: "emailUser" } });
      const fromEmail = emailUser?.value?.trim() || "";

      if (!fromEmail) {
        logger.warn("Email do remetente não configurado");
        return false;
      }

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || 'Press Ticket'}" <${fromEmail}>`,
        to,
        subject,
        text,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`E-mail enviado com sucesso para ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar e-mail: ${error}`);
      return false;
    }
  }

  public async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      if (!this.transporter) {
        logger.warn("Não foi possível verificar conexão: credenciais não configuradas");
        return false;
      }

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
