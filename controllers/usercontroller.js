const User = require("../models/user");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const saltRounds = 10;

const userControllers = {};

userControllers.register = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ ok: false, error: "The request body is missing!" });
    }
    var { fullName, email, role, password } = req.body;

    if (!fullName || !ema. il || !role || !password) {
      return res.status(400).json({
        ok: false,
        error: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        ok: false,
        error: "Email already exists",
      });

    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = User({
      fullName,
      email,
      role,
      password: hashedPassword,
    });
    await newUser.save();
    return res.json({
      ok: true,
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in register: ", error.message);

    return res.status(400).json({
      ok: false,
      error: error.message,
    });
  }
};
userControllers.login = async (req, res) => {
  console.log("login triggered");

  try {
    if (
      !req.body
      //  || Object.keys(req.body).length ==0
    ) {
      return res
        .status(400)
        .json({ ok: false, error: "The request body is missing!" });
    }

    var { email, password } = req.body;
    console.log("email :", email);

    const missingField = [];

    if (!email) missingField.push("email");
    if (!password) missingField.push("password");

    if (missingField.length > 0) {
      return res.status(400).json({
        ok: false,
        error: `Missing required field(s): ${missingField.join(",")}`,
      });
    }

    const user = await User.findOne({ email }).select();

    if (!user)
      return res.status(400).json({
        ok: false,
        error: "User not exists",
      });
    // console.log("Password : ", password);
    // console.log("User.Password : ", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ ok: false, error: "Invalid credentials" });
    }
    var { _id, role } = user;

    var token = await jwt.sign(
      {
        _id,
        role,
      },
      process.env.JWT_SECRET_KEY
    );

    return res.json({
      ok: true,
      token: token,
      role,
    });
  } catch (error) {
    console.error("Error in login: ", error.message);

    return res.status(500).json({
      ok: false,
      error: "Server error. Please try again later",
    });
  }
};

userControllers.profile = async (req, res) => {
  const { _id } = req.user;

  var user = await User.findById(_id).select("-_id -__v -password");

  return res.status(200).json({ ok: true, user });
};

module.exports = userControllers;
  