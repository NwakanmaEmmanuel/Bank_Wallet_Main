import { makeBillPayment } from "../models/bills.js";
import { getBillPayment } from "../models/bills.js";
import { getBillsOnAccount } from "../models/bills.js";
import logger from "../config/logger.js";

// Make a bill payment
export async function makeABillPayment(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await makeBillPayment(user_email, req.body);

    logger.info("Bill payment successful", data);

    return res.status(201).json({
      message: "Bill payment successful",
      bill_details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get details for a specific bill payment
export async function getABillPayment(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getBillPayment(user_email, req.body);

    logger.info("Bill payment details", data);

    return res.status(200).json({
      message: "Bill payment details",
      bill_details: data,
    });
  } catch (error) {
    next(error);
  }
}

// Get bills associated with a user's account
export async function getBillsOnAnAccount(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getBillsOnAccount(user_email, req.body);

    logger.info("Bill payments", data);

    return res.status(200).json({
      message: "Bill payments",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}