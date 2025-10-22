import express from "express";
import isAuth from "../middleware/isAuth";
import * as CacheController from "../controllers/CacheController";

const cacheRoutes = express.Router();

cacheRoutes.get("/cache/stats", isAuth, CacheController.getCacheStats);
cacheRoutes.get("/cache/keys", isAuth, CacheController.getCacheKeys);
cacheRoutes.post("/cache/flush", isAuth, CacheController.flushCache);

export default cacheRoutes;
