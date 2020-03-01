const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const passport = require('passport')

const User = require("../models/user");

// body-parser middleware
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//路由跳转
router.get("/login", (req, res) => {
  res.render("users/login");
});

router.get("/register", (req, res) => {
  res.render("users/register");
});

// 注册api
router.post("/register", urlencodedParser, (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password2) {
    errors.push({
      text: "两次密码不一致！请重新输入!"
    });
  }

  //密码长度
  if (req.body.password.length < 6) {
    errors.push({
      text: "密码长度不能小于6位!"
    });
  }

  if (req.body.password.length > 12) {
    errors.push({
      text: "密码长度不能大于12位!"
    });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ name: req.body.name }).then(user => {
      if (user) {
        req.flash("error_msg", "用户名已被使用！");
        res.redirect("/users/register");
      } else {
        User.findOne({ email: req.body.email }).then(user => {
          if (user) {
            req.flash("error_msg", "邮箱已被注册！");
            res.redirect("/users/register");
          } else {
            const newUser = new User({
              name: req.body.name,
              email: req.body.email,
              password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                  .then(user => {
                    req.flash("success_msg", "注册成功！");
                    res.redirect("/users/login");
                  })
                  .catch(err => {
                    req.flash("error_msg", "注册失败！");
                    res.redirect("/users/register");
                  });
              });
            });
          }
        });
      }
    });
  }
});

//登录api
router.post('/login',urlencodedParser, (req, res,next) => {

    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/users/login",
      failureFlash: true
    })(req, res, next);

})

//退出api
router.get('/logout',(req,res) => {
    req.logout();
    req.flash('success_msg','退出成功！')
    res.redirect('/')
})

module.exports = router;
