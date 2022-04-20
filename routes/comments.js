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
      req.body.commentTextVal = validation.checkComment(
        req.body.commentTextVal,
        "Comment"
      );
    } catch (e) {
      res.status(404).json({ error: e });
    }
    try {
      let insertComment = await commentData.postComment(
        req.body.commentTextVal
      ); // req.session.user to be passed as well
      res.json(insertComment);
    } catch (e) {
      return e.message;
    }
  });
});

module.exports = router;
