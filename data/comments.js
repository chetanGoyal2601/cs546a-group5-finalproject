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

  return true;
}
module.exports = {
  postComment,
};
