const mongoCollections = require("../config/mongoCollections");
const universities = mongoCollections.universities;
const users = mongoCollections.profiles;
const commentData = require("./comments");
const { ObjectId, ExplainVerbosity } = require("mongodb");

//get all posts
async function getUniversity(uniId) {
  try {
    //console.log(uniId);
    idValidation(uniId);
    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    //const userCollection = await users();
    //check if post lists is retrieved
    if (!university)
      throw { code: 400, message: "Could not get the University!" };
    university._id = university._id.toString();
    if (!university.location.city) {
      university.location.city = "Unavailable";
    }
    if (!university.location.state) {
      university.location.state = "Unavailable";
    }
    university.commentListForEachPost = [];
    university.commentListForEachPost = await commentData.getCommentsByIds(
      university.comments
    );
    university.commentListForEachPost.reverse();
    for (const i of university.rating) {
      i.userId = i.userId.toString();
    }
    //console.log(university);
    return university;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function userRated(userId, uniId) {
  try {
    idValidation(userId);
    idValidation(uniId);
    userExistsValidation(userId);
    let university = await getUniversity(uniId);
    let k = 0;
    for (let i of university.rating) {
      if (i.userId.toString() === userId) {
        k = i.givenRating;
        break;
      }
    }
    return k;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function editRating(userId, uniId, rating) {
  try {
    idValidation(userId);
    idValidation(uniId);
    userExistsValidation(userId);

    if (!rating) {
      throw { code: 400, message: "You must provide a valid rating!" };
    }

    if (isNaN(rating)) {
      throw { code: 400, message: "You must provide a valid rating!" };
    }

    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    if (!university)
      throw { code: 400, message: "Could not get the University!" };
    let userHasAlreadyRated = false;
    let sameRatingGiven = false;
    let prevRating = null;
    //console.log(university.rating);
    for (let i = 0; i < university.rating.length; i++) {
      //console.log(university.rating[i], "test1");
      if (university.rating[i].userId.toString() === userId) {
        userHasAlreadyRated = true;
        //console.log(university.rating[i]);
        if (university.rating[i].givenRating === rating) {
          sameRatingGiven = true;
        } else {
          //console.log(university.rating[i]);
          prevRating = university.rating[i].givenRating;
          university.rating[i].givenRating = rating;
        }
      }
      if (userHasAlreadyRated && sameRatingGiven) {
        break;
      }
    }
    // for (let i of university.rating) {
    //   console.log(i);
    //   console.log(i.givenRating);
    //   if (i.userId.toString() === userId) {
    //     userHasAlreadyRated = true;
    //     console.log(i);
    //     if (i.givenRating === rating) {
    //       sameRatingGiven = true;
    //     }
    //     console.log(i.givenRating);
    //     i.givenRating = rating;
    //     console.log(i.givenRating);
    //     break;
    //   }
    // }
    //console.log(university.rating, "test3");
    if (!userHasAlreadyRated) {
      let ratingSum = university.overallRating * university.rating.length;
      university.rating.push({ userId: ObjectId(userId), givenRating: rating });
      university.overallRating =
        (ratingSum + rating) / university.rating.length;
      university.overallRating.toFixed(2);
      university.overallRating = Number(university.overallRating);
    } else if (!sameRatingGiven) {
      let ratingSum = university.overallRating * university.rating.length;
      university.overallRating =
        (ratingSum - prevRating + rating) / university.rating.length;
      university.overallRating.toFixed(2);
      university.overallRating = Number(university.overallRating);
    }
    const updatedInfo = await uniCollection.updateOne(
      { _id: ObjectId(uniId) },
      {
        $set: {
          overallRating: university.overallRating,
          rating: university.rating,
        },
      }
    );
    if (userHasAlreadyRated && sameRatingGiven) {
      return true;
    }
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function favoriteUniversityList(userId) {
  try {
    idValidation(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user === null) throw { code: 404, message: "No user found" };
    return user.favouriteUniversities;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function addToFavourites(userId, uniId) {
  try {
    idValidation(userId);
    idValidation(uniId);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user === null) throw { code: 404, message: "No user found" };
    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    if (university === null)
      throw { code: 404, message: "No university found" };
    if (user.favouriteUniversities.length === 0) {
      throw { code: 400, message: "Maximum Universities already added" };
    }
    user.favouriteUniversities.push(university.name.trim());
    const updatedInfo = await userCollection.updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          favouriteUniversities: user.favouriteUniversities,
        },
      }
    );
    //console.log(user.favouriteUniversities, university, user);
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function unFavourite(userId, uniId) {
  try {
    idValidation(userId);
    idValidation(uniId);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user === null) throw { code: 404, message: "No user found" };
    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    if (university === null)
      throw { code: 404, message: "No university found" };
    let k = [];
    for (const i of user.favouriteUniversities) {
      if (i.trim() === university.name.trim()) {
        continue;
      } else {
        k.push(i);
      }
    }
    if (k.length === user.favouriteUniversities.length) {
      throw {
        code: 400,
        message:
          "University was never favourited, so can not be removed from favourites!",
      };
    }
    const updatedInfo = await userCollection.updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          favouriteUniversities: k,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 404, message: "No update occured!" };
    }
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function createCommentOnUniversity(userId, uniId, text) {
  try {
    textValidation(text);
    idValidation(userId);
    idValidation(uniId);
    await userExistsValidation(userId);
    text = text.trim();
    const commentId = await commentData.postComment(userId, text);
    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    if (university === null)
      throw { code: 404, message: "No university found" };
    university.comments.push(ObjectId(commentId));
    const updatedInfo = await uniCollection.updateOne(
      { _id: ObjectId(uniId) },
      {
        $set: {
          comments: university.comments,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function deleteCommentOnUniversity(commentId, uniId) {
  try {
    idValidation(commentId);
    idValidation(uniId);
    const uniCollection = await universities();
    const university = await uniCollection.findOne({ _id: ObjectId(uniId) });
    if (university === null)
      throw { code: 404, message: "No university found" };

    //delete the comment from comment collection
    let deleted = await commentData.deleteCommentsByIds([ObjectId(commentId)]);
    let k = [];
    for (const i of university.comments) {
      if (i.toString() === commentId) {
        continue;
      } else {
        k.push(i);
      }
    }
    if (k.length === university.comments.length) {
      throw { code: 400, message: "Could not delete from university" };
    }

    // delete comment from university
    const updatedInfo = await uniCollection.updateOne(
      { _id: ObjectId(uniId) },
      {
        $set: {
          comments: k,
        },
      }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//to check if text is string type
function textValidation(text) {
  if (!text)
    throw { code: 400, message: "You must provide a text in the post!" };
  if (typeof text !== "string")
    throw { code: 400, message: "post should be a string!" };
  if (text.trim().length === 0)
    throw { code: 400, message: "post can not be empty" };
}

//to check if id is string type and can be converted to object
function idValidation(id) {
  if (!id) throw { code: 400, message: "You must provide an id to search for" };
  if (typeof id !== "string")
    throw { code: 400, message: "Id must be a string" };
  if (id.trim().length === 0)
    throw { code: 400, message: "Id cannot be an empty string or just spaces" };
  id = id.trim();
  if (!ObjectId.isValid(id)) throw { code: 400, message: "invalid object ID" };
}

//to check if user id exists in user collection
async function userExistsValidation(userId) {
  try {
    idValidation(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(userId) });
    if (user === null) throw { code: 404, message: "No user found" };
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

module.exports = {
  getUniversity,
  editRating,
  userRated,
  addToFavourites,
  unFavourite,
  favoriteUniversityList,
  createCommentOnUniversity,
  deleteCommentOnUniversity,
};
