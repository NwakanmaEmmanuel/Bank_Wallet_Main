import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { depositSchema } from "../validation/Schemas.js";
import { getDepositSchema } from "../validation/Schemas.js";
import { getDepositsOnAccountSchema } from "../validation/Schemas.js";
import { currencyConverter } from "./layer.js";

// Deposit funds into a user's account, updating balance and recording the transaction.
// Deposit funds into a user's account, updating balance and recording the transaction.
export async function depositToAccount(user_email, payload) {
  const { error, value } = depositSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const {
    account_number,
    amount,
    deposit_currency,
    description,
  } = value;

  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    const query = `
      SELECT *
      FROM account
      WHERE account_number = $1 AND user_email = $2
    `;

    const values = [account_number, user_email];

    const result = await dbClient.query(query, values);

    if (!result.rows[0]) {
      throw new AppError(
        "You are not allowed to carry out this action",
        403
      );
    }

    const account_currency = result.rows[0].currency_code;
    const account_balance = parseFloat(
      result.rows[0].account_balance
    );

    let deposit_amount;
    let deposit_currency_code;

    if (account_currency !== deposit_currency) {
      // Currency Conversion
      const data = await currencyConverter(
        account_currency,
        deposit_currency,
        amount
      );

      deposit_amount = data.result;
      deposit_currency_code = account_currency;
    } else {
      deposit_amount = amount;
      deposit_currency_code = deposit_currency;
    }

    const new_balance = account_balance + deposit_amount;
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
      INSERT INTO deposits
      (user_email, description, account_number, amount, currency_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values3 = [
      user_email,
      description,
      account_number,
      amount,
      deposit_currency_code,
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

    console.error("Deposit failed:", error.message);

    throw error;
  } finally {
    dbClient.release();
  }
}

// Retrieve the details of a specific deposit.
// Retrieve the details of a specific deposit.
export async function getDeposit(user_email, payload) {
  const { value, error } = getDepositSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number, deposit_id } = value;

  try {
    const query = `
      SELECT *
      FROM deposits
      WHERE deposit_id = $1
        AND account_number = $2
    `;

    const values = [deposit_id, account_number];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new AppError("No deposit found", 404);
    }

    if (result.rows[0].user_email !== user_email) {
      throw new AppError(
        "You are not allowed to carry out this action",
        403
      );
    }

    return result.rows[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Retrieve details of deposits associated with a specific account.
// Retrieve details of deposits associated with a specific account.
export async function getDepositsOnAccount(user_email, payload) {
  const { value, error } = getDepositsOnAccountSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number } = value;

  try {
    const query = `
      SELECT *
      FROM deposits
      WHERE account_number = $1
        AND user_email = $2
    `;

    const values = [account_number, user_email];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new AppError("No deposit found", 404);
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
