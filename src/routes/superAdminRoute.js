import express from "express";
const superAdminRoute = express.Router();

import { logSuperAdmin } from "../controllers/superAdmin.js";
import { sendAnAdminToken } from "../controllers/superAdmin.js";
import { authAdmin } from "../middlewares/authAdmin.js";

superAdminRoute.post("/login", logSuperAdmin);
superAdminRoute.post("/send-token", authAdmin, sendAnAdminToken);

export default superAdminRoute;
