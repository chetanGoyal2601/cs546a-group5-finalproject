const express = require("express");
const router = express.Router();
const path = require("path");
const validation = require("../data/validation");
const data = require("../data");
const commentData = data.comments;

router.get("/", async (req, res) => {
  //if (req.session.user) {
  res.sendFile(path.resolve("static/comments.html"));
  //}

  router.post("/", async (req, res) => {
    try {
      req.body.comment = validation.checkComment(req.body.comment, "Comment");
    } catch (e) {
      res.status(404).json({ error: e });
    }
    try {
      let insertComment = await commentData.postComment(req.body.comment); // req.session.user to be passed as well
      if (insertComment) res.json(insertComment);
    } catch (e) {
      res.status(404).json({ error: e });
    }
  });
});

module.exports = router;
