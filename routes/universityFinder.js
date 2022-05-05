const express = require("express");
const searchData = require("../data/search");
const router = express.Router();

const data = require("../data");
const universityList = data.university;

router.get("/search", async (req, res) => {
  res.render("search/search", { title: "University Finder" });
});

router.get("/search/universities", async (req, res) => {
  try {
    const unis = await searchData.getUniversities();
    res.json(unis);
  } catch (e) {
    res.status(404).json({ error: e });
  }
});
/*
router.get("/university/:id", async (req, res) => {
  try {
    const uni = await searchData.getUniById(req.params.id);
    res.status(201).render("display/universityInfo", {
      layout: false,
      universityData: uni,
    });
    //res.render("search/search", { title: "University Finder" }); fill params acc to that page
  } catch (e) {
    res.status(404).json({ error: e });
  }
}); */

//Route to display university data
router.get("/university/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const uniData = await universityList.getUniversityById(id);
    let userID = "6272bb0b56f3a87e7f457541";
    // const favUniversityCheck = await universityList.checkFavUni(userID,id);
    // console.log(favUniversityCheck);
    res.status(201).render("display/universityInfo", {
      layout: false,
      universityData: uniData,
    });
  } catch (e) {
    res.status(404).send(e);
  }
});

//Route for posting comments on university page
router.post("/university/:id", async (req, res) => {
  if (!req.session.user) {
    return res.json({ result: "redirect", url: "http://localhost:3000/login" });
  } else {
    let universityId = req.params.id;
    let comment = req.body["comments"];
    let array = [];
    if (!comment) {
      array.push("You must enter a comment");
    }
    if (comment == null) {
      array.push("You must enter a comment");
    }
    comment = comment.trim();
    if (comment.length === 0) {
      array.push("You must enter a comment");
    }
    if (array.length > 0) {
      return res.status(400).json({
        errors: array,
        hasErrors: true,
      });
    }
    const userComment = await universityList.postCommentOnUniversity(
      comment,
      universityId
    );
    try {
      if (userComment._id) {
        res.json(userComment);
      } else {
        return res.status(400).json({
          errors: array,
          hasErrors: true,
        });
      }
    } catch (e) {
      res.status(e.code).json(e);
    }
  }
});

//Route to add favourite universities
router.post("/university/:id/fav", async (req, res) => {
  if (!req.session.user)
    return res.json({ result: "redirect", url: "http://localhost:3000/login" });
  let universityId = req.params.id;
  let array = [];
  if (!universityId) {
    array.push("You must Provide an ID");
  }
  if (typeof universityId != "string") {
    array.push("Id is not a string");
  }
  if (universityId == null) {
    array.push("You must Provide an ID");
  }
  universityId = universityId.trim();
  if (universityId.length === 0) {
    array.push("You must Provide an ID");
  }
  if (array.length > 0) {
    return res.status(400).json({
      errors: array,
      hasErrors: true,
    });
  }
  let userID = "62702dcda133812c4f7c8060";
  const favUniversity = await universityList.addFavUniversity(
    universityId,
    userID
  );
  try {
    if (favUniversity._id) {
      res.json(favUniversity);
    } else {
      return res.status(400).json({
        errors: array,
        hasErrors: true,
      });
    }
  } catch (e) {
    res.status(e.code).json(e);
  }
});

module.exports = router;
