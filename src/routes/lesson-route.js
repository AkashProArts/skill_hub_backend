const express = require("express");
 const { isMentor } = require("../middleware/auth-middleware");
const lessonControllers = require("../controllers/lessoncontroller");
 
const router = express.Router();

router.post("/create", isMentor, lessonControllers.create);

router.get("/", lessonControllers.getAllLessons);
router.get("/my", lessonControllers.getLessonsByMentorId);
router.get("/popular", lessonControllers.popularLessons);

router.post('/review', lessonControllers.addOrUpdateReview);
router.post('/rating', lessonControllers.addOrUpdateRating);

router.get("/review/:lessonId", lessonControllers.getReviews);
 router.get("/:lessonId", lessonControllers.getLessonByLessonId);

module.exports = router;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                