import {
  createAccountInACurrency,
  createDefaultAccount,
  getAccounts,
  getSpecificAccount,
  deleteAccount,
} from "../models/account.js";
import logger from "../config/logger.js";

export async function createADefaultAccount(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await createDefaultAccount(user_email);

    if (!data) {
      return res.status(409).json({
        error: "User already has an account in our base currency",
      });
    }

    logger.info("Account created successfully", data.account_details);

    return res.status(201).json({
      message: "Account created successfully",
      account_details: data.account_details,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAnAccountInACurrency(req, res, next) {
  try {
    const user_email = req.user_email;
    const currency = req.body.currency_code;

    const data = await createAccountInACurrency(user_email, currency);

    if (!data) {
      return res.status(409).json({
        error: "User already has an account in this currency",
      });
    }

    logger.info("Account created successfully", data.account_details);

    return res.status(201).json({
      message: "Account created successfully",
      account_details: data.account_details,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTheAccounts(req, res, next) {
  try {
    const user_email = req.user_email;

    const data = await getAccounts(user_email);

    if (!data) {
      return res.status(404).json({
        error: "No accounts associated with this user",
      });
    }

    logger.info("User accounts retrieved", data);

    return res.status(200).json({
      message: "User accounts",
      accounts: data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getASpecificAccount(req, res, next) {
  try {
    const user_email = req.user_email;
    const account_number = req.body.account_number;

    const data = await getSpecificAccount(user_email, account_number);

    if (!data) {
      return res.status(404).json({
        error: `No account with account number ${account_number} exists`,
      });
    }

    logger.info("Account retrieved", data);

    return res.status(200).json({
      message: "Account",
      account: data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnAccount(req, res, next) {
  try {
    const user_email = req.user_email;
    const account_number = req.body.account_number;

    const data = await deleteAccount(user_email, account_number);

    if (!data) {
      return res.status(404).json({
        error: `No account with account number ${account_number} exists`,
      });
    }

    logger.info("Account deleted successfully", data);

    return res.status(200).json({
      message: "Account deleted successfully",
      account: data,
    });
  } catch (error) {
    next(error);
  }
}