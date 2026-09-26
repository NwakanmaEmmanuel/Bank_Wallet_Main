import { superAdminLogin } from "../models/superAdmin.js";
import { sendAdminToken } from "../models/superAdmin.js";
import logger from "../config/logger.js";

export async function logSuperAdmin(req, res, next) {
  try {
    const token = await superAdminLogin(req.body);

    logger.info("Super admin login successful");

    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendAnAdminToken(req, res, next) {
  try {
    const admin_email = req.admin_email;

    await sendAdminToken(admin_email, req.body);

    logger.info("Admin token sent");

    return res.status(200).json({
      message: "Admin token has been sent",
    });
  } catch (error) {
    next(error);
  }
}