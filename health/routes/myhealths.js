const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const {ensureAuthenticated} = require("../helpers/auth");

router.get("/physiology", ensureAuthenticated, (req, res) => {
  res.render("myhealths/physiology");
});

router.get("/food", ensureAuthenticated, (req, res) => {
  res.render("myhealths/food");
});

router.get("/exercise", ensureAuthenticated, (req, res) => {
  res.render("myhealths/exercise");
});




module.exports = router;