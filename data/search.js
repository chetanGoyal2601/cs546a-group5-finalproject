const mongoCollections = require("../config/mongoCollections");
const universitiesMongo = mongoCollections.universities;
const { ObjectId } = require("mongodb");

const getUniversities = async function getUniversities() {
  const universitiesCollection = await universitiesMongo();
  const unis = await universitiesCollection.find({}).toArray();

  if (unis === null) {
    throw "No universities present in database.";
  }

  return unis;
};
/*
const getUniById = async function getUniById(id) {
  if (typeof id === "undefined") {
    throw "Argument id must be provided.";
  }
  if (typeof id !== "string") {
    throw "Argument id must be a string.";
  }
  id = id.trim();
  if (id.length == 0) {
    throw "Argument id must not be empty.";
  }
  if (!ObjectId.isValid(id)) {
    throw "Argument id must be valid ObjectId.";
  }

  const universitiesCollection = await universitiesMongo();
  const uni = await universitiesCollection.findOne({ _id: ObjectId(id) });
  if (uni === null) {
    throw "No university with the given id exists.";
  }
  uni._id = uni._id.toString();
  return uni;
}; */

// Function To get data of individual university
async function getUniversityById(id) {
  if (id == null) throw "Error";
  if (!id) throw "Error";
  if (typeof id != "string") throw "Error";
  if (id === undefined) throw "You must provide an ID";
  id = id.trim();
  let newId;
  if (isJSON(id)) {
    newId = JSON.parse(id);
    let parsedId = ObjectId(newId);
    if (!ObjectId.isValid(parsedId)) throw "Object Id is not valid";
    const universityCollection = await universitiesMongo();
    const uniList = await universityCollection.findOne({ _id: parsedId });
    if (!uniList) {
      throw "Could not find university with id of " + id;
    }
    if (uniList.comments.length > 0) {
      const commentList = await this.getCommentsByIds(uniList.comments);
      if (commentList) {
        uniList["commentsText"] = commentList;
      }
    }
    return uniList;
  } else {
    let parsedId = ObjectId(id);
    if (!ObjectId.isValid(parsedId)) throw "invalid object ID";
    const universityCollection = await universitiesMongo();
    const uniList = await universityCollection.findOne({ _id: parsedId });
    if (!uniList) {
      throw "Could not find university with id of " + id;
    }
    if (uniList.comments.length > 0) {
      const commentList = await this.getCommentsByIds(uniList.comments);
      if (commentList) {
        uniList["commentsText"] = commentList;
      }
    }
    return uniList;
  }
  function isJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (err) {
      return false;
    }
  }
}

//Funtion to display comments on individual university
async function getCommentsByIds(inputCommentIds) {
  for (let index = 0; index < inputCommentIds.length; index++) {
    inputCommentIds[index] = ObjectId(inputCommentIds[index]._id);
  }
  const commentsCollection = await commentsMongo();
  const profileCollection = await profileMongo();
  let commentList = await commentsCollection
    .find({ _id: { $in: inputCommentIds } })
    .toArray();
  if (!commentList) throw { message: "Could not get all comments", code: 400 };
  for (let index = 0; index < commentList.length; index++) {
    commentList[index].userId = commentList[index].userId.toString();
    const user = await profileCollection.findOne({
      _id: ObjectId(commentList[index].userId),
    });
    if (user) {
      commentList[index]["userName"] = user.name;
    }
    commentList[index]._id = commentList[index]._id.toString();
  }
  return commentList;
}

module.exports = {
  getUniversities,
  // getUniById,
  getUniversityById,
  getCommentsByIds,
};
