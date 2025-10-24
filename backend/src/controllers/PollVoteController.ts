import { Request, Response } from "express";
import PollVoteService from "../services/PollVoteService";
import AppError from "../errors/AppError";

export const getVotesSummary = async (req: Request, res: Response): Promise<Response> => {
  const { pollMessageId } = req.params;

  if (!pollMessageId) {
    throw new AppError("ID da mensagem de enquete é obrigatório", 400);
  }

  const summary = await PollVoteService.getVotesSummary(pollMessageId);

  if (!summary) {
    throw new AppError("Enquete não encontrada", 404);
  }

  return res.json(summary);
};

export const getVotes = async (req: Request, res: Response): Promise<Response> => {
  const { pollMessageId } = req.params;

  if (!pollMessageId) {
    throw new AppError("ID da mensagem de enquete é obrigatório", 400);
  }

  const votes = await PollVoteService.getVotesByPollId(pollMessageId);

  return res.json(votes);
};
