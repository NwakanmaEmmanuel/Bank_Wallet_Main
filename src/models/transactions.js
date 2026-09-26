/*
// Get all transactions details on a specific account
/accounts/:account_id/transactions

// Initiate a file download on account transactions
/accounts/:account_id/transactions/download
*/

import pool from "../config/db.js";

export async function getAllTransactions(user_email) {
  try {
    const deposits = await pool.query(
      `SELECT 'deposit' AS type, deposit_id AS id, amount, 
        currency_code, description, deposit_date AS date
       FROM deposits
       WHERE user_email = $1`,
      [user_email]
    );

    const withdrawals = await pool.query(
      `SELECT 'withdrawal' AS type, withdrawal_id AS id, amount,
        currency_code, description, withdrawal_date AS date
       FROM withdrawals
       WHERE user_email = $1`,
      [user_email]
    );

    const transfers = await pool.query(
      `SELECT 'transfer' AS type, transfer_id AS id, amount,
        currency_code, description, transfer_date AS date
       FROM transfers
       WHERE user_email = $1`,
      [user_email]
    );

    const bills = await pool.query(
      `SELECT 'bill' AS type, bill_id AS id, amount,
        currency_code, description, bill_date AS date
       FROM bills
       WHERE user_email = $1`,
      [user_email]
    );

    const all = [
      ...deposits.rows,
      ...withdrawals.rows,
      ...transfers.rows,
      ...bills.rows,
    ];

    if (all.length === 0) {
      return false;
    }

    return all;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}