const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", async (req, res) => {
  //if (req.session.user) {
  res.sendFile(path.resolve("static/comments.html"));
  //}
});

module.exports = router;
