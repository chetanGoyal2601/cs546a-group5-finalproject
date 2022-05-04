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
};

module.exports = {
  getUniversities,
  getUniById,
};
