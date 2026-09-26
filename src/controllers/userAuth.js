import logger from "../config/logger.js";
import { createUserProfile, userLogin, sendResetLink, reset } from "../models/userAuth.js";

export async function createAUserProfile(req, res, next) {
  try {
    const data = await createUserProfile(req.body);

    if (!data) {
      return res.status(400).json({ error: "Invalid Request" });
    }

    const { userData, token } = data;

    logger.info("Registration successful", userData);

    res.cookie("token", token);

    return res.status(201).json({
      message: "Registration successful",
      your_details: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function logUser(req, res, next) {
  try {
    const token = await userLogin(req.body);

    logger.info("Login successful");

    res.cookie("token", token, { httpOnly: true });

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendAResetLink(req, res, next) {
  try {
    await sendResetLink(req.body);

    logger.info("Reset link sent");

    return res.status(200).json({
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email } = req.user;

    await reset(email, req.body);

    logger.info("Password updated successfully");

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
}