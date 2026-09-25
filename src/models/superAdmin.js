import { checkIfAdminExists } from "./admin.js";
import client from "../config/db.js";
import { passwordMatches } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { generateAdminToken } from "../utils/jwt.js";
import { loginSchema } from "../validation/Schemas.js";
import { createAdminSchema } from "../validation/Schemas.js";
import { sendAdminRegisterTokenEmail } from "../utils/nodeMailer.js";

export async function superAdminLogin(payload) {
  const { error, value } = loginSchema.validate(payload);

  if (error) {
    return "Invalid Request";
  }

  const { email, password } = value;

  try {
    const adminExists = await checkIfAdminExists(email);

    if (!adminExists) {
      return "Admin doesn't exist";
    }

    const query = `
      SELECT admin_password
      FROM admin
      WHERE admin_email = $1
    `;

    const result = await client.query(query, [email]);

    const dbPassword = result.rows[0].admin_password;

    const isMatch = await passwordMatches(password, dbPassword);

    if (!isMatch) {
      return false;
    }

    const token = await generateToken({ email });

    return token;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export async function sendAdminToken(super_admin_email, payload) {
  const { first_name, last_name, email } = payload;

  if (!first_name || !last_name || !email) {
    return "Invalid Request";
  }

  try {
    const adminExists = await checkIfAdminExists(super_admin_email);

    if (!adminExists) {
      return "Admin does not exist";
    }

    const token = await generateAdminToken({ first_name, last_name, email });
    console.log("ADMIN TOKEN:", token);
    await sendAdminRegisterTokenEmail(email, token);

    return "DONE";
  } catch (error) {
    throw error;
  }
}
