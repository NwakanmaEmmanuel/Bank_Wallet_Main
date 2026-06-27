import client from "../config/db.js";

// Create a default Bank account in(NGN)
export async function createDefaultAccount(user_email) {
  const currency = "NGN";
  const balance = 0.0;
  const status = true;
  try {
    const checkQuery = `
    SELECT account_number
    FROM account
    WHERE user_email = $1 AND currency_code = $2
  `;
    const checkValues = [user_email, currency];
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      console.error("User already has an account in this currency.");
      return false;
    }

    const query1 = `
    INSERT INTO account(user_email, currency_code, account_balance, account_status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
    const values = [user_email, currency, balance, status];
    const result = await client.query(query1, values);
    const account_details = result.rows[0];
    console.log("Account created successfully");
    return { account_details };
  } catch (error) {
    console.error(error.message);
    throw err;
  }
}
// Create a currency Bank account in any of the three available currencies
export async function createAccountInACurrency(user_email, currency) {
  const balance = 0.0;
  const status = true;
  try {
    // Check if the user already has an account in the same currency
    const checkQuery = `
      SELECT account_number
      FROM account
      WHERE user_email = $1 AND currency_code = $2
    `;
    const checkValues = [user_email, currency];
    const checkResult = await client.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      console.error("User already has an account in this currency.");
      return false;
    }
    //Create the account
    const query1 = `
      INSERT INTO account(user_email, currency_code, account_balance, account_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_email, currency, balance, status];
    const result = await client.query(query1, values);
    const account_details = result.rows[0];
    console.log(`Account details: ${JSON.stringify(account_details)}`);
    return { account_details };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
// Get their accounts
export async function getAccounts(user_email) {
  try {
    const query = `
      SELECT account_number, currency_code, account_balance
      FROM account
      WHERE user_email = $1
    `;
    const values = [user_email];
    const result = await client.query(query, values);
    console.log(result.rows);
    if (result.rows.length > 0) {
      return result.rows;
    }
    console.error("No accounts associated with this user");
    return false;
  } catch (err) {
    console.error(err.message);
    throw error;
  }
}

// Get a specific account
export async function getSpecificAccount(user_email, account_number) {
  try {
    const query = `
      SELECT user_email, account_number, currency_code, account_balance
      FROM account
      WHERE user_email= $1 AND account_number = $2
    `;
    const values = [user_email, account_number];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      console.error("No account found for the given user and account number.");
      return false;
    }

    console.log(result.rows);
    return result.rows;
  } catch (err) {
    console.error(err.message);
    throw error;
  }
}

// Delete a specific account
// /accounts/:id
export async function deleteAccount(user_email, account_number) {
  try {
    const query = `
      DELETE FROM account
      WHERE user_email = $1 AND account_number = $2
      RETURNING *
    `;
    const values = [user_email, account_number];
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      console.error("No account found for the given user and account number.");
      return false;
    }
    console.log(result.rows);
    return result.rows;
  } catch (err) {
    console.error(err.message);
    throw error;
  }
}
