import { superAdminLogin } from "../models/superAdmin.js";
import { sendAdminToken } from "../models/superAdmin.js";
import logger from "../config/logger.js";

export async function logSuperAdmin(req, res) {
  try {
    const data = await superAdminLogin(req.body);

    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Invalid Request" });
    }
    if (data === "Admin doesn't exist") {
      logger.error("Admin doesn't exist");
      return res.status(401).json({ error: "Invalid Email/ Password" });
    }
    if (!data) {
      logger.error("Invalid Email/ Password");
      return res.status(401).json({ error: "Invalid Email/ Password" });
    }
    logger.info("LOGIN SUCESSFUL", data);
    res.cookie("token", data, { httpOnly: true });
    return res.status(201).json({
      message: "LOGIN SUCESSFUL",
      token: data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

export async function sendAnAdminToken(req, res) {
  try {
    const admin_email = req.user_email;
    const data = await sendAdminToken(admin_email, req.body);
    if (!data) {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Invalid Request" });
    }
    if (data === "Admin does not exist") {
      logger.error("Admin does not exist");
      return res
        .status(404)
        .json({ error: "You are not allowed to carry out this action" });
    }
    logger.info("ADMIN TOKEN HAS BEEN SENT");
    return res.status(201).json({
      message: "ADMIN TOKEN HAS BEEN SENT",
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
