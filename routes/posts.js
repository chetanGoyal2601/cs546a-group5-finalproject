const express = require("express");
const router = express.Router();
const data = require("../data");
const postData = data.posts;
const { ObjectId } = require("mongodb");

router.route("/posts").get(async (req, res) => {
  //let userId = req.body.userId;
  const output = [];
  try {
    const postDataList = await postData.getAllPosts();
    for (const i in postDataList) {
      output.push({
        _id: postDataList[i]._id,
        userId: "62751ace4bc518cf42583d0a",
        userName: postDataList[i].username,
        text: postDataList[i].text,
        totalLikes: postDataList[i].totalLikes,
        postUserId: postDataList[i].userId,
        likes: postDataList[i].likes,
        comments: postDataList[i].commentListForEachPost,
      });
    }
    res.render("posts", {
      pageTitle: "Posts",
      postList: output,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  } catch (e) {
    res.status(e.code || 500).render("posts", {
      pageTitle: "Posts",
      postList: output,
      error: e.message || "Internal server error occured while getting posts",
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  }
});

router.route("/posts/like").post(async (req, res) => {
  //check user logged in
  //let userId = req.body.userId;
  let userId = "62751ace4bc518cf42583d0a";
  let postId = req.body.postId;
  try {
    await postData.increaseLike(userId, postId);
    res.status(200).redirect("/posts");
  } catch (e) {
    res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Error Ocurred while liking!" });
  }
});

router.route("/posts/disLike").post(async (req, res) => {
  //check user logged in
  //let userId = req.body.userId;
  let userId = "62751ace4bc518cf42583d0a";
  let postId = req.body.postId;
  try {
    idValidation(userId);
    idValidation(postId);
    await postData.decreaseLike(userId, postId);
    res.status(200).redirect("/posts");
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/posts/comment").post(async (req, res) => {
  //check user logged in
  //let userId = req.body.userId;
  let userId = "62751ace4bc518cf42583d0a";
  let postId = req.body.postId;
  const commentInfo = req.body["newComment" + postId];
  console.log(req.body);
  console.log(commentInfo);
  try {
    idValidation(userId);
    idValidation(postId);
    textValidation(commentInfo);
    //console.log("test", commentInfo);
    await postData.createCommentOnPost(userId, postId, commentInfo);
    res.status(200).redirect("/posts");
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/posts/editPost").post(async (req, res) => {
  const newPostText = req.body.editedPost;
  const postId = req.body.postId;
  try {
    textValidation(newPostText);
    idValidation(postId);
    await postData.editPost(postId, newPostText);
    res.status(200).redirect("/posts");
  } catch (e) {
    return res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Internal server error occured" });
  }
});

router.route("/posts/deletePost").post(async (req, res) => {
  const postId = req.body.postId;
  try {
    idValidation(postId);
    await postData.deletePost(postId);
    res.status(200).redirect("/posts");
  } catch (e) {
    return res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Internal server error occured" });
  }
});

router.route("/post").post(async (req, res) => {
  //checkUserId else ask user to login
  //console.log(req.body.createPost);
  const postInfo = req.body.newPost;
  try {
    idValidation("62751ace4bc518cf42583d0a"); // ObjectIdValidation and if the user exists in db or not
    textValidation(postInfo);
  } catch (e) {
    return res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Internal server error occured" });
  }
  //console.log("Hello", postInfo);

  try {
    const p = await postData.createPost("62751ace4bc518cf42583d0a", postInfo);
    // res.status(200).json(p);
    res.status(200).redirect("/posts");
  } catch (e) {
    return res.status(e.code || 500).json({
      ErrorMessage:
        e.message || "Internal server error occured while creating post",
    });
  }
});

//to check if text is string type
function textValidation(text) {
  if (!text)
    throw { code: 400, message: "You must provide a text in the post!" };
  if (typeof text !== "string")
    throw { code: 400, message: "Post should be a string!" };
  if (text.trim().length === 0)
    throw { code: 400, message: "Post can not be empty" };
  //console.log("Hello111text");
}

//to check if id is string type and can be converted to object
function idValidation(id) {
  //console.log("Hello111text2222");
  if (!id) throw { code: 400, message: "You must provide an id to search for" };
  if (typeof id !== "string")
    throw { code: 400, message: "Id must be a string" };
  if (id.trim().length === 0)
    throw { code: 400, message: "Id cannot be an empty string or just spaces" };
  id = id.trim();
  if (!ObjectId.isValid(id)) throw { code: 400, message: "invalid object ID" };
  //console.log("Hello111id1111");
}

module.exports = router;
