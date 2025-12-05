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

    if (!fullName || !email || !role || !password) {
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

userControllers.getMentors = async (req, res) => {
  var search = req.query.search || "";

  var matchQuery = {};

  if (search) {
    matchQuery.fullName = { $regex: search, $options: "i" };
  }

  var mentors = await User.find({ role: "MENTOR", ...matchQuery }).select(
    "-__v -password"
  );

  return res.status(200).json({ ok: true, mentors });
};

userControllers.getAllUsers = async (req, res) => {
  var search = req.query.search || "";

  var matchQuery = {};

  if (search) {
    matchQuery.fullName = { $regex: search, $options: "i" };
  }

  var users = await User.find({ ...matchQuery }).select(
    "-__v -password"
  );

  return res.status(200).json({ ok: true, users });
};
userControllers.addOrUpdateReview = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ ok: false, error: "The request Body is missing" });
  }
  // console.log("addOrUpdateReview triggered");

  var { mentorId, comment } = req.body;
  // console.log(req.body);

  var ratingUserId = req.user._id;
  // console.log(ratingUserId);
  var ratedUser = await User.findById(mentorId);

  //  console.log("ratedUser : ", ratedUser);

  if (!ratedUser) throw Error("User not found");

  const existingReview = ratedUser.reviews.find(
    (rev) => rev.userId.toString() === ratingUserId.toString()
  );
  // console.log("existingReview : ", existingReview);
  if (existingReview) {
    existingReview.comment = comment;
    existingReview.createdAt = Date.now();
  } else {
    // console.log("else triggered");

    // console.log(ratedUser.reviews);

    ratedUser.reviews.push({
      userId: ratingUserId,
      comment,
    });
  }

  await ratedUser.save();
  res.status(200).json({ ok: true, message: "Review added successfully" });
};
userControllers.addOrUpdateRating = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ ok: false, error: "The request Body is missing" });
  }

  var { mentorId, value } = req.body;
  console.log(req.body);

  var ratingUserId = req.user._id;

  var ratedUser = await User.findById(mentorId);

  console.log("ratedUser : ", ratedUser);
  // console.log("lessonDoc : ", lessonDoc);

  if (!ratedUser) {
    res.status(404).json({ ok: false, message: "User not found" });
  }

  const existingRating = ratedUser.ratings.find(
    (rat) => rat.userId.toString() === ratingUserId.toString()
  );
  // console.log("existingRating : ", existingRating);
  if (existingRating) {
    existingRating.value = value;
    existingRating.createdAt = Date.now();
  } else {
    ratedUser.ratings.push({
      userId: ratingUserId,
      value,
    });
  }

  if (ratedUser.ratings.length > 0) {
    const total = ratedUser.ratings.reduce((acc, curr) => acc + curr.value, 0);
    ratedUser.ratingsSummary.count = ratedUser.ratings.length;
    ratedUser.ratingsSummary.average = total / ratedUser.ratings.length;
  }

  await ratedUser.save();
  return res
    .status(200)
    .json({ ok: true, message: "Rating updated successfully" });
};
userControllers.getReviews = async (req, res) => {
  // console.log("get reviews triggered");

  var { userId } = req.params;
  // console.log(lessonId);

  var user = await User.findById(userId).populate({
    path: "reviews.userId",
    select: "fullName",
    model: "user",
  });

  // console.log("lessonDoc : ", lessonDoc);

  if (!user) {
    res.status(404).json({ ok: false, message: "User not found" });
  }

  res.status(200).json({
    ok: true,
    reviews: user.reviews,
  });
};

userControllers.getPopularMentors = async (req, res) => {
  var userId = req.user._id;
  const mentors = await User.find({
    "ratingsSummary.count": { $gt: 0 },
    _id: { $ne: userId },
  })
    .sort({
      "ratingsSummary.average": -1,
    })
    .select("-__v -password")
    .lean();

  return res.json({ ok: true, mentors });
};

module.exports = userControllers;
