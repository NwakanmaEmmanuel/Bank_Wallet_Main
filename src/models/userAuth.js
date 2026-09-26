import pool from "../config/db.js";
import { hashPassword, passwordMatches } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { createProfileSchema, loginSchema, resetSchema } from "../validation/Schemas.js";
import { sendEmail, sendRegisterEmail } from "../utils/nodeMailer.js";
import { AppError } from "../utils/AppError.js";

async function checkIfUserExists(email) {
  const query = `
    SELECT COUNT(*) AS count
    FROM users
    WHERE user_email = $1
  `;
  const result = await pool.query(query, [email]);
  return Number(result.rows[0].count);
}

export async function createUserProfile(payload) {
  const { error, value } = createProfileSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { first_name, last_name, email, password } = value;

  try {
    const userExists = await checkIfUserExists(email);

    if (userExists) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO users (first_name, last_name, user_email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [first_name, last_name, email, hashedPassword]);

    const details = result.rows[0];

    const userData = {
      first_name: details.first_name,
      last_name: details.last_name,
      user_email: details.user_email,
    };

    const token = await generateToken({ email });

    await sendRegisterEmail(email);

    return { userData, token };
  } catch (error) {
    throw error;
  }
}

export async function userLogin(payload) {
  const { error, value } = loginSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { email, password } = value;

  try {
    const query = `
      SELECT password
      FROM users
      WHERE user_email = $1
    `;

    const result = await pool.query(query, [email]);

    if (!result.rows[0]) {
      throw new AppError("Invalid email or password", 401);
    }

    const dbPassword = result.rows[0].password;

    const isMatch = await passwordMatches(password, dbPassword);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await generateToken({ email });

    return token;
  } catch (error) {
    throw error;
  }
}

export const sendResetLink = async (payload) => {
  const { error, value } = resetSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { email } = value;

  try {
    const userExists = await checkIfUserExists(email);

    if (!userExists) {
      throw new AppError("User not found", 404);
    }

    const token = await generateToken({ email });

    await sendEmail(email, token);

    return true;
  } catch (error) {
    throw error;
  }
};

export async function reset(user_email, userPassword) {
  const { password, confirm_password } = userPassword;

  if (password !== confirm_password) {
    throw new AppError("Passwords don't match", 400);
  }

  try {
    const hashedPassword = await hashPassword(confirm_password);

    const query = `
      UPDATE users
      SET password = $1
      WHERE user_email = $2
      RETURNING *
    `;

    const result = await pool.query(query, [hashedPassword, user_email]);

    if (result.rowCount === 0) {
      throw new AppError("Unable to update password", 404);
    }

    return true;
  } catch (error) {
    throw error;
  }
}