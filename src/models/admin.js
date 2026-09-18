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

    const result = await client.query(query, values);

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

    await sendAdminRegisterEmail(email);

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
    return "Invalid Request";
  }
  const { email, password } = value;
  try {
    const adminExists = await checkIfAdminExists(email);
    if (!adminExists) {
      console.log("Admin doesn't exist");
      return "Admin doesn't exist";
    }
    const query = `
        SELECT admin_password
        FROM admin
        WHERE admin_email = $1
        `;
    const values = [email];
    const result = await client.query(query, values);
    const dbPassword = result.rows[0].admin_password;
    const isMatch = await passwordMatches(password, dbPassword);
    if (!isMatch) {
      console.log("passwords don't match");
      return false;
    }
    const token = await generateToken(value);
    console.log("Login Successful, user token generated");
    console.log(token);
    return token;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// Create a new currency account
export async function createCurrency(admin_email, payload) {
  const { error, value } = currencySchema.validate(payload);
  if (error) {
    return "Invalid Request";
  }
  const { currency_code } = value;
  console.log(admin_email);

  try {
    const adminConfirmed = await checkAdminEmail(admin_email);
    if (!adminConfirmed) {
      console.log("You are not allowed to carry this action");
      return "You are not allowed to carry this action";
    }

    const currencyExists = await checkIfCurrencyExists(currency_code);
    if (currencyExists) {
      console.log("currency exists already");
      return "currency exists already";
    }

    const { currencies } = await getCurrencyList();
    const data = await isSupportedCurrency(currency_code, currencies);
    if (!data) {
      console.log("Invalid or Unsupported currency");
      return "Invalid or Unsupported currency";
    }
    console.log(data);

    const query = `
    INSERT INTO currencies(currency_code)
    VALUES ($1)
    RETURNING *
    `;

    const values = [currency_code];
    const result = await client.query(query, values);
    console.log(result.rows);
    return result.rows[0];
  } catch (error) {
    console.log(error.message);
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
    return "Invalid Request";
  }
  const { currency_code } = value;
  try {
    const adminConfirmed = await checkAdminEmail(admin_email);
    if (!adminConfirmed) {
      console.log("You are not allowed to carry this action");
      return "You are not allowed to carry this action";
    }
    const query = `
    SELECT *
    FROM account
    WHERE currency_code = $1
    `;
    const values = [currency_code];
    const result = await client.query(query, values);
    console.log(result.rows[0]);
    if (!result.rows[0]) {
      console.log("No Account with specified currency available");
      return "No Account with specified currency available";
    }

    const userDetails = getUsersDetails(result.rows);
    console.log(userDetails);

    return userDetails;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// Check a user's account
export async function getUserAccount(admin_email, payload) {
  const { error, value } = accountSchema.validate(payload);
  if (error) {
    return "Invalid Request";
  }
  const { account_number } = value;
  try {
    const adminConfirmed = await checkAdminEmail(admin_email);
    if (!adminConfirmed) {
      console.log("You are not allowed to carry this action");
      return "You are not allowed to carry this action";
    }
    const query = `
    SELECT *
    FROM account
    WHERE account_number = $1
    `;
    const values = [account_number];
    const result = await client.query(query, values);
    if (!result.rows[0]) {
      console.log("No Account with account number available");
      return "No Account with account number available";
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
    console.log(error.message);
    throw error;
  }
}
