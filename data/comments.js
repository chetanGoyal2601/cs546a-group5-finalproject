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
    throw { message: "Could not add comment", code: 400 };

  const newId = insertInfo.insertedId.toString();
  const newComment = await this.get(newId);

  return newComment;
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

  if (!commentList) throw { message: "Could not get all comments", code: 400 };

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
