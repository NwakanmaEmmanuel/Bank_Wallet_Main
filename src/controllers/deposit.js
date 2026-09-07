import { depositToAccount } from "../models/deposit.js";
import { getDeposit } from "../models/deposit.js";
import { getDepositsOnAccount } from "../models/deposit.js";
import logger from "../config/logger.js";

// Deposit funds into an account
export async function depositToAnAccount(req, res) {
  try {
    const user_email = req.user_email;
    const data = await depositToAccount(user_email, req.body);
    if (!data) {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (data === "You are not allowed to carry out this action") {
      logger.error("You are not allowed to carry out this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry out this action" });
    }
    logger.info("Deposit successful", data.resulting);
    return res.status(201).json({
      message: "Deposit successful",
      deposit_details: data.resulting,
      balance: data.now_balance,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Get details for a specific deposit on an account
// Get details for a specific deposit on an account
export async function getADeposit(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getDeposit(user_email, req.body);

    logger.info("Deposit details", data);

    return res.status(200).json({
      message: "Deposit details",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get deposits associated with a user's account
export async function getDepositsOnAnAccount(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getDepositsOnAccount(user_email, req.body);
    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (!data) {
      logger.error("No deposit found");
      return res.status(404).json({ error: "No deposit found" });
    }
    if (data === "You are not allowed to carry out this action") {
      logger.error("You are not allowed to carry out this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry out this action" });
    }
    logger.info("Deposit details", data);
    return res.status(201).json({
      message: "Deposit details",
      details: data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
