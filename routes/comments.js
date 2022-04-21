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
});

router.get("/:id", async (req, res) => {
  //if (req.session.user) {
  //   try {
  //     req.params.id = validation.checkId(inputUserId, "User ID");
  //   } catch (e) {}

  try {
    let comments = await commentData.getUsersComments("123");

    //let allComments = await commentData.getCommentsByIds(commentIds); // To get multiple comments
    console.log(comments);
  } catch (e) {}

  //}
});

router.post("/", async (req, res) => {
  try {
    req.body.commentTextVal = validation.checkComment(
      req.body.commentTextVal,
      "Comment"
    );
  } catch (e) {
    return res.status(e.code).json(e);
  }
  try {
    let insertComment = await commentData.postComment(req.body.commentTextVal); // req.session.user to be passed as well
    res.json(insertComment);
  } catch (e) {
    res.status(e.code).json(e);
  }
});

module.exports = router;
