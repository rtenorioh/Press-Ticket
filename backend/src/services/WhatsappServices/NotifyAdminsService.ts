import EmailService from "../EmailService";
import FindAdminUsersService from "../UserServices/FindAdminUsersService";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  whatsappId: number;
}

const NotifyAdminsService = async ({ whatsappId }: Request): Promise<void> => {
  const whatsapp = await Whatsapp.findByPk(whatsappId);

  if (!whatsapp) {
    throw new AppError("Canal não encontrado", 404);
  }

  if (whatsapp.status === "CONNECTED") {
    return;
  }

  const adminUsers = await FindAdminUsersService({
    profiles: ["admin", "masteradmin"]
  });

  if (adminUsers.length === 0) {
    return;
  }

  const emailService = EmailService.getInstance();

  const subject = `Alerta: Canal ${whatsapp.name} com status ${whatsapp.status}`;
  
  let statusColor = "#FFA500";
  if (whatsapp.status === "DISCONNECTED") {
    statusColor = "#FF0000";
  } else if (whatsapp.status === "qrcode") {
    statusColor = "#3498db";
  }
  
  const updatedDate = new Date(whatsapp.updatedAt).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
  
  const text = `
    Olá,
    
    O canal ${whatsapp.name} está com status ${whatsapp.status}.
    
    Detalhes do canal:
    - ID: ${whatsapp.id}
    - Nome: ${whatsapp.name}
    - Número: ${whatsapp.number || "N/A"}
    - Status: ${whatsapp.status}
    - Última atualização: ${updatedDate}
    
    Por favor, verifique o sistema para mais detalhes.
    
    Este é um e-mail automático, não responda.
  `;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta de Status do Canal</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-height: 60px;
        }
        .content {
          padding: 20px 0;
        }
        .alert-box {
          background-color: #f8f9fa;
          border-left: 4px solid ${statusColor};
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          background-color: ${statusColor};
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        .details {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
        }
        .details-table td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        .details-table td:first-child {
          font-weight: bold;
          width: 40%;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #25D366;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Alerta de Status do Canal</h2>
        </div>
        <div class="content">
          <p>Olá,</p>
          
          <div class="alert-box">
            <p>O canal <strong>${whatsapp.name}</strong> está com status <span class="status-badge">${whatsapp.status}</span></p>
          </div>
          
          <h3>Detalhes do Canal:</h3>
          <div class="details">
            <table class="details-table">
              <tr>
                <td>ID:</td>
                <td>${whatsapp.id}</td>
              </tr>
              <tr>
                <td>Nome:</td>
                <td>${whatsapp.name}</td>
              </tr>
              <tr>
                <td>Número:</td>
                <td>${whatsapp.number || "N/A"}</td>
              </tr>
              <tr>
                <td>Status:</td>
                <td><span class="status-badge">${whatsapp.status}</span></td>
              </tr>
              <tr>
                <td>Última atualização:</td>
                <td>${updatedDate}</td>
              </tr>
            </table>
          </div>
          
          <p>Por favor, verifique o sistema para mais detalhes.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/connections" class="button">Verificar Canais</a>
          </div>
        </div>
        
        <div class="footer">
          <p>Este é um e-mail automático, não responda.</p>
          <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Press Ticket'}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  for (const user of adminUsers) {
    if (user.email) {
      const sent = await emailService.sendEmail({
        to: user.email,
        subject,
        text,
        html
      });
      
      if (!sent) {
        console.error(`Falha ao enviar e-mail para ${user.email}`);
      }
    }
  }
};

export default NotifyAdminsService;
