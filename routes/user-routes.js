const express = require("express");
const userControllers = require("../controllers/usercontroller");
const { authenticate } = require("../middleware/auth-middleware");
const router = express.Router();

router.post("/register", userControllers.register);
router.post("/login", userControllers.login);
router.get("/profile", authenticate, userControllers.profile);
router.get("/mentors", authenticate, userControllers.getMentors);
router.get("/mentors/popular", authenticate, userControllers.getPopularMentors);

router.post("/review", authenticate, userControllers.addOrUpdateReview);
router.post("/rating", authenticate, userControllers.addOrUpdateRating);
router.get("/review/:userId", authenticate, userControllers.getReviews);

module.exports = router;
