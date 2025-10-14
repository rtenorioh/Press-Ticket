import express from "express";
import isAuth from "../middleware/isAuth";

import * as ClientStatusController from "../controllers/ClientStatusController";

const clientStatusRoutes = express.Router();

clientStatusRoutes.get("/client-status/statistics", isAuth, ClientStatusController.statistics);
clientStatusRoutes.get("/client-status", isAuth, ClientStatusController.index);
clientStatusRoutes.post("/client-status", isAuth, ClientStatusController.store);
clientStatusRoutes.put("/client-status/:clientStatusId", isAuth, ClientStatusController.update);
clientStatusRoutes.get("/client-status/:clientStatusId", isAuth, ClientStatusController.show);
clientStatusRoutes.delete("/client-status/:clientStatusId", isAuth, ClientStatusController.remove);
clientStatusRoutes.delete("/client-status", isAuth, ClientStatusController.removeAll);

export default clientStatusRoutes;
