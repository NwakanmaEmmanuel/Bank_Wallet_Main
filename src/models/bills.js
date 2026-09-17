import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { payBillSchema } from "../validation/Schemas.js";
import { getBillSchema } from "../validation/Schemas.js";
import { getBillsOnAccountSchema } from "../validation/Schemas.js";
import { currencyConverter } from "./layer.js";

// Retrieve the account balance of a user's account.
async function getAccountBalance(account_number) {
  const query = `
    SELECT account_balance 
    FROM account 
    WHERE account_number = $1`;
  const { rows } = await client.query(query, [account_number]);
  return rows[0].account_balance;
}

// Retrieve the account balance and currency code for a receiver's account.
async function getReceiverAccountBalance(account_number) {
  const query = `
      SELECT *
      FROM account 
      WHERE account_number = $1 `;
  const values = [account_number];
  const { rows } = await client.query(query, values);
  const balance = parseFloat(rows[0].account_balance);
  const currency = rows[0].currency_code;
  return { balance, currency };
}

// Update the account balance of a user's account.
async function updateAccountBalance(account_number, amount) {
  const query = `
    UPDATE account
    SET account_balance = $1
    WHERE account_number = $2
    RETURNING *
  `;
  const values = [amount, account_number];
  const result = await client.query(query, values);
  return result.rows[0];
}

// Make a bill payment
export async function makeBillPayment(user_email, payload) {
  const { error, value } = payBillSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const {
    account_number,
    bill_type,
    bill_account_number,
    amount,
    currency_code,
    description,
  } = value;

  if (
    bill_type !== "airtime" &&
    bill_type !== "betting" &&
    bill_type !== "electricity"
  ) {
    throw new AppError(
      "We currently do not support this bill type at the moment",
      400
    );
  }

  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    // Get sender account
    const senderQuery = `
      SELECT *
      FROM account
      WHERE account_number = $1
        AND user_email = $2
    `;

    const senderValues = [account_number, user_email];

    const senderResult = await dbClient.query(
      senderQuery,
      senderValues
    );

    if (!senderResult.rows[0]) {
      throw new AppError(
        "You are not allowed to carry out this action",
        403
      );
    }

    const senderBalance = parseFloat(
      senderResult.rows[0].account_balance
    );

    const senderCurrency = senderResult.rows[0].currency_code;

    if (senderBalance < amount) {
      throw new AppError("Insufficient funds", 400);
    }

    // Get receiver account
    const receiverQuery = `
      SELECT *
      FROM account
      WHERE account_number = $1
    `;

    const receiverResult = await dbClient.query(
      receiverQuery,
      [bill_account_number]
    );

    if (!receiverResult.rows[0]) {
      throw new AppError(
        "No account associated with provided account number",
        404
      );
    }

    const receiverBalance = parseFloat(
      receiverResult.rows[0].account_balance
    );

    const receiverCurrency = receiverResult.rows[0].currency_code;

    let receiverAmount;

    if (currency_code !== receiverCurrency) {
      const data = await currencyConverter(
        receiverCurrency,
        currency_code,
        amount
      );

      receiverAmount = data.result;
    } else {
      receiverAmount = amount;
    }

    const newSenderBalance = senderBalance - amount;
    const newReceiverBalance = receiverBalance + receiverAmount;

    // Update sender
    const updateSenderQuery = `
      UPDATE account
      SET account_balance = $1
      WHERE account_number = $2
        AND currency_code = $3
      RETURNING *
    `;

    const senderUpdateResult = await dbClient.query(
      updateSenderQuery,
      [
        newSenderBalance.toFixed(2),
        account_number,
        senderCurrency,
      ]
    );

    // Update receiver
    const updateReceiverQuery = `
      UPDATE account
      SET account_balance = $1
      WHERE account_number = $2
        AND currency_code = $3
      RETURNING *
    `;

    const receiverUpdateResult = await dbClient.query(
      updateReceiverQuery,
      [
        newReceiverBalance.toFixed(2),
        bill_account_number,
        receiverCurrency,
      ]
    );

    // Record bill payment
    const billQuery = `
      INSERT INTO bills
      (
        user_email,
        bill_type,
        description,
        source_account_number,
        currency_code,
        amount,
        bill_account_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const billValues = [
      user_email,
      bill_type,
      description,
      account_number,
      currency_code,
      amount,
      bill_account_number,
    ];

    const billResult = await dbClient.query(
      billQuery,
      billValues
    );

    await dbClient.query("COMMIT");

    return billResult.rows[0];
  } catch (error) {
    await dbClient.query("ROLLBACK");

    console.error("Bill payment failed:", error.message);

    throw error;
  } finally {
    dbClient.release();
  }
}

// Make a bill payment and update account balances accordingly.
export async function getBillPayment(user_email, payload) {
  const { value, error } = getBillSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number, bill_id } = value;

  try {
    const query = `
      SELECT *
      FROM bills
      WHERE bill_id = $1
        AND source_account_number = $2
        AND user_email = $3
    `;

    const values = [bill_id, account_number, user_email];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new AppError("No bill found", 404);
    }

    return result.rows[0];
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// Retrieve bill details associated with a specific account.
export async function getBillsOnAccount(user_email, payload) {
  const { value, error } = getBillsOnAccountSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number } = value;

  try {
    const query = `
      SELECT *
      FROM bills
      WHERE source_account_number = $1
        AND user_email = $2
    `;

    const values = [account_number, user_email];

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new AppError("No bills found for this account", 404);
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
