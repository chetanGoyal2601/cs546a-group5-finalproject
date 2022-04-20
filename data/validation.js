const { ObjectId } = require("mongodb");

module.exports = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== "string") throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    //if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;

    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;

    strVal = strVal.trim();

    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;

    // if (!isNaN(strVal))
    //   throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;

    if (!strVal.match(/^[0-9a-zA-Z]+$/))
      throw `Error: ${varName} cannot contain Special characters`;

    if (varName.indexOf(" ") >= 0)
      throw `Error: ${varName} cannot contain spaces`;

    if (varName == "Username") {
      if (strVal.length < 4)
        throw `Error: ${varName} cannot be a string of length less than 4`;
      // strVal = strVal.toLowerCase();
    }

    if (varName == "Password") {
      if (strVal.length < 6)
        throw `Error: ${varName} cannot be a string of length less than 6`;
    }

    return strVal;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    let arrayInvalidFlag = false;
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        arrayInvalidFlag = true;
        break;
      }
      arr[i] = arr[i].trim();
    }
    if (arrayInvalidFlag)
      throw `One or more elements in ${varName} array is not a string or is an empty string`;
    return arr;
  },

  checkComment(comment, varName) {
    if (!comment) throw `Error: You must provide a ${varName}`;
    if (typeof comment !== "string") throw `Error:${varName} must be a string`;
    comment = comment.trim();
    if (comment.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;

    return comment;
  },
};
