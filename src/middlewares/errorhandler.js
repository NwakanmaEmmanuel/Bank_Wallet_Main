import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;

  const errorMessage = err.message || "INTERNAL SERVER ERROR";

  res.status(statusCode).json({
    error: errorMessage,
  });
};