const mongoCollections = require("../config/mongoCollections");
const comments = mongoCollections.comments;
const { ObjectId } = require("mongodb");
const validation = require("./validation");

async function postComment(comment) {
  //inputUserId will be passed as well
  comment = validation.checkComment(comment, "Comment");
  inputUserId = 123;
  const userId = inputUserId.toString();

  let insertComment = {
    userId,
    text: comment,
  };

  const commentsCollection = await comments();

  const insertInfo = await commentsCollection.insertOne(insertComment);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not add comment";

  const newId = insertInfo.insertedId.toString();
  const newComment = await this.get(newId);

  return newComment;
}

async function get(id) {
  if (!id) throw "You must provide an id to search for";
  if (typeof id !== "string") throw "Id must be a string";
  if (id.trim().length === 0)
    throw "Id cannot be an empty string or just spaces";
  id = id.trim();
  if (!ObjectId.isValid(id)) throw "invalid object ID";

  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({ _id: ObjectId(id) });
  if (comment === null) throw "No comment with that id";

  comment._id = comment._id.toString();

  return comment;
}

async function getUsersComments(inputUserId) {
  inputUserId = validation.checkId(inputUserId, "User ID");
  const commentsCollection = await comments();
  let commentList = await commentsCollection
    .find({ userId: inputUserId })
    .toArray();

  if (!commentList) throw "Could not get all comments";

  for (let index = 0; index < commentList.length; index++) {
    commentList[index]._id = commentList[index]._id.toString();
  }
  return commentList;
}

async function getCommentsByIds(inputCommentIds) {
  for (let index = 0; index < inputCommentIds.length; index++) {
    inputCommentIds[index] = validation.checkId(
      inputCommentIds[index],
      "Comment ID"
    );
    inputCommentIds[index] = ObjectId(inputCommentIds[index]);
  }

  const commentsCollection = await comments();

  let commentList = await commentsCollection
    .find({ _id: { $in: inputCommentIds } })
    .toArray();

  if (!commentList) throw "Could not get all comments";

  for (let index = 0; index < commentList.length; index++) {
    commentList[index]._id = commentList[index]._id.toString();
  }
  return commentList;
}

module.exports = {
  postComment,
  get,
  getUsersComments,
  getCommentsByIds,
};
