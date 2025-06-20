const express = require("express");
const lessoncontroller = require("../controllers/lessoncontroller");
const { isMentor } = require("../middleware/auth-middleware");
const lessonControllers = require("../controllers/lessoncontroller");

const router = express.Router();

router.post("/create", isMentor, lessoncontroller.create);

router.get("/", lessoncontroller.getAllLessons);
router.get("/my", lessoncontroller.getLessonsByMentorId);

router.get("/:lessonId", lessoncontroller.getSingleLesson);

 
module.exports = router;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                