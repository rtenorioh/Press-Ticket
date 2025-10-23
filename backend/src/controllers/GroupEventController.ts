import { Request, Response } from "express";
import GroupEventService from "../services/GroupEventService";
import AppError from "../errors/AppError";

export const listEvents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    whatsappId,
    groupId,
    eventType,
    limit,
    offset
  } = req.query;

  const { events, count } = await GroupEventService.listEvents({
    whatsappId: whatsappId ? Number(whatsappId) : undefined,
    groupId: groupId as string,
    eventType: eventType as string,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined
  });

  return res.json({ events, count });
};

export const getEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { eventId } = req.params;

  const event = await GroupEventService.getEventById(Number(eventId));

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return res.json(event);
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { eventId } = req.params;

  await GroupEventService.deleteEvent(Number(eventId));

  return res.json({ message: "Event deleted successfully" });
};

export const deleteOldEvents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { days } = req.body;

  const deleted = await GroupEventService.deleteOldEvents(
    days ? Number(days) : 30
  );

  return res.json({ 
    message: `${deleted} old events deleted successfully`,
    deleted 
  });
};

export const getGroupStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { groupId } = req.params;

  const stats = await GroupEventService.getStatsByGroup(groupId);

  return res.json(stats);
};

export const getWhatsappStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  const stats = await GroupEventService.getStatsByWhatsapp(Number(whatsappId));

  return res.json(stats);
};
