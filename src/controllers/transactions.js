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

    res.writeHead(200, {
  "Content-Type": "application/pdf",
  "Content-Disposition": "attachment;filename=transaction-history.pdf",
});

generatePDF(
  JSON.stringify(transactions, null, 2),
  (chunk) => res.write(chunk),
  () => res.end()
);
  } catch (error) {
    next(error);
  }
}