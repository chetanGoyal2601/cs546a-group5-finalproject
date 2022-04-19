const express = require("express");
const router = express.Router();
const path = require("path");
const validation = require("../data/validation");
router.get("/", async (req, res) => {
  //if (req.session.user) {
  res.sendFile(path.resolve("static/comments.html"));
  //}

  router.post("/comments", async (req, res) => {
    req.body.comment = validation.checkComment(comment, "Comment");
  });
});

module.exports = router;
