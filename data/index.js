const commentData = require("./comments");
const profileData = require("./profile");
const universityData = require("./universityList");

module.exports = {
  comments: commentData,
  profile: profileData,
  university: universityData,
  posts: require("./posts.js"),
  individualUniversity: require("./individualUniversity.js"),
};
