//Account Transfers

import pool from "../config/db.js";
import { currencyConverter } from "./layer.js";
import { transferSchema } from "../validation/Schemas.js";
import { getTransferSchema } from "../validation/Schemas.js";
import { getTransfersOnAccountSchema } from "../validation/Schemas.js";

// Retrieve the account balance of a user's account.
async function getAccountBalance(db, account_number, email) {
  const query = `
    SELECT account_balance
    FROM account
    WHERE user_email = $1 AND account_number = $2
  `;

  const values = [email, account_number];

  const { rows } = await db.query(query, values);

  if (rows.length === 0) {
    return null;
  }

  return parseFloat(rows[0].account_balance);
}

// Retrieve the account balance and currency code for a receiver's account.
async function getReceiverAccountBalance(db, account_number) {
  const query = `
    SELECT account_balance, currency_code
    FROM account
    WHERE account_number = $1
  `;

  const values = [account_number];

  const { rows } = await db.query(query, values);

  if (rows.length === 0) {
    return null;
  }

  return {
    balance: parseFloat(rows[0].account_balance),
    currency: rows[0].currency_code,
  };
}

// Update the account balance of a user's account.
async function updateAccountBalance(db, account_number, amount) {
  const query = `
    UPDATE account
    SET account_balance = $1
    WHERE account_number = $2
    RETURNING *
  `;

  const values = [amount, account_number];

  const result = await db.query(query, values);

  return result.rows[0];
}

// Transfer funds from one user's account to another.
export async function transferToAccount(user_email, payload) {
  const { error, value } = transferSchema.validate(payload);

  if (error) {
    console.log(error);
    return false;
  }

  const {
    user_account_number,
    receiver_account_number,
    amount,
    currency_code,
    description,
  } = value;

  // Get a connection from the PostgreSQL pool
  const dbClient = await pool.connect();

  try {
    // Start the transaction
    await dbClient.query("BEGIN");

    // Get sender's balance
    const sender_account_balance = await getAccountBalance(
      dbClient,
      user_account_number,
      user_email
    );

    if (sender_account_balance === null) {
      await dbClient.query("ROLLBACK");
      return "You are not allowed to carry out this action";
    }

    // Check if sender has enough money
    if (sender_account_balance < amount) {
      await dbClient.query("ROLLBACK");
      return "Insufficient funds";
    }

    // Get receiver's account
    const receiver = await getReceiverAccountBalance(
      dbClient,
      receiver_account_number
    );

    if (!receiver) {
      await dbClient.query("ROLLBACK");
      return "No user with the provided account number exists";
    }

    const receiver_currency = receiver.currency;
    const receiver_balance = receiver.balance;

    let new_balance_sender;
    let new_balance_receiver;

    // Currency conversion if necessary
    if (currency_code !== receiver_currency) {
      const data = await currencyConverter(
        receiver_currency,
        currency_code,
        amount
      );

      const converted_amount = data.result;

      new_balance_sender = sender_account_balance - amount;
      new_balance_receiver = receiver_balance + converted_amount;
    } else {
      new_balance_sender = sender_account_balance - amount;
      new_balance_receiver = receiver_balance + amount;
    }

    // Update sender's balance
    await updateAccountBalance(
      dbClient,
      user_account_number,
      new_balance_sender
    );

    // Update receiver's balance
    await updateAccountBalance(
      dbClient,
      receiver_account_number,
      new_balance_receiver.toFixed(2)
    );

    // Record the transfer
    const query = `
      INSERT INTO transfers (
        user_email,
        description,
        account_number,
        amount,
        currency_code,
        third_party_acct_no
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      user_email,
      description,
      user_account_number,
      amount,
      currency_code,
      receiver_account_number,
    ];

    const transferResult = await dbClient.query(query, values);

    // Everything succeeded
    await dbClient.query("COMMIT");

    console.log("Transfer Successful");

    return transferResult.rows[0];
  } catch (err) {
    // Something failed, undo all database changes
    await dbClient.query("ROLLBACK");

    console.error("Transfer failed:", err.message);

    throw err;
  } finally {
    // Return the connection to the pool
    dbClient.release();
  }
}

// Retrieve the details of a specific transfer.
export async function getTransfer(user_email, payload) {
  const { value, error } = getTransferSchema.validate(payload);
  if (error) {
    console.log(error);
    return "Invalid Request";
  }
  const { account_number, transfer_id } = value;
  try {
    const query = `
      SELECT *
      FROM transfers
      WHERE transfer_id = $1 AND account_number = $2
    `;
    const values = [transfer_id, account_number];
    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      console.log("No transfer found");
      return "No transfer found";
    }

    if (result.rows[0].user_email !== user_email) {
      console.log("You are not allowed to carry out this action");
      return "You are not allowed to carry out this action";
    }

    console.log(result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error(err.message);
    throw err;
  }
}

// Retrieve details of transfers on a specific account.
export async function getTransfersOnAccount(user_email, payload) {
  const { value, error } = getTransfersOnAccountSchema.validate(payload);
  if (error) {
    console.log(error);
    return "Invalid Request";
  }
  const { account_number } = value;
  try {
    const query = `
      SELECT *
      FROM transfers
      WHERE account_number = $1 
    `;
    const values = [account_number];
    const result = await pool.query(query, values);
    if (!result.rows[0]) {
      return false;
    }
    if (result.rows[0].user_email !== user_email) {
      console.log("You are not allowed to carry out this action");
      return "You are not allowed to carry out this action";
    }

    return result.rows;
  } catch (error) {
    console.error(err.message);
    throw err;
  }
}
