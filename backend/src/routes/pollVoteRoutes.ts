import express from "express";
import * as PollVoteController from "../controllers/PollVoteController";
import isAuth from "../middleware/isAuth";

const pollVoteRoutes = express.Router();

pollVoteRoutes.get("/poll-votes/:pollMessageId/summary", isAuth, PollVoteController.getVotesSummary);
pollVoteRoutes.get("/poll-votes/:pollMessageId", isAuth, PollVoteController.getVotes);

export default pollVoteRoutes;
