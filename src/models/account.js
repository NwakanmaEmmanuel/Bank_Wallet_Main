import pool from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export async function createDefaultAccount(user_email) {
  const currency = "NGN";
  const balance = 0.0;
  const status = true;

  try {
    const checkQuery = `
      SELECT account_number
      FROM account
      WHERE user_email = $1
        AND currency_code = $2
    `;

    const checkResult = await pool.query(checkQuery, [user_email, currency]);

    if (checkResult.rows.length > 0) {
      return false;
    }

    const query = `
      INSERT INTO account (user_email, currency_code, account_balance, account_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [user_email, currency, balance, status]);

    return { account_details: result.rows[0] };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function createAccountInACurrency(user_email, currency) {
  const balance = 0.0;
  const status = true;

  try {
    const checkQuery = `
      SELECT account_number
      FROM account
      WHERE user_email = $1
        AND currency_code = $2
    `;

    const checkResult = await pool.query(checkQuery, [user_email, currency]);

    if (checkResult.rows.length > 0) {
      return false;
    }

    const query = `
      INSERT INTO account (user_email, currency_code, account_balance, account_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [user_email, currency, balance, status]);

    return { account_details: result.rows[0] };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function getAccounts(user_email) {
  try {
    const query = `
      SELECT account_number, currency_code, account_balance
      FROM account
      WHERE user_email = $1
    `;

    const result = await pool.query(query, [user_email]);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function getSpecificAccount(user_email, account_number) {
  try {
    const query = `
      SELECT user_email, account_number, currency_code, account_balance
      FROM account
      WHERE user_email = $1
        AND account_number = $2
    `;

    const result = await pool.query(query, [user_email, account_number]);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

export async function deleteAccount(user_email, account_number) {
  try {
    const query = `
      DELETE FROM account
      WHERE user_email = $1
        AND account_number = $2
      RETURNING *
    `;

    const result = await pool.query(query, [user_email, account_number]);

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}