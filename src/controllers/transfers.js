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
// Get details for a specific transfer
export async function getATransfer(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getTransfer(user_email, req.body);

    if (!data) {
      return res.status(400).json({
        error: "Invalid Request",
      });
    }

    logger.info("Transfer details", data);

    return res.status(200).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get transfers associated with a user's account
export async function getTransfersOnAnAccount(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getTransfersOnAccount(user_email, req.body);

    if (!data) {
      return res.status(400).json({
        error: "No transfers found",
      });
    }

    logger.info("Transfer details", data);

    return res.status(200).json({
      message: "Transfer details",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}
