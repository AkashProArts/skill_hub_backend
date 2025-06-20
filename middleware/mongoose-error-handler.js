const mongoose = require("mongoose");

const errorHandler = async (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res
      .status(409)
      .json({
        ok: false,
        error: `Duplicate field : ${field} value already exists`,
        field,
      });
  }
};

module.exports= errorHandler;
