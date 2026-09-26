import { verifyAdminToken } from "../utils/jwt.js";

export const authAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "UNAUTHORIZED",
    });
  }

  try {
    const decoded = await verifyAdminToken(token);

    const { email } = decoded;

    req.admin_email = email;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "INVALID ADMIN TOKEN",
    });
  }
};