import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate a JSON Web Token (JWT) with the provided payload
export async function generateToken(payload) {
  const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return generatedToken;
}

// Verify and decode a JWT to extract the payload
export async function verifyToken(generatedToken) {
  return jwt.verify(generatedToken, process.env.JWT_SECRET);
}

export async function generateAdminToken(payload) {
  const generatedToken = jwt.sign(payload, process.env.ADMIN_JWT_SECRET, {
    expiresIn: "1h",
  });
  return generatedToken;
}

export async function verifyAdminToken(generatedToken) {
  return jwt.verify(generatedToken, process.env.ADMIN_JWT_SECRET);
}
