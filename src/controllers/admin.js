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
export async function createACurrency(req, res) {
  try {
    const user_email = req.user_email;
    const data = await createCurrency(user_email, req.body);

    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Invalid Request" });
    }
    if (data === "You are not allowed to carry this action") {
      logger.error("You are not allowed to carry this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry this action" });
    }
    if (data === "currency exists already") {
      logger.error("Currency exists already");
      return res.status(409).json({ error: "Currency exists already" });
    }
    if (data === "Invalid or Unsupported currency") {
      logger.error("Invalid or Unsupported currency");
      return res.status(400).json({ error: "Invalid or Unsupported currency" });
    }
    logger.info("CURRENCY CREATED SUCESSFULLY", data);
    return res.status(201).json({
      message: "CURRENCY CREATED SUCESSFULLY",
      details: data,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Retrieve user accounts with the same currency as the user's
export async function getTheUserAccountsWithSameCurrency(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getUserAccountWithSameCurrency(user_email, req.body);

    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Invalid Request" });
    }
    if (data === "You are not allowed to carry this action") {
      logger.error("You are not allowed to carry this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry this action" });
    }
    if (data === "No Account with specified currency available") {
      logger.error("No Account with specified currency available");
      return res
        .status(404)
        .json({ error: "No Account with specified currency available" });
    }
    logger.info("ACCOUNTS", data);
    return res.status(201).json({
      message: "ACCOUNTS",
      details: data,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Get details of a specific user's account based on account number
export async function getAUser(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getUserAccount(user_email, req.body);

    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Invalid Request" });
    }
    if (data === "You are not allowed to carry this action") {
      logger.error("You are not allowed to carry this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry this action" });
    }
    if (data === "No Account with account number available") {
      logger.error("No Account with account number available");
      return res
        .status(404)
        .json({ error: "No Account with account number available" });
    }
    logger.info("ACCOUNT", data);
    return res.status(201).json({
      message: "ACCOUNT",
      details: data,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
