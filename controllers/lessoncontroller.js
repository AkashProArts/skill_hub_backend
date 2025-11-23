const lessonControllers = {};
const { model } = require("mongoose");
const Lesson = require("../models/lesson.js");
const e = require("express");

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
  // console.log("lesson", lesson);

  var formattedLesson = formatSingleLesson(lesson);

  return res.status(200).json({ ok: true, lesson: formattedLesson });
};

lessonControllers.addOrUpdateReview = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ ok: false, error: "The request Body is missing" });
  }

  var { lessonId, comment } = req.body;

  var userId = req.user._id;

  var lessonDoc = await Lesson.findById(lessonId);

  console.log("userId : ", userId);
  // console.log("lessonDoc : ", lessonDoc);

  if (!lessonDoc) throw new Error("Lesson not found");

  const existingReview = lessonDoc.reviews.find(
    (rev) => rev.userId.toString() === userId.toString()
  );
  // console.log("existingReview : ", existingReview);
  if (existingReview) {
    existingReview.comment = comment;
    existingReview.createdAt = Date.now();
  } else {
    lessonDoc.reviews.push({
      userId,
      comment,
    });
  }

  await lessonDoc.save();
  res.status(200).json({ ok: true, message: "Review added successfully" });
};
lessonControllers.addOrUpdateRating = async (req, res) => {
  if (!req.body) {
    return res
      .status(400)
      .json({ ok: false, error: "The request Body is missing" });
  }

  var { lessonId, value } = req.body;
  console.log(req.body);

  var userId = req.user._id;

  var lessonDoc = await Lesson.findById(lessonId);

  console.log("userId : ", userId);
  // console.log("lessonDoc : ", lessonDoc);

  if (!lessonDoc) {
    res.status(404).json({ ok: false, message: "Lesson not found" });
  }

  const existingRating = lessonDoc.ratings.find(
    (rat) => rat.userId.toString() === userId.toString()
  );
  // console.log("existingRating : ", existingRating);
  if (existingRating) {
    existingRating.value = value;
    existingRating.createdAt = Date.now();
  } else {
    lessonDoc.ratings.push({
      userId,
      value,
    });
  }

  if (lessonDoc.ratings.length > 0) {
    const total = lessonDoc.ratings.reduce((acc, curr) => acc + curr.value, 0);
    lessonDoc.ratingsSummary.count = lessonDoc.ratings.length;
    lessonDoc.ratingsSummary.average = total / lessonDoc.ratings.length;
  }

  await lessonDoc.save();
  res.status(200).json({ ok: true, message: "Rating updated successfully" });
};
lessonControllers.getReviews = async (req, res) => {
  // console.log("get reviews triggered");

  var { lessonId } = req.params;
  // console.log(lessonId);

  var lessonDoc = await Lesson.findById(lessonId);

  // console.log("lessonDoc : ", lessonDoc);

  if (!lessonDoc) {
    res.status(404).json({ ok: false, message: "Lesson not found" });
  }

  res.status(200).json({ ok: true, reviews: lessonDoc.reviews });
};

lessonControllers.popularLessons = async (req, res) => {
  try {
    const lessons =await Lesson.find({ "ratingsSummary.count": { $gt: 0 } })
      .sort({ "ratingsSummary.average": -1 })
      .limit(10)
      .select("-__v")
      .populate({ path: "mentorId", select: "fullName", model: "user" })
      .lean();

    const formatedLessons = formatLessons(lessons);

    return res.status(200).json({ ok: true, lessons: formatedLessons });
  } catch (e) {
    return res.status(400).json({ ok: false, message: "Something went wrong from popular" });
  }
};

function formatLessons(lessons) {
  return lessons.map((lesson) => formatSingleLesson(lesson));
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
    ratingsSummary: lesson.ratingsSummary,
  };
}

module.exports = lessonControllers;
