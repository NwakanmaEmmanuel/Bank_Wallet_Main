import express from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import logger from "./src/config/logger.js";
import cors from "cors";
import superAdminRoute from "./src/routes/superAdminRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import authUserRoute from "./src/routes/userAuthroute.js";
import accountRoute from "./src/routes/accountRoute.js";
import depositRoute from "./src/routes/depositRoute.js";
import transferRoute from "./src/routes/transferRoute.js";
import billRoute from "./src/routes/billRoute.js";
import withdrawalsRoute from "./src/routes/withdrawalRoute.js";
import transactionRoute from "./src/routes/transactionRoute.js";
import morgan from "morgan";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let accessLogStream = fs.createWriteStream(join(__dirname, "access.log"), {
  flags: "a",
});

app.use(morgan("combined"));

app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(cors());

app.use("/authUser", authUserRoute);
app.use("/superAdmin", superAdminRoute);
app.use("/admin", adminRoute);
app.use("/account", accountRoute);
app.use("/deposit", depositRoute);
app.use("/transfer", transferRoute);
app.use("/bill-payment", billRoute);
app.use("/withdraw", withdrawalsRoute);
app.use("/transaction", transactionRoute);

const PORT = process.env.PORT || 6000;
// Global error handler — must be after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
