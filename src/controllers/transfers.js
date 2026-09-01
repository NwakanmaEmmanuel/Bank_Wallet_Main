import { transferToAccount } from "../models/tranfers.js";
import { getTransfer } from "../models/tranfers.js";
import { getTransfersOnAccount } from "../models/tranfers.js";
import logger from "../config/logger.js";

// Transfer funds to another account
export async function transferToAnAccount(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await transferToAccount(user_email, req.body);

    if (!data) {
      return res.status(400).json({
        error: "Invalid Request",
      });
    }

    logger.info("Transfer successful", data);

    return res.status(201).json({
      message: "Transfer successful",
      transfer_details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get details for a specific transfer
export async function getATransfer(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getTransfer(user_email, req.body);
    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (data === "No transfer found") {
      logger.error("No transfer found");
      return res.status(404).json({ error: "No transfer found" });
    }
    if (data === "You are not allowed to carry out this action") {
      logger.error("You are not allowed to carry out this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry out this action" });
    }
    logger.info("Transfer details", data);
    return res.status(201).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

// Get transfers associated with a user's account
export async function getTransfersOnAnAccount(req, res) {
  try {
    const user_email = req.user_email;
    const data = await getTransfersOnAccount(user_email, req.body);
    if (data === "Invalid Request") {
      logger.error("Invalid Request");
      return res.status(400).json({ error: "Error Invalid Request" });
    }
    if (!data) {
      logger.error("No transfers found");
      return res.status(400).json({ error: "No transfers found" });
    }
    if (data === "You are not allowed to carry out this action") {
      logger.error("You are not allowed to carry out this action");
      return res
        .status(401)
        .json({ error: "You are not allowed to carry out this action" });
    }
    logger.info("Transfer details", data);
    return res.status(201).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
