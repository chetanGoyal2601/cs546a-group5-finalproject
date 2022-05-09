const { ObjectId } = require("mongodb");

module.exports = {
  checkId(id, varName) {
    if (!id)
      throw { message: `Error: You must provide a ${varName}`, code: 400 };

    if (!ObjectId.isValid(id))
      throw {
        message: `Error: ${varName} invalid object ID`,
        code: 400,
      };
    return id;
  },
  checkComment(comment, varName) {
    if (!comment)
      throw {
        message: `Error: You must provide a ${varName}`,
        code: 400,
      };
    if (typeof comment !== "string")
      throw {
        message: `Error:${varName} must be a string`,
        code: 400,
      };
    comment = comment.trim();
    if (comment.length === 0)
      throw {
        message: `Error: ${varName} cannot be an empty string or just spaces`,
        code: 400,
      };

    return comment;
  },
};
