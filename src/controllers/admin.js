import logger from "../config/logger.js";
import { createAdminAccount } from "../models/admin.js";
import { adminLogin } from "../models/admin.js";
import { createCurrency } from "../models/admin.js";
import { getUserAccountWithSameCurrency } from "../models/admin.js";
import { getUserAccount } from "../models/admin.js";

//Create admin Account
export async function createAnAdminAccount(req, res, next) {
  try {
    const data = await createAdminAccount(req.body);

    if (!data) {
      return res.status(400).json({ error: "Invalid Request" });
    }

    const { userData, newToken } = data;

    logger.info("Admin registration successful");

    res.cookie("token", newToken);

    return res.status(201).json({
      message: "Admin registration successful",
      your_details: userData,
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
}
// Log in an admin user and set a cookie with the user's token
export async function logAdmin(req, res, next) {
  try {
    const token = await adminLogin(req.body);

    logger.info("Admin login successful");

    res.cookie("token", token, {
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
}

// Create a new currency with specific user details
export async function createACurrency(req, res, next) {
  try {
    const admin_email = req.admin_email;

    const data = await createCurrency(admin_email, req.body);

    logger.info("Currency created successfully", data);

    return res.status(201).json({
      message: "Currency created successfully",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Retrieve user accounts with the same currency as the user's
export async function getTheUserAccountsWithSameCurrency(req, res, next) {
  try {
    const admin_email = req.admin_email;

    const data = await getUserAccountWithSameCurrency(admin_email, req.body);

    logger.info("Accounts retrieved", data);

    return res.status(200).json({
      message: "Accounts",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get details of a specific user's account based on account number
export async function getAUser(req, res, next) {
  try {
    const admin_email = req.admin_email;

    const data = await getUserAccount(admin_email, req.body);

    logger.info("Account retrieved", data);

    return res.status(200).json({
      message: "Account",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}
