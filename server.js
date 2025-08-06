require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const {authenticate,isMentor} = require("./middleware/auth-middleware");
const errorHandler = require("./middleware/mongoose-error-handler");

 /// variable
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const userRoute = require("./routes/user-routes");
const lessonRoute = require("./routes/lesson-route")


/// Global Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));




/// Routes
app.use("/api/users", userRoute)
app.use("/api/lesson",authenticate,lessonRoute)
app.get("/", authenticate, (req, res) => {
  return res
    .status(200)
    .json({ ok: true, message: "WELCOME to SKILL HUB backend center" });
});


 app.use(errorHandler)





mongoose.connect(mongoUrl).then((e) => {
  console.log("Database connected successfully!");
});
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);
