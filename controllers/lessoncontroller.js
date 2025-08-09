const lessonControllers = {};
const { model } = require("mongoose");
const Lesson = require("../models/lesson.js");

lessonControllers.create = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ ok: false, error: "The request Body is missing" });
  }
  var { title, content } = req.body;
  const { _id } = req.user;

  var missingField = [];
  if (!title) missingField.push("title");
  if (!content) missingField.push("content");

  if (missingField.length > 0) {
    return res.status(400).json({
      ok: false,
      error: `Missing required field(s) : ${missingField.join(", ")}`,
    });
  }

  var lesson = Lesson({
    mentorId: _id,
    title,
    content,
    lessonType: "DOC",
  });

  await lesson.save();

  return res.json({ ok: true, message: "Lesson created Successfully" });
};

lessonControllers.getAllLessons = async (req, res) => {
  const search = req.query.search || "";

  // console.log("search", search);
  const matchQuery = {};

  if (search) {
    matchQuery.title = { $regex: search, $options: "i" };
  }

  var lessons = await Lesson.find(matchQuery)
    .select("-__v -mentorId")
    .populate({ path: "mentorId", select: "fullName", model: "user" });
  var formattedLessons = formatLessons(lessons).reverse();

  return res.status(200).json({ ok: true, lessons: formattedLessons });
};
lessonControllers.getLessonsByMentorId = async (req, res) => {
  const { _id } = req.user;

  console.log("Id", _id);
  var lessons = await Lesson.find({ mentorId: _id })
    .select("-__v -mentorId")
    .populate({ path: "mentorId", select: "fullName", model: "user" });

  var formattedLessons = formatLessons(lessons).reverse();

  return res.status(200).json({ ok: true, lessons: formattedLessons });
};
lessonControllers.getLessonByLessonId = async (req, res) => {
  const { _id: userId } = req.user;
  const { lessonId } = req.params;

  var lesson = await Lesson.findById(lessonId)
    .select("-__v")
    .populate({ path: "mentorId", select: "fullName", model: "user" })
    .lean();
  // /.select(-__v -mentorId).lean();

  if (!lesson) {
    return res.status(404).json({ ok: false, message: "Invalid lesson Id" });
  }
  // console.log("Id", userId);
  // console.log("lessonId", lessonId);

  if (lesson.mentorId != userId) {
    await Lesson.updateOne({ _id: lessonId }, { $addToSet: { views: userId } });
  }
  console.log("lesson", lesson);

  var formattedLesson = formatSingleLesson(lesson);

  return res.status(200).json({ ok: true, lesson: formattedLesson });
};

function formatLessons(lessons) {
  return lessons.map((lesson) => ({
    id: lesson._id,

    title: lesson.title,
    lessonType: lesson.lessonType,
    content: lesson.content,
    mentor: {
      fullName: lesson.mentorId.fullName,
    },
    views: lesson.views,
  }));
}
function formatSingleLesson(lesson) {
  return {
    id: lesson._id,
    title: lesson.title,
    lessonType: lesson.lessonType,
    content: lesson.content,
    mentor: {
      fullName: lesson.mentorId.fullName,
    },
    views: lesson.views,

  };
}

module.exports = lessonControllers;
