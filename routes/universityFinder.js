const express = require("express");
const searchData = require("../data/search");
const router = express.Router();

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
});

module.exports = router;
