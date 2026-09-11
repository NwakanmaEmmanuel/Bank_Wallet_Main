import { withdraw } from "../models/withdrawals.js";
import { getWithdrawal } from "../models/withdrawals.js";
import { getWithdrawalsOnAccount } from "../models/withdrawals.js";
import logger from "../config/logger.js";

export async function withdrawCash(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await withdraw(user_email, req.body);

    if (!data) {
      return res.status(400).json({ error: "Invalid Request" });
    }

    logger.info("Withdrawal successful", data.resulting);

    return res.status(201).json({
      message: "Withdrawal successful",
      withdrawal_details: data.resulting,
      balance: data.now_balance,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAWithdrawal(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getWithdrawal(user_email, req.body);

    if (!data) {
      return res.status(400).json({ error: "Invalid Request" });
    }

    logger.info("Withdrawal details", data);

    return res.status(200).json({
      message: "Withdrawal details",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWithdrawalOnAnAccount(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getWithdrawalsOnAccount(user_email, req.body);

    if (!data) {
      return res.status(400).json({ error: "Invalid Request" });
    }

    logger.info("Withdrawal(s)", data);

    return res.status(200).json({
      message: "Withdrawal(s)",
      details: data,
    });
  } catch (error) {
    next(error);
  }
}