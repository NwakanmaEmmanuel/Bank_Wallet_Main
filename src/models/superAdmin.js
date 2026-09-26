import { checkIfAdminExists } from "./admin.js";
import pool from "../config/db.js";
import { passwordMatches } from "../utils/hash.js";
import { generateAdminToken } from "../utils/jwt.js";
import { loginSchema } from "../validation/Schemas.js";
import { sendAdminRegisterTokenEmail } from "../utils/nodeMailer.js";
import { AppError } from "../utils/AppError.js";

export async function superAdminLogin(payload) {
  const { error, value } = loginSchema.validate(payload);

  if (error) {
    throw new AppError("Invalid Request", 400);
  }

  const { email, password } = value;

  try {
    const adminExists = await checkIfAdminExists(email);

    if (!adminExists) {
      throw new AppError("Invalid email or password", 401);
    }

    const query = `
      SELECT admin_password
      FROM admin
      WHERE admin_email = $1
    `;

    const result = await pool.query(query, [email]);

    const dbPassword = result.rows[0].admin_password;

    const isMatch = await passwordMatches(password, dbPassword);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = await generateAdminToken({ email });

    return token;
  } catch (error) {
    throw error;
  }
}

export async function sendAdminToken(super_admin_email, payload) {
  const { first_name, last_name, email } = payload;

  if (!first_name || !last_name || !email) {
    throw new AppError("Invalid Request", 400);
  }

  try {
    const adminExists = await checkIfAdminExists(super_admin_email);

    if (!adminExists) {
      throw new AppError("You are not allowed to carry out this action", 403);
    }

    const token = await generateAdminToken({ first_name, last_name, email });
    console.log("ADMIN TOKEN:", token);
    await sendAdminRegisterTokenEmail(email, token);

    return true;
  } catch (error) {
    throw error;
  }
}