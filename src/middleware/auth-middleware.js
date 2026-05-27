const jwt = require("jsonwebtoken");
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ ok: false, error: "UnAuthorized access" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ ok: false, error: "Forbidden access" });

    req.user = user;

    next();
  });
};
const isMentor = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ ok: false, error: "UnAuthorized access" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ ok: false, error: "Forbidden access" });

    req.user = user;
    if (user.role != "MENTOR") {
      return res.status(401).json({ ok: false, error: "UnAuthorized access" });
    }

    next();
  });
};
module.exports = { authenticate, isMentor };
