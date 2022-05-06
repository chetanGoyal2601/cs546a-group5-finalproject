const mongoCollections = require("../config/mongoCollections");
const comments = mongoCollections.comments;
const users = mongoCollections.profiles;
const posts = mongoCollections.posts;
const { ObjectId } = require("mongodb");
const validation = require("./validationComment");

async function postComment(inputUserId, comment) {
  comment = validation.checkComment(comment, "Comment");
  inputUserId = validation.checkId(inputUserId, "User ID");

  let insertComment = {
    userId: inputUserId,
    text: comment,
  };

  const commentsCollection = await comments();

  const insertInfo = await commentsCollection.insertOne(insertComment);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw { message: "Could not add comment", code: 400 };

  const newId = insertInfo.insertedId.toString();
  return newId;
}

async function get(id) {
  if (!id) throw { message: "You must provide an id to search for", code: 400 };
  if (typeof id !== "string")
    throw { message: "Id must be a string", code: 400 };
  if (id.trim().length === 0)
    throw { message: "Id cannot be an empty string or just spaces", code: 400 };
  id = id.trim();
  if (!ObjectId.isValid(id)) throw { message: "invalid object ID", code: 400 };

  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({ _id: ObjectId(id) });
  if (comment === null) throw { message: "No comment with that id", code: 400 };

  comment._id = comment._id.toString();

  return comment;
}

async function getUsersComments(inputUserId) {
  inputUserId = validation.checkId(inputUserId, "User ID");
  const commentsCollection = await comments();
  let commentList = await commentsCollection
    .find({ userId: inputUserId })
    .toArray();

  if (!commentList) throw { message: "Could not get all comments", code: 400 };

  for (let index = 0; index < commentList.length; index++) {
    commentList[index]._id = commentList[index]._id.toString();
    commentList[index]._id = commentList[index].userId.toString();
  }
  return commentList;
}

async function getCommentsByIds(inputCommentIds) {
  for (let index = 0; index < inputCommentIds.length; index++) {
    inputCommentIds[index] = validation.checkId(inputCommentIds[index]);
    inputCommentIds[index] = ObjectId(inputCommentIds[index]);
  }

  const commentsCollection = await comments();
  const userCollection = await users();

  let commentList = await commentsCollection
    .find({ _id: { $in: inputCommentIds } })
    .toArray();

  if (!commentList) throw { message: "Could not get all comments", code: 400 };

  for (let index = 0; index < commentList.length; index++) {
    commentList[index].userId = commentList[index].userId.toString();
    const user = await userCollection.findOne({
      _id: ObjectId(commentList[index].userId),
    });
    if (!user) throw { message: "User does not exist", code: 400 };
    commentList[index].userName = "";
    commentList[index].userName = user.name;
    commentList[index]._id = commentList[index]._id.toString();
  }
  return commentList;
}

async function deleteCommentsByIds(inputCommentIds) {
  if (inputCommentIds.length === 0) {
    return;
  }
  for (let index = 0; index < inputCommentIds.length; index++) {
    inputCommentIds[index] = validation.checkId(
      inputCommentIds[index],
      "Comment ID"
    );
    inputCommentIds[index] = ObjectId(inputCommentIds[index]);
  }

  const commentsCollection = await comments();

  let deletionInfo = await commentsCollection.deleteMany({
    _id: { $in: inputCommentIds },
  });

  if (deletionInfo.deletedCount === 0) {
    throw { message: `Could not delete comments`, code: 400 };
  }
  let answer = { deleted: "true" };
  return answer;
}

async function postCommentInPost(inputPostId, inputCommentId) {
  inputCommentId = validation.checkId(inputCommentId, "Comment ID");
  inputPostId = validation.checkId(inputPostId, "Post ID");

  const commentsCollection = await comments();
  const postCollection = await posts();

  let comment = await this.get(inputCommentId);

  const post = await postCollection.findOne({
    _id: ObjectId(inputPostId),
  });
  if (!post) throw { message: "Post does not exist", code: 400 };

  post.commentOnPost.append(inputCommentId);

  const updatedInfo = await postCollection.updateOne(
    { _id: ObjectId(inputPostId) },
    { $set: post }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw { message: "could not update Post successfully", code: 400 };
  }

  return true;
}

module.exports = {
  postComment,
  get,
  getUsersComments,
  getCommentsByIds,
  deleteCommentsByIds,
  postCommentInPost,
};
