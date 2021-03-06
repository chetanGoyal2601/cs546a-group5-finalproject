const express = require("express");
const xss = require("xss");
const searchData = require("../data/search");
const router = express.Router();
const data = require("../data");
const universityData = data.individualUniversity;
const { ObjectId } = require("mongodb");
const { append } = require("express/lib/response");

router.get("/search", async (req, res) => {
  let userId = null;
  let isUserLoggedIn = false;
  try {
    if (checkUserLoggedIn(req)) {
      userId = xss(req.session.user);
      isUserLoggedIn = true;
      idValidation(userId);
    }
    res.render("search/search", {
      title: "University Finder",
      isUserLoggedIn: isUserLoggedIn,
    });
  } catch (e) {
    res.status(e.code || 500).json(e.message || "Internal Server Error");
  }
});

router.get("/search/universities", async (req, res) => {
  try {
    const unis = await searchData.getUniversities();
    res.json(unis);
  } catch (e) {
    res.status(e.code || 500).json(e.message || "Internal Server Error");
  }
});

//routes for individual university

router.route("/university/:id").get(async (req, res) => {
  let userId = null;
  let isUserLoggedIn = false;
  let output = {};
  try {
    if (checkUserLoggedIn(req)) {
      userId = xss(req.session.user);
      isUserLoggedIn = true;
      idValidation(userId);
    }
    //console.log(xss(req.params.id));
    idValidation(xss(req.params.id));
    let favoriteUniversities = [];
    let universityInfo = await universityData.getUniversity(xss(req.params.id));
    let userRating = 0;
    if (userId) {
      userRating = await universityData.userRated(userId, universityInfo._id);
    }
    if (userId) {
      favoriteUniversities = await universityData.favoriteUniversityList(
        userId
      );
    }
    output = {
      _id: universityInfo._id,
      name: universityInfo.name,
      description: universityInfo.description,
      universityPhoto: universityInfo.image,
      rank: universityInfo.ranking || "Unavailable",
      city: universityInfo.location.city || "Unavailable",
      state: universityInfo.location.state || "Unavailable",
      latitude: universityInfo.latitude,
      longitude: universityInfo.longitude,
      totalRating: universityInfo.overallRating,
      comments: universityInfo.commentListForEachPost,
      rating: universityInfo.rating,
      favoriteUniversityList: favoriteUniversities,
    };
    //console.log("Hello");
    //console.log(output);
    res.render("individualUniversity", {
      title: "University Info",
      universityData: output,
      userId: userId,
      userRating: userRating,
      isUserLoggedIn: isUserLoggedIn,
    });
  } catch (e) {
    //console.log(e.message);
    res.status(e.code || 500).render("posts", {
      title: "University Info",
      postList: output,
      error:
        e.message || "Internal server error occured while getting universities",
      isUserLoggedIn: isUserLoggedIn,
    });
  }
});

router.route("/university/editRating").post(async (req, res) => {
  let userId = xss(req.session.user);
  try {
    let uniId = xss(req.body.uniId);
    idValidation(uniId);
    if (!checkUserLoggedIn(req)) {
      return res.status(200).redirect("/login");
      //throw { code: 400, message: "User not logged in!" };
    }
    idValidation(userId);
    let rating = req.body.rating;
    //console.log(rating);
    if (!rating || !Number(rating)) {
      throw { code: 400, message: "Invalid rating given" };
    }
    if (
      rating == "1" ||
      rating == "2" ||
      rating == "3" ||
      rating == "4" ||
      rating == "5"
    ) {
      rating = Number(rating);
      await universityData.editRating(userId, uniId, rating);
      res.status(200).redirect("/university/" + uniId);
    } else {
      throw { code: 400, message: "Invalid rating given" };
    }
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/university/comment").post(async (req, res) => {
  let userId = xss(req.session.user);
  let uniId = xss(req.body.uniId);
  let text = xss(req.body.newComment);
  try {
    if (!checkUserLoggedIn(req)) {
      return res.status(200).redirect("/login");
      //throw { code: 400, message: "User not logged in!" };
    }
    idValidation(userId);
    idValidation(uniId);
    textValidation(text);
    await universityData.createCommentOnUniversity(userId, uniId, text);
    res.status(200).redirect("/university/" + uniId);
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/university/deleteComment").post(async (req, res) => {
  let commentId = xss(req.body.commentId);
  let uniId = xss(req.body.uniId);
  try {
    if (!checkUserLoggedIn(req)) {
      return res.status(200).redirect("/login");
      //throw { code: 400, message: "User not logged in!" };
    }
    idValidation(commentId);
    idValidation(uniId);
    await universityData.deleteCommentOnUniversity(commentId, uniId);
    res.status(200).redirect("/university/" + uniId);
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/university/favourite").post(async (req, res) => {
  let userId = xss(req.session.user);
  let uniId = xss(req.body.uniId);

  //console.log(userId);
  try {
    //console.log(req.body, userId, uniId, req.body.favouriteUniversitiesLength);
    if (!checkUserLoggedIn(req)) {
      return res.status(200).redirect("/login");
      //throw { code: 400, message: "User not logged in!" };
    }
    idValidation(userId);
    idValidation(uniId);
    favouriteUniversitiesLength = Number(req.body.favouriteUniversitiesLength);
    //console.log(favouriteUniversitiesLength);
    if (favouriteUniversitiesLength === 5) {
      return res.status(200).json({ result: false });
      //throw { code: 400, message: "Maximum Universities added" };
    }

    await universityData.addToFavourites(userId, uniId);
    res.status(200).json({ result: true });
    //res.status(200).redirect("/university/" + uniId);
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

router.route("/university/unfavourite").post(async (req, res) => {
  let userId = xss(req.session.user);
  try {
    if (!checkUserLoggedIn(req)) {
      return res.status(200).redirect("/login");
      //throw { code: 400, message: "User not logged in!" };
    }
    let uniId = xss(req.body.uniId);
    idValidation(uniId);
    await universityData.unFavourite(userId, uniId);
    res.status(200).redirect("/university/" + uniId);
  } catch (e) {
    res
      .status(e.code || 500)
      .json(e.message || "Internal server error occured while disliking!");
  }
});

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

function checkUserLoggedIn(req) {
  if (xss(req.session.user)) {
    return true;
  }
  return false;
}

module.exports = router;
