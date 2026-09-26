// /admin/:user_id         // Close down a user's account
// */
// A default/ super admin can make other users admins.

// Admins can close down user accounts, but would send a warning email to the user before doing so..
import { AppError } from "../utils/AppError.js";
import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";
import { createAdminSchema, currencySchema } from "../validation/Schemas.js";
import { loginSchema } from "../validation/Schemas.js";
import { accountSchema } from "../validation/Schemas.js";
import { generateToken } from "../utils/jwt.js";
import { passwordMatches } from "../utils/hash.js";
import { sendAdminRegisterEmail } from "../utils/nodeMailer.js";
import { getCurrencyList } from "./layer.js";
import { isSupportedCurrency } from "./layer.js";
import { verifyAdminToken } from "../utils/jwt.js";
import { generateAdminToken } from "../utils/jwt.js";

export async function checkIfAdminExists(email) {
  const query = `
    SELECT COUNT(*) AS count
    FROM admin
    WHERE admin_email = $1
  `;

  const values = [email];

  const result = await pool.query(query, values);

  return Number(result.rows[0].count);
}

async function checkAdminEmail(email) {
  const query = `
    SELECT *
    FROM admin
    WHERE admin_email = $1
  `;

  const values = [email];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function checkIfCurrencyExists(currency_code) {
  const query = `
    SELECT COUNT(*) as count
    FROM currencies
    WHERE currency_code = $1
      `;
  const values = [currency_code];
  const result = await pool.query(query, values);
  return +result.rows[0].count;
}

// An admin would create an admin account.
export async function createAdminAccount(payload) {
  const { error, value } = createAdminSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { first_name, last_name, email, password, token } = value;

  try {
    const tokenVerified = await verifyAdminToken(token);

    if (!tokenVerified) {
      throw new AppError("Invalid admin token", 401);
    }

    const userExists = await checkIfAdminExists(email);

    if (userExists) {
      throw new AppError(
        "An admin with this email already exists",
        409
      );
    }

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO admin (
        first_name,
        last_name,
        admin_email,
        admin_password
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      first_name,
      last_name,
      email,
      hashedPassword,
    ];

    const result = await pool.query(query, values);

    const details = result.rows[0];

    const userData = {
      first_name: details.first_name,
      last_name: details.last_name,
      admin_email: details.admin_email,
    };

    const newToken = await generateToken({
      first_name,
      last_name,
      email,
    });

    // await sendAdminRegisterEmail(email);

    return {
      userData,
      newToken,
    };
  } catch (error) {
    throw error;
  }
}

// Authenticate an admin login and generate an authentication token.
export async function adminLogin(payload) {
  const { error, value } = loginSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { email, password } = value;

  try {
    const query = `
      SELECT *
      FROM admin
      WHERE admin_email = $1
    `;

    const result = await pool.query(query, [email]);

    if (!result.rows[0]) {
      throw new AppError("Invalid email or password", 401);
    }

    const admin = result.rows[0];

    const isMatch = await passwordMatches(
      password,
      admin.admin_password
    );

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await generateAdminToken({
      admin_id: admin.admin_id,
      email: admin.admin_email,
    });

    return token;
  } catch (error) {
    throw error;
  }
}

// Create a new currency account
export async function createCurrency(admin_email, payload) {
  const { error, value } = currencySchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { currency_code } = value;

  try {
    const adminConfirmed = await checkAdminEmail(admin_email);

    if (!adminConfirmed) {
      throw new AppError("You are not allowed to carry out this action", 403);
    }

    const currencyExists = await checkIfCurrencyExists(currency_code);

    if (currencyExists) {
      throw new AppError("Currency already exists", 409);
    }

    const { currencies } = await getCurrencyList();
    const isSupported = isSupportedCurrency(currency_code, currencies);

    if (!isSupported) {
      throw new AppError("Invalid or unsupported currency", 400);
    }

    const query = `
      INSERT INTO currencies (currency_code)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [currency_code]);

    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

function getUsersDetails(rows) {
  const userDetails = [];

  for (const row of rows) {
    const userDetail = {
      account_id: row.account_id,
      user_email: row.user_email,
      account_number: row.account_number,
      currency_code: row.currency_code,
      account_status: row.account_status,
    };

    userDetails.push(userDetail);
  }

  return userDetails;
}

// Admins can access users with the same currency, excluding sensitive details.
export async function getUserAccountWithSameCurrency(admin_email, payload) {
  const { error, value } = currencySchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { currency_code } = value;

  try {
    const adminConfirmed = await checkAdminEmail(admin_email);

    if (!adminConfirmed) {
      throw new AppError("You are not allowed to carry out this action", 403);
    }

    const query = `
      SELECT *
      FROM account
      WHERE currency_code = $1
    `;

    const result = await pool.query(query, [currency_code]);

    if (!result.rows[0]) {
      throw new AppError("No accounts with specified currency found", 404);
    }

    return getUsersDetails(result.rows);
  } catch (error) {
    throw error;
  }
}

// Check a user's account
export async function getUserAccount(admin_email, payload) {
  const { error, value } = accountSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { account_number } = value;

  try {
    const adminConfirmed = await checkAdminEmail(admin_email);

    if (!adminConfirmed) {
      throw new AppError("You are not allowed to carry out this action", 403);
    }

    const query = `
      SELECT *
      FROM account
      WHERE account_number = $1
    `;

    const result = await pool.query(query, [account_number]);

    if (!result.rows[0]) {
      throw new AppError("No account found with that account number", 404);
    }

    const details = {
      account_id: result.rows[0].account_id,
      user_email: result.rows[0].user_email,
      account_number: result.rows[0].account_number,
      currency_code: result.rows[0].currency_code,
      account_status: result.rows[0].account_status,
    };

    return details;
  } catch (error) {
    throw error;
  }
}
