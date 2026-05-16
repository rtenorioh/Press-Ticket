import { Request, Response } from "express";
import { Op } from "sequelize";
import Contact from "../models/Contact";
import Email from "../models/Email";
import EmailAttachment from "../models/EmailAttachment";
import { SendEmailHubService } from "../services/HubServices/SendEmailHubService";
import { logger } from "../utils/logger";

// GET /emails?whatsappId=&folder=&page=&limit=&isStarred=true
export const index = async (req: Request, res: Response): Promise<Response> => {
  const folder = (req.query.folder as string) || "";
  const isStarredParam = req.query.isStarred === "true";
  const whatsappId = Number(req.query.whatsappId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  if (!whatsappId) {
    return res.status(400).json({ error: "whatsappId é obrigatório." });
  }

  const offset = (page - 1) * limit;

  // Starred view: show from all non-trash folders
  // Trash: show soft-deleted. Others: exclude deleted.
  let whereClause: any;
  if (isStarredParam) {
    whereClause = {
      whatsappId,
      isStarred: true,
      deletedAt: { [Op.is]: null as any }
    };
  } else if (folder === "trash") {
    whereClause = { whatsappId, folder: "trash" };
  } else {
    whereClause = {
      whatsappId,
      folder: folder || "inbox",
      deletedAt: { [Op.is]: null as any }
    };
  }

  try {
    const { count, rows } = await Email.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "email", "profilePicUrl"]
        },
        {
          model: EmailAttachment,
          as: "attachments",
          attributes: ["id", "filename", "mimeType", "fileUrl", "direction"]
        }
      ],
      attributes: [
        "id",
        "messageId",
        "whatsappId",
        "contactId",
        "direction",
        "fromAddress",
        "toAddress",
        "subject",
        "bodyHtml",
        "bodyText",
        "folder",
        "isRead",
        "isStarred",
        "hubStatus",
        "createdAt",
        "updatedAt"
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    return res.status(200).json({
      emails: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error(`EmailController.index: ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};

// GET /emails/counts?whatsappId=
export const countFolders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const whatsappId = Number(req.query.whatsappId);
  if (!whatsappId) {
    return res.status(400).json({ error: "whatsappId é obrigatório." });
  }
  try {
    const [inbox, sent, starred, trash] = await Promise.all([
      Email.count({
        where: {
          whatsappId,
          folder: "inbox",
          isRead: false,
          deletedAt: { [Op.is]: null as any }
        }
      }),
      Email.count({
        where: {
          whatsappId,
          folder: "sent",
          deletedAt: { [Op.is]: null as any }
        }
      }),
      Email.count({
        where: {
          whatsappId,
          isStarred: true,
          deletedAt: { [Op.is]: null as any }
        }
      }),
      Email.count({ where: { whatsappId, folder: "trash" } })
    ]);
    return res.status(200).json({ inbox, sent, starred, trash });
  } catch (error) {
    logger.error(`EmailController.countFolders: ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};

// GET /emails/:id
export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const email = await Email.findByPk(id, {
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "email", "profilePicUrl"]
        },
        {
          model: EmailAttachment,
          as: "attachments"
        }
      ]
    });

    if (!email) {
      return res.status(404).json({ error: "Email não encontrado." });
    }

    // Mark as read on open
    if (!email.isRead) {
      await email.update({ isRead: true });
    }

    return res.status(200).json(email);
  } catch (error) {
    logger.error(`EmailController.show: ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};

// POST /emails/attachment — upload de arquivo para anexo de email
export const uploadAttachment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado." });
  }
  const backendUrl = process.env.WEBHOOK;
  const filename = encodeURIComponent(file.filename);
  return res.status(200).json({
    fileUrl: `${backendUrl}/public/${filename}`,
    fileName: file.originalname
  });
};

// POST /emails
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId, to, subject, htmlBody, textBody, attachments } = req.body;

  if (!whatsappId) {
    return res.status(400).json({ error: "whatsappId é obrigatório." });
  }
  if (!to) {
    return res.status(400).json({ error: "Destinatário (to) é obrigatório." });
  }
  if (!subject?.trim() && !htmlBody?.trim() && !textBody?.trim()) {
    return res
      .status(400)
      .json({ error: "Assunto ou conteúdo são obrigatórios." });
  }

  try {
    const email = await SendEmailHubService({
      whatsappId: Number(whatsappId),
      to,
      subject: subject || "",
      htmlBody,
      textBody,
      attachments: Array.isArray(attachments) ? attachments : undefined
    });

    return res.status(201).json(email);
  } catch (error) {
    logger.error(`EmailController.store: ${error}`);
    return res.status(400).json({ error: String(error) });
  }
};

// PUT /emails/:id
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { isRead, isStarred, folder } = req.body;

  const validFolders = ["inbox", "sent", "trash", "draft"];

  try {
    const email = await Email.findByPk(id);

    if (!email) {
      return res.status(404).json({ error: "Email não encontrado." });
    }

    const changes: Record<string, any> = {};

    if (typeof isRead === "boolean") changes.isRead = isRead;
    if (typeof isStarred === "boolean") changes.isStarred = isStarred;
    if (folder && validFolders.includes(folder)) changes.folder = folder;

    await email.update(changes);

    return res.status(200).json(email);
  } catch (error) {
    logger.error(`EmailController.update: ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};

// DELETE /emails/:id  — soft delete (move to trash)
export const destroy = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const email = await Email.findByPk(id);

    if (!email) {
      return res.status(404).json({ error: "Email não encontrado." });
    }

    if (email.folder === "trash") {
      // Already in trash — hard delete
      await email.destroy();
      return res
        .status(200)
        .json({ message: "Email excluído permanentemente." });
    }

    await email.update({ folder: "trash", deletedAt: new Date() });

    return res.status(200).json({ message: "Email movido para lixeira." });
  } catch (error) {
    logger.error(`EmailController.destroy: ${error}`);
    return res.status(500).json({ error: String(error) });
  }
};
