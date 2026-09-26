import express from "express";
const adminRoute = express.Router();

import { authAdmin } from "../middlewares/authAdmin.js";
import { createAnAdminAccount } from "../controllers/admin.js";
import { logAdmin } from "../controllers/admin.js";
import { createACurrency } from "../controllers/admin.js";
import { getTheUserAccountsWithSameCurrency } from "../controllers/admin.js";
import { getAUser } from "../controllers/admin.js";
// import { authUser } from "../middlewares/authuser.js";

adminRoute.post("/create-admin-account", createAnAdminAccount);
adminRoute.post("/log-admin", logAdmin);

adminRoute.post("/create-a-currency", authAdmin, createACurrency);

adminRoute.get(
  "/get-users-with-same-currency",
  authAdmin,
  getTheUserAccountsWithSameCurrency
);

adminRoute.get("/get-a-user", authAdmin, getAUser);

export default adminRoute;
