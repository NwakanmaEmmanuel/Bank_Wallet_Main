import { getAllTransactions } from "../models/transactions.js";
import logger from "../config/logger.js";
import { generatePDF } from "../utils/pdfMaker.js";

export async function getAllTheTransactions(req, res, next) {
  try {
    const user_email = req.user_email;

    const transactions = await getAllTransactions(user_email);

    if (!transactions) {
      return res.status(404).json({
        error: "No transactions found for this account",
      });
    }

    logger.info("Transactions retrieved", transactions);

    return res.status(200).json({
      message: "Transactions",
      details: transactions,
    });
  } catch (error) {
    next(error);
  }
}