import pool from "../config/db.js";

import {
  getWithdrawalsOnAccountSchema,
  withdrawSchema,
  getWithdrawalSchema,
} from "../validation/Schemas.js";

import { AppError } from "../utils/AppError.js";

// Withdraw funds from a user's account, updating balance and recording the transaction.
export async function withdraw(user_email, payload) {
  const { error, value } = withdrawSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const {
    account_number,
    amount,
    account_currency,
    description,
  } = value;

  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    const query = `
      SELECT *
      FROM account
      WHERE account_number = $1
        AND user_email = $2
    `;

    const values = [account_number, user_email];

    const result = await dbClient.query(query, values);

    if (!result.rows[0]) {
      throw new AppError(
        "You are not allowed to carry out this action",
        403
      );
    }

    const account_balance = parseFloat(
      result.rows[0].account_balance
    );

    if (account_balance < amount) {
      throw new AppError("Insufficient funds", 400);
    }

    const new_balance = account_balance - amount;
    const new_balance_db = new_balance.toFixed(2);

    const query2 = `
      UPDATE account
      SET account_balance = $1
      WHERE account_number = $2
        AND currency_code = $3
      RETURNING *
    `;

    const values2 = [
      new_balance_db,
      account_number,
      account_currency,
    ];

    const result2 = await dbClient.query(query2, values2);

    const now_balance = result2.rows[0].account_balance;

    const query3 = `
      INSERT INTO withdrawals
      (user_email, description, account_number, amount, currency_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values3 = [
      user_email,
      description,
      account_number,
      amount,
      account_currency,
    ];

    const result3 = await dbClient.query(query3, values3);

    const resulting = result3.rows[0];

    await dbClient.query("COMMIT");

    return {
      resulting,
      now_balance,
    };
  } catch (error) {
    await dbClient.query("ROLLBACK");

    console.error("Withdrawal failed:", error.message);

    throw error;
  } finally {
    dbClient.release();
  }
}

// Retrieve the details of a specific withdrawal.
export async function getWithdrawal(user_email, payload) {
  const { value, error } = getWithdrawalSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number, withdrawal_id } = value;

  try {
    const query = `
      SELECT *
      FROM withdrawals
      WHERE withdrawal_id = $1
        AND account_number = $2
        AND user_email = $3
    `;

    const values = [withdrawal_id, account_number, user_email];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new AppError("No withdrawal found", 404);
    }

    return result.rows[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Retrieve details of withdrawals associated with a specific account.
export async function getWithdrawalsOnAccount(user_email, payload) {
  const { value, error } = getWithdrawalsOnAccountSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number, currency_code } = value;

  try {
    const query = `
      SELECT *
      FROM withdrawals
      WHERE account_number = $1
        AND currency_code = $2
        AND user_email = $3
    `;

    const values = [account_number, currency_code, user_email];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new AppError("No withdrawals found", 404);
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
